"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  open: boolean;
  nextPath: string;
  onClose: () => void;
};

export function LoginModal({ open, nextPath, onClose }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const signIn = async () => {
    // Preserve where to return after OAuth, even if the provider/Supabase sends us to `/`.
    // SECURITY: `nextPath` is generated internally as a relative path.
    sessionStorage.setItem("rha_next_after_login", nextPath);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      nextPath,
    )}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const sendOtp = async () => {
    setError(null);
    try {
      sessionStorage.setItem("rha_next_after_login", nextPath);
      const supabase = createSupabaseBrowserClient();
      const normalized = phone.trim();
      if (!normalized.startsWith("+")) {
        throw new Error("Enter phone in international format, e.g. +91XXXXXXXXXX");
      }
      const { error: otpErr } = await supabase.auth.signInWithOtp({ phone: normalized });
      if (otpErr) throw otpErr;
      setOtpSent(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const normalized = phone.trim();
      const token = otp.trim();
      if (!normalized.startsWith("+")) {
        throw new Error("Enter phone in international format, e.g. +91XXXXXXXXXX");
      }
      if (token.length < 4) {
        throw new Error("Enter the OTP sent to your phone");
      }
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        phone: normalized,
        token,
        type: "sms",
      });
      if (verifyErr) throw verifyErr;
      window.location.assign(nextPath);
    } catch (e: any) {
      setError(e?.message ?? "Failed to verify OTP");
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-header" style={{ marginBottom: "0.75rem" }}>
          <div>
            <div className="card-title">Sign in required</div>
            <div className="card-subtitle">
              Sign in with Google or via OTP to request this booking.
            </div>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <button type="button" className="btn-primary" onClick={() => void signIn()}>
          Continue with Google
        </button>

        <div className="card" style={{ marginTop: "0.9rem", padding: "0.9rem" }}>
          <div className="card-title">Sign in with OTP</div>
          <div className="form-grid" style={{ marginTop: "0.75rem" }}>
            <div className="field">
              <label>Phone</label>
              <input
                inputMode="tel"
                placeholder="+91XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {otpSent && (
              <div className="field">
                <label>OTP</label>
                <input
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
            {!otpSent ? (
              <button
                type="button"
                className="btn-secondary"
                disabled={!phone.trim()}
                onClick={() => void sendOtp()}
              >
                Send OTP
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                disabled={!otp.trim()}
                onClick={() => void verifyOtp()}
              >
                Verify OTP
              </button>
            )}
            {otpSent && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                Resend / change
              </button>
            )}
          </div>
        </div>

        {error && <p className="muted" style={{ color: "var(--error)" }}>{error}</p>}
      </div>
    </div>
  );
}


