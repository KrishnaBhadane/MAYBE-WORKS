import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { recordTaskCompletion } from "@/lib/services/progressService";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, taskId, submittedCode, userTimezone } = body;

    if (!enrollmentId || !taskId) {
      return NextResponse.json(
        { error: "enrollmentId and taskId are required" },
        { status: 400 }
      );
    }

    // Verify user owns the enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, user_id")
      .eq("id", enrollmentId)
      .eq("user_id", user.id)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found or unauthorized" },
        { status: 403 }
      );
    }

    const result = await recordTaskCompletion(supabase, {
      enrollmentId,
      taskId,
      submittedCode,
      userTimezone: userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
