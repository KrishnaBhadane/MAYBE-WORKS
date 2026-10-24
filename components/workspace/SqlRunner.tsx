"use client";

import { useMemo } from "react";
import { Play, Check, AlertCircle, Clock, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { SqlQueryResult } from "@/lib/services/sqlWorker";
import { evaluateSqlRows } from "@/lib/utils/testcaseEvaluator";

export interface SqlRunnerProps {
  queryResult: SqlQueryResult | null;
  expectedRows?: Array<Record<string, unknown>>;
  isRunning?: boolean;
  onExecute?: () => void;
  error?: string | null;
  className?: string;
}

export function SqlRunner({
  queryResult,
  expectedRows,
  isRunning = false,
  onExecute,
  error,
  className = "",
}: SqlRunnerProps) {
  const comparison = useMemo(() => {
    if (!queryResult || !expectedRows) return null;
    return evaluateSqlRows(queryResult.rows, expectedRows);
  }, [queryResult, expectedRows]);

  return (
    <div className={`flex flex-col h-full bg-white border-t border-black/10 select-none ${className}`}>
      {/* Console Chrome Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F9FA] border-b border-black/10 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="yellow"
            onClick={onExecute}
            isLoading={isRunning}
            className="text-xs py-1 px-3 shadow-none"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Run Query
          </Button>

          {queryResult && (
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {queryResult.executionTimeMs}ms
              </span>
              <span>•</span>
              <Badge variant="subtle">{queryResult.rows.length} rows</Badge>
            </div>
          )}
        </div>

        {/* Validation Status Indicator */}
        {comparison && (
          <div className="flex items-center gap-1.5 font-bold">
            {comparison.matched ? (
              <span className="inline-flex items-center gap-1 text-black bg-[#FAFF00] px-2 py-0.5 border border-black rounded-xs">
                <Check className="w-3.5 h-3.5" /> Output Matches Expected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-white bg-black px-2 py-0.5 rounded-xs">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Mismatch Detected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Query Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 font-mono text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Table Output Viewer */}
      <div className="flex-1 overflow-auto bg-white">
        {!queryResult && !error && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-xs font-mono py-12">
            <Database className="w-8 h-8 mb-2 opacity-30 text-black" />
            <span>Click &quot;Run Query&quot; to execute SQL in the Dedicated Web Worker.</span>
          </div>
        )}

        {queryResult && queryResult.columns.length > 0 && (
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="sticky top-0 bg-[#F8F9FA] z-10 border-b-2 border-black/10">
              <tr>
                <th className="py-2 px-3 text-neutral-400 font-normal w-12 border-r border-black/5">#</th>
                {queryResult.columns.map((col) => (
                  <th key={col} className="py-2 px-3 font-bold text-black border-r border-black/5 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.values.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-black/5 hover:bg-neutral-50 transition-colors ${
                    rowIdx % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                  }`}
                >
                  <td className="py-2 px-3 text-neutral-400 font-normal border-r border-black/5 select-none">
                    {rowIdx + 1}
                  </td>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="py-2 px-3 text-neutral-900 border-r border-black/5">
                      {cell === null ? (
                        <span className="text-neutral-400 italic">NULL</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
