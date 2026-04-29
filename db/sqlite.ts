import { DatabaseSync } from "node:sqlite";
import { dirname } from "node:path";

export type SqliteDb = DatabaseSync;

const globalKey = "__one_is_all_sqlite_db__";

export function getSqlitePath() {
  return Deno.env.get("SQLITE_PATH") ?? "./data/app.sqlite";
}

function ensureParentDir(path: string) {
  const dir = dirname(path);
  if (dir && dir !== "." && dir !== "/") {
    Deno.mkdirSync(dir, { recursive: true });
  }
}

function migrate(db: DatabaseSync) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
  );

  const migrations: Array<{ id: string; sql: string }> = [
    // Add your schema migrations here, e.g.
    // {
    //   id: "0001_init",
    //   sql: "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);"
    // },
  ];

  const has = db.prepare("SELECT 1 FROM _migrations WHERE id = ? LIMIT 1");
  const insert = db.prepare(
    "INSERT INTO _migrations (id, applied_at) VALUES (?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))",
  );

  for (const m of migrations) {
    const exists = has.get(m.id) !== undefined;
    if (exists) continue;
    db.exec("BEGIN");
    try {
      db.exec(m.sql);
      insert.run(m.id);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
}

export function getDb() {
  const g = globalThis as unknown as Record<string, DatabaseSync | undefined>;
  const existing = g[globalKey];
  if (existing) return existing;

  const path = getSqlitePath();
  ensureParentDir(path);
  const db = new DatabaseSync(path);
  db.exec("PRAGMA foreign_keys = ON");
  migrate(db);

  g[globalKey] = db;
  return db;
}
