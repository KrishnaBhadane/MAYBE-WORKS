import { NextResponse } from "next/server";
import { contestStore } from "@/lib/contests/store";

interface Params {
  params: Promise<{
    contestId: string;
  }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { contestId } = await params;
    const contest = contestStore.getContestById(contestId);

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    const participants = contestStore.getParticipants(contestId);
    const violations = contestStore.getViolations(contestId);

    return NextResponse.json({
      contest,
      participants,
      violations,
      participantCount: participants.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch contest details" }, { status: 500 });
  }
}
