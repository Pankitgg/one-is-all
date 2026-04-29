import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { getDb } from "./db/sqlite.ts";

export const app = new App<State>();
const db = getDb();

app.use(staticFiles());

// Inject database into context state
app.use(async (ctx) => {
  ctx.state.db = db;
  return await ctx.next();
});

// Include file-system based routes here
app.fsRoutes();
