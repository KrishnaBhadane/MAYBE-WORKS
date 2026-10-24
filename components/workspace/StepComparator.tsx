"use client";

import { useState } from "react";
import { GitCompare, CheckCircle2, Copy, Check, ChevronDown, Cpu, Lightbulb } from "lucide-react";

export interface AnalysisStep {
  stepNumber: number;
  title: string;
  question: string;
  targetLineNumbers: number[]; // 1-indexed assembly lines to highlight
  analystThought: string;
  recoveredRule: string;
  evidenceOffset: string;
  oracleStatus: "verified" | "matching" | "exact";
}

export interface CaseStudyPreset {
  id: string;
  title: string;
  targetBinary: string;
  arch: string;
  assemblyLines: string[];
  steps: AnalysisStep[];
  technicalDetails: {
    registers: Record<string, string>;
    callingConvention: string;
    rawHexDossier: string;
  };
}

export const CASE_STUDY_PRESETS: CaseStudyPreset[] = [
  {
    id: "dino-speed",
    title: "Chromium Dino Runner Velocity",
    targetBinary: "offline_runner.bundle.js / wasm_engine",
    arch: "x86-64 / V8 JIT",
    assemblyLines: [
      "0000000000001000 <advanceSpeed>:",
      "1000:  f3 0f 10 05 38 10 00 00   movss  xmm0, DWORD PTR [rip+0x1038]  # threshold = 13.0f",
      "1008:  0f 2e 07                   ucomiss xmm0, DWORD PTR [rdi]         # compare current speed with 13.0f",
      "100b:  76 0d                      jbe    101a <advanceSpeed+0x1a>       # if speed >= 13.0f, jump to return",
      "100d:  f3 0f 10 0d 33 10 00 00   movss  xmm1, DWORD PTR [rip+0x1033]  # acceleration = 0.001f",
      "1015:  f3 0f 58 07                addss  xmm0, DWORD PTR [rdi]         # new_speed = speed + 0.001f",
      "1019:  c3                         ret                                   # return new_speed in xmm0",
      "101a:  f3 0f 10 07                movss  xmm0, DWORD PTR [rdi]         # retain current speed unchanged",
      "101e:  c3                         ret                                   # return clamped speed",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Load Threshold Constant",
        question: "Where is the terminal velocity threshold defined in the engine?",
        targetLineNumbers: [2, 3],
        analystThought: "The function immediately loads a single-precision floating point constant from relative rip+0x1038 into xmm0 and compares it against the input pointer at [rdi].",
        recoveredRule: "THRESHOLD = 13.0 (Dword float literal 0x41500000)",
        evidenceOffset: "rip+0x1038 (0x00002040)",
        oracleStatus: "verified",
      },
      {
        stepNumber: 2,
        title: "Conditional Jump & Branch",
        question: "Does the runner accelerate forever or cap at a maximum speed?",
        targetLineNumbers: [4, 8, 9],
        analystThought: "Instruction ucomiss followed by jbe (jump if below or equal) branches to offset 0x101a if the current speed exceeds or equals 13.0. In that branch, it simply returns the existing speed without mutation.",
        recoveredRule: "if (current_speed >= 13.0) return current_speed;",
        evidenceOffset: "0x100b: jbe 101a",
        oracleStatus: "exact",
      },
      {
        stepNumber: 3,
        title: "Delta Acceleration Increment",
        question: "By how much does the speed increase per collision-free frame?",
        targetLineNumbers: [5, 6, 7],
        analystThought: "In the non-clamped branch, scalar single-precision addss adds the constant at rip+0x1033 (0.001f) to the existing velocity register and returns.",
        recoveredRule: "ACCELERATION = 0.001f; return speed + 0.001f;",
        evidenceOffset: "rip+0x1033 (0x3A83126F = 0.001f)",
        oracleStatus: "matching",
      },
      {
        stepNumber: 4,
        title: "Full Reconstructed Expression",
        question: "Can we synthesize the complete pure-logic rule?",
        targetLineNumbers: [2, 3, 4, 5, 6, 7, 8, 9],
        analystThought: "The entire 31-byte assembly sequence reduces cleanly to a single ternary arithmetic equation that passes 10,000 game frame simulations identically.",
        recoveredRule: "advanceSpeed(s) = (s < 13.0 ? s + 0.001 : s)",
        evidenceOffset: "Golden oracle checksum: 0x89AC21D0",
        oracleStatus: "verified",
      },
    ],
    technicalDetails: {
      registers: {
        rdi: "Pointer to current runner state struct containing float speed",
        xmm0: "Return register holding new floating point speed",
        xmm1: "Scratch register holding delta acceleration constant 0.001f",
      },
      callingConvention: "System V AMD64 ABI (float returned in %xmm0)",
      rawHexDossier: "f3 0f 10 05 38 10 00 00 0f 2e 07 76 0d f3 0f 10 0d 33 10 00 00 f3 0f 58 07 c3",
    },
  },
  {
    id: "calc-percent",
    title: "Windows Calculator % Logic",
    targetBinary: "Calculator.Model.dll",
    arch: "x86-64 MSVC",
    assemblyLines: [
      "0000000180024A10 <CalculatePercent>:",
      "4a10:  48 89 5c 24 08          mov    QWORD PTR [rsp+0x8], rbx",
      "4a15:  83 fa 01                cmp    edx, 0x1                       # test operator: 0x1 = Add / Sub",
      "4a18:  75 14                   jne    4a2e <CalculatePercent+0x1e>   # if mul/div, jump to direct 100 division",
      "4a1a:  f2 0f 59 c1             mulsd  xmm0, xmm1                     # percent = current * previous",
      "4a1e:  f2 0f 5e 05 8a 30 01 00 divsd  xmm0, QWORD PTR [rip+0x1308a]  # percent = (current * previous) / 100.0",
      "4a26:  48 8b 5c 24 08          mov    rbx, QWORD PTR [rsp+0x8]",
      "4a2b:  c3                      ret                                   # return for addition/subtraction mode",
      "4a2e:  f2 0f 5e 05 7a 30 01 00 divsd  xmm0, QWORD PTR [rip+0x1307a]  # percent = current / 100.0",
      "4a36:  48 8b 5c 24 08          mov    rbx, QWORD PTR [rsp+0x8]",
      "4a3b:  c3                      ret                                   # return for multiplication/division mode",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Operator Mode Branch",
        question: "Why does the % key behave differently in 200 + 10% vs 200 * 10%?",
        targetLineNumbers: [3, 4],
        analystThought: "Instruction cmp edx, 0x1 checks the pending calculation operator. If it is addition or subtraction (edx == 1), it takes the linear accumulation branch; otherwise it jumps to direct scaling at 0x4a2e.",
        recoveredRule: "isAddSub = (operator_mode == 1)",
        evidenceOffset: "edx register input flag",
        oracleStatus: "exact",
      },
      {
        stepNumber: 2,
        title: "Additive Percentage Calculation",
        question: "How is 10% of 200 calculated when adding?",
        targetLineNumbers: [5, 6, 7, 8],
        analystThought: "In the additive branch, mulsd multiplies current operand by previous accumulator (10 * 200 = 2000), then divsd divides by 100.0 yielding 20.0.",
        recoveredRule: "percent = (current * previous) / 100.0",
        evidenceOffset: "0x4a1a: mulsd xmm0, xmm1; divsd xmm0, [100.0]",
        oracleStatus: "verified",
      },
      {
        stepNumber: 3,
        title: "Multiplicative Scaling",
        question: "How is percentage calculated when multiplying?",
        targetLineNumbers: [9, 10, 11],
        analystThought: "In the multiplicative branch, current operand is simply divided by 100.0 directly (10 becomes 0.1). When subsequent equals is pressed, 200 * 0.1 evaluates to 20.",
        recoveredRule: "percent = current / 100.0",
        evidenceOffset: "0x4a2e: divsd xmm0, [100.0]",
        oracleStatus: "matching",
      },
    ],
    technicalDetails: {
      registers: {
        xmm0: "Current operand entered by user (e.g. 10.0)",
        xmm1: "Previous accumulator value (e.g. 200.0)",
        edx: "Pending binary operator tag (1 = Add/Subtract, 2 = Multiply/Divide)",
      },
      callingConvention: "Microsoft x64 Calling Convention",
      rawHexDossier: "48 89 5c 24 08 83 fa 01 75 14 f2 0f 59 c1 f2 0f 5e 05 8a 30 01 00 c3",
    },
  },
  {
    id: "dxball-pan",
    title: "Vintage Game Stereo Audio Pan",
    targetBinary: "dxball.exe (1996 PC Game)",
    arch: "x86 32-bit Native",
    assemblyLines: [
      "00412350 <CalculateSoundPan>:",
      "412350:  8b 44 24 04             mov    eax, DWORD PTR [esp+0x4]      # eax = ball_x (0 .. 640)",
      "412354:  2d 40 01 00 00          sub    eax, 0x140                    # eax = ball_x - 320 (center)",
      "412359:  69 c0 10 27 00 00       imul   eax, eax, 0x2710              # eax = delta * 10000",
      "41235f:  99                      cdq                                  # sign extend eax to edx:eax",
      "412360:  b9 40 01 00 00          mov    ecx, 0x140                    # ecx = 320",
      "412365:  f7 f9                   idiv   ecx                           # eax = (delta * 10000) / 320",
      "412367:  c3                      ret                                  # return DirectSound pan in eax",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Center Baseline Offset",
        question: "How does the game find the stereo balance center?",
        targetLineNumbers: [2, 3],
        analystThought: "The screen width is 640 pixels. Subtraction sub eax, 0x140 (320 decimal) centers the screen coordinate such that left boundary is -320, center is 0, and right is +320.",
        recoveredRule: "delta_x = ball_x - 320",
        evidenceOffset: "0x412354: sub eax, 320",
        oracleStatus: "exact",
      },
      {
        stepNumber: 2,
        title: "DirectSound Range Scaling",
        question: "What is the output range for hardware audio panning?",
        targetLineNumbers: [4, 5, 6, 7],
        analystThought: "DirectSound 3.0 expects panning values from -10,000 (far left) to +10,000 (far right). The routine multiplies delta_x by 10,000 (0x2710) and divides by half-width 320.",
        recoveredRule: "pan = (ball_x - 320) * 10000 / 320",
        evidenceOffset: "0x412359: imul eax, eax, 10000; idiv 320",
        oracleStatus: "verified",
      },
    ],
    technicalDetails: {
      registers: {
        eax: "Input coordinate X on stack, output pan value (-10000 to +10000)",
        ecx: "Divisor constant 320 (half screen width)",
      },
      callingConvention: "cdecl 32-bit x86 stack convention",
      rawHexDossier: "8b 44 24 04 2d 40 01 00 00 69 c0 10 27 00 00 99 b9 40 01 00 00 f7 f9 c3",
    },
  },
];

