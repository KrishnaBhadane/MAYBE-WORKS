"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ContestQuestion, ContestMcqQuestion, ContestDsaQuestion, ContestSqlQuestion } from "@/lib/contests/store";

export default function CreateContestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessCode, setAccessCode] = useState(`CODE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [tabSwitchPenalty, setTabSwitchPenalty] = useState("5");

  const [questions, setQuestions] = useState<ContestQuestion[]>([
    {
      id: `q-mcq-${Date.now()}`,
      type: "mcq",
      title: "Asymptotic Complexity Invariant",
      question: "What is the worst-case time complexity of quickselect on an unsorted array?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
      correctIndex: 2,
      explanation: "Worst case pivot selection yields quadratic O(N^2) partitions.",
      points: 25,
    },
    {
      id: `q-dsa-${Date.now()}`,
      type: "dsa",
      title: "Two Sum Optimal Invariant",
      description: "### Problem Statement\nGiven an array of integers `nums` and an integer `target`, return the two numbers that sum up to `target`.\n\n### Constraints\n- Time Complexity: O(N)\n- Space: O(N) Hash Table",
      starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
      language: "cpp",
      sampleTestcases: [{ input: "4\n2 7 11 15\n9", expectedOutput: "2 7" }],
      hiddenTestcases: [],
      points: 50,
    },
    {
      id: `q-sql-${Date.now()}`,
      type: "sql",
      title: "Top Earning Engineers Query",
      description: "### Task Requirement\nWrite a query to retrieve all employees with salary > 90000 ordered by salary DESC.\n\n### Target Schema\n`employees(id INT, name TEXT, salary INT)`",
      schemaSql: "CREATE TABLE employees (id INT, name TEXT, salary INT);\nINSERT INTO employees VALUES (1, 'Alice', 95000), (2, 'Bob', 82000), (3, 'Charlie', 110000);",
      starterQuery: "SELECT name, salary FROM employees WHERE salary > 90000 ORDER BY salary DESC;",
      expectedRows: [{ name: "Charlie", salary: 110000 }, { name: "Alice", salary: 95000 }],
      points: 25,
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateCode = () => {
    setAccessCode(`CODE-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleAddMcq = () => {
    const newMcq: ContestMcqQuestion = {
      id: `q-mcq-${Date.now()}`,
      type: "mcq",
      title: "New MCQ Question",
      question: "Which invariant holds true?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Explanation for answer.",
      points: 20,
    };
    setQuestions([...questions, newMcq]);
  };

  const handleAddDsa = () => {
    const newDsa: ContestDsaQuestion = {
      id: `q-dsa-${Date.now()}`,
      type: "dsa",
      title: "New C++ Algorithmic Problem",
      description: "### Problem Statement\nImplement the required algorithm.\n\n### Constraints\n- Time: O(N)\n- Space: O(1)",
      starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
      language: "cpp",
      sampleTestcases: [{ input: "1 2 3", expectedOutput: "6" }],
      hiddenTestcases: [],
      points: 40,
    };
    setQuestions([...questions, newDsa]);
  };

  const handleAddSql = () => {
    const newSql: ContestSqlQuestion = {
      id: `q-sql-${Date.now()}`,
      type: "sql",
      title: "New SQL Query Challenge",
      description: "### Task Requirement\nWrite an ANSI SQL query to solve the specification.",
      schemaSql: "CREATE TABLE users (id INT, email TEXT);\nINSERT INTO users VALUES (1, 'user@example.com');",
      starterQuery: "SELECT * FROM users;",
      expectedRows: [{ id: 1, email: "user@example.com" }],
      points: 30,
    };
    setQuestions([...questions, newSql]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Contest title is required.");
      return;
    }
    if (questions.length === 0) {
      setErrorMsg("Please add at least one question to the contest.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          accessCode,
          durationMinutes: Number(durationMinutes) || 60,
          tabSwitchPenalty: Number(tabSwitchPenalty) || 5,
          questions,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to create contest.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/admin/contests/${data.contest.id}`);
    } catch {
      setErrorMsg("Error creating contest.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/contests" className="p-2 rounded-full border border-black/20 hover:border-black transition-colors">
            <ArrowLeft className="w-4 h-4 text-black" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              Create New Proctored Contest
            </h1>
            <p className="text-xs text-neutral-600 font-sans">
              Configure contest timer, access code, anti-cheat penalty rules, and question suite.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Contest Info */}
        <div className="p-6 bg-white border-2 border-black rounded-xl space-y-4 shadow-xs">
          <h2 className="text-sm font-black uppercase tracking-wider text-black font-mono">
            General Configuration
          </h2>

          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
              Contest Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CodeChef Proctored Round 1 — Systems & DSA"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
              Contest Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Comprehensive assessment with tab-switch penalties and clipboard restrictions..."
              className="w-full border-2 border-black p-2.5 text-xs font-sans rounded-none focus:outline-none"
            />
          </div>

          {/* Access Code & Timer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono font-bold text-neutral-700">
                  Access Code
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[10px] font-mono font-bold text-blue-700 hover:underline"
                >
                  Generate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="font-mono font-bold uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                Duration (Minutes)
              </label>
              <Input
                type="number"
                min="5"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                Penalty / Tab-Switch (Points)
              </label>
              <Input
                type="number"
                min="0"
                max="50"
                value={tabSwitchPenalty}
                onChange={(e) => setTabSwitchPenalty(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Questions Suite */}
        <div className="p-6 bg-white border-2 border-black rounded-xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/10 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-black font-mono">
                Contest Questions ({questions.length})
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Mix of MCQ concept checkpoints, C++ DSA algorithms, and SQL query tasks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" onClick={handleAddMcq} variant="outline" size="sm" className="text-xs font-bold">
                + Add MCQ
              </Button>
              <Button type="button" onClick={handleAddDsa} variant="outline" size="sm" className="text-xs font-bold">
                + Add DSA
              </Button>
              <Button type="button" onClick={handleAddSql} variant="outline" size="sm" className="text-xs font-bold">
                + Add SQL
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-[#F8F9FA] border border-black/20 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-xs text-black uppercase">
                    Q{idx + 1}: [{q.type.toUpperCase()}] {q.title} ({q.points} pts)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">Title</label>
                    <Input
                      value={q.title}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].title = e.target.value;
                        setQuestions(copy);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-neutral-600 mb-1">Points</label>
                    <Input
                      type="number"
                      value={q.points}
                      onChange={(e) => {
                        const copy = [...questions];
                        copy[idx].points = Number(e.target.value) || 0;
                        setQuestions(copy);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-100 border border-red-500 rounded-lg text-xs font-mono text-red-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="yellow"
          size="lg"
          className="w-full rounded-xl font-black uppercase text-sm py-4 shadow-md"
        >
          {isSubmitting ? "Launching Contest..." : "Save & Launch Live Contest"}
        </Button>
      </form>
    </div>
  );
}
