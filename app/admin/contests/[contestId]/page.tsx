"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  ShieldAlert,
  UserX,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Contest, ContestParticipant, ContestViolationEvent } from "@/lib/contests/store";

interface PageProps {
  params: Promise<{
    contestId: string;
  }>;
}

export default function AdminContestDashboardPage({ params }: PageProps) {
  const { contestId } = use(params);

  const [contest, setContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<ContestParticipant[]>([]);
  const [violations, setViolations] = useState<ContestViolationEvent[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [kickingEmail, setKickingEmail] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/contests/${contestId}`);
      const data = await res.json();
      if (data.contest) setContest(data.contest);
      if (data.participants) setParticipants(data.participants);
      if (data.violations) setViolations(data.violations);
      setLastRefreshed(new Date());
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Real-time live polling every 2.5 seconds
    const interval = setInterval(fetchDashboardData, 2500);
    return () => clearInterval(interval);
  }, [contestId]);

  const handleCopyAccessCode = () => {
    if (!contest) return;
    navigator.clipboard.writeText(contest.accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleKickUser = async (userEmail: string) => {
    if (!confirm(`Are you sure you want to kick and disqualify ${userEmail} from this contest?`)) {
      return;
    }

    setKickingEmail(userEmail);
    try {
      const res = await fetch(`/api/contests/${contestId}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch {
      // Fallback
    } finally {
      setKickingEmail(null);
    }
  };

  if (!contest) {
    return (
      <div className="p-8 font-mono text-xs text-neutral-500">
        Loading live proctoring dashboard...
      </div>
    );
  }

  // Sorted leaderboard by netScore descending, then by tabSwitches ascending
  const sortedParticipants = [...participants].sort((a, b) => {
    if (b.netScore !== a.netScore) return b.netScore - a.netScore;
    return a.tabSwitches - b.tabSwitches;
  });

  const activeCount = participants.filter((p) => p.status !== "kicked").length;
  const kickedCount = participants.filter((p) => p.status === "kicked").length;
  const flaggedCount = participants.filter((p) => p.status === "flagged").length;

  return (
    <div className="space-y-8 select-none pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/contests" className="p-2 rounded-full border border-black/20 hover:border-black transition-colors">
            <ArrowLeft className="w-4 h-4 text-black" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                Live Contest Proctoring Dashboard
              </h1>
            </div>
            <p className="text-xs text-neutral-600 font-sans">
              Monitoring real-time telemetry, tab-switch penalties, and participants for &quot;{contest.title}&quot;.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black rounded-lg hover:bg-neutral-100 transition-colors font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </button>

          <Link href={`/contests/${contest.id}?code=${contest.accessCode}`} target="_blank">
            <Button variant="yellow" size="sm" className="rounded-lg font-bold flex items-center gap-1">
              <span>View Student Arena</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Access Code Card */}
        <div className="p-5 bg-white border-2 border-black rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Access Code</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-black">{contest.accessCode}</span>
            <button
              onClick={handleCopyAccessCode}
              className="p-1.5 border border-black/20 rounded hover:border-black transition-colors text-black"
              title="Copy Access Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 block pt-1">
            Share this with students to join
          </span>
        </div>

        {/* Total Joined */}
        <div className="p-5 bg-white border-2 border-black rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Joined Participants</span>
          <div className="text-3xl font-black font-mono text-black">{participants.length}</div>
          <span className="text-[10px] font-mono text-green-700 font-bold block pt-1">
            {activeCount} Active / In Arena
          </span>
        </div>

        {/* Tab Switch Violations */}
        <div className="p-5 bg-white border-2 border-black rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Proctoring Violations</span>
          <div className="text-3xl font-black font-mono text-red-600">
            {violations.length}
          </div>
          <span className="text-[10px] font-mono text-red-600 font-bold block pt-1">
            {flaggedCount} Flagged for repeated exits
          </span>
        </div>

        {/* Disqualified / Kicked */}
        <div className="p-5 bg-white border-2 border-black rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase">Kicked / Disqualified</span>
          <div className="text-3xl font-black font-mono text-neutral-900">{kickedCount}</div>
          <span className="text-[10px] font-mono text-neutral-500 block pt-1">
            -{contest.tabSwitchPenalty} pts per tab switch
          </span>
        </div>
      </div>

      {/* Live Scoreboard / Leaderboard Table */}
      <div className="bg-white border-2 border-black rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8F9FA] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-black" />
            <h2 className="text-sm font-black uppercase tracking-wider text-black font-mono">
              Live Scoreboard & Participant Telemetry
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-500">
            Ranked by Net Score
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-100 border-b border-black/15 uppercase font-bold text-neutral-600 text-[11px]">
              <tr>
                <th className="p-3 text-center w-12">#</th>
                <th className="p-3">Participant</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Solved</th>
                <th className="p-3 text-center">Tab Switches</th>
                <th className="p-3 text-center">Time Away</th>
                <th className="p-3 text-center">Penalties</th>
                <th className="p-3 text-right">Net Score</th>
                <th className="p-3 text-center">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {sortedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-neutral-500 font-sans text-xs">
                    No participants have entered with code <strong>{contest.accessCode}</strong> yet.
                  </td>
                </tr>
              ) : (
                sortedParticipants.map((p, idx) => {
                  const solvedCount = Object.values(p.answeredQuestions || {}).filter((x) => x.solved).length;
                  const isKicked = p.status === "kicked";

                  return (
                    <tr
                      key={p.id}
                      className={isKicked ? "bg-red-50/60 opacity-60" : "hover:bg-neutral-50 transition-colors"}
                    >
                      <td className="p-3 text-center font-bold text-neutral-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-black">
                        <div>{p.userName}</div>
                        <div className="text-[11px] text-neutral-500 font-normal">{p.userEmail}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isKicked
                              ? "bg-red-200 text-red-900 border border-red-500"
                              : p.status === "flagged"
                              ? "bg-amber-100 text-amber-900 border border-amber-500"
                              : "bg-green-100 text-green-900 border border-green-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-black">
                        {solvedCount} / {contest.questions.length}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold ${p.tabSwitches > 0 ? "text-red-600" : "text-neutral-600"}`}>
                          {p.tabSwitches}x
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-neutral-600">
                        {p.totalTimeAwaySeconds.toFixed(1)}s
                      </td>
                      <td className="p-3 text-center font-bold text-red-600">
                        {p.penalties > 0 ? `-${p.penalties} pts` : "0 pts"}
                      </td>
                      <td className="p-3 text-right font-black text-black text-sm">
                        <span className={p.netScore > 0 ? "text-green-800" : "text-black"}>
                          {p.netScore} pts
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isKicked ? (
                          <span className="text-[11px] text-red-600 font-bold">Kicked</span>
                        ) : (
                          <button
                            onClick={() => handleKickUser(p.userEmail)}
                            disabled={kickingEmail === p.userEmail}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Kick</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Proctoring Audit Trail (Tab Switches & Clipboard Actions) */}
      <div className="bg-white border-2 border-black rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8F9FA] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-black font-mono">
              Anti-Cheat Real-Time Audit Log
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-500">
            {violations.length} Events Logged
          </span>
        </div>

        <div className="p-4 max-h-72 overflow-y-auto divide-y divide-black/10 font-mono text-xs">
          {violations.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 font-sans text-xs">
              No proctoring violations recorded yet. All participants are within focus.
            </div>
          ) : (
            violations.map((v) => (
              <div key={v.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 text-[11px]">
                    {new Date(v.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <span className="font-bold text-black">{v.userEmail}</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 border border-red-300 text-red-900 font-bold text-[10px] uppercase">
                    {v.type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-700 text-[11px]">{v.details}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
