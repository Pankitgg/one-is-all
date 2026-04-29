import type { SqliteDb } from "./sqlite.ts";

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export function listNotes(db: SqliteDb): Note[] {
  const stmt = db.prepare(
    "SELECT id, title, content, created_at AS createdAt FROM notes ORDER BY id DESC",
  );
  return stmt.all() as unknown as Note[];
}

export function getNote(db: SqliteDb, id: number): Note | null {
  const stmt = db.prepare(
    "SELECT id, title, content, created_at AS createdAt FROM notes WHERE id = ?",
  );
  return (stmt.get(id) as Note | undefined) ?? null;
}

export function createNote(
  db: SqliteDb,
  input: { title: string; content?: string },
): Note {
  const stmt = db.prepare(
    "INSERT INTO notes (title, content) VALUES (?, ?) RETURNING id, title, content, created_at AS createdAt",
  );
  const row = stmt.get(input.title, input.content ?? "") as Note | undefined;
  if (!row) throw new Error("insert failed");
  return row;
}

export function deleteNote(db: SqliteDb, id: number) {
  const stmt = db.prepare("DELETE FROM notes WHERE id = ?");
  stmt.run(id);
}
