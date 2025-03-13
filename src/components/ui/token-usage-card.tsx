import React from "react";
import { useTokens } from "@/hooks/useTokens";
import { ArrowUpCircle, Clock } from "lucide-react";
import Link from "next/link";

export function TokenUsageCard() {
  const { loading, tokenUsage } = useTokens();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!tokenUsage) {
    return (
      <div className="bg-white p-6 rounded-xl  border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Token Usage</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sign in to view your token usage
        </p>
      </div>
    );
  }

  const { tokensUsed, tokensRemaining, resetDate, subscriptionTier } =
    tokenUsage;
  const totalTokens = tokensUsed + tokensRemaining;
  const usagePercentage = Math.round((tokensUsed / totalTokens) * 100);
  const resetDateFormatted = new Date(resetDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Token Usage
          </h3>
          <p className="text-sm text-gray-500">
            {subscriptionTier.charAt(0).toUpperCase() +
              subscriptionTier.slice(1)}{" "}
            plan
          </p>
        </div>
        <Link
          href="/pricing"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <ArrowUpCircle className="h-3 w-3 mr-1" />
          Upgrade
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">
            {tokensRemaining} tokens remaining
          </span>
          <span className="text-gray-500">{tokensUsed} used</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500">
        <Clock className="h-3 w-3 mr-1" />
        <span>Resets on {resetDateFormatted}</span>
      </div>
    </div>
  );
}
