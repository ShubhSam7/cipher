import { expect, test, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionProvider } from "@/components/motion/MotionProvider";

vi.mock("@/lib/session", () => ({ getServerSession: async () => ({ success: true, userId: "viewer", email: "viewer@example.com" }) }));
vi.mock("@/lib/prisma", () => ({ default: { user: { findUnique: async ({ where }: { where: { user_handle: string } }) => ({ id: where.user_handle === "my_profile" ? "viewer" : "other", user_handle: where.user_handle, bio: "Campus member", avatar: null, createdAt: new Date("2026-10-01"), _count: { posts: 2 } }) } } }));
import ProfilePage from "@/app/(main)/u/[handle]/page";

test("someone else's profile shows their posts without inviting a post to their profile", async () => {
  const html = renderToStaticMarkup(createElement(MotionProvider, null, await ProfilePage({ params: Promise.resolve({ handle: "other_student" }) })));
  expect(html).toContain("u/other_student");
  expect(html).toContain("Posts");
  expect(html).not.toContain("Something on your mind");
  expect(html).not.toContain("Edit profile");
});

test("your own profile retains the composer and profile editing", async () => {
  const html = renderToStaticMarkup(createElement(MotionProvider, null, await ProfilePage({ params: Promise.resolve({ handle: "my_profile" }) })));
  expect(html).toContain("Something on your mind");
  expect(html).toContain("Edit profile");
});
