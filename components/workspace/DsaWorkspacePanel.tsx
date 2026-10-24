"use client";

import { useState } from "react";
import { Play, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/workspace/CodeEditor";
import { executeCode } from "@/lib/services/codeRunner";
import { evaluateDsaSuite, type EvaluationResult, type DsaTestcase } from "@/lib/utils/testcaseEvaluator";

export interface DsaWorkspacePanelProps {
  initialCode: string;
  testcases: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  onSubmitSuccess: (code: string) => Promise<void>;
  isCompleted?: boolean;
}

export function DsaWorkspacePanel({
  initialCode,
  testcases,
  onSubmitSuccess,
  isCompleted = false,
}: DsaWorkspacePanelProps) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "testcases">("testcases");

  // Format testcases to DsaTestcase interface
  const formattedTestcases: DsaTestcase[] = testcases.map((t) => ({
    input: t.input,
    expected_output: t.expectedOutput,
  }));

  const runSample = async () => {
    setIsRunning(true);
    setActiveTab("output");
    try {
      const sample = formattedTestcases[0] || { input: "", expected_output: "" };
      const run = await executeCode({ language: "cpp", code, stdin: sample.input });
      const res = evaluateDsaSuite(
        [{ actual: run.stdout, runtimeMs: run.executionTimeMs ?? 0 }],
        [sample]
      );
      setEvalResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab("output");
    try {
      const outputs: Array<{ actual: string; runtimeMs: number }> = [];

      for (const tc of formattedTestcases) {
        const run = await executeCode({ language: "cpp", code, stdin: tc.input });
        outputs.push({ actual: run.stdout, runtimeMs: run.executionTimeMs ?? 0 });
      }

      const res = evaluateDsaSuite(outputs, formattedTestcases);
      setEvalResult(res);

      if (res.status === "passed") {
        await onSubmitSuccess(code);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      {/* Editor Area */}
      <div className="flex-1 min-h-[300px]">
        <CodeEditor
          language="cpp"
          value={code}
          onChange={(val) => setCode(val)}
          onRun={runSample}
        />
      </div>

      {/* Action Bar & Results Console */}
      <div className="border-t-2 border-black bg-white select-none">
        {/* Controls Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/10 bg-[#F8F9FA]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("testcases")}
              className={`text-xs font-mono font-bold px-2.5 py-1 border ${
                activeTab === "testcases" ? "bg-black text-white border-black" : "bg-white text-black border-black/20"
              }`}
            >
              Testcases ({testcases.length})
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`text-xs font-mono font-bold px-2.5 py-1 border ${
                activeTab === "output" ? "bg-black text-white border-black" : "bg-white text-black border-black/20"
              }`}
            >
              Console Output
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runSample} disabled={isRunning || isSubmitting}>
              <Play className="w-3.5 h-3.5 mr-1" />
              {isRunning ? "Running..." : "Run Test"}
            </Button>
            <Button
              variant="yellow"
              size="sm"
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting || isCompleted}
            >
              <Send className="w-3.5 h-3.5 mr-1 text-black" />
              {isSubmitting ? "Evaluating..." : isCompleted ? "Completed" : "Submit Solution"}
            </Button>
          </div>
        </div>

        {/* Console Content */}
        <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs">
          {activeTab === "testcases" ? (
            <div className="space-y-2">
              {testcases.map((tc, i) => (
                <div key={i} className="p-2.5 bg-[#F8F9FA] border border-black/15">
                  <span className="font-bold text-neutral-500 uppercase">Case {i + 1}:</span>
                  <div className="mt-1 text-neutral-800">
                    <strong>Input:</strong> {tc.input || "<empty>"}
                  </div>
                  <div className="text-neutral-800">
                    <strong>Expected:</strong> {tc.expectedOutput}
                  </div>
                </div>
              ))}
            </div>
          ) : evalResult ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold uppercase border ${
                    evalResult.status === "passed"
                      ? "bg-green-100 text-green-900 border-green-600"
                      : "bg-red-100 text-red-900 border-red-600"
                  }`}
                >
                  {evalResult.status === "passed" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {evalResult.status === "passed"
                    ? `All Passed (${evalResult.passedCount}/${evalResult.totalCount})`
                    : `Mismatch (${evalResult.passedCount}/${evalResult.totalCount})`}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-500 text-[11px]">
                  <Clock className="w-3 h-3" /> {evalResult.runtimeMs}ms
                </span>
              </div>
              {evalResult.mismatchDetails && (
                <div className="p-2 bg-[#FAFAFA] border border-black/15">
                  <div><strong>Actual:</strong> {evalResult.mismatchDetails.actual || "<no output>"}</div>
                  <div><strong>Expected:</strong> {evalResult.mismatchDetails.expected}</div>
                  <div className="text-red-600 mt-1">{evalResult.mismatchDetails.reason}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-400">Click &ldquo;Run Test&rdquo; or &ldquo;Submit Solution&rdquo; to execute C++ compiler.</p>
          )}
        </div>
      </div>
    </div>
  );
}
