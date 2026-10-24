import { NextResponse } from "next/server";
import { contestStore, type Contest } from "@/lib/contests/store";

export async function GET() {
  try {
    const contests = contestStore.getContests();
    return NextResponse.json({ contests });
  } catch {
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, durationMinutes, tabSwitchPenalty, questions, accessCode } = body;

    if (!title) {
      return NextResponse.json({ error: "Contest title is required" }, { status: 400 });
    }

    // Auto-generate access code if omitted
    const generatedCode = accessCode?.trim() || `CODE-${Math.floor(1000 + Math.random() * 9000)}`;

    const newContest: Contest = {
      id: `contest-${Date.now()}`,
      title,
      description: description || "Proctored technical round.",
      accessCode: generatedCode.toUpperCase(),
      durationMinutes: Number(durationMinutes) || 60,
      tabSwitchPenalty: Number(tabSwitchPenalty) || 5,
      createdAt: new Date().toISOString(),
      status: "active",
      questions: questions || [],
    };

    contestStore.createContest(newContest);
    return NextResponse.json({ contest: newContest, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to create contest" }, { status: 500 });
  }
}
