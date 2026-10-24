import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "yellow" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#0A1128] text-white hover:bg-black border border-transparent shadow-xs",
  yellow: "bg-[#FAFF00] text-black hover:bg-[#EEF200] border-2 border-black font-black",
  outline: "bg-white text-black border-2 border-black hover:bg-black hover:text-white",
  ghost: "bg-transparent text-black hover:bg-black/5 border border-transparent",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs font-bold tracking-wider",
  md: "px-5 py-2.5 text-sm font-bold tracking-wider",
  lg: "px-7 py-3.5 text-base font-black tracking-wider",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 uppercase select-none transition-colors duration-150 rounded-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
