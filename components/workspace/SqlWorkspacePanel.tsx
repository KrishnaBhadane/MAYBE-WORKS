"use client";

import { useState, useEffect } from "react";
import { Play, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CodeEditor } from "@/components/workspace/CodeEditor";
import { SqlRunner } from "@/components/workspace/SqlRunner";
import { getSqlEngine, type SqlQueryResult } from "@/lib/services/sqlWorker";
import { evaluateSqlRows, type SqlRow } from "@/lib/utils/testcaseEvaluator";

export interface SqlWorkspacePanelProps {
  initialCode: string;
  schemaSql?: string;
  expectedOutput: SqlRow[];
  onSubmitSuccess: (code: string) => Promise<void>;
  isCompleted?: boolean;
}

export function SqlWorkspacePanel({
  initialCode,
  schemaSql = "",
  expectedOutput,
  onSubmitSuccess,
  isCompleted = false,
}: SqlWorkspacePanelProps) {
  const [query, setQuery] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [isDbReady, setIsDbReady] = useState(false);

  // Initialize WebAssembly SQLite database
  useEffect(() => {
    let mounted = true;
    const engine = getSqlEngine();
    engine
      .initDb(schemaSql)
      .then(() => {
        if (mounted) setIsDbReady(true);
      })
      .catch((err) => {
        if (mounted) setErrorMsg(err.message);
      });
    return () => {
      mounted = false;
    };
  }, [schemaSql]);

  const handleExecute = async () => {
    setIsRunning(true);
    setErrorMsg(undefined);
    try {
      const engine = getSqlEngine();
      const res = await engine.executeQuery(query);
      setQueryResult(res);

      const evaluation = evaluateSqlRows(res.rows, expectedOutput, false);
      setIsMatch(evaluation.matched);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Query execution failed";
      setErrorMsg(msg);
      setIsMatch(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!isMatch) return;
    setIsSubmitting(true);
    try {
      await onSubmitSuccess(query);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      {/* SQL Editor */}
      <div className="flex-1 min-h-[250px]">
        <CodeEditor
          language="sql"
          value={query}
          onChange={(val) => setQuery(val)}
          onRun={handleExecute}
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-black bg-[#F8F9FA] select-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-500 font-bold">
            {isDbReady ? "SQLite WASM Ready" : "Loading DB..."}
          </span>
          {isMatch === true && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-green-700 bg-green-100 border border-green-600 px-2 py-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Output Matches Expected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExecute} disabled={isRunning || !isDbReady}>
            <Play className="w-3.5 h-3.5 mr-1" />
            {isRunning ? "Running..." : "Run Query"}
          </Button>
          <Button
            variant="yellow"
            size="sm"
            onClick={handleSubmit}
            disabled={!isMatch || isSubmitting || isCompleted}
          >
            <Send className="w-3.5 h-3.5 mr-1 text-black" />
            {isSubmitting ? "Submitting..." : isCompleted ? "Completed" : "Submit Query"}
          </Button>
        </div>
      </div>

      {/* SQL Table Results Output */}
      <div className="border-t border-black/10 bg-white max-h-56 overflow-y-auto">
        <SqlRunner
          queryResult={queryResult}
          expectedRows={expectedOutput}
          isRunning={isRunning}
          onExecute={handleExecute}
          error={errorMsg}
        />
      </div>
    </div>
  );
}
