// Prayer translation edge function with provider abstraction + cache.
// Phase 1: on-demand translation of prayer title/body.
// Providers supported via TRANSLATION_PROVIDER env var:
//   - "lovable" (default, uses LOVABLE_API_KEY via Lovable AI Gateway)
//   - "google"  (uses TRANSLATION_API_KEY = Google Cloud Translation v2 key)
//   - "deepl"   (uses TRANSLATION_API_KEY = DeepL auth key)
//   - "azure"   (uses TRANSLATION_API_KEY + TRANSLATION_API_REGION)
//   - "openai"  (uses TRANSLATION_API_KEY = OpenAI key)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  prayer_request_id: string;
  source_type?: "global" | "church";
  target_language_code: string;
  title?: string | null;
  body?: string | null;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const PROVIDER = (Deno.env.get("TRANSLATION_PROVIDER") || "lovable").toLowerCase();
const PROVIDER_KEY = Deno.env.get("TRANSLATION_API_KEY") || "";
const PROVIDER_REGION = Deno.env.get("TRANSLATION_API_REGION") || "";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function translateWithLovable(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null }> {
  if (!LOVABLE_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const sys =
    "You are a precise translator. Translate the user's text faithfully, preserving meaning, tone, and any religious/biblical terms. Respond with JSON only: {\"translated\":\"...\",\"source_lang\":\"xx\"}. source_lang is the ISO 639-1 code of the source.";
  const user = `Target language code: ${targetCode}\n\nText:\n${text}`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Lovable AI error ${res.status}: ${t}`);
  }
  const j = await res.json();
  const content = j?.choices?.[0]?.message?.content || "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { translated: content, source_lang: null };
  }
  return {
    text: String(parsed.translated || ""),
    sourceLang: parsed.source_lang || null,
  };
}

async function translateWithGoogle(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null }> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(PROVIDER_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: targetCode, format: "text" }),
  });
  if (!res.ok) throw new Error(`Google translate error ${res.status}`);
  const j = await res.json();
  const t = j?.data?.translations?.[0];
  return {
    text: String(t?.translatedText || ""),
    sourceLang: t?.detectedSourceLanguage || null,
  };
}

async function translateWithDeepL(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null }> {
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${PROVIDER_KEY}`,
    },
    body: JSON.stringify({ text: [text], target_lang: targetCode.toUpperCase() }),
  });
  if (!res.ok) throw new Error(`DeepL error ${res.status}`);
  const j = await res.json();
  const t = j?.translations?.[0];
  return {
    text: String(t?.text || ""),
    sourceLang: t?.detected_source_language?.toLowerCase() || null,
  };
}

async function translateWithAzure(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null }> {
  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(targetCode)}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": PROVIDER_KEY,
  };
  if (PROVIDER_REGION) headers["Ocp-Apim-Subscription-Region"] = PROVIDER_REGION;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify([{ Text: text }]),
  });
  if (!res.ok) throw new Error(`Azure error ${res.status}`);
  const j = await res.json();
  const t = j?.[0];
  return {
    text: String(t?.translations?.[0]?.text || ""),
    sourceLang: t?.detectedLanguage?.language || null,
  };
}

async function translateWithOpenAI(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PROVIDER_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Translate the user text faithfully. Reply JSON only: {"translated":"...","source_lang":"xx"}',
        },
        { role: "user", content: `Target: ${targetCode}\n\n${text}` },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const j = await res.json();
  const content = j?.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return { text: String(parsed.translated || ""), sourceLang: parsed.source_lang || null };
}

