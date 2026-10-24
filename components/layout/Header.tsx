"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { User, Shield } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface HeaderProps {
  user?: {
    email: string;
    role?: "student" | "admin";
    streakCount?: number;
  } | null;
}

export function Header({ user = null }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWorkspace = /^\/learn\/[^/]+\/day\//.test(pathname);

  const [currentUser, setCurrentUser] = useState<{ email: string; role?: string } | null>(
    user ? { email: user.email, role: user.role } : null
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const fetchRole = async (u: SupabaseUser) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single();
      setCurrentUser({ email: u.email ?? "", role: profile?.role });
    };

    supabase.auth.getUser().then((res: { data: { user: SupabaseUser | null } }) => {
      if (res.data.user?.email) {
        fetchRole(res.data.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, session: Session | null) => {
        if (session?.user?.email) {
          fetchRole(session.user);
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isWorkspace) {
    return null;
  }

  const isAdmin = currentUser?.role === "admin";

  return (
    <header
      className={`w-full z-40 select-none transition-colors duration-200 ${
        isHome
          ? "absolute top-0 inset-x-0 bg-transparent border-none"
          : "sticky top-0 border-b border-white/10 bg-black text-white"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Only the circular logo mark (no name) */}
        <Logo variant="mark" size="md" href="/" />

        {/* Right Action: Sign In / Profile / Admin */}
        <div>
          {currentUser ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="yellow"
                    size="sm"
                    className="rounded-full font-black uppercase tracking-wider text-xs border border-black flex items-center gap-1.5 px-4 shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 border-2 border-white/30 bg-black/60 px-4 py-1.5 rounded-full hover:border-[#FAFF00] hover:text-[#FAFF00] text-white transition-colors shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider">
                  {currentUser.email.split("@")[0]}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2 rounded-full font-black tracking-wider text-xs uppercase bg-white text-black hover:bg-[#FAFF00] hover:text-black border-2 border-transparent transition-all duration-150 shadow-md select-none"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
