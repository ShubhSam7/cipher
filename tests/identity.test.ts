import { test, expect } from "vitest";
import { avatarIdentity, hashString, toneFor } from "../lib/avatar";
test("identity is deterministic and independent of browser state", () => {
  expect(hashString("hello")).toBe(1335831723);
  expect(avatarIdentity("u/quiet_orbit")).toEqual(avatarIdentity("quiet_orbit"));
  expect(avatarIdentity("").initial).toBe("?");
  expect(new Set(Array.from({length:100},(_,i)=>toneFor(`student_${i}`))).size).toBe(6);
});
