import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "RHA Villa Booking",
  description: "Book your stay at our beautiful villa",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    null;

  const isHost = user
    ? (
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()
      ).data?.role === "host"
    : false;

  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <Link href="/" className="logo">
                RHA Villa
              </Link>
              <nav className="nav-links" />
              <div className="nav-auth">
                <details className="nav-dropdown">
                  <summary className="nav-auth-link">
                    {user ? displayName : "Sign in"}
                  </summary>
                  <div className="nav-dropdown-menu">
                    {user ? (
                      <>
                        {isHost && (
                          <Link href="/admin" className="nav-dropdown-item">
                            Owner dashboard
                          </Link>
                        )}
                        <Link href="/dashboard" className="nav-dropdown-item">
                          My bookings
                        </Link>
                        <form method="post" action="/logout" style={{ margin: 0 }}>
                          <button type="submit" className="nav-dropdown-item nav-dropdown-button">
                            Sign out
                          </button>
                        </form>
                      </>
                    ) : (
                      <Link href="/login" className="nav-dropdown-item">
                        Sign in with Google
                      </Link>
                    )}
                  </div>
                </details>
              </div>
            </div>
          </header>
          <main className="app-main">{children}</main>
          <footer className="app-footer">
            <span>© {new Date().getFullYear()} RHA Villa Booking</span>
          </footer>
        </div>
      </body>
    </html>
  );
}


