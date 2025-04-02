"use client";

import React from 'react';
import { Check } from 'lucide-react'; // Using lucide for the check icon

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string; // Optional label text
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked);
  };

  return (
    <div className={`flex items-center ${className || ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="peer sr-only" // Hide default checkbox but keep it accessible
        {...props}
      />
      {/* Custom styled checkbox */}
      <label
        htmlFor={id}
        className={`flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-gray-400 bg-white transition-colors 
                    peer-checked:bg-indigo-600 peer-checked:border-indigo-600 
                    peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 
                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:border-gray-300 peer-disabled:bg-gray-100
                    ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-500'}`}
      >
        {/* Check icon - only show when checked */}
        <Check className={`h-3 w-3 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`} />
      </label>
      {/* Optional label text */}
      {label && (
        <label
          htmlFor={id}
          className={`ml-2 text-sm font-medium ${disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-700'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

// Optional: Export default if preferred
// export default Checkbox;
