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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/workspace/CodeEditor";
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

  // LeetCode-style Multi-Case Testcase Selector state
  // 0, 1, 2... for sample cases, -1 for custom input
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [customStdin, setCustomStdin] = useState<string>("");
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

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setShowConsole(true);
    setRunOutput(null);
    setEvalResult(null);

    const activeInput =
      selectedCaseIdx === -1
        ? customStdin
        : (formattedTestcases[selectedCaseIdx]?.input ?? "");

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

      if (selectedCaseIdx >= 0 && formattedTestcases[selectedCaseIdx]) {
        const evalOutcome = evaluateDsaSuite(
          [{ actual: data.stdout || "", runtimeMs: data.executionTimeMs ?? 0 }],
          [formattedTestcases[selectedCaseIdx]]
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
  }, [code, language, selectedCaseIdx, customStdin, formattedTestcases]);

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

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white select-none">
      {/* Sleek, Minimalist Top Toolbar (Language & Reset only) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121824] border-b border-black/40 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#FAFF00]" />
          {/* Language Selector Dropdown */}
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

        {/* Action: Reset */}
        <div className="flex items-center gap-2">
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

      {/* Main Code Editor */}
      <div className="flex-1 min-h-[220px] overflow-hidden">
        <CodeEditor
          language={language}
          value={code}
          onChange={(val) => setCode(val)}
          onRun={handleRun}
          hideHeader={true}
        />
      </div>

      {/* LeetCode-style Multi-Case Testcase Selector */}
      <div className="border-t border-neutral-800 bg-[#141A29]">
        {/* Case Tabs Ribbon */}
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-b border-neutral-800/80">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mr-1">
            Testcase:
          </span>
          {formattedTestcases.map((_, idx) => {
            const isSelected = selectedCaseIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCaseIdx(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-black shadow-xs font-black"
                    : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
                }`}
              >
                <span>Case {idx + 1}</span>
              </button>
            );
          })}

          <button
            onClick={() => setSelectedCaseIdx(-1)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              selectedCaseIdx === -1
                ? "bg-[#FAFF00] text-black shadow-xs font-black"
                : "bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700"
            }`}
          >
            <span>+ Custom Input</span>
          </button>
        </div>

        {/* Selected Case Content / Custom Input Box */}
        <div className="px-4 py-2.5">
          {selectedCaseIdx >= 0 && formattedTestcases[selectedCaseIdx] ? (
            <div className="space-y-1 font-mono text-xs">
              <span className="text-[10px] font-bold text-neutral-500 uppercase">Input:</span>
              <pre className="p-2 bg-black/60 border border-neutral-800 rounded-lg text-neutral-300 overflow-x-auto">
                {formattedTestcases[selectedCaseIdx].input || "<empty>"}
              </pre>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              <span className="text-[10px] font-bold text-[#FAFF00] uppercase">Custom Stdin:</span>
              <textarea
                value={customStdin}
                onChange={(e) => setCustomStdin(e.target.value)}
                placeholder="Enter standard input tokens..."
                rows={2}
                className="w-full bg-black/60 border border-neutral-700 rounded-lg p-2 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FAFF00] resize-y"
              />
            </div>
          )}
        </div>
      </div>

      {/* Execution Results & Visual Diff Output Drawer */}
      {showConsole && (
        <div className="border-t border-neutral-800 bg-black/95 p-3.5 max-h-48 overflow-y-auto font-mono text-xs select-text">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Execution Verdict
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

          {/* Visual Output Diff Viewer (CodeChef / LeetCode Style) */}
          {evalResult?.mismatchDetails && (
            <div className="mt-3 p-3 bg-red-950/30 border border-red-800/60 rounded-xl space-y-2 text-neutral-300">
              <div className="text-red-400 font-bold text-[11px] flex items-center justify-between">
                <span>Output Mismatch Detected</span>
                <span className="text-[10px] text-neutral-400">{evalResult.mismatchDetails.reason}</span>
              </div>

              {/* Side-by-Side Visual Diff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Actual Output Box */}
                <div className="p-2 bg-red-950/60 border border-red-700/60 rounded-lg">
                  <span className="text-[10px] text-red-400 font-bold uppercase block mb-1">
                    Your Output:
                  </span>
                  <pre className="text-red-200 whitespace-pre-wrap font-mono">
                    {evalResult.mismatchDetails.actual || "<no output produced>"}
                  </pre>
                </div>

                {/* Expected Output Box */}
                <div className="p-2 bg-green-950/60 border border-green-700/60 rounded-lg">
                  <span className="text-[10px] text-green-400 font-bold uppercase block mb-1">
                    Expected Output:
                  </span>
                  <pre className="text-green-200 whitespace-pre-wrap font-mono">
                    {evalResult.mismatchDetails.expected}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar (Run | Submit | Next) */}
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

        {/* Run, Submit, Next Action Cluster with Keyboard Shortcut Hints */}
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
