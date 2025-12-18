import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="stack-lg">
          <div className="card">
            <p className="muted">Loading…</p>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}


