"use client";

import { TokenTransaction } from "@/lib/token-service";
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  BarChart2, 
  Search
} from "lucide-react";

interface TokenTransactionHistoryProps {
  transactions: TokenTransaction[];
}

export function TokenTransactionHistory({ transactions }: TokenTransactionHistoryProps) {
  // Format operation name for display
  const formatOperation = (operation: string) => {
    return operation
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get icon for operation type
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'TEXT_REPURPOSE':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'IMAGE_GENERATION':
        return <ImageIcon className="h-4 w-4 text-green-600" />;
      case 'VIDEO_PROCESSING':
        return <Video className="h-4 w-4 text-red-600" />;
      case 'CONTENT_ANALYSIS':
        return <Search className="h-4 w-4 text-amber-600" />;
      case 'ADVANCED_FORMATTING':
        return <BarChart2 className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!transactions.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md">
        <p className="text-gray-500">No transaction history available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens Used
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-2">
                      {getOperationIcon(transaction.transaction_type)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatOperation(transaction.transaction_type)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-indigo-600 font-medium">
                    {transaction.tokens_used}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.content_id ? (
                    <a 
                      href={`/content/${transaction.content_id}`}
                      className="text-indigo-600 hover:text-indigo-900 truncate block max-w-[100px]"
                      title={transaction.content_id}
                    >
                      {transaction.content_id.substring(0, 8)}...
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
