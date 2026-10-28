import { beforeEach, test, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { safeNext } from "@/lib/navigation";
import { completeSignupSchema } from "@/lib/validation/auth";
import { generateAnonymousHandle } from "@/lib/utils";
import { pollDTO } from "@/lib/polls";

const state = vi.hoisted(() => {
  const db = {};
  for (const model of ["user", "poll", "pollBallot", "community", "communityMember", "post", "question", "answer", "answerVote"]) {
    db[model] = {};
    for (const method of ["findUnique", "findUniqueOrThrow", "findFirst", "findMany", "create", "createMany", "update", "updateMany", "delete", "deleteMany"]) db[model][method] = vi.fn();
  }
  db.$transaction = vi.fn(); db.$queryRaw = vi.fn();
  return { db, session: { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" } };
});
vi.mock("@/lib/prisma", () => ({ default: state.db }));
vi.mock("@/lib/session", () => ({ getSession: async () => state.session }));
import * as polls from "@/app/api/v1/polls/route";
import * as managePoll from "@/app/api/v1/polls/[id]/route";
import * as vote from "@/app/api/v1/polls/[id]/vote/route";
import * as communities from "@/app/api/v1/communities/route";
import * as membership from "@/app/api/v1/communities/[slug]/membership/route";
import * as me from "@/app/api/v1/me/route";
import * as accept from "@/app/api/v1/questions/[id]/accept/route";
import * as answerVote from "@/app/api/v1/answers/[id]/vote/route";
import * as posts from "@/app/api/v1/posts/route";

const req = (url, body, method = "POST") => new NextRequest(`http://localhost/api/v1/${url}`, { method, ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
const rawPoll = (overrides = {}) => ({ id: "poll", question: "Campus lunch?", allowMultiple: false, endsAt: new Date(Date.now() + 3600000), closedAt: null, createdAt: new Date(), createdById: "admin", options: [{ id: "a", label: "A", position: 0, _count: { votes: 2 } }, { id: "b", label: "B", position: 1, _count: { votes: 1 } }], ballots: [], _count: { ballots: 3 }, ...overrides });
const user = (overrides = {}) => ({ id: "student", email: "bt22cse001@iiitn.ac.in", user_handle: "quiet_fox", bio: "Hello", handleChangedAt: null, ...overrides });
beforeEach(() => {
  vi.resetAllMocks();
  state.session = { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" };
  state.db.$transaction.mockImplementation(fn => fn(state.db)); state.db.$queryRaw.mockResolvedValue([]);
  state.db.poll.findUnique.mockResolvedValue(rawPoll());
  state.db.pollBallot.findUnique.mockResolvedValue(null);
  state.db.pollBallot.create.mockResolvedValue({});
  state.db.user.findUnique.mockResolvedValue(user()); state.db.user.findUniqueOrThrow.mockResolvedValue(user());
  state.db.user.updateMany.mockResolvedValue({ count: 1 });
});

test.each([
  ["create poll", () => polls.POST(req("polls", {}))],
  ["create community", () => communities.POST(req("communities", {}))],
  ["end poll", () => managePoll.PATCH(req("polls/poll", { action: "end" }, "PATCH"))],
  ["delete poll", () => managePoll.DELETE(req("polls/poll", undefined, "DELETE"))],
])("non-admin cannot %s", async (_, call) => {
  expect((await call()).status).toBe(403);
  expect(state.db.$transaction).not.toHaveBeenCalled();
  expect(state.db.poll.create).not.toHaveBeenCalled();
  expect(state.db.community.create).not.toHaveBeenCalled();
});

test("admin identity comes only from the configured email", async () => {
  state.session.isAdmin = true;
  expect((await polls.POST(req("polls", {}))).status).toBe(403);
  state.session.email = "bt23csa041@iiitn.ac.in";
  state.db.poll.create.mockResolvedValue(rawPoll());
  const response = await polls.POST(req("polls", { question: "Lunch?", options: ["A", "B"], duration: "1h" }));
  expect(response.status).toBe(201);
  expect(await response.json()).not.toHaveProperty("poll.results");
});

test("poll results are absent from the network response before closing, including for admins", async () => {
  state.session.email = "bt23csa041@iiitn.ac.in";
  state.db.poll.findMany.mockResolvedValueOnce([rawPoll()]).mockResolvedValueOnce([]);
  const response = await polls.GET(req("polls", undefined, "GET"));
  const data = await response.json();
  expect(data.polls[0]).not.toHaveProperty("results");
  expect(JSON.stringify(data)).not.toContain("_count");
  expect(data.polls[0].options[0]).not.toHaveProperty("count");
});

test("expired and manually closed polls expose totals and own choices", () => {
  const ended = pollDTO(rawPoll({ endsAt: new Date(0), ballots: [{ votes: [{ optionId: "a" }] }] }));
  expect(ended.results.totalVoters).toBe(3);
  expect(ended.results.options[0].percentage).toBe(67);
  expect(ended.myChoices).toEqual(["a"]);
  expect(pollDTO(rawPoll({ closedAt: new Date() })).results).toBeDefined();
});

test("a single-choice poll rejects two options", async () => {
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["a", "b"] }))).status).toBe(400);
  expect(state.db.pollBallot.create).not.toHaveBeenCalled();
});

test("a second vote returns 409 and ballots cannot be edited", async () => {
  state.db.pollBallot.findUnique.mockResolvedValue({ userId: "student", pollId: "poll" });
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["a"] }))).status).toBe(409);
  expect(state.db.pollBallot.create).not.toHaveBeenCalled();
});

