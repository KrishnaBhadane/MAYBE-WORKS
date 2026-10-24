import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  style,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-black/5 border border-black/5 rounded-none ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
