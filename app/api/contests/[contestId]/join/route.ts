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
    const { userEmail, userName } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    const participant = contestStore.joinContest(contestId, userEmail, userName || "");
    return NextResponse.json({ participant, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to join contest" }, { status: 500 });
  }
}
