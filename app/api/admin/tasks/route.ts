import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskType } from "@/lib/supabase/types";

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
    const {
      trackId,
      dayNumber,
      dayTitle,
      taskType,
      title,
      estimatedMinutes = 30,
      sequenceOrder = 1,
      payload,
    } = body;

    if (!trackId || !dayNumber || !taskType || !title || !payload) {
      return NextResponse.json(
        { error: "trackId, dayNumber, taskType, title, and payload are required" },
        { status: 400 }
      );
    }

    // 1. Ensure track day exists
    let { data: trackDay } = await supabase
      .from("track_days")
      .select("id")
      .eq("track_id", trackId)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (!trackDay) {
      const { data: newTrackDay, error: dayErr } = await supabase
        .from("track_days")
        .insert({
          track_id: trackId,
          day_number: dayNumber,
          title: dayTitle || `Day ${dayNumber} Curriculum`,
        })
        .select()
        .single();

      if (dayErr || !newTrackDay) {
        return NextResponse.json(
          { error: `Failed to create track day: ${dayErr?.message}` },
          { status: 400 }
        );
      }
      trackDay = newTrackDay;
    }

    if (!trackDay) {
      return NextResponse.json({ error: "Track day resolution failed" }, { status: 500 });
    }

    // 2. Insert Day Task
    const { data: newTask, error: taskErr } = await supabase
      .from("day_tasks")
      .insert({
        day_id: trackDay.id,
        task_type: taskType as TaskType,
        title,
        estimated_minutes: estimatedMinutes,
        sequence_order: sequenceOrder,
        payload,
      })
      .select()
      .single();

    if (taskErr || !newTask) {
      return NextResponse.json(
        { error: `Failed to insert day task: ${taskErr?.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
