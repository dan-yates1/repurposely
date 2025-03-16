import * as React from "react";

// Instead of an empty interface, use a type alias
type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className || ""}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={`p-6 pb-0 flex flex-col space-y-1.5 ${className || ""}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={`font-semibold text-lg leading-none tracking-tight ${className || ""}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p
      className={`text-sm text-gray-500 ${className || ""}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div
      className={`p-6 pt-0 ${className || ""}`}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={`flex items-center p-6 pt-0 ${className || ""}`}
      {...props}
    />
  );
}
