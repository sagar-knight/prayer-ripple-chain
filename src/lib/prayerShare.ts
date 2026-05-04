import { supabase } from "@/integrations/supabase/client";

const PUBLIC_HOST = "https://prayerforward.com";

export function buildShortPrayerUrl(slug: string): string {
  return `${PUBLIC_HOST}/p/${slug}`;
}

/**
 * Fetch (or lazily backfill) a slug for a given prayer id.
 * Returns null if the prayer is not visible to the caller.
 */
export async function getPrayerSlug(prayerId: string): Promise<string | null> {
  const { data, error } = await (supabase.from as any)("global_prayer_requests")
    .select("slug")
    .eq("id", prayerId)
    .maybeSingle();
  if (error || !data) return null;
  return data.slug ?? null;
}

export interface ShareOptions {
  url: string;
  title?: string;
  message?: string;
}

export function buildShareText({ message, url }: ShareOptions): string {
  const intro = message?.trim()
    ? message.trim()
    : "Would you join me in praying for this request?";
  return `${intro}\n\n${url}`;
}

export function buildWhatsAppHref(opts: ShareOptions): string {
  return `https://wa.me/?text=${encodeURIComponent(buildShareText(opts))}`;
}

export function buildSmsHref(opts: ShareOptions): string {
  return `sms:?&body=${encodeURIComponent(buildShareText(opts))}`;
}

export function buildEmailHref(opts: ShareOptions): string {
  const subject = opts.title
    ? `Prayer request: ${opts.title}`
    : "A prayer request to share";
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildShareText(opts))}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}