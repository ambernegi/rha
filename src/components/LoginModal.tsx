"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  open: boolean;
  nextPath: string;
  onClose: () => void;
};

export function LoginModal({ open, nextPath, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const signIn = async (provider: "google" | "facebook") => {
    // Preserve where to return after OAuth, even if the provider/Supabase sends us to `/`.
    // SECURITY: `nextPath` is generated internally as a relative path.
    sessionStorage.setItem("rha_next_after_login", nextPath);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      nextPath,
    )}`;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ marginBottom: "0.75rem" }}>
          <div>
            <div className="card-title">Sign in required</div>
            <div className="card-subtitle">
              Sign in with Google or Facebook to request this booking.
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <button type="button" className="btn-primary" onClick={() => void signIn("google")}>
          Continue with Google
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => void signIn("facebook")}
          style={{ marginTop: "0.75rem" }}
        >
          Continue with Facebook
        </button>

        {error && <p className="muted" style={{ color: "var(--error)" }}>{error}</p>}
      </div>
    </div>
  );
}


