"use client";

import { useState, useMemo } from "react";
import { Database, Table, Key, Table2, ChevronDown, ChevronUp, Check } from "lucide-react";

export interface ColumnDef {
  name: string;
  type: string;
  isPk: boolean;
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
  sampleRows: string[][];
}

export interface SqlSchemaInspectorProps {
  schemaSql: string;
  onInsertColumn?: (columnName: string) => void;
}

export function SqlSchemaInspector({ schemaSql, onInsertColumn }: SqlSchemaInspectorProps) {
  const [showSampleData, setShowSampleData] = useState<boolean>(false);
  const [copiedCol, setCopiedCol] = useState<string | null>(null);

  // Parse tables and columns from schemaSql
  const tables: TableDef[] = useMemo(() => {
    if (!schemaSql || schemaSql.trim() === "") {
      return [
        {
          name: "employees",
          columns: [
            { name: "id", type: "INTEGER", isPk: true },
            { name: "first_name", type: "VARCHAR(50)", isPk: false },
            { name: "last_name", type: "VARCHAR(50)", isPk: false },
            { name: "department_id", type: "INTEGER", isPk: false },
            { name: "salary", type: "NUMERIC", isPk: false },
          ],
          sampleRows: [
            ["1", "Alice", "Smith", "101", "85000"],
            ["2", "Bob", "Jones", "102", "92000"],
            ["3", "Charlie", "Brown", "101", "78000"],
          ],
        },
      ];
    }

    const parsedTables: TableDef[] = [];
    const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
    let match: RegExpExecArray | null;

    while ((match = createRegex.exec(schemaSql)) !== null) {
      const tableName = match[1];
      const body = match[2];

      const columns: ColumnDef[] = [];
      const lines = body.split(/,\s*\n/);

      for (const line of lines) {
        const trimmed = line.trim();
        if (
          trimmed.toUpperCase().startsWith("PRIMARY KEY") ||
          trimmed.toUpperCase().startsWith("FOREIGN KEY") ||
          trimmed.toUpperCase().startsWith("CONSTRAINT")
        ) {
          continue;
        }

        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const colName = parts[0].replace(/[`"']/g, "");
          const colType = parts[1];
          const isPk = trimmed.toUpperCase().includes("PRIMARY KEY");
          columns.push({ name: colName, type: colType, isPk });
        }
      }

      // Look for sample INSERTs
      const sampleRows: string[][] = [];
      const insertRegex = new RegExp(`INSERT\\s+INTO\\s+${tableName}[^;]*?VALUES\\s*([\\s\\S]*?);`, "gi");
      const insertMatch = insertRegex.exec(schemaSql);
      if (insertMatch) {
        const valuesBlock = insertMatch[1];
        const rowRegex = /\(([^)]+)\)/g;
        let rowMatch: RegExpExecArray | null;
        let count = 0;
        while ((rowMatch = rowRegex.exec(valuesBlock)) !== null && count < 4) {
          const vals = rowMatch[1].split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
          sampleRows.push(vals);
          count++;
        }
      }

      parsedTables.push({
        name: tableName,
        columns: columns.length > 0 ? columns : [{ name: "id", type: "INTEGER", isPk: true }],
        sampleRows: sampleRows.length > 0 ? sampleRows : [["1", "Sample Record", "100"]],
      });
    }

    return parsedTables.length > 0
      ? parsedTables
      : [
          {
            name: "records",
            columns: [
              { name: "id", type: "INTEGER", isPk: true },
              { name: "name", type: "TEXT", isPk: false },
              { name: "value", type: "NUMERIC", isPk: false },
            ],
            sampleRows: [["1", "Alpha", "100"], ["2", "Beta", "200"]],
          },
        ];
  }, [schemaSql]);

  const [selectedTableIdx, setSelectedTableIdx] = useState<number>(0);
  const activeTable = tables[selectedTableIdx] || tables[0];

  const handleColumnClick = (colName: string) => {
    if (onInsertColumn) {
      onInsertColumn(colName);
    } else {
      navigator.clipboard.writeText(colName);
    }
    setCopiedCol(colName);
    setTimeout(() => setCopiedCol(null), 1500);
  };

  return (
    <div className="bg-[#141A29] border-b border-black/40 text-neutral-300 font-mono text-xs select-none">
      {/* Schema Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#FAFF00]" />
          <span className="font-bold uppercase text-[10px] text-white tracking-wider">
            Table Schema (HackerRank Inspector)
          </span>

          {/* Table Switcher */}
          {tables.length > 1 && (
            <select
              value={selectedTableIdx}
              onChange={(e) => setSelectedTableIdx(Number(e.target.value))}
              className="bg-black/60 border border-neutral-700 text-white text-[11px] font-bold rounded px-2 py-0.5 focus:outline-none focus:border-[#FAFF00]"
            >
              {tables.map((t, idx) => (
                <option key={t.name} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-400 font-bold">
            {activeTable.name} ({activeTable.columns.length} cols)
          </span>
        </div>

        {/* Toggle Sample Rows */}
        <button
          onClick={() => setShowSampleData(!showSampleData)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
        >
          <Table2 className="w-3 h-3 text-[#FAFF00]" />
          <span>{showSampleData ? "Hide Sample Rows" : "Preview Sample Rows"}</span>
          {showSampleData ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Interactive Columns Ribbon */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto bg-[#0E1320]">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mr-1">
          Columns:
        </span>
        {activeTable.columns.map((col) => {
          const isCopied = copiedCol === col.name;
          return (
            <button
              key={col.name}
              onClick={() => handleColumnClick(col.name)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-neutral-900 border border-neutral-700 hover:border-[#FAFF00] hover:text-white text-neutral-300 transition-colors whitespace-nowrap shadow-xs"
              title="Click to insert or copy column name"
            >
              {col.isPk ? (
                <Key className="w-3 h-3 text-amber-400" />
              ) : (
                <Table className="w-3 h-3 text-neutral-500" />
              )}
              <span className="font-bold text-white">{col.name}</span>
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                {col.type}
              </span>
              {isCopied && <Check className="w-3 h-3 text-green-400 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Collapsible Sample Rows Preview */}
      {showSampleData && (
        <div className="p-3 bg-black/80 border-t border-neutral-800 overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-700 text-neutral-400 text-[10px] uppercase">
                {activeTable.columns.map((col) => (
                  <th key={col.name} className="p-2 font-bold">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px] text-neutral-200">
              {activeTable.sampleRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-neutral-900/60 transition-colors">
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className="p-2 whitespace-nowrap">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
