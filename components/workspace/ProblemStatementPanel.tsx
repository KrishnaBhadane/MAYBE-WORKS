"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Copy, HelpCircle, FileText, History } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export interface SubmissionHistoryItem {
  id: string;
  status: "passed" | "failed" | "error";
  runtimeMs: number;
  language: string;
  timestamp: string;
  codeSnippet: string;
}

export interface ProblemStatementPanelProps {
  title: string;
  description: string;
  sampleTestcases?: Array<{
    input: string;
    expectedOutput: string;
    explanation?: string;
  }>;
  isSolved: boolean;
  submissions: SubmissionHistoryItem[];
}

export function ProblemStatementPanel({
  title,
  description,
  sampleTestcases = [],
  isSolved,
  submissions,
}: ProblemStatementPanelProps) {
  const [activeTab, setActiveTab] = useState<"statement" | "submissions" | "help">("statement");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyInput = (input: string, idx: number) => {
    navigator.clipboard.writeText(input);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white select-text text-black font-sans">
      {/* Top Tab Switcher (Statement | Submissions | Help) */}
      <div className="flex items-center gap-1 border-b-2 border-black bg-[#F8F9FA] px-4 pt-2 select-none shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("statement")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black border-t-2 border-x-2 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "statement"
              ? "bg-white text-black border-black -mb-[2px] z-10"
              : "bg-transparent text-neutral-600 border-transparent hover:text-black"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Statement</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black border-t-2 border-x-2 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "submissions"
              ? "bg-white text-black border-black -mb-[2px] z-10"
              : "bg-transparent text-neutral-600 border-transparent hover:text-black"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Submissions</span>
          {submissions.length > 0 && (
            <span className="px-1.5 py-0.2 bg-black text-[#FAFF00] rounded-full text-[10px]">
              {submissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("help")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black border-t-2 border-x-2 rounded-t-lg transition-colors whitespace-nowrap ${
            activeTab === "help"
              ? "bg-white text-black border-black -mb-[2px] z-10"
              : "bg-transparent text-neutral-600 border-transparent hover:text-black"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* 1. STATEMENT TAB */}
        {activeTab === "statement" && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="subtle" className="rounded-md">Algorithmic Problem</Badge>
                {isSolved && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-black bg-green-100 text-green-800 border border-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-black tracking-tight uppercase">
                {title}
              </h1>
            </div>

            {/* Note Callout (Matching CodeChef Note Banner) */}
            <div className="p-4 bg-[#FAFF00]/15 border-l-4 border-black rounded-r-xl text-xs font-sans text-black leading-relaxed">
              <strong className="font-black text-black">Note - </strong>
              Optimal solutions must satisfy strict time and space complexity invariants. Ensure corner cases (empty inputs, single elements, negative prefixes) are evaluated correctly.
            </div>

            {/* Problem Description Body */}
            <div className="text-sm text-neutral-900 leading-relaxed font-sans space-y-4">
              <div className="whitespace-pre-wrap">{description}</div>
            </div>

            {/* Sample Testcases Section */}
            {sampleTestcases.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-black/10">
                <h3 className="font-mono text-xs font-black uppercase text-black tracking-wider">
                  Sample Testcases
                </h3>
                <div className="space-y-3">
                  {sampleTestcases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="border border-black/15 bg-[#F8F9FA] rounded-xl p-4 text-xs font-mono space-y-3"
                    >
                      <div className="flex items-center justify-between text-neutral-500 font-bold uppercase text-[11px]">
                        <span>Sample {idx + 1}</span>
                        <button
                          onClick={() => handleCopyInput(tc.input, idx)}
                          className="flex items-center gap-1 text-black hover:underline"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedIndex === idx ? "Copied" : "Copy Input"}
                        </button>
                      </div>

                      <div>
                        <div className="text-neutral-500 mb-1 font-bold">Input:</div>
                        <pre className="p-2.5 bg-white border border-black/10 rounded-lg text-black overflow-x-auto">
                          {tc.input || "<empty>"}
                        </pre>
                      </div>

                      <div>
                        <div className="text-neutral-500 mb-1 font-bold">Expected Output:</div>
                        <pre className="p-2.5 bg-white border border-black/10 rounded-lg text-black overflow-x-auto">
                          {tc.expectedOutput}
                        </pre>
                      </div>

                      {tc.explanation && (
                        <div className="pt-1 text-neutral-600 text-[11px] font-sans">
                          <strong>Explanation:</strong> {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SUBMISSIONS TAB */}
        {activeTab === "submissions" && (
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-black uppercase text-black tracking-wider">
              Recent Submissions
            </h3>
            {submissions.length === 0 ? (
              <div className="p-8 text-center border border-black/10 rounded-xl bg-[#F8F9FA]">
                <Clock className="w-6 h-6 mx-auto text-neutral-400 mb-2" />
                <p className="text-xs text-neutral-600 font-bold">No submissions recorded yet.</p>
                <p className="text-[11px] text-neutral-400 mt-1">Run and submit your code to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 border border-black/15 bg-white rounded-xl shadow-xs space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-black uppercase text-[10px] ${
                          sub.status === "passed"
                            ? "bg-green-100 text-green-800 border border-green-500"
                            : "bg-red-100 text-red-800 border border-red-500"
                        }`}
                      >
                        {sub.status === "passed" ? "All Passed" : "Failed / Mismatch"}
                      </span>
                      <span className="text-[11px] text-neutral-500">{sub.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600 text-[11px]">
                      <span>Language: <strong className="text-black uppercase">{sub.language}</strong></span>
                      <span>Runtime: <strong className="text-black">{sub.runtimeMs}ms</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. HELP TAB */}
        {activeTab === "help" && (
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-black uppercase text-black tracking-wider">
              Algorithmic Guidance &amp; Constraints
            </h3>
            <div className="p-4 bg-[#F8F9FA] border border-black/15 rounded-xl space-y-3 text-xs leading-relaxed text-black">
              <div>
                <strong className="block text-black mb-1">Time Complexity Target:</strong>
                <p className="text-neutral-700">O(N) single-pass iteration. Avoid nested loops that lead to quadratic O(N²) worst-case timeouts.</p>
              </div>
              <div className="pt-2 border-t border-black/10">
                <strong className="block text-black mb-1">Space Complexity Target:</strong>
                <p className="text-neutral-700">O(1) auxiliary space without redundant copies or extra heap allocation.</p>
              </div>
              <div className="pt-2 border-t border-black/10">
                <strong className="block text-black mb-1">Standard I/O Hint:</strong>
                <p className="text-neutral-700">Read inputs using standard streams (`std::cin` / `Scanner` / `process.stdin`). Print only the expected output value without extra prompts.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
