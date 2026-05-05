import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight hook returning how many prayers the current user has offered.
 * Used to gate non-essential UI (e.g., Store) until users have engaged with
 * the core prayer experience first. Returns 0 for signed-out users.
 */
export const useUserPrayerCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { count: c } = await supabase
        .from("prayer_actions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "prayed");
      if (!cancelled) {
        setCount(c ?? 0);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { count, loading };
};