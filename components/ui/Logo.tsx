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
      {/* Round circular container for the high quality kreepycode mark */}
      <div
        className="relative overflow-hidden rounded-full border-2 border-white/30 bg-white shadow-sm shrink-0 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: dimension, height: dimension }}
      >
        <Image
          src="/brand/kreepycode-mark.png"
          alt="kreepycode logo"
          width={dimension * 2}
          height={dimension * 2}
          priority
          quality={100}
          unoptimized
          className="h-full w-full object-contain p-0.5"
        />
      </div>

      {variant === "full" && (
        <span className={`font-black uppercase text-white font-sans ${textClass}`}>
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
