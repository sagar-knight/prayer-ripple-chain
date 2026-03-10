import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PrayerRow {
  prayer_id: string;
  source_type: string;
  title: string;
  description: string;
  category: string;
  anonymous: boolean;
  show_country: boolean;
  country: string | null;
  visibility: string;
  status: string;
  created_by: string;
  created_at: string;
  prayer_count: number;
  unique_people_prayed: number;
  target_prayers: number;
  last_prayed_at: string | null;
}

function computeScore(p: PrayerRow, now: number): number {
  const createdMs = new Date(p.created_at).getTime();
  const lastPrayedMs = p.last_prayed_at ? new Date(p.last_prayed_at).getTime() : 0;

  // Need factor: fewer prayers → higher need
  const need = 1 / (p.prayer_count + 1);

  // Age boost: older requests get a log boost
  const ageHours = (now - createdMs) / (1000 * 60 * 60);
  const ageBoost = Math.log(1 + ageHours);

  // Stale boost: longer since last prayed → higher boost
  const staleHours = lastPrayedMs > 0
    ? (now - lastPrayedMs) / (1000 * 60 * 60)
    : 999;
  const staleBoost = Math.log(1 + staleHours);

  // Assignment boost: requests not yet at minimum coverage
  const remaining = Math.max(0, p.target_prayers - p.prayer_count);
  const assignBoost = remaining > 0 ? 2.0 : 0;

  // Jitter for tie-breaking
  const jitter = Math.random() * 0.05;

  return (5 * need) + (1.2 * ageBoost) + (1.5 * staleBoost) + assignBoost + jitter;
}

function isRescueCandidate(p: PrayerRow, now: number): boolean {
  const staleHours = p.last_prayed_at
    ? (now - new Date(p.last_prayed_at).getTime()) / (1000 * 60 * 60)
    : 999;
  return p.prayer_count <= 1 || staleHours > 72;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, user_id, user_country, user_interests, exclude_ids } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all open public global prayers from the unified view
    const { data: prayers, error } = await supabase
      .from("unified_prayer_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("DB error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch prayers" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!prayers || prayers.length === 0) {
      return new Response(JSON.stringify({ prayer: null, rescue_count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = Date.now();
    let eligible = prayers as PrayerRow[];

    // Exclude user's own requests
    if (user_id) {
      eligible = eligible.filter((p) => p.created_by !== user_id);
    }

    // Exclude already-prayed IDs (passed from frontend for session continuity)
    if (exclude_ids && Array.isArray(exclude_ids) && exclude_ids.length > 0) {
      const excludeSet = new Set(exclude_ids);
      eligible = eligible.filter((p) => !excludeSet.has(p.prayer_id));
    }

    // If user is authenticated, exclude prayers they prayed in last 30 days
    if (user_id) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentActions } = await supabase
        .from("prayer_actions")
        .select("prayer_id")
        .eq("user_id", user_id)
        .eq("action_type", "prayed")
        .gte("created_at", thirtyDaysAgo);

      if (recentActions && recentActions.length > 0) {
        const recentIds = new Set(recentActions.map((a: any) => a.prayer_id));
        eligible = eligible.filter((p) => !recentIds.has(p.prayer_id));
      }
    }

    // Mode-based filtering
    switch (mode) {
      case "my_country":
        if (user_country) {
          const countryFiltered = eligible.filter((p) => p.country === user_country);
          if (countryFiltered.length > 0) eligible = countryFiltered;
        }
        break;
      case "interests":
        if (user_interests && user_interests.length > 0) {
          const interestFiltered = eligible.filter((p) =>
            user_interests.includes(p.category)
          );
          if (interestFiltered.length > 0) eligible = interestFiltered;
        }
        break;
      case "rescue":
        eligible = eligible.filter((p) => isRescueCandidate(p, now));
        break;
      case "surprise":
        // Will shuffle later
        break;
      // "needs_most", "recent" use default scoring
    }

    // Count rescue candidates for UI badge
    const rescueCount = (prayers as PrayerRow[]).filter((p) => isRescueCandidate(p, now)).length;

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ prayer: null, rescue_count: rescueCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Score and sort
    const scored = eligible.map((p) => ({ prayer: p, score: computeScore(p, now) }));

    if (mode === "surprise") {
      // Pick randomly from top 50%
      scored.sort((a, b) => b.score - a.score);
      const poolSize = Math.max(1, Math.ceil(scored.length * 0.5));
      const pool = scored.slice(0, poolSize);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return new Response(JSON.stringify({ prayer: pick.prayer, rescue_count: rescueCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    scored.sort((a, b) => {
      if (Math.abs(a.score - b.score) < 0.01) {
        if (a.prayer.prayer_count !== b.prayer.prayer_count) {
          return a.prayer.prayer_count - b.prayer.prayer_count;
        }
        return new Date(a.prayer.created_at).getTime() - new Date(b.prayer.created_at).getTime();
      }
      return b.score - a.score;
    });

    const selected = scored[0].prayer;

    return new Response(JSON.stringify({ prayer: selected, rescue_count: rescueCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("pray-selection error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
