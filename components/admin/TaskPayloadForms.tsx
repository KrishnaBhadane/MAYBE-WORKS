"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { WikipediaArticleRenderer } from "@/components/ui/WikipediaArticleRenderer";
import { Eye, EyeOff, BookOpen, Code2 } from "lucide-react";
import type { TaskType } from "@/lib/supabase/types";

interface TaskPayloadFormsProps {
  taskType: TaskType;
  formData: Record<string, string>;
  onChange: (key: string, val: string) => void;
}

export function TaskPayloadForms({ taskType, formData, onChange }: TaskPayloadFormsProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (taskType === "theory_video") {
    return (
      <div className="space-y-4 p-4 bg-[#F8F9FA] border border-black/15">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Theory & Video Specification
          </h4>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black transition-colors"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Hide Wikipedia Preview" : "Wikipedia Preview"}
          </button>
        </div>

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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-mono font-bold text-neutral-600">
              Markdown Notes & Encyclopedic Deep-Dive (Wikipedia Style)
            </label>
            <span className="text-[10px] font-mono text-neutral-500">Supports #, ##, ###, Tables &gt; Quotes</span>
          </div>
          <textarea
            value={formData.markdownNotes || ""}
            onChange={(e) => onChange("markdownNotes", e.target.value)}
            rows={6}
            placeholder={`## Overview\nThis module analyzes cache coherence...\n\n### Invariant Guarantees\n- Temporal locality\n- Spatial locality\n\n> Note: Hardware caches rely on contiguous memory strides.`}
            className="w-full border-2 border-black p-2.5 text-xs font-mono focus:outline-none bg-white text-black"
          />
        </div>

        {showPreview && formData.markdownNotes && (
          <div className="p-4 bg-white border-2 border-black rounded-xs shadow-xs space-y-2">
            <div className="text-[10px] font-mono font-black uppercase text-neutral-500 border-b border-black/10 pb-1">
              Live Wikipedia Article Preview
            </div>
            <WikipediaArticleRenderer
              content={formData.markdownNotes}
              showToc={true}
              articleMeta={{ category: "Core Engineering Theory" }}
            />
          </div>
        )}
      </div>
    );
  }

  if (taskType === "dsa_problem") {
    return (
      <div className="space-y-4 p-4 bg-[#F8F9FA] border border-black/15">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            C++ Algorithmic Question Details
          </h4>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black transition-colors"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Hide Wikipedia Preview" : "Wikipedia Preview"}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-mono font-bold text-neutral-600">
              Problem Description & Question Specification (Wikipedia Report Style)
            </label>
            <span className="text-[10px] font-mono text-neutral-500">Use ### Headings for clean sections</span>
          </div>
          <textarea
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            rows={6}
            placeholder={`### Problem Statement\nGiven an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\n### Input Format\n- The first line contains an integer \`N\`.\n- The second line contains \`N\` space-separated integers.\n\n### Output Format\n- Print two space-separated indices.\n\n### Constraints\n- 2 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n\n> Note: Exactly one solution exists. You may not use the same element twice.`}
            className="w-full border-2 border-black p-2.5 text-xs font-sans focus:outline-none bg-white text-black"
          />
        </div>

        {showPreview && formData.description && (
          <div className="p-4 bg-white border-2 border-black rounded-xs shadow-xs space-y-2">
            <div className="text-[10px] font-mono font-black uppercase text-neutral-500 border-b border-black/10 pb-1">
              Live Question Report Preview (Wikipedia Format)
            </div>
            <WikipediaArticleRenderer
              content={formData.description}
              showToc={false}
              infoboxData={[
                { label: "Domain", value: "Algorithmic Systems" },
                { label: "Standard I/O", value: "stdin / stdout" },
                { label: "Time Bound", value: "1.00s execution" },
                { label: "Space Limit", value: "256 MB heap" },
              ]}
              articleMeta={{ category: "Algorithmic Invariants" }}
            />
          </div>
        )}

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
      <div className="space-y-4 p-4 bg-[#F8F9FA] border border-black/15">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-black font-mono">
            SQL Query Challenge Specification
          </h4>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black transition-colors"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? "Hide Wikipedia Preview" : "Wikipedia Preview"}
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">
            Problem Description (Wikipedia Report Style with ### Headings)
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            placeholder={`### Task Requirement\nWrite an ANSI SQL query to identify top 3 highest revenue departments...\n\n### Output Format\n| department | total_revenue |\n|---|---|\n\n### Invariant\n- Exclude departments with NULL revenue.`}
            className="w-full border-2 border-black p-2 text-xs font-sans focus:outline-none bg-white text-black"
          />
        </div>

        {showPreview && formData.description && (
          <div className="p-4 bg-white border-2 border-black rounded-xs shadow-xs space-y-2">
            <div className="text-[10px] font-mono font-black uppercase text-neutral-500 border-b border-black/10 pb-1">
              Live SQL Question Report Preview
            </div>
            <WikipediaArticleRenderer
              content={formData.description}
              showToc={false}
              infoboxData={[
                { label: "Engine", value: "SQLite 3 WASM" },
                { label: "Dialect", value: "ANSI SQL-92" },
              ]}
            />
          </div>
        )}

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
