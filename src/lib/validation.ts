import { z } from "zod";

// Shared sanitizer — strips control chars and excessive whitespace
const sanitizeString = (val: string) =>
  val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();

const safeText = (maxLen: number) =>
  z
    .string()
    .trim()
    .min(1, "This field is required")
    .max(maxLen, `Must be ${maxLen} characters or fewer`)
    .transform(sanitizeString);

const optionalSafeText = (maxLen: number) =>
  z
    .string()
    .max(maxLen, `Must be ${maxLen} characters or fewer`)
    .transform(sanitizeString)
    .optional()
    .or(z.literal(""));

// ─── Prayer request ────────────────────────────────────────
export const prayerRequestSchema = z.object({
  title: safeText(120),
  description: safeText(2000),
  category: z.string().min(1, "Category is required"),
  anonymous: z.boolean(),
  show_country: z.boolean().optional(),
  country: z.string().max(5).optional(),
});

// ─── Church prayer request ─────────────────────────────────
export const churchPrayerSchema = z.object({
  title: safeText(100),
  description: safeText(1000),
  category: z.string().min(1),
  anonymous: z.boolean(),
});

// ─── Family note / testimony ───────────────────────────────
export const familyNoteSchema = z.object({
  noteText: safeText(1500),
});

// ─── Family prayer request ─────────────────────────────────
export const familyPrayerSchema = z.object({
  title: safeText(200),
  description: optionalSafeText(1500),
});

// ─── Family scripture ──────────────────────────────────────
export const familyScriptureSchema = z.object({
  verseReference: safeText(100),
  verseText: safeText(2000),
  note: optionalSafeText(1000),
  translation: z.enum(["NIV", "KJV", "NLT", "ESV"]),
});

// ─── Profile ───────────────────────────────────────────────
export const profileSchema = z.object({
  displayName: safeText(60),
});

// ─── Report ────────────────────────────────────────────────
export const reportSchema = z.object({
  reason: z.enum(["spam", "abuse", "inappropriate", "other"]),
  details: optionalSafeText(500),
});

// ─── Rate limiter (client-side) ────────────────────────────
const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxPerWindow: number,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= maxPerWindow) {
    const oldest = timestamps[0];
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfterMs: 0 };
}

// ─── Quick profanity check (client-side first pass) ────────
const BLOCKED_PATTERNS = [
  /\b(f+u+c+k+|s+h+i+t+|a+s+s+h+o+l+e|b+i+t+c+h|d+a+m+n+|c+u+n+t+)\b/i,
  /https?:\/\/[^\s]+\.(ru|tk|ml|ga|cf)\b/i, // suspicious TLD links
];

export function quickContentCheck(text: string): {
  pass: boolean;
  reason?: string;
} {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { pass: false, reason: "inappropriate" };
    }
  }
  // Repeated character spam (e.g. "aaaaaaaaaa")
  if (/(.)\1{15,}/.test(text)) {
    return { pass: false, reason: "spam" };
  }
  return { pass: true };
}

export const CONTENT_BLOCKED_MESSAGE =
  "Your message could not be posted. Please keep content respectful and appropriate.";
