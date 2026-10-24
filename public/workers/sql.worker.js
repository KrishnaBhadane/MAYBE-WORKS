/* eslint-disable no-restricted-globals */
// kreepycode Dedicated SQLite WebAssembly Worker
// Runs in background thread to prevent any UI frame drops
importScripts('/workers/sql-wasm.js');

let SQL = null;
let db = null;
let initialSchema = '';

async function getSql() {
  if (!SQL) {
    SQL = await self.initSqlJs({
      locateFile: (file) => `/workers/${file}`,
    });
  }
  return SQL;
}

self.onmessage = async (e) => {
  const { id, action, payload } = e.data;

  try {
    if (action === 'INIT_DB') {
      const sqlInstance = await getSql();
      if (db) {
        db.close();
      }
      db = new sqlInstance.Database();
      initialSchema = payload?.schemaSql || '';
      if (initialSchema) {
        db.run(initialSchema);
      }
      self.postMessage({ id, action, success: true });
    } else if (action === 'EXEC_QUERY') {
      if (!db) {
        throw new Error('SQLite database not initialized. Call INIT_DB first.');
      }
      const startTime = performance.now();
      const results = db.exec(payload.query);
      const executionTimeMs = performance.now() - startTime;

      const first = results[0] || { columns: [], values: [] };
      const columns = first.columns || [];
      const values = first.values || [];
      const rows = values.map((row) => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });

      self.postMessage({
        id,
        action,
        success: true,
        result: {
          columns,
          values,
          rows,
          executionTimeMs: Math.round(executionTimeMs * 100) / 100,
        },
      });
    } else if (action === 'RESET_DB') {
      const sqlInstance = await getSql();
      if (db) {
        db.close();
      }
      db = new sqlInstance.Database();
      const schema = payload?.schemaSql !== undefined ? payload.schemaSql : initialSchema;
      if (schema) {
        db.run(schema);
      }
      self.postMessage({ id, action, success: true });
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    self.postMessage({
      id,
      action,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
