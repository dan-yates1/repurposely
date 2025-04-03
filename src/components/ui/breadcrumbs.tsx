import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string; // Optional href for clickable links
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const lastItem = items[items.length - 1];

  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      {/* Full breadcrumbs for medium screens and up */}
      <ol className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            )}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              // Last item or item without href is not clickable
              <span className={index === items.length - 1 ? "font-medium text-gray-700" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      {/* Simplified breadcrumb for small screens (only show last item) */}
      <div className="block md:hidden text-sm font-medium text-gray-700">
         {/* Optionally add a back arrow or home icon link here if needed */}
         <span>{lastItem?.label}</span>
      </div>
    </nav>
  );
}
