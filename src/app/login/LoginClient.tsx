"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

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

  const sendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const normalized = phone.trim();
      if (!normalized.startsWith("+")) {
        throw new Error("Enter phone in international format, e.g. +91XXXXXXXXXX");
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        phone: normalized,
      });
      if (otpErr) throw otpErr;

      setOtpSent(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-lg">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Sign in</div>
            <div className="card-subtitle">
              Continue with Google or use a one-time password (OTP) on mobile.
            </div>
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

        <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
          <div className="card-title">Sign in with OTP</div>
          <div className="muted" style={{ marginTop: "0.35rem" }}>
            Enter your phone number in international format.
          </div>
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
                disabled={loading || !phone.trim()}
                onClick={() => void sendOtp()}
              >
                Send OTP
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                disabled={loading || !otp.trim()}
                onClick={() => void verifyOtp()}
              >
                Verify OTP
              </button>
            )}
            {otpSent && (
              <button
                type="button"
                className="btn-secondary"
                disabled={loading}
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                Use a different number
              </button>
            )}
          </div>
        </div>

        {error && <p className="muted" style={{ color: "var(--error)" }}>{error}</p>}
      </div>
    </div>
  );
}


