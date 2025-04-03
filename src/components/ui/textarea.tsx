import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

// Remove the empty interface definition
// interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Use the extended type directly
const Textarea = React.forwardRef<
  HTMLTextAreaElement, 
  React.TextareaHTMLAttributes<HTMLTextAreaElement> // Use the base type directly
>(({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", // Basic styling (similar to Shadcn/ui)
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