test("options from another poll and duplicate choices are rejected", async () => {
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["alien"] }))).status).toBe(400);
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["a", "a"] }))).status).toBe(400);
  expect(state.db.pollBallot.create).not.toHaveBeenCalled();
});

test.each([{ closedAt: new Date() }, { endsAt: new Date(0) }])("closed poll rejects votes: %o", async values => {
  state.db.poll.findUnique.mockResolvedValue(rawPoll(values));
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["a"] }))).status).toBe(400);
});

test("multiple-choice ballot writes all choices in the same transaction", async () => {
  state.db.poll.findUnique.mockResolvedValue(rawPoll({ allowMultiple: true }));
  expect((await vote.POST(req("polls/poll/vote", { optionIds: ["a", "b"] }))).status).toBe(200);
  expect(state.db.$transaction).toHaveBeenCalledOnce();
  expect(state.db.$queryRaw).toHaveBeenCalledOnce();
  expect(state.db.pollBallot.create).toHaveBeenCalledWith({ data: { userId: "student", pollId: "poll", votes: { create: [{ optionId: "a" }, { optionId: "b" }] } } });
});

test("poll duration and unique options are validated", async () => {
  state.session.email = "bt23csa041@iiitn.ac.in";
  for (const body of [
    { question: "Q", options: ["A", "a"] },
    { question: "Q", options: ["A", "B"], duration: "custom", endsAt: new Date(0).toISOString() },
    { question: "Q", options: ["A", "B"], duration: "custom", endsAt: new Date(Date.now() + 31 * 86400000).toISOString() },
  ]) expect((await polls.POST(req("polls", body))).status).toBe(400);
});

test("only the asker can accept an answer and it must belong to that question", async () => {
  state.db.question.findUniqueOrThrow.mockResolvedValue({ id: "q", authorId: "other" });
  expect((await accept.PATCH(req("questions/q/accept", { answerId: "a" }, "PATCH"))).status).toBe(403);
  state.db.question.findUniqueOrThrow.mockResolvedValue({ id: "q", authorId: "student" });
  state.db.answer.findFirst.mockResolvedValue(null);
  expect((await accept.PATCH(req("questions/q/accept", { answerId: "alien" }, "PATCH"))).status).toBe(400);
  state.db.answer.findFirst.mockResolvedValue({ id: "a", questionId: "q" });
  expect((await accept.PATCH(req("questions/q/accept", { answerId: "a" }, "PATCH"))).status).toBe(200);
  expect((await accept.PATCH(req("questions/q/accept", { answerId: null }, "PATCH"))).status).toBe(200);
});

test("answer upvotes and un-upvotes are idempotent", async () => {
  const votes = new Set();
  state.db.answer.findUniqueOrThrow.mockResolvedValue({ id: "a" });
  state.db.answerVote.createMany.mockImplementation(async ({ data }) => { data.forEach(row => votes.add(`${row.userId}:${row.answerId}`)); return { count: 1 }; });
  state.db.answerVote.deleteMany.mockImplementation(async () => { votes.clear(); return { count: 1 }; });
  for (let i = 0; i < 2; i++) expect((await answerVote.POST(req("answers/a/vote"))).status).toBe(200);
  expect(votes.size).toBe(1);
  expect(state.db.answerVote.createMany.mock.calls[0][0].skipDuplicates).toBe(true);
  for (let i = 0; i < 2; i++) expect((await answerVote.DELETE(req("answers/a/vote", undefined, "DELETE"))).status).toBe(200);
  expect(votes.size).toBe(0);
});

test("username cooldown rejects early and concurrent changes with an available date", async () => {
  state.db.user.findUniqueOrThrow.mockResolvedValue(user({ handleChangedAt: new Date() }));
  const response = await me.PATCH(req("me", { user_handle: "new_fox" }, "PATCH"));
  expect(response.status).toBe(429); expect(await response.json()).toHaveProperty("handleChangeAvailableAt");
  state.db.user.findUniqueOrThrow.mockResolvedValue(user()); state.db.user.updateMany.mockResolvedValue({ count: 0 });
  expect((await me.PATCH(req("me", { user_handle: "new_fox" }, "PATCH"))).status).toBe(429);
});

test("username roll numbers are rejected by signup and profile updates", async () => {
  expect(completeSignupSchema.safeParse({ email: "bt22cse001@iiitn.ac.in", user_handle: "user_22001", password: "password123", step: "complete-signup" }).success).toBe(false);
  expect((await me.PATCH(req("me", { user_handle: "user_22001" }, "PATCH"))).status).toBe(400);
  for (let i = 0; i < 100; i++) { const handle = generateAnonymousHandle(); expect(handle.length).toBeLessThanOrEqual(20); expect(handle).toMatch(/^[a-z]+_[a-z]+_\d{4}$/); }
});

