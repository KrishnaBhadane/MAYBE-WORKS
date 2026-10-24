"use client";

import { useState, useRef } from "react";
import {
  Play,
  Send,
  RotateCcw,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Cpu,
  Binary,
  GitCompare,
  Code as CodeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/workspace/CodeEditor";
import { HexInspector } from "@/components/workspace/HexInspector";
import { StepComparator } from "@/components/workspace/StepComparator";
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

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Provide default boilerplate of the selected language
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
  const [customInputEnabled, setCustomInputEnabled] = useState<boolean>(false);
  const [customStdin, setCustomStdin] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string; timeMs?: number } | null>(null);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [isAsmOpen, setIsAsmOpen] = useState<boolean>(false);
  const [asmOutput, setAsmOutput] = useState<string | null>(null);
  const [isDisassembling, setIsDisassembling] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"editor" | "hex" | "steps">("editor");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInspectAsm = async () => {
    if (isAsmOpen) {
      setIsAsmOpen(false);
      return;
    }
    setIsAsmOpen(true);
    setIsDisassembling(true);
    try {
      const res = await fetch("/api/code/disassemble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      setAsmOutput(data.assembly || "// No assembly produced.");
    } catch {
      setAsmOutput("// Disassembly failed.");
    } finally {
      setIsDisassembling(false);
    }
  };

  const formattedTestcases: DsaTestcase[] = testcases.map((t) => ({
    input: t.input,
    expected_output: t.expectedOutput,
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setCode(content);
      }
    };
    reader.readAsText(file);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowConsole(true);
    setRunOutput(null);
    setEvalResult(null);

    const stdinToUse = customInputEnabled
      ? customStdin
      : (formattedTestcases[0]?.input ?? "");

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: stdinToUse }),
      });
      const data = await res.json();
      setRunOutput({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        timeMs: data.executionTimeMs,
      });

      if (!customInputEnabled && formattedTestcases.length > 0) {
        const evalOutcome = evaluateDsaSuite(
          [{ actual: data.stdout || "", runtimeMs: data.executionTimeMs ?? 0 }],
          [formattedTestcases[0]]
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
  };

  const handleSubmit = async () => {
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
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white select-none">
      {/* Top Compiler Toolbar (Matching CodeChef Image 1) */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121824] border-b border-black/40 shrink-0">
        <div className="flex items-center gap-3">
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

          {/* View Mode Pill Switcher (Code | Hex | Steps) */}
          <div className="hidden sm:flex items-center gap-0.5 bg-black/60 p-0.5 rounded-full border border-neutral-700">
            <button
              onClick={() => setActiveView("editor")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                activeView === "editor"
                  ? "bg-white text-black shadow-xs font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Code Editor"
            >
              <CodeIcon className="w-3 h-3" />
              <span>Code</span>
            </button>
            <button
              onClick={() => setActiveView("hex")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                activeView === "hex"
                  ? "bg-[#FAFF00] text-black shadow-xs font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Binary Hex & Format Overlay"
            >
              <Binary className="w-3 h-3" />
              <span>Hex</span>
            </button>
            <button
              onClick={() => setActiveView("steps")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                activeView === "steps"
                  ? "bg-[#FAFF00] text-black shadow-xs font-black"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Step-by-step Disassembly Deconstruction"
            >
              <GitCompare className="w-3 h-3" />
              <span>Steps</span>
            </button>
          </div>
        </div>

        {/* Action Icons: Upload File & Reset */}
        <div className="flex items-center gap-2">
          {/* File Upload Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".cpp,.c,.java,.py,.js,.sql,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white rounded-full transition-colors border border-white/15"
            title="Upload Solution File"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {/* Inspect ASM / Disassembly (REA Binary Integration) */}
          <button
            onClick={handleInspectAsm}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-full transition-colors border ${
              isAsmOpen
                ? "bg-[#FAFF00] text-black border-[#FAFF00]"
                : "bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border-white/15"
            }`}
            title="Inspect Compiled x86/ARM Assembly (REA Decompiler)"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect ASM</span>
          </button>

          {/* Reset Code */}
          <button
            onClick={handleReset}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Reset Code Boilerplate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="flex-1 min-h-[220px] overflow-hidden">
        {activeView === "editor" && (
          <CodeEditor
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
            onRun={handleRun}
            hideHeader={true}
          />
        )}
        {activeView === "hex" && <HexInspector />}
        {activeView === "steps" && <StepComparator />}
      </div>

      {/* Binary / ASM Disassembly Drawer (REA Engine) */}
      {isAsmOpen && (
        <div className="border-t border-neutral-800 bg-[#0A0E1A] p-3.5 max-h-56 overflow-y-auto font-mono text-xs select-text">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-neutral-800">
            <span className="text-[#FAFF00] font-black uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Compiled Binary Disassembly (-O3)
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">REA Binary Engine</span>
          </div>
          {isDisassembling ? (
            <div className="text-neutral-400 py-3 text-center">Disassembling binary opcodes...</div>
          ) : (
            <pre className="text-emerald-400 whitespace-pre-wrap font-mono text-xs leading-relaxed">{asmOutput}</pre>
          )}
        </div>
      )}

      {/* Collapsible "Test against Custom Input" (Matching CodeChef Image 1) */}
      <div className="border-t border-neutral-800 bg-[#141A29]">
        <button
          onClick={() => setCustomInputEnabled(!customInputEnabled)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-mono font-bold text-neutral-300 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${customInputEnabled ? "bg-[#FAFF00]" : "bg-neutral-600"}`} />
            <span>Test against Custom Input</span>
          </div>
          {customInputEnabled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {customInputEnabled && (
          <div className="px-4 pb-3">
            <textarea
              value={customStdin}
              onChange={(e) => setCustomStdin(e.target.value)}
              placeholder="Your program will run with custom input"
              rows={3}
              className="w-full bg-black/60 border border-neutral-700 rounded-lg p-2.5 font-mono text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FAFF00] resize-y"
            />
          </div>
        )}
      </div>

      {/* Execution Results / Console Output Drawer */}
      {showConsole && (
        <div className="border-t border-neutral-800 bg-black/90 p-3 max-h-40 overflow-y-auto font-mono text-xs select-text">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold uppercase text-[11px] text-neutral-400">Execution Output</span>
            {evalResult && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
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
                  ? `Passed (${evalResult.passedCount}/${evalResult.totalCount})`
                  : `Mismatch (${evalResult.passedCount}/${evalResult.totalCount})`}
              </span>
            )}
          </div>

          {runOutput && (
            <div>
              {runOutput.stdout && (
                <pre className="text-green-400 whitespace-pre-wrap">{runOutput.stdout}</pre>
              )}
              {runOutput.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap mt-1">{runOutput.stderr}</pre>
              )}
            </div>
          )}

          {evalResult?.mismatchDetails && (
            <div className="mt-2 p-2 bg-red-950/40 border border-red-800/40 rounded-lg text-neutral-300">
              <div><strong>Actual:</strong> {evalResult.mismatchDetails.actual || "<empty>"}</div>
              <div><strong>Expected:</strong> {evalResult.mismatchDetails.expected}</div>
              <div className="text-red-400 mt-1">{evalResult.mismatchDetails.reason}</div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Bar (Run | Submit | Next - Matching CodeChef Image 1) */}
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

        {/* Run, Submit, Next Action Cluster */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold px-4 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-white" />
            {isRunning ? "Running..." : "Run"}
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            {isSubmitting ? "Submitting..." : "Submit"}
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
