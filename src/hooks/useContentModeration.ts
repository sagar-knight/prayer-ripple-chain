import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  quickContentCheck,
  checkRateLimit,
  CONTENT_BLOCKED_MESSAGE,
} from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";

interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export function useContentModeration() {
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  const moderate = useCallback(
    async (
      text: string,
      context: string = "prayer request",
      rateLimitKey: string = "submit"
    ): Promise<ModerationResult> => {
      // 1. Rate limit check
      const rl = checkRateLimit(rateLimitKey, 5, 60_000); // 5 per minute
      if (!rl.allowed) {
        toast({
          title: "Please slow down",
          description: `You can try again in ${Math.ceil(rl.retryAfterMs / 1000)} seconds.`,
          variant: "destructive",
        });
        return { allowed: false, reason: "rate_limited" };
      }

      // 2. Quick client-side check
      const quick = quickContentCheck(text);
      if (!quick.pass) {
        toast({ title: CONTENT_BLOCKED_MESSAGE, variant: "destructive" });
        return { allowed: false, reason: quick.reason };
      }

      // 3. AI moderation (backend)
      setChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          "moderate-content",
          { body: { text, context } }
        );
        if (error) {
          console.warn("Moderation service error, allowing through:", error);
          return { allowed: true };
        }
        if (data?.flagged) {
          toast({ title: CONTENT_BLOCKED_MESSAGE, variant: "destructive" });
          return { allowed: false, reason: data.category || "flagged" };
        }
        return { allowed: true };
      } catch {
        // Fail open
        return { allowed: true };
      } finally {
        setChecking(false);
      }
    },
    [toast]
  );

  return { moderate, checking };
}
