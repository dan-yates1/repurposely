import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export function Progress({ 
  className, 
  value = 0, 
  max = 100, 
  ...props 
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-indigo-600 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