test("duplicate usernames return 409; bio changes do not consume a rename", async () => {
  state.db.user.updateMany.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("taken", { code: "P2002", clientVersion: "6" }));
  expect((await me.PATCH(req("me", { user_handle: "taken_name" }, "PATCH"))).status).toBe(409);
  expect((await me.PATCH(req("me", { bio: "New bio" }, "PATCH"))).status).toBe(200);
  expect(state.db.user.updateMany.mock.calls.at(-1)[0].data).not.toHaveProperty("handleChangedAt");
});

test("community posts require membership", async () => {
  state.db.community.findUnique.mockResolvedValue({ id: "c" }); state.db.communityMember.findUnique.mockResolvedValue(null);
  expect((await posts.POST(req("posts", { content: "Hello", communityId: "c" }))).status).toBe(403);
  expect(state.db.post.create).not.toHaveBeenCalled();
});

test("repeated joins and leaves keep memberCount in sync", async () => {
  let member = false; let count = 0;
  state.db.community.findUnique.mockImplementation(async () => ({ id: "c", memberCount: count }));
  state.db.communityMember.createMany.mockImplementation(async () => { const changed = !member; member = true; return { count: +changed }; });
  state.db.communityMember.deleteMany.mockImplementation(async () => { const changed = member; member = false; return { count: +changed }; });
  state.db.community.update.mockImplementation(async ({ data }) => { count += data.memberCount.increment; return { memberCount: count }; });
  for (let i = 0; i < 2; i++) expect((await membership.POST(req("communities/c/membership"))).status).toBe(200);
  expect(count).toBe(1);
  for (let i = 0; i < 2; i++) expect((await membership.DELETE(req("communities/c/membership", undefined, "DELETE"))).status).toBe(200);
  expect(count).toBe(0);
});

test("signin next accepts local paths and rejects external and ambiguous URLs", () => {
  for (const value of ["//evil.com", "https://evil.com", "/\\evil.com", "/%2fevil.com", "/%5cevil.com", "javascript:alert(1)"]) expect(safeNext(value)).toBe("/feed");
  expect(safeNext("/questions/q?from=feed")).toBe("/questions/q?from=feed");
});

test("a member can publish a community post", async () => {
  state.db.community.findUnique.mockResolvedValue({ id: "c" });
  state.db.communityMember.findUnique.mockResolvedValue({ userId: "student", communityId: "c" });
  state.db.post.create.mockResolvedValue({ id: "p" });
  state.db.post.findUniqueOrThrow.mockResolvedValue({ id: "p", content: "Hello", mediaURL: [], mediaType: [], createdAt: new Date(), author: { id: "student", user_handle: "quiet_fox", avatar: null, bio: null }, community: { id: "c", slug: "c", name: "Campus", avatar: null }, likes: [], _count: { likes: 0, comments: 0 }, hashtags: [] });
  expect((await posts.POST(req("posts", { content: "Hello", communityId: "c" }))).status).toBe(201);
});

test("admin can end and delete a poll with the same row lock used by voting", async () => {
  state.session.email = "bt23csa041@iiitn.ac.in";
  expect((await managePoll.PATCH(req("polls/poll", { action: "end" }, "PATCH"))).status).toBe(200);
  expect(state.db.poll.update.mock.calls[0][0].data.closedAt).toBeInstanceOf(Date);
  expect((await managePoll.DELETE(req("polls/poll", undefined, "DELETE"))).status).toBe(200);
  expect(state.db.$queryRaw).toHaveBeenCalledTimes(2);
});

test("me returns admin flag and private fields only to the account owner", async () => {
  const response = await me.GET(req("me", undefined, "GET"));
  const result = await response.json();
  expect(result.id).toBe("student");
  expect(result.isAdmin).toBe(false);
  expect(result).not.toHaveProperty("password");
  expect(result).not.toHaveProperty("year");
});

test("proxy never redirects a signed-in user to a protocol-relative next", async () => {
  const { proxy } = await import("@/proxy");
  const response = await proxy(new NextRequest("http://localhost/signin?next=%2F%2Fevil.com"));
  expect(response.headers.get("location")).toBe("http://localhost/feed");
});

test("hidden community posts do not expose comments or like counts", async () => {
  const comments = await import("@/app/api/v1/comments/route");
  const likes = await import("@/app/api/v1/postlikes/route");
  state.db.post.findFirst.mockResolvedValue(null);
  expect((await comments.GET(req("comments?postId=private", undefined, "GET"))).status).toBe(404);
  expect((await comments.POST(req("comments", { postId: "private", content: "Reply" }))).status).toBe(404);
  expect((await likes.GET(req("postlikes?postId=private", undefined, "GET"))).status).toBe(404);
  expect((await likes.POST(req("postlikes", { postId: "private" }))).status).toBe(404);
});
