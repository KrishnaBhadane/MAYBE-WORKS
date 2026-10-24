export type ExecutionStatus =
  | "success"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "error";

export interface CodeExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
  timeoutMs?: number;
}

export interface CodeExecutionResult {
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs?: number;
  memoryKb?: number;
  errorMessage?: string;
}

interface OnlineCompilerResponse {
  output?: string;
  error?: string;
  status?: string;
  exit_code?: number;
  signal?: number | null;
  time?: string;
  memory?: string;
}

interface PistonResponse {
  compile?: { stdout?: string; stderr?: string; code?: number };
  run?: { stdout?: string; stderr?: string; code?: number; signal?: string | null };
  message?: string;
}

function resolveOnlineCompilerId(language: string): string {
  const normalized = language.toLowerCase().trim();
  switch (normalized) {
    case "cpp":
    case "c++":
    case "g++":
      return "g++-15";
    case "c":
      return "gcc-15";
    case "python":
    case "python3":
    case "py":
      return "python-3.14";
    case "java":
    case "openjdk":
      return "openjdk-25";
    case "rust":
    case "rs":
      return "rust-1.93";
    case "go":
    case "golang":
      return "go-1.26";
    case "javascript":
    case "js":
    case "node":
      return "nodejs-24";
    case "typescript":
    case "ts":
      return "typescript-deno";
    case "sql":
    case "sqlite":
      return "sqlite-3";
    default:
      return normalized;
  }
}

function parseOnlineCompilerResponse(data: OnlineCompilerResponse): CodeExecutionResult {
  const stdout = data.output ?? "";
  const stderr = data.error ?? "";
  const exitCode = typeof data.exit_code === "number" ? data.exit_code : null;
  const executionTimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : undefined;
  const memoryKb = data.memory ? parseInt(data.memory, 10) : undefined;

  if (exitCode === 0 && (!data.status || data.status === "success")) {
    return { status: "success", stdout, stderr, exitCode, executionTimeMs, memoryKb };
  }

  // Distinguish compilation diagnostics from runtime failures
  const isCompileErr = stderr.includes("error:") || stderr.includes("fatal error:") || (executionTimeMs === 0 && exitCode === 1);
  const status: ExecutionStatus = isCompileErr ? "compile_error" : "runtime_error";

  return {
    status,
    stdout,
    stderr: stderr || (data.signal ? `Terminated with signal ${data.signal}` : "Non-zero exit code"),
    exitCode,
    executionTimeMs,
    memoryKb,
    errorMessage: isCompileErr ? "Compilation failed" : "Runtime error occurred",
  };
}

function parsePistonResponse(data: PistonResponse): CodeExecutionResult {
  if (data.compile && data.compile.code !== 0) {
    return {
      status: "compile_error",
      stdout: data.compile.stdout ?? "",
      stderr: data.compile.stderr ?? "",
      exitCode: data.compile.code ?? null,
      errorMessage: "Compilation failed",
    };
  }

  const run = data.run ?? {};
  const exitCode = typeof run.code === "number" ? run.code : null;
  const stdout = run.stdout ?? "";
  const stderr = run.stderr ?? "";

  if (exitCode === 0) {
    return { status: "success", stdout, stderr, exitCode };
  }

  return {
    status: "runtime_error",
    stdout,
    stderr: stderr || "Program terminated abnormally",
    exitCode,
    errorMessage: "Runtime error occurred",
  };
}

export async function executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
  const rawUrl = process.env.CODE_RUNNER_API_URL || "https://api.onlinecompiler.io/api/run-code-sync/";
  const apiKey = process.env.CODE_RUNNER_API_KEY || "";
  const timeoutMs = request.timeoutMs ?? 5000;

  // Normalize endpoint if configured for onlinecompiler.io
  const apiUrl = rawUrl.includes("onlinecompiler.io") && !rawUrl.endsWith("run-code-sync/")
    ? "https://api.onlinecompiler.io/api/run-code-sync/"
    : rawUrl;

  const isOnlineCompiler = apiUrl.includes("onlinecompiler.io") || apiUrl.endsWith("run-code-sync/");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["Authorization"] = apiKey;
    }

    const payload = isOnlineCompiler
      ? {
          compiler: resolveOnlineCompilerId(request.language),
          code: request.code,
          input: request.stdin ?? "",
          time_limit: Math.min(Math.ceil(timeoutMs / 1000), 10),
        }
      : {
          language: request.language,
          version: "*",
          files: [{ content: request.code }],
          stdin: request.stdin ?? "",
          run_timeout: timeoutMs,
        };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        status: "error",
        stdout: "",
        stderr: `Runner HTTP error ${res.status}: ${res.statusText}`,
        exitCode: null,
        errorMessage: "Compiler service unavailable, retrying...",
      };
    }

    const data = await res.json();
    return isOnlineCompiler
      ? parseOnlineCompilerResponse(data as OnlineCompilerResponse)
      : parsePistonResponse(data as PistonResponse);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        status: "timeout",
        stdout: "",
        stderr: `Code execution timed out (${timeoutMs}ms limit exceeded).`,
        exitCode: null,
        errorMessage: "Execution timed out",
      };
    }

    return {
      status: "error",
      stdout: "",
      stderr: err instanceof Error ? err.message : "Unknown execution error",
      exitCode: null,
      errorMessage: "Compiler service unavailable, retrying...",
    };
  } finally {
    clearTimeout(timer);
  }
}
