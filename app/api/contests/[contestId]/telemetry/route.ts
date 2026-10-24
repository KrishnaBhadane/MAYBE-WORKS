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
    const { userEmail, type, durationSeconds } = body;

    if (!userEmail || !type) {
      return NextResponse.json({ error: "Missing telemetry params" }, { status: 400 });
    }

    const result = contestStore.recordViolation(
      contestId,
      userEmail,
      type,
      Number(durationSeconds) || 0
    );

    return NextResponse.json({
      success: true,
      participant: result.participant,
      event: result.event,
    });
  } catch {
    return NextResponse.json({ error: "Failed to record telemetry" }, { status: 500 });
  }
}
