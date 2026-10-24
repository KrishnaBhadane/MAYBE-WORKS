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

    const kicked = contestStore.kickParticipant(contestId, userEmail);
    if (!kicked) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, kickedEmail: userEmail });
  } catch {
    return NextResponse.json({ error: "Failed to kick participant" }, { status: 500 });
  }
}
