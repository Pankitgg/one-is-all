import { createDefine } from "fresh";
import type { SqliteDb } from "./db/sqlite.ts";

// This specifies the type of "ctx.state" which is used to share
// data among middlewares, layouts and routes.
export interface State {
  db: SqliteDb;
}

export const define = createDefine<State>();
