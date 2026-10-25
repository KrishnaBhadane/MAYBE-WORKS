"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/courses";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Create account on server with auto email confirmation
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create account.");
        return;
      }

      // 2. Immediately sign in the confirmed user
      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setErrorMsg(signInError.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-white p-1 mb-4 flex items-center justify-center shadow-lg">
          <Image
            src="/brand/kreepycode-mark.png"
            alt="kreepycode logo"
            width={128}
            height={128}
            priority
            quality={100}
            unoptimized
            className="w-full h-full object-contain p-0.5"
          />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Create Account
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-500/50 rounded-xl flex items-start gap-2.5 text-xs text-red-300 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FAFF00] text-white placeholder-zinc-500 rounded-full px-5 py-3.5 text-sm outline-none transition-colors"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FAFF00] text-white placeholder-zinc-500 rounded-full px-5 py-3.5 text-sm outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 rounded-full bg-[#FAFF00] text-black font-black uppercase text-sm tracking-wider hover:bg-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-zinc-400 font-mono">
        Already have an account?{" "}
        <Link
          href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-[#FAFF00] hover:underline font-bold"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-black min-h-[calc(100vh-5rem)]">
      <Suspense fallback={<div className="font-mono text-sm text-zinc-400">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
