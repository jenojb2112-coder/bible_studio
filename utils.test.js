import { test, expect } from "bun:test";
import { withTimeout } from "./utils.js";

test("withTimeout - resolves when target promise resolves before timeout", async () => {
  const p = new Promise(resolve => setTimeout(() => resolve("resolved value"), 10));
  const result = await withTimeout(p, 50, "TestPromise");
  expect(result).toBe("resolved value");
});

test("withTimeout - rejects when target promise rejects before timeout", async () => {
  const p = new Promise((_, reject) => setTimeout(() => reject(new Error("custom error")), 10));
  await expect(withTimeout(p, 50, "TestPromise")).rejects.toThrow("custom error");
});

test("withTimeout - rejects due to timeout when target promise takes too long", async () => {
  const p = new Promise(resolve => setTimeout(() => resolve("too slow"), 50));
  await expect(withTimeout(p, 10, "TestPromise")).rejects.toThrow("TestPromise - Timeout (network/rules problem)");
});
