import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "navy" | "outline" | "subtle";
  size?: "sm" | "md";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  yellow: "bg-[#FAFF00] text-black border border-black",
  navy: "bg-[#0A1128] text-white border border-[#0A1128]",
  outline: "bg-white text-black border border-black",
  subtle: "bg-black/5 text-black border border-black/10",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "yellow",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider rounded-none select-none ${sizeClass} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
