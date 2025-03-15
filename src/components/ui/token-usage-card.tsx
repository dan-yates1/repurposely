"use client";

import { useTokens } from "@/hooks/useTokens";
import { Sparkles, Clock, AlertCircle } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export function TokenUsageCard() {
  const { tokenUsage } = useTokens();

  // Default values in case token usage data isn't loaded yet
  const tokensRemaining = tokenUsage?.tokensRemaining || 0;
  const tokensUsed = tokenUsage?.tokensUsed || 0;
  const totalTokens = tokensRemaining + tokensUsed;
  const usagePercentage = totalTokens > 0 ? (tokensRemaining / totalTokens) * 100 : 0;
  
  // Calculate days remaining until token reset
  const resetDate = tokenUsage?.resetDate ? new Date(tokenUsage.resetDate) : null;
  const today = new Date();
  const daysRemaining = resetDate 
    ? Math.max(0, Math.ceil((resetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) 
    : 30;
  
  // Determine status colors based on tokens remaining
  const getStatusColor = () => {
    if (usagePercentage <= 10) return "bg-red-100 text-red-800 border-red-200";
    if (usagePercentage <= 25) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Token Usage</h2>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{daysRemaining} days remaining in current billing cycle</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full md:max-w-md">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{tokensRemaining} tokens remaining</span>
              <span className="text-gray-600">{totalTokens} total</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center">
          {usagePercentage <= 25 && (
            <div className={`mr-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
              {usagePercentage <= 10 ? (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  <span>Low tokens</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  <span>Running low</span>
                </div>
              )}
            </div>
          )}
          
          <Link href="/pricing">
            <Button variant="primary" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Get More Tokens</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Token usage history link */}
      <div className="mt-4 text-sm">
        <Link href="/settings" className="text-indigo-600 hover:text-indigo-800 font-medium">
          View detailed token usage history →
        </Link>
      </div>
    </div>
  );
}
