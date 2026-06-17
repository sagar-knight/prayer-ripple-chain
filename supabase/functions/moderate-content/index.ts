import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { text, context } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ flagged: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not set – skipping AI moderation");
      return new Response(
        JSON.stringify({ flagged: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are a content moderator for a faith-based prayer community app. Classify the following user-submitted text. Respond ONLY with a JSON object: {"flagged": boolean, "reason": string|null, "category": "safe"|"spam"|"profanity"|"harassment"|"hate_speech"|"inappropriate"}. Be strict about hate speech and harassment. Be lenient about prayer topics like illness, grief, and struggles — these are normal. Context: ${context || "prayer request"}.`,
            },
            { role: "user", content: text },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "classify_content",
                description:
                  "Classify user content for moderation in a prayer community",
                parameters: {
                  type: "object",
                  properties: {
                    flagged: {
                      type: "boolean",
                      description: "Whether this content should be blocked or reviewed",
                    },
                    reason: {
                      type: "string",
                      description: "Short reason if flagged, null if safe",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "safe",
                        "spam",
                        "profanity",
                        "harassment",
                        "hate_speech",
                        "inappropriate",
                      ],
                    },
                  },
                  required: ["flagged", "category"],
                  additionalProperties: false,
                },
              },
            },
          ],
            tool_choice: {
              type: "function",
              function: { name: "classify_content" },
            },
          }),
        }
      );
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("AI moderation timed out or failed, allowing through:", err);
      return new Response(
        JSON.stringify({ flagged: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        // Fail open — don't block users if AI quota is exhausted
        console.warn("AI moderation rate limited, allowing content through");
        return new Response(
          JSON.stringify({ flagged: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI moderation error:", response.status);
      return new Response(
        JSON.stringify({ flagged: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ flagged: false, category: "safe" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("moderate-content error:", e);
    return new Response(
      JSON.stringify({ flagged: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
