import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, string>();

/**
 * Resolve a stored avatar value (either a full URL or a storage key
 * in the private `avatars` bucket) into a renderable URL.
 * Returns null if the value is empty.
 */
export async function resolveAvatarUrl(value?: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (cache.has(value)) return cache.get(value)!;
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(value, 60 * 60);
  if (error || !data?.signedUrl) return null;
  cache.set(value, data.signedUrl);
  return data.signedUrl;
}

export function clearAvatarCache(value?: string | null) {
  if (value) cache.delete(value);
}
