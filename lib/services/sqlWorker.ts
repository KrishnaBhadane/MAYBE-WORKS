export type SqlWorkerAction = "INIT_DB" | "EXEC_QUERY" | "RESET_DB";

export interface SqlInitDbPayload {
  schemaSql?: string;
}

export interface SqlExecQueryPayload {
  query: string;
}

export interface SqlQueryResult {
  columns: string[];
  values: Array<Array<string | number | boolean | null>>;
  rows: Array<Record<string, unknown>>;
  executionTimeMs: number;
}

export interface SqlWorkerRequest {
  id: string;
  action: SqlWorkerAction;
  payload?: SqlInitDbPayload | SqlExecQueryPayload;
}

export interface SqlWorkerResponse {
  id: string;
  action: SqlWorkerAction;
  success: boolean;
  result?: SqlQueryResult;
  error?: string;
}

interface PendingMessage {
  resolve: (value: SqlQueryResult | boolean) => void;
  reject: (reason: Error) => void;
  timer: NodeJS.Timeout;
}

export class SqlEngineClient {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingMessage>();
  private counter = 0;

  constructor() {
    this.ensureWorker();
  }

  private ensureWorker(): Worker | null {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      return null;
    }
    if (!this.worker) {
      this.worker = new Worker("/workers/sql.worker.js");
      this.worker.onmessage = this.handleMessage.bind(this);
      this.worker.onerror = this.handleError.bind(this);
    }
    return this.worker;
  }

  private handleMessage(event: MessageEvent<SqlWorkerResponse>): void {
    const { id, success, result, error } = event.data;
    const req = this.pending.get(id);
    if (!req) return;

    clearTimeout(req.timer);
    this.pending.delete(id);

    if (success) {
      req.resolve(result ?? true);
    } else {
      req.reject(new Error(error || "SQLite execution failed"));
    }
  }

  private handleError(event: ErrorEvent): void {
    const errorMsg = event.message || "Dedicated SQL Worker encountered an error";
    for (const [id, req] of this.pending.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error(errorMsg));
      this.pending.delete(id);
    }
  }

  private postRequest<T extends SqlQueryResult | boolean>(
    action: SqlWorkerAction,
    payload?: SqlInitDbPayload | SqlExecQueryPayload,
    timeoutMs = 5000
  ): Promise<T> {
    const worker = this.ensureWorker();
    if (!worker) {
      return Promise.reject(new Error("Worker environment unavailable in current runtime context."));
    }

    const id = `sql_req_${Date.now()}_${++this.counter}`;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`SQL query execution timed out (${timeoutMs}ms limit).`));
      }, timeoutMs);

      this.pending.set(id, {
        resolve: resolve as (val: SqlQueryResult | boolean) => void,
        reject,
        timer,
      });

      const message: SqlWorkerRequest = { id, action, payload };
      worker.postMessage(message);
    });
  }

  public async initDb(schemaSql?: string): Promise<boolean> {
    return this.postRequest<boolean>("INIT_DB", { schemaSql });
  }

  public async executeQuery(query: string, timeoutMs = 5000): Promise<SqlQueryResult> {
    return this.postRequest<SqlQueryResult>("EXEC_QUERY", { query }, timeoutMs);
  }

  public async resetDb(schemaSql?: string): Promise<boolean> {
    return this.postRequest<boolean>("RESET_DB", { schemaSql });
  }

  public terminate(): void {
    for (const [, req] of this.pending.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error("SQL Worker terminated."));
    }
    this.pending.clear();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton helper for shared workspace usage
let globalEngine: SqlEngineClient | null = null;

export function getSqlEngine(): SqlEngineClient {
  if (!globalEngine) {
    globalEngine = new SqlEngineClient();
  }
  return globalEngine;
}
