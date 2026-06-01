import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdminRole() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setIsAdmin(false);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "moderator"]);
      const roles = (data ?? []).map((r: { role: string }) => r.role);
      setIsAdmin(roles.includes("admin"));
      setIsModerator(roles.includes("moderator"));
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  return { isAdmin, isModerator, isAdminOrModerator: isAdmin || isModerator, loading };
}
