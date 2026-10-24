"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Terminal,
  Code2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/workspace/CodeEditor";
import { VisualDiffViewer } from "@/components/workspace/VisualDiffViewer";
import { RuntimePerformanceCard } from "@/components/workspace/RuntimePerformanceCard";
import { evaluateDsaSuite, type EvaluationResult, type DsaTestcase } from "@/lib/utils/testcaseEvaluator";

export const LANGUAGE_BOILERPLATES: Record<string, string> = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your solution here

    return 0;
}`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your solution here

    return 0;
}`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int a = scanner.nextInt();
            int b = scanner.hasNextInt() ? scanner.nextInt() : 0;
            System.out.println(a + b);
        }
    }
}`,
  python: `import sys

def main():
    # Write your solution here
    tokens = sys.stdin.read().split()
    if len(tokens) >= 2:
        print(int(tokens[0]) + int(tokens[1]))
    elif len(tokens) == 1:
        print(tokens[0])

if __name__ == "__main__":
    main()`,
  javascript: `const fs = require("fs");

function main() {
    // Write your solution here
    const input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);
    if (input.length >= 2) {
        const [a, b] = input.map(Number);
        console.log(a + b);
    } else if (input.length === 1 && input[0] !== "") {
        console.log(input[0]);
    }
}

main();`,
};

export interface AttachedCompilerPanelProps {
  initialCode: string;
  defaultLanguage?: string;
  testcases: Array<{ input: string; expectedOutput: string }>;
  isCompleted: boolean;
  onSubmitSuccess: (code: string) => Promise<void>;
  onNextTask?: () => void;
  hasNextTask?: boolean;
}

interface CustomCase {
  id: string;
  name: string;
  input: string;
}

export function AttachedCompilerPanel({
  initialCode,
  defaultLanguage = "cpp",
  testcases,
  isCompleted,
  onSubmitSuccess,
  onNextTask,
  hasNextTask = false,
}: AttachedCompilerPanelProps) {
  const [language, setLanguage] = useState<string>(defaultLanguage);
  const [code, setCode] = useState<string>(
    initialCode && initialCode.trim().length > 0
      ? initialCode
      : (LANGUAGE_BOILERPLATES[defaultLanguage] || LANGUAGE_BOILERPLATES.cpp)
  );

  const formattedTestcases: DsaTestcase[] = testcases.map((t) => ({
    input: t.input,
    expected_output: t.expectedOutput,
  }));

  // LeetCode-style Multi-Testcase Management (Feature 3)
  const [activeTab, setActiveTab] = useState<{ type: "sample"; idx: number } | { type: "custom"; id: string }>({
    type: "sample",
    idx: 0,
  });
  const [customCases, setCustomCases] = useState<CustomCase[]>([]);

  // HackerRank Hidden Testcase Unlock State (Feature 7)
  const [unlockedHiddenCases, setUnlockedHiddenCases] = useState<Set<number>>(new Set());
  const [streakPoints, setStreakPoints] = useState<number>(120);

  // Execution & Results State
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string; timeMs?: number } | null>(null);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (newLang === defaultLanguage && initialCode && initialCode.trim().length > 0) {
      setCode(initialCode);
    } else {
      setCode(LANGUAGE_BOILERPLATES[newLang] || LANGUAGE_BOILERPLATES.cpp);
    }
  };

  const handleReset = () => {
    if (language === defaultLanguage && initialCode && initialCode.trim().length > 0) {
      setCode(initialCode);
    } else {
      setCode(LANGUAGE_BOILERPLATES[language] || LANGUAGE_BOILERPLATES.cpp);
    }
  };

  // Add new Custom Case
  const handleAddCustomCase = () => {
    const newId = `custom-${Date.now()}`;
    const newCase: CustomCase = {
      id: newId,
      name: `Custom ${customCases.length + 1}`,
      input: "",
    };
    setCustomCases((prev) => [...prev, newCase]);
    setActiveTab({ type: "custom", id: newId });
  };

  const handleRemoveCustomCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomCases((prev) => prev.filter((c) => c.id !== id));
    setActiveTab({ type: "sample", idx: 0 });
  };

  const handleUpdateCustomInput = (id: string, text: string) => {
    setCustomCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, input: text } : c))
    );
  };

  // Unlock Hidden Testcase (Feature 7)
  const handleUnlockHiddenCase = (idx: number) => {
    if (streakPoints >= 10) {
      setStreakPoints((prev) => prev - 10);
      setUnlockedHiddenCases((prev) => new Set([...prev, idx]));
    }
  };

  // Run Code (Feature 1, 2, 3)
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setShowConsole(true);
    setRunOutput(null);
    setEvalResult(null);

    let activeInput = "";
    if (activeTab.type === "sample") {
      activeInput = formattedTestcases[activeTab.idx]?.input ?? "";
    } else {
      const c = customCases.find((x) => x.id === activeTab.id);
      activeInput = c?.input ?? "";
    }

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: activeInput }),
      });
      const data = await res.json();
      setRunOutput({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        timeMs: data.executionTimeMs,
      });

      if (activeTab.type === "sample" && formattedTestcases[activeTab.idx]) {
        const evalOutcome = evaluateDsaSuite(
          [{ actual: data.stdout || "", runtimeMs: data.executionTimeMs ?? 0 }],
          [formattedTestcases[activeTab.idx]]
        );
        setEvalResult(evalOutcome);
      }
    } catch (err: unknown) {
      setRunOutput({
        stdout: "",
        stderr: err instanceof Error ? err.message : "Execution failed",
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, activeTab, customCases, formattedTestcases]);

  // Submit Code Across All Testcases
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setShowConsole(true);
    setRunOutput(null);
    setEvalResult(null);

    try {
      const outputs: Array<{ actual: string; runtimeMs: number }> = [];

      for (const tc of formattedTestcases) {
        const res = await fetch("/api/code/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code, stdin: tc.input }),
        });
        const data = await res.json();
        outputs.push({
          actual: data.stdout || "",
          runtimeMs: data.executionTimeMs ?? 0,
        });
      }

      const evalOutcome = evaluateDsaSuite(outputs, formattedTestcases);
      setEvalResult(evalOutcome);

      if (evalOutcome.status === "passed") {
        await onSubmitSuccess(code);
      }
    } catch (err: unknown) {
      setRunOutput({
        stdout: "",
        stderr: err instanceof Error ? err.message : "Submission evaluation failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, language, formattedTestcases, onSubmitSuccess]);

  // Global IDE Keyboard Shortcuts (Cmd+Enter to Run, Cmd+Shift+Enter to Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun, handleSubmit]);

  // Subtask & Partial Scoring (Feature 5)
  const scoreInfo = evalResult
    ? {
        points: Math.round((evalResult.passedCount / Math.max(1, evalResult.totalCount)) * 100),
        subtask1: Math.min(40, Math.round((evalResult.passedCount / Math.max(1, evalResult.totalCount)) * 40)),
        subtask2: Math.max(0, Math.round((evalResult.passedCount / Math.max(1, evalResult.totalCount)) * 60)),
      }
    : null;

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white select-none">
      {/* Minimalist Top Toolbar (Language & Reset) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121824] border-b border-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#FAFF00]" />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-black/80 border border-neutral-700 text-white text-xs font-mono font-bold rounded-full px-3 py-1.5 focus:outline-none focus:border-[#FAFF00] cursor-pointer"
          >
            <option value="cpp">C++ (g++ 15)</option>
            <option value="c">C (gcc 15)</option>
            <option value="java">Java (OpenJDK 25)</option>
            <option value="python">Python 3.14</option>
            <option value="javascript">JavaScript (Node.js 24)</option>
          </select>
        </div>

        {/* Action: Streak Points & Reset */}
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-900 border border-neutral-700 text-amber-300">
            <span>Streak Points:</span>
            <strong className="text-white">{streakPoints}</strong>
          </span>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-white/10"
            title="Reset to Starter Template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Monaco Code Editor */}
      <div className="flex-1 min-h-[220px] overflow-hidden">
        <CodeEditor
          language={language}
          value={code}
          onChange={(val) => setCode(val)}
          onRun={handleRun}
          hideHeader={true}
        />
      </div>

      {/* LeetCode-style Multi-Testcase Tabs Ribbon (Feature 3) */}
      <div className="border-t border-neutral-800 bg-[#141A29]">
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-neutral-800/80">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mr-1">
            Testcases:
          </span>

          {/* Sample Cases */}
          {formattedTestcases.map((_, idx) => {
            const isSelected = activeTab.type === "sample" && activeTab.idx === idx;
            const isHidden = idx >= 2 && !unlockedHiddenCases.has(idx);

            return (
              <button
                key={`sample-${idx}`}
                onClick={() => setActiveTab({ type: "sample", idx })}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-black shadow-xs font-black"
                    : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
                }`}
              >
                {isHidden ? <Lock className="w-3 h-3 text-amber-400" /> : null}
                <span>Case {idx + 1}</span>
                {isHidden && <span className="text-[9px] text-amber-400 uppercase">Hidden</span>}
              </button>
            );
          })}

          {/* Custom Cases */}
          {customCases.map((c) => {
            const isSelected = activeTab.type === "custom" && activeTab.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveTab({ type: "custom", id: c.id })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#FAFF00] text-black shadow-xs font-black"
                    : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
                }`}
              >
                <span>{c.name}</span>
                <button
                  onClick={(e) => handleRemoveCustomCase(c.id, e)}
                  className="hover:text-red-500 transition-colors p-0.5"
                  title="Remove testcase"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add Custom Testcase Button */}
          <button
            onClick={handleAddCustomCase}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 border border-neutral-700 transition-colors ml-1"
            title="Add Custom Testcase (LeetCode Style)"
          >
            <Plus className="w-3 h-3" />
            <span>Add Case</span>
          </button>
        </div>

        {/* Active Testcase Content / Hidden Unlock Action (Feature 7) */}
        <div className="px-4 py-2.5">
          {activeTab.type === "sample" && formattedTestcases[activeTab.idx] && (
            <div>
              {activeTab.idx >= 2 && !unlockedHiddenCases.has(activeTab.idx) ? (
                /* Locked Hidden Case Display with Unlock Button */
                <div className="p-3 bg-neutral-900/90 border border-amber-900/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Hidden Testcase Locked (HackerRank Mechanic)
                    </span>
                    <p className="text-[11px] text-neutral-400 font-sans">
                      Hidden edge cases test performance invariants. Spend 10 Streak Points to reveal this input.
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlockHiddenCase(activeTab.idx)}
                    disabled={streakPoints < 10}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-black shadow-xs transition-colors shrink-0"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock (-10 pts)</span>
                  </button>
                </div>
              ) : (
                /* Unlocked / Sample Testcase View */
                <div className="space-y-1 font-mono text-xs">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Input:</span>
                  <pre className="p-2 bg-black/60 border border-neutral-800 rounded-lg text-neutral-300 overflow-x-auto">
                    {formattedTestcases[activeTab.idx].input || "<empty>"}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab.type === "custom" && (() => {
            const c = customCases.find((x) => x.id === activeTab.id);
            return (
              <div className="space-y-1 font-mono text-xs">
                <span className="text-[10px] font-bold text-[#FAFF00] uppercase">Custom Stdin:</span>
                <textarea
                  value={c?.input || ""}
                  onChange={(e) => handleUpdateCustomInput(activeTab.id, e.target.value)}
                  placeholder="Enter custom input tokens..."
                  rows={2}
                  className="w-full bg-black/60 border border-neutral-700 rounded-lg p-2 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FAFF00] resize-y"
                />
              </div>
            );
          })()}
        </div>
      </div>

      {/* CodeChef Subtask Scoring Banner (Feature 5) */}
      {scoreInfo && (
        <div className="px-4 py-2 bg-[#0E1422] border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FAFF00]" />
            <span className="font-bold text-white">
              Subtask Score: <strong className="text-[#FAFF00] text-sm">{scoreInfo.points} / 100</strong>
            </span>
            <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden ml-1">
              <div
                className={`h-full ${scoreInfo.points === 100 ? "bg-green-500" : scoreInfo.points >= 50 ? "bg-yellow-400" : "bg-red-500"}`}
                style={{ width: `${scoreInfo.points}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Subtask 1 (Small): <strong>{scoreInfo.subtask1}/40 pts</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
              Subtask 2 (Full): <strong>{scoreInfo.subtask2}/60 pts</strong>
            </span>
          </div>
        </div>
      )}

      {/* Execution Results, Visual Diff (Feature 1), and Performance Card (Feature 6) */}
      {showConsole && (
        <div className="border-t border-neutral-800 bg-black/95 p-3.5 max-h-56 overflow-y-auto font-mono text-xs select-text">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Execution Output
            </span>
            {evalResult && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  evalResult.status === "passed"
                    ? "bg-green-950 text-green-300 border border-green-600"
                    : "bg-red-950 text-red-300 border border-red-600"
                }`}
              >
                {evalResult.status === "passed" ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {evalResult.status === "passed"
                  ? `Accepted (${evalResult.passedCount}/${evalResult.totalCount})`
                  : `Wrong Answer (${evalResult.passedCount}/${evalResult.totalCount})`}
              </span>
            )}
          </div>

          {/* Standard Outputs */}
          {runOutput && (
            <div className="space-y-1">
              {runOutput.stdout && (
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-bold">Standard Output:</span>
                  <pre className="text-green-400 whitespace-pre-wrap bg-neutral-900/60 p-2 rounded border border-neutral-800 mt-0.5">
                    {runOutput.stdout}
                  </pre>
                </div>
              )}
              {runOutput.stderr && (
                <div>
                  <span className="text-[10px] text-red-400 uppercase font-bold">Error / Stderr:</span>
                  <pre className="text-red-400 whitespace-pre-wrap bg-red-950/30 p-2 rounded border border-red-900 mt-0.5">
                    {runOutput.stderr}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Feature 1: Visual Output Diff Viewer */}
          {evalResult?.status === "failed" && evalResult.mismatchDetails && (
            <VisualDiffViewer
              actual={evalResult.mismatchDetails.actual}
              expected={evalResult.mismatchDetails.expected}
              reason={evalResult.mismatchDetails.reason}
            />
          )}

          {/* Feature 6: LeetCode Runtime Performance Card */}
          {evalResult?.status === "passed" && runOutput?.timeMs !== undefined && (
            <RuntimePerformanceCard
              runtimeMs={runOutput.timeMs}
              language={language}
            />
          )}
        </div>
      )}

      {/* Bottom Action Bar (Run | Submit | Next) with Keyboard Shortcuts (Feature 2) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121824] border-t border-black/40 shrink-0">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-black bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
          {runOutput?.timeMs !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400">
              <Clock className="w-3 h-3" /> {runOutput.timeMs}ms
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold px-4 shadow-sm"
            title="Run Code (⌘ + Enter)"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-white" />
            {isRunning ? "Running..." : "Run (⌘↵)"}
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-5 shadow-sm"
            title="Submit Code (⇧ + ⌘ + Enter)"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {isSubmitting ? "Submitting..." : "Submit (⇧⌘↵)"}
          </Button>

          {hasNextTask && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNextTask}
              className="rounded-full bg-white hover:bg-neutral-100 text-black border-black font-black px-4 shadow-sm"
            >
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
