"use client";

import { Check, BookOpen, Terminal, Database, HelpCircle } from "lucide-react";
import type { DayTask } from "@/lib/supabase/types";

export interface DayTaskTabsProps {
  tasks: DayTask[];
  activeTaskId: string;
  completedTaskIdSet: Set<string>;
  onSelectTask: (taskId: string) => void;
}

export function DayTaskTabs({
  tasks,
  activeTaskId,
  completedTaskIdSet,
  onSelectTask,
}: DayTaskTabsProps) {
  const getTaskIcon = (type: DayTask["task_type"]) => {
    switch (type) {
      case "theory_video":
        return <BookOpen className="w-3.5 h-3.5" />;
      case "dsa_problem":
        return <Terminal className="w-3.5 h-3.5" />;
      case "sql_problem":
        return <Database className="w-3.5 h-3.5" />;
      case "mcq":
        return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex items-center gap-1.5 border-b-2 border-black bg-white px-4 py-2 overflow-x-auto select-none">
      {tasks.map((task, idx) => {
        const isActive = task.id === activeTaskId;
        const isCompleted = completedTaskIdSet.has(task.id);

        return (
          <button
            key={task.id}
            onClick={() => onSelectTask(task.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold transition-colors whitespace-nowrap border ${
              isActive
                ? "bg-black text-white border-black"
                : isCompleted
                ? "bg-[#FAFF00]/20 text-black border-black/30 hover:border-black"
                : "bg-[#F8F9FA] text-neutral-600 border-black/15 hover:border-black/40 hover:text-black"
            }`}
          >
            <span className="opacity-70">0{idx + 1}.</span>
            {getTaskIcon(task.task_type)}
            <span className="truncate max-w-[120px] sm:max-w-[160px]">{task.title}</span>
            {isCompleted && (
              <span className="w-4 h-4 bg-[#FAFF00] text-black flex items-center justify-center border border-black text-[10px]">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
