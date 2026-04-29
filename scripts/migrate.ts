import { getDb } from "../db/sqlite.ts";

const db = getDb();
db.prepare("select 1").get();
db.close();
