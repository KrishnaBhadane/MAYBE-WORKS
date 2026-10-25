"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, ShieldAlert, Clock, ArrowRight, Lock, KeyRound, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Contest } from "@/lib/contests/store";

export default function ContestsPortalPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contests")
      .then((res) => res.json())
      .then((data) => {
        if (data.contests) setContests(data.contests);
      })
      .catch(() => {});
  }, []);

  const handleJoinWithCode = async (codeToUse?: string) => {
    const code = (codeToUse || accessCode).trim().toUpperCase();
    if (!code) {
      setErrorMsg("Please enter a valid contest access code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contests/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setErrorMsg(data.error || "Invalid contest code.");
        setLoading(false);
        return;
      }

      // Route directly into the proctored contest arena
      router.push(`/contests/${data.contestId}?code=${encodeURIComponent(code)}`);
    } catch {
      setErrorMsg("Failed to verify access code.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FAFF00] selection:text-black">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {/* Top Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAFF00]/10 border border-[#FAFF00]/30 text-[#FAFF00] text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>CodeChef-Style Proctoring Arena</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase">
            Engineering Contests
          </h1>

          <p className="text-sm text-neutral-400 font-sans leading-relaxed">
            Admin-governed timed competitions with real-time browser integrity proctoring,
            clipboard lockout, tab-switch penalty tracking, and instant scoreboards.
          </p>
        </div>

        {/* Access Code Input Box */}
        <div className="max-w-xl mx-auto bg-[#0E1424] border-2 border-[#FAFF00] rounded-2xl p-6 sm:p-8 shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAFF00]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#FAFF00] uppercase tracking-wider mb-2">
            <KeyRound className="w-4 h-4" />
            <span>Enter Contest Access Code</span>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">
            Have an admin invite code for a live test?
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase());
                  setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinWithCode();
                }}
                placeholder="e.g. CODE-2026"
                className="w-full bg-black/80 border-2 border-white/20 focus:border-[#FAFF00] rounded-xl px-4 py-3.5 font-mono text-base font-bold text-white uppercase tracking-wider placeholder-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-red-400 font-mono bg-red-950/40 border border-red-800 p-2.5 rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              onClick={() => handleJoinWithCode()}
              disabled={loading}
              variant="yellow"
              size="lg"
              className="w-full rounded-xl font-black uppercase text-sm py-3.5 shadow-lg flex items-center justify-center gap-2"
            >
              <span>{loading ? "Verifying..." : "Enter Live Contest Arena"}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </div>

          {/* Anti-Cheat Features List */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FAFF00]" />
              <span>Copy/Paste Disabled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#FAFF00]" />
              <span>Tab-Switch Penalties</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FAFF00]" />
              <span>Strict Countdown Timer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FAFF00]" />
              <span>Live Admin Telemetry</span>
            </div>
          </div>
        </div>

        {/* Active Contests List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-mono font-bold uppercase tracking-wider text-neutral-300">
              Active Official Contests
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              {contests.length} Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contests.map((c) => (
              <div
                key={c.id}
                className="bg-[#0C101C] border border-white/15 hover:border-[#FAFF00] rounded-2xl p-6 transition-colors duration-150 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="yellow" className="font-mono text-[11px] font-bold">
                      Code: {c.accessCode}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      {c.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {c.title}
                  </h3>

                  <p className="text-xs text-neutral-400 font-sans line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                      {c.questions.length} Questions
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-800 text-red-300">
                      -{c.tabSwitchPenalty} pts / Tab-switch
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-neutral-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    Live & Open
                  </span>

                  <button
                    onClick={() => {
                      setAccessCode(c.accessCode);
                      handleJoinWithCode(c.accessCode);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#FAFF00] text-black font-mono font-black text-xs hover:bg-white transition-colors"
                  >
                    <span>Join with Code</span>
                    <ArrowRight className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
