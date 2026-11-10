import { beforeEach, expect, test, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import { commentBranchIds, groupComments, type CommentData } from "@/lib/comments";
import CommentCard from "@/components/feed/CommentCard";
import { MotionProvider } from "@/components/motion/MotionProvider";

const state = vi.hoisted(() => ({
  db: { post: { findFirst: vi.fn() }, comment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() } },
  session: { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" },
}));
vi.mock("@/lib/prisma", () => ({ default: state.db }));
vi.mock("@/lib/session", () => ({ getSession: async () => state.session }));
import { GET, POST } from "@/app/api/v1/comments/route";

const comment = (id: string, parentId: string | null = null): CommentData => ({ id, parentId, content: `Body ${id}`, author: { id: "student", user_handle: "quiet_orbit", avatar: null }, createdAt: "2026-11-09T10:00:00Z" });

beforeEach(() => {
  vi.resetAllMocks();
  state.db.post.findFirst.mockResolvedValue({ id: "post" });
});

test("thread grouping retains replies to replies in sibling order", () => {
  const rows = [comment("root"), comment("first", "root"), comment("nested", "first"), comment("second", "root"), comment("other")];
  const tree = groupComments(rows);
  expect(tree.topLevel.map(item => item.id)).toEqual(["root", "other"]);
  expect(tree.repliesByParent.get("root")?.map(item => item.id)).toEqual(["first", "second"]);
  expect(tree.repliesByParent.get("first")?.map(item => item.id)).toEqual(["nested"]);
});

test("missing parents do not silently hide comments", () => {
  expect(groupComments([comment("orphan", "gone")]).topLevel.map(item => item.id)).toEqual(["orphan"]);
});

test("deleting a branch removes every descendant while preserving siblings and ancestors", () => {
  const rows = [comment("root"), comment("first", "root"), comment("nested", "first"), comment("deep", "nested"), comment("second", "root"), comment("other")];
  expect([...commentBranchIds(rows, "first")]).toEqual(["first", "nested", "deep"]);
  expect(rows.filter(item => !commentBranchIds(rows, "first").has(item.id)).map(item => item.id)).toEqual(["root", "second", "other"]);
  expect(commentBranchIds(rows, "root")).toEqual(new Set(["root", "first", "nested", "deep", "second"]));
});

test("nested comments all expose Reply, and the editor follows the selected comment", () => {
  const rows = [comment("root"), comment("child", "root"), comment("grandchild", "child")];
  const { repliesByParent } = groupComments(rows);
  const html = renderToStaticMarkup(createElement(MotionProvider, null, createElement(CommentCard, {
    comment: rows[0], repliesByParent, onReply: () => {}, onDelete: () => {}, activeReplyId: "child",
    replyComposer: createElement("form", { "aria-label": "Inline editor" }),
  })));
  expect((html.match(/id="reply-button-/g) ?? []).length).toBe(3);
  expect(html).toContain('id="comment-grandchild"');
  expect(html.indexOf('id="reply-form-child"')).toBeGreaterThan(html.indexOf("Body child"));
  expect(html.indexOf('id="reply-form-child"')).toBeLessThan(html.indexOf("Body grandchild"));
  expect(html).toContain("comment-replies--flat");
});

test("a newly created fourth reply remains visible rather than hiding behind Show more", () => {
  const rows = [comment("root"), ...Array.from({ length: 4 }, (_, i) => comment(`child${i}`, "root"))];
  const html = renderToStaticMarkup(createElement(MotionProvider, null, createElement(CommentCard, {
    comment: rows[0], repliesByParent: groupComments(rows).repliesByParent, newIds: new Set(["child3"]), onDelete: () => {},
  })));
  expect(html).toContain("Body child3");
});

test("the API accepts a reply to an existing reply without flattening its parent", async () => {
  state.db.comment.findUnique.mockResolvedValue({ id: "child", postId: "post", parentId: "root" });
  state.db.comment.create.mockResolvedValue(comment("new", "child"));
  const response = await POST(new NextRequest("http://localhost/api/v1/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: "A nested reply", postId: "post", parentId: "child" }) }));
  expect(response.status).toBe(201);
  expect(state.db.comment.create).toHaveBeenCalledWith(expect.objectContaining({ data: { content: "A nested reply", authorId: "student", postId: "post", parentId: "child" } }));
  expect((await response.json()).comment.parentId).toBe("child");
});

test("nested replies cannot reference a parent on another post", async () => {
  state.db.comment.findUnique.mockResolvedValue({ id: "child", postId: "elsewhere", parentId: "root" });
  const response = await POST(new NextRequest("http://localhost/api/v1/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: "A reply", postId: "post", parentId: "child" }) }));
  expect(response.status).toBe(400);
  expect(state.db.comment.create).not.toHaveBeenCalled();
});

test("the comments endpoint returns the complete thread for recursive rendering", async () => {
  const rows = [comment("root"), comment("child", "root"), comment("grandchild", "child")];
  state.db.comment.findMany.mockResolvedValue(rows);
  const response = await GET(new NextRequest("http://localhost/api/v1/comments?postId=post"));
  expect(response.status).toBe(200);
  expect((await response.json()).comments).toEqual(rows);
  expect(state.db.comment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { postId: "post" } }));
});
