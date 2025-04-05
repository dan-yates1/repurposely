"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTokens } from "@/hooks/useTokens";
import { useUser } from "@/hooks/useUser";
import { Toaster } from "react-hot-toast";
import { BarChart2, Calendar, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TokenUsageCard } from "@/components/ui/token-usage-card";
import { AnalyticsMetricCard } from "@/components/ui/analytics-metric-card";
import { TokenUsageChart } from "@/components/analytics/token-usage-chart";
import { usePageTitle } from "@/hooks/usePageTitle";
import { TokenTransaction } from "@/lib/token-service";
import { ContentTypeDistribution } from "@/components/analytics/content-type-distribution";
import { ContentCreationTimeline } from "@/components/analytics/content-creation-timeline";
import { TokenTransactionHistory } from "@/components/analytics/token-transaction-history";

export default function AnalyticsPage() {
  usePageTitle("Analytics");
  const { user, loading: userLoading } = useUser();
  const { fetchTransactionHistory } = useTokens();

  const [contentHistory, setContentHistory] = useState<{
    id: string;
    user_id: string;
    created_at: string;
    output_format: string | null;
    original_content: string;
    repurposed_content: string;
  }[]>([]);
  const [contentMetrics, setContentMetrics] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byType: {} as Record<string, number>,
  });
  const [tokenMetrics, setTokenMetrics] = useState({
    totalUsed: 0,
    byOperation: {} as Record<string, number>,
    dailyUsage: [] as { date: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );
  const [allTransactions, setAllTransactions] = useState<TokenTransaction[]>(
    []
  );

  // Fetch content history and calculate metrics
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch content history
        const { data: contentData, error: contentError } = await supabase
          .from("content_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (contentError) throw contentError;

        setContentHistory(contentData || []);

        // Calculate content metrics
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);

        const oneMonthAgo = new Date(now);
        oneMonthAgo.setDate(now.getDate() - 30);

        const thisWeekContent =
          contentData?.filter(
            (item) => new Date(item.created_at) >= oneWeekAgo
          ) || [];

        const thisMonthContent =
          contentData?.filter(
            (item) => new Date(item.created_at) >= oneMonthAgo
          ) || [];

        // Count by content type
        const typeCount: Record<string, number> = {};
        contentData?.forEach((item) => {
          const type = item.output_format || "Other";
          typeCount[type] = (typeCount[type] || 0) + 1;
        });

        setContentMetrics({
          total: contentData?.length || 0,
          thisWeek: thisWeekContent.length,
          thisMonth: thisMonthContent.length,
          byType: typeCount,
        });

        // Fetch all token transactions for charts
        await fetchTransactionHistory(100); // Fetch more transactions for charts

        // Fetch all transactions for detailed analysis
        const { data: transactions } = await supabase
          .from("token_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        setAllTransactions(transactions || []);

        // Calculate token usage metrics
        const operationCount: Record<string, number> = {};
        const dailyUsage: Record<string, number> = {};

        transactions?.forEach((tx) => {
          // Count by operation type
          operationCount[tx.transaction_type] =
            (operationCount[tx.transaction_type] || 0) + tx.tokens_used;

          // Group by day for timeline
          const date = new Date(tx.created_at).toISOString().split("T")[0];
          dailyUsage[date] = (dailyUsage[date] || 0) + tx.tokens_used;
        });

        // Convert daily usage to array and sort by date
        const dailyUsageArray = Object.entries(dailyUsage)
          .map(([date, count]) => ({
            date,
            count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setTokenMetrics({
          totalUsed:
            transactions?.reduce((sum, tx) => sum + tx.tokens_used, 0) || 0,
          byOperation: operationCount,
          dailyUsage: dailyUsageArray,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, fetchTransactionHistory]);

  // Calculate weekly growth percentage
  const calculateGrowth = () => {
    if (contentMetrics.thisWeek === 0) return 0;

    // Get content from previous week
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeekContent = contentHistory.filter(
      (item) => new Date(item.created_at) >= oneWeekAgo
    );

    const lastWeekContent = contentHistory.filter(
      (item) =>
        new Date(item.created_at) >= twoWeeksAgo &&
        new Date(item.created_at) < oneWeekAgo
    );

    if (lastWeekContent.length === 0) return 100; // If no content last week, 100% growth

    const growthRate =
      ((thisWeekContent.length - lastWeekContent.length) /
        lastWeekContent.length) *
      100;
    return Math.round(growthRate);
  };

  // Get most used content type
  const getMostUsedContentType = () => {
    if (Object.keys(contentMetrics.byType).length === 0) return "None";

    return Object.entries(contentMetrics.byType).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
  };

  // Filter transactions based on time period
  const getFilteredTransactions = () => {
    if (!allTransactions.length) return [];

    const now = new Date();
    const cutoffDate = new Date(now);

    switch (timeFilter) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "all":
      default:
        return allTransactions;
    }

    return allTransactions.filter(
      (tx) => new Date(tx.created_at) >= cutoffDate
    );
  };

  if (userLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-2/4 bg-gray-200 rounded mb-8"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500">
            Track your content creation and token usage metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border space-x-2 border-gray-200 rounded-md p-1">
            <Button
              variant={timeFilter === "7d" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTimeFilter("7d")}
              className="text-xs"
            >
              7 Days
            </Button>
            <Button
              variant={timeFilter === "30d" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTimeFilter("30d")}
              className="text-xs"
            >
              30 Days
            </Button>
            <Button
              variant={timeFilter === "90d" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTimeFilter("90d")}
              className="text-xs"
            >
              90 Days
            </Button>
            <Button
              variant={timeFilter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setTimeFilter("all")}
              className="text-xs"
            >
              All Time
            </Button>
          </div>
        </div>
      </div>

      {/* Token Usage Summary */}
      <div className="mb-8">
        <TokenUsageCard />
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsMetricCard
            icon={<FileText className="h-5 w-5 text-indigo-600" />}
            title="Total Content Created"
            value={contentMetrics.total.toString()}
          />
          <AnalyticsMetricCard
            icon={<Calendar className="h-5 w-5 text-indigo-600" />}
            title="Content This Month"
            value={contentMetrics.thisMonth.toString()}
            change={`${calculateGrowth()}%`}
            isPositive={calculateGrowth() >= 0}
          />
          <AnalyticsMetricCard
            icon={<Zap className="h-5 w-5 text-indigo-600" />}
            title="Tokens Used"
            value={tokenMetrics.totalUsed.toString()}
          />
          <AnalyticsMetricCard
            icon={<BarChart2 className="h-5 w-5 text-indigo-600" />}
            title="Most Used Format"
            value={getMostUsedContentType()}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 pb-2 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Token Usage Over Time
          </h3>
          <div className="h-64 overflow-hidden"> {/* Fixed height container */}
            <TokenUsageChart
              data={tokenMetrics.dailyUsage}
              timeFilter={timeFilter}
            />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Type Distribution
          </h3>
          <ContentTypeDistribution data={contentMetrics.byType} />
        </div>
      </div>

      {/* Content Creation Timeline */}
      <div className="mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Creation Timeline
          </h3>
          <ContentCreationTimeline
            contentHistory={contentHistory}
            timeFilter={timeFilter}
          />
        </div>
      </div>

      {/* Token Transaction History */}
      <div className="mb-8">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Token Transaction History
          </h3>
          <TokenTransactionHistory transactions={getFilteredTransactions()} />
        </div>
      </div>
    </div>
  );
}

