import { define } from "../../../utils.ts";
import { createNote, listNotes } from "../../../db/notes.ts";

export const handler = define.handlers({
  GET(ctx) {
    const notes = listNotes(ctx.state.db);
    return Response.json(notes);
  },
  async POST(ctx) {
    const body = await ctx.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response("Invalid JSON body", { status: 400 });
    }
    const title = (body as Record<string, unknown>).title;
    const content = (body as Record<string, unknown>).content;
    if (typeof title !== "string" || title.length === 0) {
      return new Response("title is required", { status: 400 });
    }
    if (content !== undefined && typeof content !== "string") {
      return new Response("content must be string", { status: 400 });
    }
    const created = createNote(ctx.state.db, { title, content });
    return Response.json(created, { status: 201 });
  },
});
