import { define } from "../../../utils.ts";
import { deleteNote, getNote } from "../../../db/notes.ts";

export const handler = define.handlers({
  GET(ctx) {
    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) {
      return new Response("Invalid id", { status: 400 });
    }
    const note = getNote(ctx.state.db, id);
    if (!note) return new Response("Not found", { status: 404 });
    return Response.json(note);
  },
  DELETE(ctx) {
    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) {
      return new Response("Invalid id", { status: 400 });
    }
    deleteNote(ctx.state.db, id);
    return new Response(null, { status: 204 });
  },
});
