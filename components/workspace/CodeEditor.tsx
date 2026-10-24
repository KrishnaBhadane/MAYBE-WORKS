"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { OnMount } from "@monaco-editor/react";

export interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (val: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
  hideHeader?: boolean;
  className?: string;
}

// Skeleton placeholder to prevent CLS
function EditorSkeleton() {
  return (
    <div className="w-full h-full bg-[#1e1e1e] flex flex-col p-4 animate-pulse select-none">
      <div className="h-4 w-32 bg-white/10 rounded-md mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 bg-white/5 rounded-md" />
        <div className="h-3 w-1/2 bg-white/5 rounded-md" />
        <div className="h-3 w-5/6 bg-white/5 rounded-md" />
        <div className="h-3 w-2/3 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}

// Dynamically imported Monaco Editor (ssr: false)
const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

export function CodeEditor({
  value,
  language = "cpp",
  onChange,
  onRun,
  readOnly = false,
  hideHeader = false,
  className = "",
}: CodeEditorProps) {
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Add Cmd+Enter / Ctrl+Enter keyboard shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });
  };

  const monacoLang =
    language === "c"
      ? "c"
      : language === "java"
      ? "java"
      : language === "python" || language === "py"
      ? "python"
      : language === "javascript" || language === "js"
      ? "javascript"
      : language === "sql"
      ? "sql"
      : language === "rust" || language === "rs"
      ? "rust"
      : language === "go"
      ? "go"
      : "cpp";

  return (
    <div className={`relative w-full h-full min-h-[300px] bg-[#1e1e1e] overflow-hidden ${className}`}>
      {/* Editor Header if not hidden */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#121824] border-b border-black/40 text-xs font-mono text-neutral-400 select-none">
          <span className="uppercase font-bold tracking-wider text-neutral-300">
            {language}
          </span>
          <span className="text-[11px] text-neutral-500">
            <kbd className="px-1.5 py-0.5 bg-black/40 border border-neutral-700 rounded-sm text-neutral-300">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1.5 py-0.5 bg-black/40 border border-neutral-700 rounded-sm text-neutral-300">
              Enter
            </kbd>{" "}
            to run
          </span>
        </div>
      )}

      {/* Monaco Container */}
      <div className={`w-full ${hideHeader ? "h-full" : "h-[calc(100%-37px)]"}`}>
        <Monaco
          height="100%"
          language={monacoLang}
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 13.5,
            fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
            fontLigatures: true,
            lineNumbers: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
}
