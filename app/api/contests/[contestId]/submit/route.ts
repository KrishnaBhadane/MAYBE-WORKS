import { NextResponse } from "next/server";
import { contestStore } from "@/lib/contests/store";

interface Params {
  params: Promise<{
    contestId: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { contestId } = await params;
    const body = await request.json();
    const { userEmail, questionId, points } = body;

    if (!userEmail || !questionId) {
      return NextResponse.json({ error: "Missing submission params" }, { status: 400 });
    }

    const participant = contestStore.submitAnswer(
      contestId,
      userEmail,
      questionId,
      Number(points) || 0
    );

    if (!participant) {
      return NextResponse.json({ error: "Participant not found or kicked" }, { status: 403 });
    }

    return NextResponse.json({ success: true, participant });
  } catch {
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
