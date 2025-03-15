"use client";

interface TokenHistoryCardProps {
  operation: string;
  tokensUsed: number;
  date: string;
}

export function TokenHistoryCard({
  operation,
  tokensUsed,
  date
}: TokenHistoryCardProps) {
  // Format operation name for display
  const formatOperation = (operation: string) => {
    return operation
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col">
        <span className="font-medium text-gray-700">{formatOperation(operation)}</span>
        <span className="text-sm text-indigo-600">{tokensUsed} tokens</span>
      </div>
      <div className="text-sm text-gray-500">{date}</div>
    </div>
  );
}

interface Transaction {
  id: string;
  transaction_type: string;
  tokens_used: number;
  created_at: string;
}

export function TokenHistory({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium text-gray-500 pb-2">
        <span>Operation</span>
        <span>Date</span>
      </div>
      
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <TokenHistoryCard
            key={transaction.id}
            operation={transaction.transaction_type}
            tokensUsed={transaction.tokens_used}
            date={new Date(transaction.created_at).toLocaleDateString()}
          />
        ))
      ) : (
        <div className="py-4 text-center text-gray-500">
          No transaction history found
        </div>
      )}
    </div>
  );
}
