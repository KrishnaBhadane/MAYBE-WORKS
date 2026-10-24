import { NextResponse } from "next/server";
import { contestStore } from "@/lib/contests/store";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Access code is required" }, { status: 400 });
    }

    const contest = contestStore.getContestByCode(code);
    if (!contest) {
      return NextResponse.json({ error: "Invalid contest access code. Please check with administrator." }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      contestId: contest.id,
      title: contest.title,
      durationMinutes: contest.durationMinutes,
      questionCount: contest.questions.length,
    });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
