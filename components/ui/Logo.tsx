import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  variant?: "mark" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

const sizeConfig = {
  sm: { dimension: 32, textClass: "text-base tracking-widest" },
  md: { dimension: 40, textClass: "text-lg tracking-widest" },
  lg: { dimension: 56, textClass: "text-2xl tracking-widest" },
};

export const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "md",
  className = "",
  href = "/",
}) => {
  const { dimension, textClass } = sizeConfig[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Round circular SVG / container for the kreepycode mark */}
      <div
        className="relative overflow-hidden rounded-full border border-black bg-white shadow-xs shrink-0 flex items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        <Image
          src="/brand/kreepycode-logo.png"
          alt="kreepycode logo"
          width={dimension}
          height={dimension}
          priority
          className="h-full w-full object-cover rounded-full"
        />
      </div>

      {variant === "full" && (
        <span className={`font-black uppercase text-black font-sans ${textClass}`}>
          KREEPYCODE
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-hidden inline-flex">
        {content}
      </Link>
    );
  }

  return content;
};
