"use client";

import { useState } from "react";
import { Check, X, HelpCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface McqViewerProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswerCorrect?: () => void;
  isCompleted?: boolean;
  className?: string;
}

export function McqViewer({
  question,
  options,
  correctIndex,
  explanation,
  onAnswerCorrect,
  isCompleted = false,
  className = "",
}: McqViewerProps) {
  const [prevQuestion, setPrevQuestion] = useState(question);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(isCompleted ? correctIndex : null);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(isCompleted);

  // Clean state reset when question prop changes without cascading useEffect render
  if (prevQuestion !== question) {
    setPrevQuestion(question);
    setSelectedIndex(isCompleted ? correctIndex : null);
    setHasEvaluated(isCompleted);
  }

  const handleSelect = (idx: number) => {
    if (hasEvaluated) return;
    setSelectedIndex(idx);
    setHasEvaluated(true);
    if (idx === correctIndex) {
      onAnswerCorrect?.();
    }
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <div className={`p-6 max-w-2xl mx-auto space-y-6 select-none ${className}`}>
      {/* Header */}
      <div>
        <Badge variant="subtle" className="mb-2">Knowledge Checkpoint</Badge>
        <h2 className="text-xl font-black text-black tracking-tight">{question}</h2>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isThisSelected = selectedIndex === idx;
          const isThisCorrect = idx === correctIndex;

          let btnStyles = "border-black/20 bg-white hover:border-black hover:bg-neutral-50";

          if (hasEvaluated) {
            if (isThisCorrect) {
              btnStyles = "border-black bg-[#FAFF00] text-black font-bold ring-2 ring-black";
            } else if (isThisSelected && !isCorrect) {
              btnStyles = "border-red-500 bg-red-50 text-red-900";
            } else {
              btnStyles = "opacity-50 border-black/10 bg-neutral-50";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasEvaluated}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xs border-2 transition-all duration-150 flex items-center justify-between cursor-pointer disabled:cursor-default ${btnStyles}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center font-mono font-bold text-xs bg-black text-white rounded-xs shrink-0">
                  {letter}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </div>

              {hasEvaluated && isThisCorrect && (
                <Check className="w-5 h-5 text-black shrink-0" />
              )}
              {hasEvaluated && isThisSelected && !isCorrect && (
                <X className="w-5 h-5 text-red-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Evaluation Explanation Card */}
      {hasEvaluated && (
        <div
          className={`p-4 border-2 rounded-xs animate-in fade-in duration-150 ${
            isCorrect ? "bg-[#FAFF00]/15 border-black text-black" : "bg-red-50 border-red-400 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider mb-1.5">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Correct Concept Understanding</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span>Concept Correction</span>
              </>
            )}
          </div>
          <p className="text-sm font-sans leading-relaxed">{explanation}</p>
          {!isCorrect && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedIndex(null);
                setHasEvaluated(false);
              }}
              className="mt-3 text-xs py-1"
            >
              Retry Checkpoint
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
