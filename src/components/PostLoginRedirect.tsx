"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function safeNextPath(value: string | null) {
  if (!value) return null;
  return value.startsWith("/") ? value : null;
}

/**
 * If an OAuth flow returns the user to `/` (e.g., because of provider/Supabase URL config),
 * this component will redirect them back to the page they were on when login started.
 *
 * Uses sessionStorage to avoid leaking state server-side.
 */
export function PostLoginRedirect() {
  useEffect(() => {
    const next = safeNextPath(sessionStorage.getItem("rha_next_after_login"));
    if (!next) return;

    const run = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      sessionStorage.removeItem("rha_next_after_login");

      const current = `${window.location.pathname}${window.location.search}`;
      if (current === next) return;

      window.location.assign(next);
    };

    void run();
  }, []);

  return null;
}