export function StepComparator() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("dino-speed");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const preset = CASE_STUDY_PRESETS.find((p) => p.id === selectedCaseId) || CASE_STUDY_PRESETS[0];
  const step = preset.steps[activeStepIndex] || preset.steps[0];

  const handleCopyAssembly = async () => {
    const text = preset.assemblyLines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D111A] text-neutral-200 font-mono text-xs select-text">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#080B12] border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-[#FAFF00]" />
          <span className="font-bold uppercase tracking-wider text-white text-[11px]">
            Assembly Step Comparator &amp; Deconstruction
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 font-bold">
            {preset.arch}
          </span>
        </div>

        {/* Case Study Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {CASE_STUDY_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedCaseId(p.id);
                setActiveStepIndex(0);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap ${
                selectedCaseId === p.id
                  ? "bg-[#FAFF00] text-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {p.title.split(" ")[0]}
            </button>
          ))}

          <button
            onClick={handleCopyAssembly}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 ml-1"
            title="Copy authentic disassembly"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy ASM"}</span>
          </button>
        </div>
      </div>

      {/* Step Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#121824] border-b border-neutral-800/80 overflow-x-auto shrink-0">
        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mr-1">Steps:</span>
        {preset.steps.map((s, idx) => {
          const isActive = activeStepIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-white text-black ring-2 ring-[#FAFF00] shadow-sm font-black"
                  : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${isActive ? "bg-black text-[#FAFF00]" : "bg-neutral-700 text-neutral-300"}`}>
                {s.stepNumber}
              </span>
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split: Left Disassembly vs Right Analyst Deduction */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 overflow-hidden">
        {/* Left Column: Disassembled Native Instructions */}
        <div className="overflow-y-auto p-4 bg-black/60 font-mono text-[11px] leading-relaxed">
          <div className="text-neutral-500 font-bold text-[10px] pb-1 border-b border-neutral-800 mb-2 flex items-center justify-between">
            <span>DISASSEMBLY ({preset.targetBinary})</span>
            <span>OPCODES &amp; OPERANDS</span>
          </div>

          <div className="space-y-1">
            {preset.assemblyLines.map((line, lineIdx) => {
              const lineNum = lineIdx + 1;
              const isHighlighted = step.targetLineNumbers.includes(lineNum);

              return (
                <div
                  key={lineIdx}
                  className={`px-2 py-1 rounded transition-colors flex items-start gap-3 ${
                    isHighlighted
                      ? "bg-amber-400/20 text-[#FAFF00] border-l-2 border-[#FAFF00] font-bold pl-2 shadow-inner"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="text-neutral-600 select-none text-[10px] w-4 text-right">
                    {lineNum}
                  </span>
                  <span className="font-mono whitespace-pre-wrap">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Analyst Deduction & Recovered Formula */}
        <div className="overflow-y-auto p-4 space-y-4 bg-[#111723]">
          {/* Active Step Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FAFF00] text-black uppercase">
                Step {step.stepNumber} of {preset.steps.length}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Oracle Verified
              </span>
            </div>
            <h3 className="text-sm font-bold text-white pt-1">{step.title}</h3>
            <p className="text-xs text-neutral-400 font-sans italic">{step.question}</p>
          </div>

          {/* Analyst Thought Card */}
          <div className="p-3.5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl space-y-2 text-neutral-300">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Reverse Engineering Deduction</span>
            </div>
            <p className="text-xs leading-relaxed font-sans text-neutral-300">
              {step.analystThought}
            </p>
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Evidence Landmark:</span>
              <code className="text-neutral-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                {step.evidenceOffset}
              </code>
            </div>
          </div>

          {/* Recovered Logic Formula */}
          <div className="p-3.5 bg-black/80 border border-[#FAFF00]/40 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#FAFF00] tracking-wider block">
              Recovered Arithmetic Rule
            </span>
            <code className="text-xs text-white font-bold block bg-neutral-900 p-2 rounded border border-neutral-800 overflow-x-auto">
              {step.recoveredRule}
            </code>
          </div>

          {/* Technical Details Disclosure */}
          <details className="border border-neutral-800 bg-neutral-900/50 rounded-xl p-3 text-xs">
            <summary className="font-bold text-neutral-300 cursor-pointer flex items-center justify-between list-none">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                <span>Calling Convention &amp; Register Maps</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </summary>

            <div className="pt-3 mt-2 border-t border-neutral-800 space-y-2 text-[11px] text-neutral-400">
              <div>
                <strong className="text-white block">ABI Convention:</strong>
                <span>{preset.technicalDetails.callingConvention}</span>
              </div>
              <div>
                <strong className="text-white block">Register Roles:</strong>
                <ul className="list-disc list-inside space-y-0.5 mt-1">
                  {Object.entries(preset.technicalDetails.registers).map(([reg, desc]) => (
                    <li key={reg}>
                      <code className="text-[#FAFF00]">{reg}</code>: {desc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong className="text-white block">Raw Byte Stream:</strong>
                <code className="text-[10px] text-neutral-400 break-all block bg-black/60 p-1.5 rounded mt-1">
                  {preset.technicalDetails.rawHexDossier}
                </code>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