async function translate(
  text: string,
  targetCode: string
): Promise<{ text: string; sourceLang: string | null; provider: string }> {
  const provider = PROVIDER;
  let out: { text: string; sourceLang: string | null };
  switch (provider) {
    case "google":
      out = await translateWithGoogle(text, targetCode);
      break;
    case "deepl":
      out = await translateWithDeepL(text, targetCode);
      break;
    case "azure":
      out = await translateWithAzure(text, targetCode);
      break;
    case "openai":
      out = await translateWithOpenAI(text, targetCode);
      break;
    case "lovable":
    default:
      out = await translateWithLovable(text, targetCode);
      break;
  }
  return { ...out, provider };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const {
    prayer_request_id,
    source_type = "global",
    target_language_code,
    title,
    body: textBody,
  } = body;

  if (!prayer_request_id || !target_language_code) {
    return jsonResponse(
      { error: "prayer_request_id and target_language_code required" },
      400
    );
  }

  // Auth: require a signed-in user. Their JWT is used to enforce visibility on the prayer.
  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }
  const userId = userData.user.id;

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1) Cache hit
  const { data: cached } = await adminClient
    .from("prayer_translations")
    .select(
      "translated_title, translated_body, source_language_code, target_language_code, provider"
    )
    .eq("prayer_request_id", prayer_request_id)
    .eq("source_type", source_type)
    .eq("target_language_code", target_language_code)
    .maybeSingle();

  if (cached) {
    // Log cache hit (non-blocking)
    adminClient
      .from("app_events")
      .insert({
        event_type: "translation_cache_hit",
        actor_user_id: userId,
        entity_type: `${source_type}_prayer`,
        entity_id: prayer_request_id,
        metadata_json: { target_language_code },
      })
      .then(() => {});
    return jsonResponse({ ...cached, cached: true });
  }

  // 2) Visibility check using the USER's JWT (respects RLS).
  // We attempt to read the prayer through the user's client. If RLS hides it,
  // we refuse to translate.
  let visibleTitle: string | null = title ?? null;
  let visibleBody: string | null = textBody ?? null;

  if (source_type === "global") {
    const { data: row } = await userClient
      .from("global_prayer_requests")
      .select("title, description, status, visibility")
      .eq("id", prayer_request_id)
      .maybeSingle();
    if (!row) {
      return jsonResponse({ error: "Prayer not visible to this user" }, 403);
    }
    if (row.status !== "open" && row.status !== "answered") {
      return jsonResponse({ error: "Prayer not approved for translation" }, 403);
    }
    visibleTitle = row.title;
    visibleBody = row.description;
  } else if (source_type === "church") {
    const { data: row } = await userClient
      .from("church_prayer_requests")
      .select("title, description, status")
      .eq("id", prayer_request_id)
      .maybeSingle();
    if (!row) {
      return jsonResponse({ error: "Prayer not visible to this user" }, 403);
    }
    if (row.status !== "approved") {
      return jsonResponse(
        { error: "Pending prayers cannot be translated publicly" },
        403
      );
    }
    visibleTitle = row.title;
    visibleBody = row.description;
  }

  // 3) Translate
  let translated_title: string | null = null;
  let translated_body: string | null = null;
  let source_language_code: string | null = null;
  let provider: string = PROVIDER;

  try {
    if (visibleTitle && visibleTitle.trim()) {
      const r = await translate(visibleTitle, target_language_code);
      translated_title = r.text;
      source_language_code = r.sourceLang;
      provider = r.provider;
    }
    if (visibleBody && visibleBody.trim()) {
      const r = await translate(visibleBody, target_language_code);
      translated_body = r.text;
      source_language_code = source_language_code || r.sourceLang;
      provider = r.provider;
    }
  } catch (e: any) {
    console.error("Translation provider error:", e?.message || e);
    // Log failure (non-blocking)
    adminClient
      .from("app_events")
      .insert({
        event_type: "translation_failed",
        actor_user_id: userId,
        entity_type: `${source_type}_prayer`,
        entity_id: prayer_request_id,
        metadata_json: {
          target_language_code,
          provider: PROVIDER,
          error: String(e?.message || e),
        },
      })
      .then(() => {});
    return jsonResponse(
      { error: "Translation failed", details: e?.message || "unknown" },
      502
    );
  }

  // 4) Cache the result
  await adminClient.from("prayer_translations").upsert(
    {
      prayer_request_id,
      source_type,
      source_language_code,
      target_language_code,
      translated_title,
      translated_body,
      provider,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "prayer_request_id,source_type,target_language_code" }
  );

  // 5) Log success (non-blocking)
  adminClient
    .from("app_events")
    .insert({
      event_type: "translation_requested",
      actor_user_id: userId,
      entity_type: `${source_type}_prayer`,
      entity_id: prayer_request_id,
      metadata_json: { target_language_code, provider, source_language_code },
    })
    .then(() => {});

  return jsonResponse({
    translated_title,
    translated_body,
    source_language_code,
    target_language_code,
    provider,
    cached: false,
  });
});