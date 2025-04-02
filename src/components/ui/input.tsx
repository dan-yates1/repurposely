"use client";

import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full text-gray-700 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                    ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium 
                    placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 
                    focus-visible:ring-indigo-500 focus-visible:ring-offset-2 
                    disabled:cursor-not-allowed disabled:opacity-50 
                    ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
