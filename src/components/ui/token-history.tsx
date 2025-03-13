import React from "react";
import { useTokens } from "@/hooks/useTokens";
import { Clock, FileText, Image, Video, Layout } from "lucide-react";

// Map transaction types to icons
const transactionIcons: Record<string, React.ReactNode> = {
  TEXT_REPURPOSE: (
    <FileText
      className="h-4 w-4"
      aria-hidden="true"
      aria-label="Text Repurposing Icon"
    />
  ),
  IMAGE_GENERATION: (
    <Image
      className="h-4 w-4"
      aria-hidden="true"
      aria-label="Image Generation Icon"
    />
  ),
  VIDEO_PROCESSING: (
    <Video
      className="h-4 w-4"
      aria-hidden="true"
      aria-label="Video Processing Icon"
    />
  ),
  ADVANCED_FORMATTING: (
    <Layout
      className="h-4 w-4"
      aria-hidden="true"
      aria-label="Advanced Formatting Icon"
    />
  ),
};

// Map transaction types to readable names
const transactionNames: Record<string, string> = {
  TEXT_REPURPOSE: "Text Repurposing",
  IMAGE_GENERATION: "Image Generation",
  VIDEO_PROCESSING: "Video Processing",
  ADVANCED_FORMATTING: "Advanced Formatting",
};

export function TokenHistory() {
  const { transactionHistory, fetchTransactionHistory, loading } = useTokens();

  React.useEffect(() => {
    console.log("Fetching transaction history from TokenHistory component");
    fetchTransactionHistory(10);
  }, [fetchTransactionHistory]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Token History
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (transactionHistory.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Token History
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No token usage history yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your token usage will appear here when you start using ContentRemix
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl  border border-gray-100">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Token History</h3>

      <div className="space-y-4">
        {transactionHistory.map((transaction) => {
          const date = new Date(transaction.created_at);
          const formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const icon = transactionIcons[transaction.transaction_type] || (
            <Clock
              className="h-4 w-4"
              aria-hidden="true"
              aria-label="Unknown Transaction Icon"
            />
          );
          const name =
            transactionNames[transaction.transaction_type] ||
            transaction.transaction_type;

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500">
                    {formattedDate} at {formattedTime}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                -{transaction.tokens_used} tokens
              </div>
            </div>
          );
        })}
      </div>

      {transactionHistory.length > 5 && (
        <button
          onClick={() => fetchTransactionHistory(20)}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View more history
        </button>
      )}
    </div>
  );
}
