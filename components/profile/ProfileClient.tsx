"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Flame,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile, DailyHours } from "@/lib/supabase/types";

export interface EnrolledCourseItem {
  enrollmentId: string;
  courseTitle: string;
  courseSlug: string;
  dailyHours: DailyHours;
  currentDay: number;
  totalDays: number;
  isCompleted: boolean;
}

interface ProfileClientProps {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  enrollments: EnrolledCourseItem[];
}

export function ProfileClient({
  user,
  profile,
  enrollments,
}: ProfileClientProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAdmin = profile?.role === "admin";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) {
        setUpdateMessage(`Error updating profile: ${error.message}`);
      } else {
        setUpdateMessage("Profile updated successfully!");
        router.refresh();
      }
    } catch {
      setUpdateMessage("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans select-none">
      {/* Profile Header Card */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 rounded-2xl shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#0A1128] text-[#FAFF00] border-2 border-black rounded-2xl flex items-center justify-center font-mono text-2xl font-black">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                  {profile?.full_name || user.email.split("@")[0]}
                </h1>
                {isAdmin ? (
                  <Badge variant="yellow" className="rounded-md">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="navy" className="rounded-md">
                    Student
                  </Badge>
                )}
              </div>
              <p className="font-mono text-xs text-black font-bold">
                {user.email}
              </p>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-3 bg-[#F8F9FA] border-2 border-black p-4 rounded-xl">
            <div className="w-10 h-10 bg-[#FAFF00] border border-black rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <div className="text-xs font-mono font-black uppercase text-black">
                Active Streak
              </div>
              <div className="text-xl font-mono font-black text-black">
                {profile?.streak_count ?? 0} Days
              </div>
            </div>
          </div>
        </div>

        {/* Admin Direct Access Banner */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t-2 border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFF00]/15 p-4 rounded-xl border border-black/15">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-black" />
              <div>
                <span className="text-sm font-black text-black uppercase tracking-wider block">
                  Admin CMS & Curriculum Control
                </span>
                <span className="text-xs font-bold text-black">
                  Manage courses, pacing models, task contents, and student overrides.
                </span>
              </div>
            </div>
            <Link href="/admin">
              <Button
                variant="primary"
                size="sm"
                className="rounded-lg font-bold uppercase tracking-wider text-xs whitespace-nowrap"
              >
                Open Admin Panel <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Enrolled Tracks Grid */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 rounded-2xl shadow-md mb-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black/10">
          <div>
            <h2 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-black" />
              Active Curriculum Tracks
            </h2>
            <p className="text-xs text-black font-bold mt-1">
              Your registered courses and daily pacing schedules.
            </p>
          </div>
          <Link href="/courses">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg font-bold border-2 border-black text-black hover:bg-[#FAFF00]"
            >
              Browse Catalog
            </Button>
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="p-8 text-center bg-[#F8F9FA] border-2 border-black rounded-xl">
            <p className="text-sm font-bold text-black mb-3">
              You have not enrolled in any pacing track yet.
            </p>
            <Link href="/courses">
              <Button variant="yellow" size="sm" className="rounded-lg font-bold">
                Explore Tracks <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((item) => (
              <div
                key={item.enrollmentId}
                className="border-2 border-black p-5 rounded-xl bg-[#F8F9FA] flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-black uppercase tracking-wider bg-[#FAFF00] text-black border border-black px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.dailyHours}H / Day
                    </span>
                    <span className="text-xs font-mono font-bold text-black flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Day {item.currentDay} of {item.totalDays}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-black tracking-tight mb-2">
                    {item.courseTitle}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between gap-2">
                  <Link href={`/learn/${item.courseSlug}/roadmap`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg font-bold text-xs border border-black"
                    >
                      Roadmap
                    </Button>
                  </Link>
                  <Link href={`/learn/${item.courseSlug}/day/${item.currentDay}`}>
                    <Button
                      variant="yellow"
                      size="sm"
                      className="rounded-lg font-bold text-xs border border-black"
                    >
                      Continue Day {item.currentDay} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Settings & Preferences */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-2 pb-4 border-b-2 border-black/10">
          <Settings className="w-5 h-5 text-black" />
          Profile Settings
        </h2>

        {updateMessage && (
          <div className="mb-4 p-3 bg-green-50 border-2 border-green-600 rounded-lg text-xs font-bold text-green-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>{updateMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 font-mono">
              Display Name
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              className="rounded-lg border-2 border-black text-black font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5 font-mono">
              Account Email
            </label>
            <Input
              type="email"
              value={user.email}
              disabled
              className="rounded-lg border-2 border-black/30 bg-neutral-100 text-black font-mono font-bold cursor-not-allowed"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="rounded-lg font-bold mt-2"
            isLoading={isUpdating}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Danger Zone / Sign Out */}
      <div className="border-2 border-black bg-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-black uppercase tracking-tight">
            Session Management
          </h3>
          <p className="text-xs font-bold text-black mt-0.5">
            Sign out of your active session on this device.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg font-bold border-2 border-black text-black hover:bg-red-50 hover:border-red-600 hover:text-red-700 transition-colors"
          onClick={handleSignOut}
          isLoading={isLoggingOut}
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
