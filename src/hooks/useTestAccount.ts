import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTestAccount() {
  const { user } = useAuth();
  const [isTestAccount, setIsTestAccount] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsTestAccount(false);
      setLoading(false);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_test_account")
        .eq("id", user.id)
        .maybeSingle();
      setIsTestAccount(!!data?.is_test_account);
      setLoading(false);
    };
    check();
  }, [user]);

  return { isTestAccount, loading };
}
