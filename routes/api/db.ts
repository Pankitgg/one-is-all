import { define } from "../../utils.ts";
import { getSqlitePath } from "../../db/sqlite.ts";

export const handler = define.handlers({
  GET(ctx) {
    const row = ctx.state.db.prepare("select sqlite_version() as version")
      .get() as
        | { version: string }
        | undefined;
    return Response.json({
      ok: true,
      sqlitePath: getSqlitePath(),
      version: row?.version,
    });
  },
});
