"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  open: boolean;
  nextPath: string;
  onClose: () => void;
};

export function LoginModal({ open, nextPath, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const signIn = async () => {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      nextPath,
    )}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
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
              Please sign in with Google to request this booking.
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <button type="button" className="btn-primary" onClick={() => void signIn()}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}


