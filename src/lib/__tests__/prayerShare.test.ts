import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildShortPrayerUrl,
  buildShareText,
  buildWhatsAppHref,
  buildSmsHref,
  buildEmailHref,
  copyToClipboard,
} from "@/lib/prayerShare";

describe("buildShortPrayerUrl", () => {
  it("builds a prayerforward.com short link", () => {
    expect(buildShortPrayerUrl("mom-healing-x7k2")).toBe(
      "https://prayerforward.com/p/mom-healing-x7k2"
    );
  });

  it("does not include any UUID-like internal id", () => {
    const url = buildShortPrayerUrl("dad-surgery-a9p4");
    expect(url).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i);
  });
});

describe("buildShareText", () => {
  it("uses the default message when none is provided", () => {
    const text = buildShareText({ url: "https://prayerforward.com/p/abc-1234" });
    expect(text).toContain("Would you join me in praying");
    expect(text).toContain("https://prayerforward.com/p/abc-1234");
  });

  it("uses a custom message when provided", () => {
    const text = buildShareText({
      url: "https://prayerforward.com/p/abc-1234",
      message: "Please lift this up",
    });
    expect(text.startsWith("Please lift this up")).toBe(true);
  });
});

describe("share href builders", () => {
  const opts = {
    url: "https://prayerforward.com/p/hope-family-q8m1",
    title: "Hope for family",
  };

  it("encodes the url for WhatsApp", () => {
    const href = buildWhatsAppHref(opts);
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    expect(href).toContain(encodeURIComponent(opts.url));
  });

  it("encodes the url for SMS", () => {
    const href = buildSmsHref(opts);
    expect(href.startsWith("sms:")).toBe(true);
    expect(href).toContain(encodeURIComponent(opts.url));
  });

  it("encodes subject and url for email", () => {
    const href = buildEmailHref(opts);
    expect(href.startsWith("mailto:?")).toBe(true);
    expect(href).toContain(encodeURIComponent("Prayer request: Hope for family"));
    expect(href).toContain(encodeURIComponent(opts.url));
  });
});

describe("copyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("returns true on success", async () => {
    const ok = await copyToClipboard("https://prayerforward.com/p/test-abcd");
    expect(ok).toBe(true);
  });

  it("returns false when clipboard throws", async () => {
    (navigator.clipboard.writeText as any) = vi.fn().mockRejectedValue(new Error("nope"));
    const ok = await copyToClipboard("x");
    expect(ok).toBe(false);
  });
});