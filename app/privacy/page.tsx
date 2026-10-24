import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — kreepycode",
  description: "Official Privacy Policy regarding developer telemetry, code submissions, and habit data.",
};

export default function PrivacyPage() {
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
          <Badge variant="yellow">Legal & Telemetry</Badge>
          <span className="font-mono text-xs text-neutral-500">Effective: October 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
          How kreepycode collects, stores, and protects developer data, code submissions, and localized habit timestamps.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-neutral-800 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            1. Information We Collect
          </h2>
          <p>
            When you register for an account on kreepycode, we collect minimal identifiable data:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-neutral-700">
            <li>Account credentials: Work or personal email address and encrypted password hashes.</li>
            <li>Submission data: C++ code solutions, SQL queries, execution runtimes, and MCQ responses.</li>
            <li>Habit telemetry: Localized browser timezone, daily milestone completion timestamps, and streak counts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            2. In-Browser SQLite WebAssembly & Worker Isolation
          </h2>
          <p>
            All SQL query evaluations run locally inside your browser via a Dedicated Web Worker powered by WebAssembly.
            Your practice database schemas and analytical queries are not transmitted to or stored on external servers during live execution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            3. Remote Code Execution
          </h2>
          <p>
            C++ compilation requests are transmitted securely to isolated execution sandboxes. Payloads contain strictly the source code and sample test inputs. Execution containers are ephemeral and destroyed immediately after process termination (5-second hard timeout).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            4. Timezones & 2:00 AM Daily Habit Calculations
          </h2>
          <p>
            To deliver consistent 2:00 AM daily milestone unlocks, kreepycode reads your local timezone (e.g., America/New_York or Asia/Kolkata). This value is used exclusively to schedule the next milestone unlock timestamp and is never shared with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-black uppercase tracking-tight font-mono">
            5. Zero Data Brokering
          </h2>
          <p>
            We do not sell, license, rent, or trade student profiles, problem solutions, or behavioral data to third-party ad networks or recruitment brokers.
          </p>
        </section>

        <section className="pt-6 border-t border-black/10 flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>kreepycode platform security</span>
          <div className="flex items-center gap-1.5 text-black font-bold">
            <Shield className="w-4 h-4 text-black" />
            <span>Encrypted with Enterprise Grade Row Level Security</span>
          </div>
        </section>
      </div>
    </div>
  );
}
