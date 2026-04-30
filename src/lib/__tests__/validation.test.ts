import { describe, it, expect } from "vitest";
import { quickContentCheck, checkRateLimit } from "@/lib/validation";

describe("quickContentCheck", () => {
  it("allows normal prayer text", () => {
    const r = quickContentCheck("Please pray for my family's health and peace.");
    expect(r.pass).toBe(true);
  });

  it("flags repeated-character spam", () => {
    const r = quickContentCheck("a".repeat(50));
    expect(r.pass).toBe(false);
    expect(r.reason).toBe("spam");
  });
});

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const key = "rl-" + Math.random();
    const r = checkRateLimit(key, 3, 60_000);
    expect(r.allowed).toBe(true);
  });

  it("blocks after exceeding the limit", () => {
    const key = "rl-block-" + Math.random();
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60_000);
    const r = checkRateLimit(key, 3, 60_000);
    expect(r.allowed).toBe(false);
  });
});
