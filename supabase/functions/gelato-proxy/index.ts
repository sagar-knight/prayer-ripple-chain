import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GELATO_BASE = "https://api.gelato.com/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GELATO_API_KEY = Deno.env.get("GELATO_API_KEY");
    if (!GELATO_API_KEY) {
      throw new Error("GELATO_API_KEY is not configured");
    }

    const { endpoint, method = "GET", body } = await req.json();

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing 'endpoint' field (e.g. '/products')" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gelatoUrl = `${GELATO_BASE}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

    const gelatoResponse = await fetch(gelatoUrl, {
      method,
      headers: {
        "X-API-KEY": GELATO_API_KEY,
        "Content-Type": "application/json",
      },
      ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}),
    });

    const data = await gelatoResponse.text();

    return new Response(data, {
      status: gelatoResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gelato-proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
