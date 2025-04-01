import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-gray-700", // Basic styling
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
