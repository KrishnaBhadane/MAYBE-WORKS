import { NextResponse } from "next/server";
import { executeCode, type CodeExecutionRequest } from "@/lib/services/codeRunner";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CodeExecutionRequest;
    const { language, code, stdin, timeoutMs } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code content is required" },
        { status: 400 }
      );
    }

    const result = await executeCode({
      language: language || "cpp",
      code,
      stdin: stdin || "",
      timeoutMs: timeoutMs || 7000,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Execution failed";
    return NextResponse.json(
      {
        status: "error",
        stdout: "",
        stderr: msg,
        exitCode: 1,
        errorMessage: msg,
      },
      { status: 500 }
    );
  }
}
