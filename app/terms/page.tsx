import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — kreepycode",
  description: "Terms and conditions governing the kreepycode habit-based learning platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 select-none font-sans">
      <div className="border-b-2 border-black pb-8 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 hover:text-black mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="yellow">Agreement</Badge>
          <span className="font-mono text-xs text-neutral-500">Effective: October 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
          Rules, usage constraints, and operational guidelines governing participation on kreepycode.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-neutral-800 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            1. Habit Architecture & 2:00 AM Daily Locks
          </h2>
          <p>
            kreepycode enforces a strict sequential progression model. Each day milestone must be completed in order. Future days remain locked until 2:00 AM of the subsequent localized day. Attempts to circumvent locks via client tampering or replay attacks will result in account disqualification and streak forfeiture.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            2. Code Execution Sandbox Limits
          </h2>
          <p>
            You agree to use our C++ and SQL execution environments strictly for educational practice. Prohibited activities include:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-neutral-700">
            <li>Attempting network calls or socket connections from execution sandboxes.</li>
            <li>Fork bombs, intentional memory exhaustion, or denial-of-service loops.</li>
            <li>Submitting malware, exploits, or reverse-shell scripts.</li>
          </ul>
          <p>
            All remote execution processes are capped at 5000 milliseconds and 128MB RAM.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            3. Intellectual Property
          </h2>
          <p>
            All curriculum notes, architectural diagrams, curated problem sequences, and video lectures provided on kreepycode are proprietary assets. You retain full ownership of any original source code you submit to solve exercises.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            4. Service Availability & Execution SLA
          </h2>
          <p>
            While we strive for 99.9% compiler and database worker uptime, compilation services may experience occasional latency during high server load. Compiler responses are provided on a best-effort basis without warranty.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            5. Account Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate execution sandbox limits, engage in automated bot submissions, or abuse administrative override endpoints.
          </p>
        </section>

        <section className="pt-6 border-t border-black/10 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>kreepycode legal compliance</span>
          <div className="flex items-center gap-1.5 text-black font-bold">
            <Scale className="w-4 h-4 text-black" />
            <span>Standard Developer Agreement</span>
          </div>
        </section>
      </div>
    </div>
  );
}
