"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Plus, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Contest } from "@/lib/contests/store";

export default function AdminContestsListPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contests")
      .then((res) => res.json())
      .then((data) => {
        if (data.contests) setContests(data.contests);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-black" />
            <h1 className="text-2xl font-black text-black uppercase tracking-tight">
              Contest & Proctoring Management
            </h1>
          </div>
          <p className="text-xs text-neutral-600 font-sans">
            Create CodeChef-style contests, set unique access codes, and monitor live proctored participant telemetry.
          </p>
        </div>

        <Link href="/admin/contests/create" prefetch={true}>
          <Button variant="yellow" size="md" className="rounded-xl font-bold uppercase text-xs flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Create New Contest</span>
          </Button>
        </Link>
      </div>

      {/* Contests Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-neutral-500">
            Loading contests...
          </div>
        ) : contests.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-black/20 rounded-2xl bg-white space-y-3">
            <h3 className="text-base font-bold text-black uppercase">No Contests Created Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Create your first proctored engineering round with custom access codes, tab-switch penalties, and questions.
            </p>
            <Link href="/admin/contests/create">
              <Button variant="yellow" size="sm" className="rounded-lg font-bold">
                Create Contest Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contests.map((c) => (
              <div
                key={c.id}
                className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="yellow" className="font-mono text-xs font-black">
                      Code: {c.accessCode}
                    </Badge>
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.durationMinutes} Mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-black tracking-tight">{c.title}</h3>
                  <p className="text-xs text-neutral-600 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
                    <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-300 font-bold">
                      {c.questions.length} Questions (MCQ / DSA / SQL)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-100 border border-red-300 text-red-800 font-bold">
                      -{c.tabSwitchPenalty} pts / Tab-switch
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: Active
                  </span>

                  <Link href={`/admin/contests/${c.id}`} prefetch={true}>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-black hover:text-[#FAFF00]">
                      <span>Live Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
