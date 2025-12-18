"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next") ?? "/dashboard";
    // SECURITY: only allow relative in-app redirects.
    return next.startsWith("/") ? next : "/dashboard";
  }, [searchParams]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        nextPath,
      )}`;

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (signInError) throw signInError;
    } catch (e: any) {
      setError(e?.message ?? "Failed to sign in");
      setLoading(false);
    }
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Sign in</div>
            <div className="card-subtitle">Continue with Google to book your stay.</div>
          </div>
          <span className="badge">Auth</span>
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={() => void signInWithGoogle()}
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        {error && <p className="muted" style={{ color: "var(--error)" }}>{error}</p>}
      </div>
    </div>
  );
}


