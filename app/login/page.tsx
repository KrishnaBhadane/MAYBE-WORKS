"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo");
  const redirectTo = rawRedirect || "/courses";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // If failed, check if user is unconfirmed and auto-confirm them
      if (error) {
        try {
          const confirmRes = await fetch("/api/auth/confirm-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
          });
          const confirmData = await confirmRes.json();
          if (confirmData?.confirmed) {
            // Retry sign-in now that user is confirmed
            const retry = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
            data = retry.data;
            error = retry.error;
          }
        } catch {
          // If confirm check failed, continue with original error
        }
      }

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Check for admin role
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin" && (!rawRedirect || rawRedirect === "/dashboard")) {
          router.push("/admin");
          router.refresh();
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg("An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPasswordAndSignIn = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsResetting(true);
    setErrorMsg(null);

    try {
      // Provision or update password instantly
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setErrorMsg(resData.error || "Failed to update password.");
        return;
      }

      // Now sign in immediately with the new password
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin" && (!rawRedirect || rawRedirect === "/dashboard")) {
          router.push("/admin");
          router.refresh();
          return;
        }
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setErrorMsg("Failed to sign in. Please try again.");
    } finally {
      setIsResetting(false);
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
          Sign In
        </h1>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-red-950/40 border border-red-500/50 rounded-xl flex flex-col gap-2.5 text-xs text-red-300 font-medium">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>

          {errorMsg.toLowerCase().includes("invalid login credentials") && (
            <button
              type="button"
              onClick={handleSetPasswordAndSignIn}
              disabled={isResetting}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FAFF00] hover:text-white uppercase tracking-wider cursor-pointer border-t border-red-500/30 pt-2 transition-colors text-left"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Updating &amp; Signing in...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  <span>Set this password for this account &amp; Sign In</span>
                </>
              )}
            </button>
          )}
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FAFF00] text-white placeholder-zinc-500 rounded-full px-5 py-3.5 text-sm outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isResetting}
          className="w-full mt-2 py-3.5 rounded-full bg-[#FAFF00] text-black font-black uppercase text-sm tracking-wider hover:bg-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-zinc-400 font-mono">
        Don&apos;t have an account?{" "}
        <Link
          href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-[#FAFF00] hover:underline font-bold"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-black min-h-[calc(100vh-5rem)]">
      <Suspense fallback={<div className="font-mono text-sm text-zinc-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
