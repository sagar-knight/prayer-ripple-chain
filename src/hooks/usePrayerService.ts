import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BackendPrayer {
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

export function usePrayerService() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rescueCount, setRescueCount] = useState(0);

  const fetchNextPrayer = useCallback(
    async (
      mode: string,
      excludeIds: string[] = []
    ): Promise<BackendPrayer | null> => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("pray-selection", {
          body: {
            mode,
            user_id: user?.id ?? null,
            user_country: null, // TODO: pull from profile
            user_interests: null,
            exclude_ids: excludeIds,
          },
        });

        if (error) {
          console.error("pray-selection error:", error);
          return null;
        }

        if (data?.rescue_count !== undefined) {
          setRescueCount(data.rescue_count);
        }

        return data?.prayer ?? null;
      } catch (e) {
        console.error("pray-selection fetch error:", e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const recordPrayed = useCallback(
    async (prayerId: string, sourceType: string = "global") => {
      try {
        await supabase.rpc("record_prayer_action", {
          _prayer_id: prayerId,
          _source_type: sourceType,
          _user_id: user?.id ?? "anonymous",
          _action_type: "prayed",
          _metadata: null,
        });
      } catch (e) {
        console.error("record_prayer_action error:", e);
      }
    },
    [user]
  );

  const recordShared = useCallback(
    async (prayerId: string, channel: string, sourceType: string = "global") => {
      try {
        await supabase.rpc("record_prayer_action", {
          _prayer_id: prayerId,
          _source_type: sourceType,
          _user_id: user?.id ?? "anonymous",
          _action_type: "shared",
          _metadata: { channel },
        });
      } catch (e) {
        console.error("record_prayer_action error:", e);
      }
    },
    [user]
  );

  const submitGlobalPrayer = useCallback(
    async (data: {
      title: string;
      description: string;
      category: string;
      anonymous: boolean;
      show_country?: boolean;
      country?: string;
    }) => {
      const { error } = await supabase.from("global_prayer_requests").insert({
        title: data.title,
        description: data.description,
        category: data.category,
        anonymous: data.anonymous,
        show_country: data.show_country ?? false,
        country: data.country ?? null,
        created_by: user?.id ?? "anonymous",
        visibility: "public",
        status: "open",
      });

      if (error) {
        console.error("submit prayer error:", error);
        throw error;
      }
    },
    [user]
  );

  return {
    fetchNextPrayer,
    recordPrayed,
    recordShared,
    submitGlobalPrayer,
    loading,
    rescueCount,
  };
}
