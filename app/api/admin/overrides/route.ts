import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify Admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, enrollmentId, userId, targetDay, targetStreak } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    if (action === "FORCE_UNLOCK") {
      if (!enrollmentId) {
        return NextResponse.json({ error: "enrollmentId is required" }, { status: 400 });
      }
      // Unlock immediately by setting next_day_unlock_at to past timestamp
      const pastTime = new Date(Date.now() - 1000).toISOString();
      const { error } = await supabase
        .from("enrollments")
        .update({ next_day_unlock_at: pastTime })
        .eq("id", enrollmentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, action: "FORCE_UNLOCK" });
    }

    if (action === "RESET_STREAK") {
      if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
      }
      const streakVal = typeof targetStreak === "number" ? targetStreak : 0;
      const { error } = await supabase
        .from("profiles")
        .update({ streak_count: streakVal })
        .eq("id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, action: "RESET_STREAK", streak: streakVal });
    }

    if (action === "SET_DAY") {
      if (!enrollmentId || typeof targetDay !== "number") {
        return NextResponse.json({ error: "enrollmentId and targetDay are required" }, { status: 400 });
      }
      const { error } = await supabase
        .from("enrollments")
        .update({ current_day: targetDay, next_day_unlock_at: new Date().toISOString() })
        .eq("id", enrollmentId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, action: "SET_DAY", currentDay: targetDay });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
