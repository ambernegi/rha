import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostLoginRedirect } from "@/components/PostLoginRedirect";

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
        <PostLoginRedirect />
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <Link href="/" className="logo">
                RHA Villa
              </Link>
              <nav className="nav-links" />
              <div className="nav-auth">
                {user ? (
                  <details className="nav-dropdown">
                    <summary className="nav-auth-link">{displayName}</summary>
                    <div className="nav-dropdown-menu">
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
                    </div>
                  </details>
                ) : (
                  <Link href="/login" className="nav-auth-link nav-auth-link--chevron">
                    Sign in
                  </Link>
                )}
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


