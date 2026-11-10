import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { feedSearchHref, filterCommunities } from "@/lib/search";
import type { CommunityDTO } from "@/lib/validation/communities";

const state = vi.hoisted(() => ({
  db: { post: { findMany: vi.fn() }, question: { findMany: vi.fn() } },
  session: { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" },
}));
vi.mock("@/lib/prisma", () => ({ default: state.db }));
vi.mock("@/lib/session", () => ({ getSession: async () => state.session }));
import { GET as posts } from "@/app/api/v1/posts/route";
import { GET as questions } from "@/app/api/v1/questions/route";

beforeEach(() => {
  vi.resetAllMocks();
  state.session.success = true;
  state.db.post.findMany.mockResolvedValue([]);
  state.db.question.findMany.mockResolvedValue([]);
});

const request = (path: string) => new NextRequest(`http://localhost/api/v1/${path}`);

test.each([
  ["  #Campus  ", "/feed?tag=campus"],
  ["campus lunch", "/feed?q=campus+lunch"],
  ["#campus lunch", "/feed?q=%23campus+lunch"],
  ["C++ & labs?", "/feed?q=C%2B%2B+%26+labs%3F"],
  ["  ", "/feed"],
])("search navigation preserves text and exact hashtag intent: %s", (input, expected) => {
  expect(feedSearchHref(input)).toBe(expected);
});

test("post search combines text, tag, author and community filters with the visibility gate", async () => {
  const response = await posts(request("posts?q=%20Campus%20&tag=lunch&community=food&author=quiet_fox&cursor=page-one&limit=2"));
  expect(response.status).toBe(200);
  expect(state.db.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: { AND: [
      { OR: [{ communityId: null }, { community: { isPublic: true } }, { community: { members: { some: { userId: "student" } } } }] },
      { hashtags: { some: { hashtag: { name: "lunch" } } } },
      { author: { user_handle: "quiet_fox" } },
      { community: { slug: "food" } },
      { content: { contains: "Campus", mode: "insensitive" } },
    ] },
    cursor: { id: "page-one" }, skip: 1, take: 3,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  }));
});

test("question text search covers both title and body and retains tag and accepted-answer filters", async () => {
  expect((await questions(request("questions?q=%20Campus%20&tag=exams&filter=answered"))).status).toBe(200);
  expect(state.db.question.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: {
      acceptedAnswerId: { not: null },
      hashtags: { some: { hashtag: { name: "exams" } } },
      OR: [{ title: { contains: "Campus", mode: "insensitive" } }, { body: { contains: "Campus", mode: "insensitive" } }],
    },
  }));
});

test("unanswered questions require zero answers, while all includes every answer state", async () => {
  await questions(request("questions?filter=unanswered"));
  expect(state.db.question.findMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: { answers: { none: {} } } }));
  await questions(request("questions?filter=all&q=%20%20"));
  expect(state.db.question.findMany).toHaveBeenLastCalledWith(expect.objectContaining({ where: {} }));
});

test("search punctuation is literal rather than SQL pattern syntax", async () => {
  const q = new URLSearchParams({ q: "100% _campus\\notes" });
  await posts(request(`posts?${q}`));
  expect(state.db.post.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
    where: { AND: expect.arrayContaining([{ content: { contains: "100\\% \\_campus\\\\notes", mode: "insensitive" } }]) },
  }));
  await questions(request(`questions?${q}`));
  expect(state.db.question.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
    where: { OR: [{ title: { contains: "100\\% \\_campus\\\\notes", mode: "insensitive" } }, { body: { contains: "100\\% \\_campus\\\\notes", mode: "insensitive" } }] },
  }));
});

test("question search returns cursor metadata and a bounded page", async () => {
  const row = (id: string) => ({ id, title: `Question ${id}`, body: "Exam preparation details", createdAt: new Date(), author: { user_handle: "quiet_fox" }, acceptedAnswerId: null, _count: { answers: 0 }, hashtags: [] });
  state.db.question.findMany.mockResolvedValue([row("a"), row("b"), row("c")]);
  const response = await questions(request("questions?q=Exam&cursor=previous&limit=2"));
  const data = await response.json();
  expect(data.questions.map((question: { id: string }) => question.id)).toEqual(["a", "b"]);
  expect(data.pagination).toEqual({ hasMore: true, nextCursor: "b" });
  expect(state.db.question.findMany).toHaveBeenCalledWith(expect.objectContaining({ cursor: { id: "previous" }, skip: 1, take: 3 }));
});

test("invalid and oversized searches fail before querying the database", async () => {
  for (const handler of [posts, questions]) {
    expect((await handler(request(`questions?q=${"x".repeat(101)}`))).status).toBe(400);
  }
  expect((await questions(request("questions?filter=unknown"))).status).toBe(400);
  expect(state.db.post.findMany).not.toHaveBeenCalled();
  expect(state.db.question.findMany).not.toHaveBeenCalled();
});

test("search still requires a signed-in account", async () => {
  state.session.success = false;
  expect((await posts(request("posts?q=campus"))).status).toBe(401);
  expect((await questions(request("questions?q=campus"))).status).toBe(401);
  expect(state.db.post.findMany).not.toHaveBeenCalled();
  expect(state.db.question.findMany).not.toHaveBeenCalled();
});

test("community discovery combines membership and case-insensitive names, slugs and descriptions", () => {
  const communities: CommunityDTO[] = [
    { id: "a", name: "Photography", slug: "photo-club", description: "Weekend campus walks", isPublic: true, memberCount: 1, isMember: true },
    { id: "b", name: "Chess", slug: "board-games", description: null, isPublic: false, memberCount: 3, isMember: false },
  ];
  expect(filterCommunities(communities, " WEEKEND ", false).map(item => item.id)).toEqual(["a"]);
  expect(filterCommunities(communities, "PHOTO", true).map(item => item.id)).toEqual(["a"]);
  expect(filterCommunities(communities, "board", false).map(item => item.id)).toEqual(["b"]);
  expect(filterCommunities(communities, "Chess", true)).toEqual([]);
  expect(filterCommunities(communities, "  ", false)).toHaveLength(2);
  expect(filterCommunities(communities, "  ", true)).toHaveLength(1);
});
