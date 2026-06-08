import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPendingChurchJoin, clearPendingChurchJoin } from "@/pages/ChurchJoin";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks on auth state change if there's a pending community join.
 * If so, auto-joins and redirects.
 */
export function useAutoJoinChurch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (!user || processed.current) return;

    const pending = getPendingChurchJoin();
    if (!pending) return;

    processed.current = true;

    (async () => {
      try {
        // Check if already a member
        const { data: existing } = await supabase
          .from("church_memberships")
          .select("id")
          .eq("church_id", pending.churchId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("church_memberships").insert({
            church_id: pending.churchId,
            user_id: user.id,
            role: "member",
            status: "active",
          });

          // Track
          await supabase.from("app_events").insert({
            event_type: "church_join_redirect_after_signup",
            entity_type: "church",
            entity_id: pending.churchId,
            actor_user_id: user.id,
          });
        }

        clearPendingChurchJoin();
        navigate(`/communities/${pending.churchId}/wall`);
      } catch {
        clearPendingChurchJoin();
      }
    })();
  }, [user, navigate]);
}
