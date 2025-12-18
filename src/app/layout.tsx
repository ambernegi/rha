import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "RHA Villa Booking",
  description: "Book your stay at our beautiful villa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <Link href="/" className="logo">
                RHA Villa
              </Link>
              <nav className="nav-links">
                <Link href="/book">Book</Link>
                <Link href="/dashboard">My bookings</Link>
                <Link href="/admin">Owner</Link>
              </nav>
              <div className="nav-auth">
                <a href="/login" className="nav-auth-link">
                  Sign in
                </a>
                <form method="post" action="/logout" style={{ display: "inline" }}>
                  <button type="submit" className="nav-auth-link">
                    Sign out
                  </button>
                </form>
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


