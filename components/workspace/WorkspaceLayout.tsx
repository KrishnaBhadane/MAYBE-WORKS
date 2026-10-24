"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Code2, FileText } from "lucide-react";

export interface WorkspaceLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number; // percentage 25-75, default 50
  className?: string;
}

export function WorkspaceLayout({
  leftPanel,
  rightPanel,
  defaultSplit = 50,
  className = "",
}: WorkspaceLayoutProps) {
  const [splitPercent, setSplitPercent] = useState<number>(defaultSplit);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"statement" | "compiler">("compiler");
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(75, Math.max(25, newPercent)));
    },
    [isDragging]
  );

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopDragging);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, stopDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col md:flex-row w-full h-full overflow-hidden bg-white select-none ${className}`}
    >
      {/* Mobile Tab Switcher (< md) */}
      <div className="md:hidden flex items-center border-b-2 border-black bg-[#F8F9FA] p-1.5 shrink-0 z-20">
        <button
          onClick={() => setMobileTab("statement")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
            mobileTab === "statement"
              ? "bg-black text-white"
              : "bg-transparent text-neutral-600 hover:text-black"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Statement</span>
        </button>
        <button
          onClick={() => setMobileTab("compiler")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors ${
            mobileTab === "compiler"
              ? "bg-[#FAFF00] text-black border border-black font-black"
              : "bg-transparent text-neutral-600 hover:text-black"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Compiler &amp; Sandbox</span>
        </button>
      </div>

      {/* Desktop & Mobile Left Panel (Statement) */}
      <div
        className={`h-full overflow-y-auto border-r border-black/10 transition-[width] duration-0 ease-linear ${
          mobileTab === "statement" ? "flex flex-col flex-1 w-full" : "hidden md:flex md:flex-col"
        }`}
        style={{
          width: typeof window !== "undefined" && window.innerWidth >= 768 ? `${splitPercent}%` : undefined,
          flexShrink: 0,
        }}
      >
        <div className="h-full w-full overflow-y-auto">
          {leftPanel}
        </div>
      </div>

      {/* Desktop Draggable Divider (Hidden on Mobile) */}
      <div
        onMouseDown={startDragging}
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
        className={`hidden md:flex items-center justify-center w-2 -ml-1 -mr-1 z-30 cursor-col-resize hover:bg-[#FAFF00] transition-colors duration-100 ${
          isDragging ? "bg-[#FAFF00]" : "bg-neutral-200"
        }`}
      >
        <div className="w-[2px] h-8 bg-black/40" />
      </div>

      {/* Desktop & Mobile Right Panel (Compiler Sandbox) */}
      <div
        className={`h-full overflow-hidden flex flex-col ${
          mobileTab === "compiler" ? "flex flex-1 w-full" : "hidden md:flex flex-1"
        }`}
        style={{
          width: typeof window !== "undefined" && window.innerWidth >= 768 ? `${100 - splitPercent}%` : undefined,
        }}
      >
        <div className="h-full w-full overflow-hidden flex flex-col">
          {rightPanel}
        </div>
      </div>
    </div>
  );
}
