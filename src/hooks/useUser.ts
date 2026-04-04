"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*, role:roles(name)")
        .eq("id", authUser.id)
        .single();

      setUser(profile as User);
      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const roleName = (user as any)?.role?.name;

  return {
    user,
    loading,
    isAdmin: roleName === "admin",
    isStaff: roleName === "staff" || roleName === "admin",
  };
}
