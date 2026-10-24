import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-white text-black font-bold text-sm px-4 py-2.5 border-2 border-black/80 rounded-none focus:border-black focus:outline-hidden transition-colors placeholder:text-black/30 disabled:opacity-40 disabled:cursor-not-allowed ${
            error ? "border-red-600 focus:border-red-600" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs font-bold text-red-600">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
