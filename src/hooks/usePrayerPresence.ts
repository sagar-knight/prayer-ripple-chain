import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Tracks how many people are *actively* present on a given prayer right now
 * via a Supabase Realtime presence channel.
 *
 * - Each viewer joins channel `prayer-presence:<prayerId>` with a unique key.
 * - The current authenticated user (typically the requester or someone already
 *   counted elsewhere) is excluded from the returned count so we never inflate
 *   "praying with you" with the viewer themselves.
 * - Falls back to 0 when no live data is available.
 *
 * No DB schema, no writes — purely ephemeral realtime presence.
 */
export function usePrayerPresence(prayerId: string | undefined): number {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!prayerId) return;

    const selfKey = user?.id ?? `anon-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(`prayer-presence:${prayerId}`, {
      config: { presence: { key: selfKey } },
    });

    const recount = () => {
      const state = channel.presenceState();
      const keys = Object.keys(state);
      // Exclude self so the requester viewing their own card doesn't see
      // "1 praying with you" that is really just themselves.
      const others = keys.filter((k) => k !== selfKey).length;
      setActiveCount(others);
    };

    channel
      .on("presence", { event: "sync" }, recount)
      .on("presence", { event: "join" }, recount)
      .on("presence", { event: "leave" }, recount)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    return () => {
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
    };
  }, [prayerId, user?.id]);

  return activeCount;
}