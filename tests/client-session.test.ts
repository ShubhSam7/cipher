import { beforeEach, afterEach, test, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ clear: vi.fn(), toast: vi.fn(), assign: vi.fn() }));
vi.mock("@/lib/store/authStore", () => ({ useAuthStore: { getState: () => ({ clear: mocks.clear }) } }));
vi.mock("sonner", () => ({ toast: { error: mocks.toast } }));
beforeEach(() => { vi.clearAllMocks(); vi.resetModules(); vi.stubGlobal("window", { location: { pathname: "/questions/q", search: "?tag=help", assign: mocks.assign } }); });
afterEach(() => vi.unstubAllGlobals());
test("401 clears persisted auth and redirects once with next", async () => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response('{"error":"Unauthorized"}', { status: 401 })));
  const { apiFetch } = await import("@/lib/apiFetch");
  expect((await apiFetch("/api/v1/me")).status).toBe(401);
  await apiFetch("/api/v1/questions");
  expect(mocks.clear).toHaveBeenCalledTimes(2);
  expect(mocks.toast).toHaveBeenCalledWith("Session expired");
  expect(mocks.assign).toHaveBeenCalledOnce();
  expect(mocks.assign).toHaveBeenCalledWith("/signin?next=%2Fquestions%2Fq%3Ftag%3Dhelp");
});
test("successful requests keep the session and pass through the response", async () => {
  const response = new Response("{}", { status: 200 });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  const { apiFetch } = await import("@/lib/apiFetch");
  expect(await apiFetch("/api/v1/me")).toBe(response);
  expect(mocks.clear).not.toHaveBeenCalled();
  expect(mocks.assign).not.toHaveBeenCalled();
});
