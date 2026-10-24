"use client";

import { useState, useMemo } from "react";
import { Check, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";

export interface VisualDiffViewerProps {
  actual: string;
  expected: string;
  reason?: string;
}

export function VisualDiffViewer({ actual, expected, reason }: VisualDiffViewerProps) {
  const [showWhitespaceSymbols, setShowWhitespaceSymbols] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<"actual" | "expected" | null>(null);

  const formatText = (text: string, showSymbols: boolean) => {
    if (!showSymbols) return text;
    // Replace spaces with middle dot · and newlines with ↵\n
    return text
      .replace(/ /g, "·")
      .replace(/\t/g, "→   ")
      .replace(/\n/g, "↵\n");
  };

  const actualLines = useMemo(() => {
    return (actual ?? "").split(/\r?\n/);
  }, [actual]);

  const expectedLines = useMemo(() => {
    return (expected ?? "").split(/\r?\n/);
  }, [expected]);

  const handleCopy = async (text: string, type: "actual" | "expected") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mt-3 p-3.5 bg-[#0C101A] border border-red-900/60 rounded-xl space-y-3 font-mono text-xs select-text">
      {/* Top Diff Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-700">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Diff Inspector
          </span>
          <span className="text-neutral-400 text-[11px] font-sans">
            {reason || "Character / line mismatch detected against testcase"}
          </span>
        </div>

        {/* Whitespace Symbols Toggle */}
        <button
          onClick={() => setShowWhitespaceSymbols(!showWhitespaceSymbols)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors border ${
            showWhitespaceSymbols
              ? "bg-[#FAFF00] text-black border-[#FAFF00]"
              : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white"
          }`}
          title="Highlight invisible spaces (·) and newlines (↵)"
        >
          {showWhitespaceSymbols ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{showWhitespaceSymbols ? "Invisibles: Visible" : "Show Whitespace"}</span>
        </button>
      </div>

      {/* Side-by-Side Visual Diff Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Your Output (Actual) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-red-400 font-bold uppercase pb-1">
            <span>Your Output (Actual)</span>
            <button
              onClick={() => handleCopy(actual, "actual")}
              className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white"
            >
              {copiedType === "actual" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === "actual" ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="p-2.5 bg-red-950/30 border border-red-900/60 rounded-lg min-h-[90px] max-h-48 overflow-y-auto leading-relaxed">
            {actualLines.length === 0 || (actualLines.length === 1 && actualLines[0] === "") ? (
              <span className="text-neutral-500 italic">&lt;no output produced&gt;</span>
            ) : (
              actualLines.map((line, idx) => {
                const isMismatch = line !== expectedLines[idx];
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 px-1 rounded ${
                      isMismatch
                        ? "bg-red-500/20 text-red-200 border-l-2 border-red-500 pl-1.5 font-bold"
                        : "text-neutral-300"
                    }`}
                  >
                    <span className="text-neutral-600 select-none text-[10px] w-4 text-right">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all">
                      {formatText(line, showWhitespaceSymbols)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Expected Output */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-green-400 font-bold uppercase pb-1">
            <span>Expected Output</span>
            <button
              onClick={() => handleCopy(expected, "expected")}
              className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white"
            >
              {copiedType === "expected" ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === "expected" ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <div className="p-2.5 bg-green-950/20 border border-green-900/60 rounded-lg min-h-[90px] max-h-48 overflow-y-auto leading-relaxed">
            {expectedLines.map((line, idx) => {
              const isMismatch = line !== actualLines[idx];
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-1 rounded ${
                    isMismatch
                      ? "bg-green-500/20 text-green-200 border-l-2 border-green-500 pl-1.5 font-bold"
                      : "text-neutral-300"
                  }`}
                >
                  <span className="text-neutral-600 select-none text-[10px] w-4 text-right">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-all">
                    {formatText(line, showWhitespaceSymbols)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Difference Summary Hint */}
      <div className="text-[11px] text-neutral-400 bg-black/40 p-2 rounded-md border border-neutral-800">
        <strong className="text-white">Note: </strong>
        Lines highlighted in <span className="text-red-400 font-bold">red</span> differ from the{" "}
        <span className="text-green-400 font-bold">expected output</span>. Check for trailing spaces, incorrect casing, or missing newlines.
      </div>
    </div>
  );
}
