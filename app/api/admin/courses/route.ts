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
    const { title, slug, description, icon = "terminal", tracks } = body;

    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: "Title, slug, and description are required" },
        { status: 400 }
      );
    }

    // 1. Insert Course
    const { data: newCourse, error: courseErr } = await supabase
      .from("courses")
      .insert({
        title,
        slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
        description,
        icon,
        is_published: true,
      })
      .select()
      .single();

    if (courseErr || !newCourse) {
      return NextResponse.json(
        { error: `Course creation failed: ${courseErr?.message}` },
        { status: 400 }
      );
    }

    // 2. Insert Tracks (default 2h, 3h, 4h if not specified)
    const trackConfigs: Array<{ daily_hours: 2 | 3 | 4; total_days: number }> =
      Array.isArray(tracks) && tracks.length > 0
        ? tracks
        : [
            { daily_hours: 2, total_days: 60 },
            { daily_hours: 3, total_days: 40 },
            { daily_hours: 4, total_days: 30 },
          ];

    const trackRows = trackConfigs.map((tc) => ({
      course_id: newCourse.id,
      daily_hours: tc.daily_hours,
      total_days: tc.total_days,
    }));

    const { data: insertedTracks, error: trackErr } = await supabase
      .from("course_tracks")
      .insert(trackRows)
      .select();

    if (trackErr) {
      return NextResponse.json(
        { error: `Tracks creation failed: ${trackErr.message}`, course: newCourse },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      course: newCourse,
      tracks: insertedTracks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
