import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { MotionProvider } from "@/components/motion/MotionProvider";

const state = vi.hoisted(() => ({ session: { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" } }));
vi.mock("@/lib/session", () => ({ getSession: async () => state.session, getServerSession: async () => state.session }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`Redirect ${url}`); } }));
import { proxy } from "@/proxy";
import PollPage from "@/app/(main)/polls/page";

beforeEach(() => { state.session = { success: true, userId: "student", email: "bt22cse001@iiitn.ac.in" }; });

test.each(["signin", "signup"])("signed-in /%s always goes to the feed, including next parameters", async path => {
  const response = await proxy(new NextRequest(`http://localhost/${path}?next=%2Fpolls`));
  expect(response.headers.get("location")).toBe("http://localhost/feed");
});

test.each(["bt22cse001@iiitn.ac.in", "bt23csa041@iiitn.ac.in"])("poll navigation is available to a valid campus session: %s", async email => {
  state.session.email = email;
  const response = await proxy(new NextRequest("http://localhost/polls"));
  expect(response.status).toBe(200);
  expect(response.headers.has("location")).toBe(false);
});

test("poll creation controls use the verified server role", async () => {
  const student = renderToStaticMarkup(createElement(MotionProvider, null, await PollPage()));
  expect(student).toContain("Polls");
  expect(student).not.toContain("Create poll");
  state.session.email = "bt23csa041@iiitn.ac.in";
  const admin = renderToStaticMarkup(createElement(MotionProvider, null, await PollPage()));
  expect(admin).toContain("Create poll");
});

test("expired sessions remain protected instead of exposing campus polls", async () => {
  state.session.success = false;
  const response = await proxy(new NextRequest("http://localhost/polls"));
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("http://localhost/signin?next=%2Fpolls");
  await expect(PollPage()).rejects.toThrow("Redirect /signin?next=%2Fpolls");
});
