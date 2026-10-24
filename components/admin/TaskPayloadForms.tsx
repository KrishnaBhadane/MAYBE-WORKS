"use client";

import { Input } from "@/components/ui/Input";
import type { TaskType } from "@/lib/supabase/types";

interface TaskPayloadFormsProps {
  taskType: TaskType;
  formData: Record<string, string>;
  onChange: (key: string, val: string) => void;
}

export function TaskPayloadForms({ taskType, formData, onChange }: TaskPayloadFormsProps) {
  if (taskType === "theory_video") {
    return (
      <div className="space-y-3 p-4 bg-[#F8F9FA] border border-black/15">
        <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
          Theory & Video Configuration
        </h4>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            YouTube Video URL
          </label>
          <Input
            value={formData.videoUrl || ""}
            onChange={(e) => onChange("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Video Title
          </label>
          <Input
            value={formData.videoTitle || ""}
            onChange={(e) => onChange("videoTitle", e.target.value)}
            placeholder="e.g. Asymptotic Complexity and Memory Hierarchy"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Markdown Notes & Engineering Deep-Dive
          </label>
          <textarea
            value={formData.markdownNotes || ""}
            onChange={(e) => onChange("markdownNotes", e.target.value)}
            rows={4}
            placeholder="### Core Concepts..."
            className="w-full border-2 border-black p-2.5 text-xs font-mono focus:outline-none"
          />
        </div>
      </div>
    );
  }

  if (taskType === "dsa_problem") {
    return (
      <div className="space-y-3 p-4 bg-[#F8F9FA] border border-black/15">
        <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
          C++ DSA Problem Details
        </h4>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Problem Description & Constraints
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            rows={3}
            placeholder="Given an array of integers nums and an integer target..."
            className="w-full border-2 border-black p-2 text-xs font-sans focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            C++ Starter Code Boilerplate
          </label>
          <textarea
            value={formData.starterCode || ""}
            onChange={(e) => onChange("starterCode", e.target.value)}
            rows={4}
            placeholder="#include <iostream>&#10;using namespace std;&#10;&#10;int main() {&#10;    return 0;&#10;}"
            className="w-full border-2 border-black p-2 text-xs font-mono bg-[#1E1E1E] text-white focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
              Sample Input
            </label>
            <Input
              value={formData.sampleInput || ""}
              onChange={(e) => onChange("sampleInput", e.target.value)}
              placeholder="5&#10;1 2 3 4 5"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
              Expected Output
            </label>
            <Input
              value={formData.expectedOutput || ""}
              onChange={(e) => onChange("expectedOutput", e.target.value)}
              placeholder="15"
            />
          </div>
        </div>
      </div>
    );
  }

  if (taskType === "sql_problem") {
    return (
      <div className="space-y-3 p-4 bg-[#F8F9FA] border border-black/15">
        <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
          SQL Query Challenge Details
        </h4>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Problem Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            rows={2}
            placeholder="Write a query to identify top 3 highest revenue departments..."
            className="w-full border-2 border-black p-2 text-xs font-sans focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Schema DDL & Seed SQL
          </label>
          <textarea
            value={formData.schemaSql || ""}
            onChange={(e) => onChange("schemaSql", e.target.value)}
            rows={3}
            placeholder="CREATE TABLE employees (id INT, salary INT);&#10;INSERT INTO employees VALUES (1, 95000);"
            className="w-full border-2 border-black p-2 text-xs font-mono focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Starter Query
          </label>
          <Input
            value={formData.starterQuery || ""}
            onChange={(e) => onChange("starterQuery", e.target.value)}
            placeholder="SELECT * FROM employees;"
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Expected Rows (JSON Array)
          </label>
          <Input
            value={formData.expectedRowsJson || ""}
            onChange={(e) => onChange("expectedRowsJson", e.target.value)}
            placeholder='[{"department": "Engineering", "revenue": 450000}]'
          />
        </div>
      </div>
    );
  }

  // MCQ Form
  return (
    <div className="space-y-3 p-4 bg-[#F8F9FA] border border-black/15">
      <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
        Architectural MCQ Details
      </h4>
      <div>
        <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
          Checkpoint Question
        </label>
        <Input
          value={formData.question || ""}
          onChange={(e) => onChange("question", e.target.value)}
          placeholder="What is the worst-case time complexity of quickselect on an unsorted array?"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={formData.option0 || ""}
          onChange={(e) => onChange("option0", e.target.value)}
          placeholder="Option A (Index 0)"
        />
        <Input
          value={formData.option1 || ""}
          onChange={(e) => onChange("option1", e.target.value)}
          placeholder="Option B (Index 1)"
        />
        <Input
          value={formData.option2 || ""}
          onChange={(e) => onChange("option2", e.target.value)}
          placeholder="Option C (Index 2)"
        />
        <Input
          value={formData.option3 || ""}
          onChange={(e) => onChange("option3", e.target.value)}
          placeholder="Option D (Index 3)"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Correct Option Index (0-3)
          </label>
          <Input
            type="number"
            min="0"
            max="3"
            value={formData.correctIndex || "0"}
            onChange={(e) => onChange("correctIndex", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Architectural Explanation
          </label>
          <Input
            value={formData.explanation || ""}
            onChange={(e) => onChange("explanation", e.target.value)}
            placeholder="Explanation shown when answered..."
          />
        </div>
      </div>
    </div>
  );
}
