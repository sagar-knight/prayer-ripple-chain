// Deletes the currently authenticated user's account.
// Uses the service-role key to call auth.admin.deleteUser after verifying
// the caller's JWT. Profile + related rows cascade via FK ON DELETE CASCADE.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) {
      return json({ error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller's identity using their JWT.
    const userClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return json({ error: "Invalid session" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { error: deleteErr } = await admin.auth.admin.deleteUser(
      userData.user.id,
    );
    if (deleteErr) {
      return json({ error: deleteErr.message }, 500);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}