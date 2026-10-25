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
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    const participant = contestStore.finishContest(contestId, userEmail);
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      participant,
      message: "Contest submitted and locked. You cannot re-enter.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to finish contest" }, { status: 500 });
  }
}
