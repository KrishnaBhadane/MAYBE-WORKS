export type EvaluationStatus = "passed" | "failed" | "error";

export interface MismatchDetail {
  testcaseIndex?: number;
  expected: string;
  actual: string;
  reason: string;
}

export interface EvaluationResult {
  status: EvaluationStatus;
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  mismatchDetails?: MismatchDetail;
  error?: string;
}

export interface DsaTestcase {
  input: string;
  expected_output: string;
  explanation?: string;
}

export type SqlRow = Record<string, unknown>;

/**
 * Normalizes text output by stripping carriage returns and trailing whitespace.
 * Time Complexity: O(N), Space Complexity: O(N)
 */
export function normalizeOutput(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Compares two tokens with numerical tolerance for floating point representations.
 */
function areTokensEqual(actual: string, expected: string, epsilon = 1e-6): boolean {
  if (actual === expected) return true;
  const numA = Number(actual);
  const numB = Number(expected);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && actual.trim() !== "" && expected.trim() !== "") {
    return Math.abs(numA - numB) < epsilon;
  }
  return false;
}

/**
 * Evaluates DSA program output against expected output in O(N) time.
 */
export function evaluateDsaOutput(actual: string, expected: string): { matched: boolean; reason?: string } {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  if (normActual === normExpected) {
    return { matched: true };
  }

  // Token-by-token comparison with whitespace split
  const tokensActual = normActual.length === 0 ? [] : normActual.split(/\s+/);
  const tokensExpected = normExpected.length === 0 ? [] : normExpected.split(/\s+/);

  if (tokensActual.length !== tokensExpected.length) {
    return {
      matched: false,
      reason: `Token count mismatch: expected ${tokensExpected.length} tokens, received ${tokensActual.length}.`,
    };
  }

  for (let i = 0; i < tokensExpected.length; i++) {
    if (!areTokensEqual(tokensActual[i], tokensExpected[i])) {
      return {
        matched: false,
        reason: `Value mismatch at index ${i}: expected "${tokensExpected[i]}", received "${tokensActual[i]}".`,
      };
    }
  }

  return { matched: true };
}

/**
 * Canonicalizes a SQL column value for hash indexing.
 */
function canonicalValue(val: unknown): string {
  if (val === null || val === undefined) return "__SQL_NULL__";
  if (typeof val === "number") {
    return Number.isInteger(val) ? val.toString() : val.toFixed(4);
  }
  if (typeof val === "boolean") return val ? "true" : "false";
  return String(val).trim();
}

/**
 * Generates an O(C) hash key for an arbitrary SQL row.
 * Handles case-insensitive column names and value formatting.
 */
function rowToHashKey(row: SqlRow): string {
  const keys = Object.keys(row).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  return keys.map((k) => `${k.toLowerCase()}:${canonicalValue(row[k])}`).join("|");
}

/**
 * Evaluates SQL query results against expected rows in O(R * C) time using hash-map diffing.
 */
export function evaluateSqlRows(
  actualRows: SqlRow[],
  expectedRows: SqlRow[],
  checkOrder = false
): { matched: boolean; reason?: string } {
  if (actualRows.length !== expectedRows.length) {
    return {
      matched: false,
      reason: `Row count mismatch: expected ${expectedRows.length} rows, received ${actualRows.length} rows.`,
    };
  }

  if (actualRows.length === 0 && expectedRows.length === 0) {
    return { matched: true };
  }

  // If ordering is strict (e.g. ORDER BY specified)
  if (checkOrder) {
    for (let i = 0; i < actualRows.length; i++) {
      const keyActual = rowToHashKey(actualRows[i]);
      const keyExpected = rowToHashKey(expectedRows[i]);
      if (keyActual !== keyExpected) {
        return {
          matched: false,
          reason: `Row ordering mismatch at row ${i + 1}:\nExpected: ${JSON.stringify(expectedRows[i])}\nReceived: ${JSON.stringify(actualRows[i])}`,
        };
      }
    }
    return { matched: true };
  }

  // Hash-indexed multiset comparison: O(R * C) time
  const freqMap = new Map<string, number>();

  for (const expRow of expectedRows) {
    const key = rowToHashKey(expRow);
    freqMap.set(key, (freqMap.get(key) ?? 0) + 1);
  }

  for (let i = 0; i < actualRows.length; i++) {
    const key = rowToHashKey(actualRows[i]);
    const count = freqMap.get(key) ?? 0;
    if (count <= 0) {
      return {
        matched: false,
        reason: `Unexpected or excess row returned at index ${i}:\n${JSON.stringify(actualRows[i])}`,
      };
    }
    freqMap.set(key, count - 1);
  }

  return { matched: true };
}

/**
 * Evaluates a full suite of DSA testcases returning structured evaluation summary.
 */
export function evaluateDsaSuite(
  outputs: Array<{ actual: string; runtimeMs: number }>,
  testcases: DsaTestcase[]
): EvaluationResult {
  let passedCount = 0;
  let totalRuntime = 0;

  for (let i = 0; i < testcases.length; i++) {
    const item = outputs[i];
    if (!item) {
      return {
        status: "failed",
        passedCount,
        totalCount: testcases.length,
        runtimeMs: totalRuntime,
        mismatchDetails: {
          testcaseIndex: i,
          expected: testcases[i].expected_output,
          actual: "",
          reason: "No output generated for testcase",
        },
      };
    }

    totalRuntime += item.runtimeMs;
    const { matched, reason } = evaluateDsaOutput(item.actual, testcases[i].expected_output);

    if (!matched) {
      return {
        status: "failed",
        passedCount,
        totalCount: testcases.length,
        runtimeMs: totalRuntime,
        mismatchDetails: {
          testcaseIndex: i,
          expected: testcases[i].expected_output,
          actual: item.actual,
          reason: reason ?? "Output mismatch",
        },
      };
    }

    passedCount++;
  }

  return {
    status: "passed",
    passedCount,
    totalCount: testcases.length,
    runtimeMs: totalRuntime,
  };
}
