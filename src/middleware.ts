import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseClient(req: NextRequest, res: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // If env is missing, do not block navigation; the app will error more visibly elsewhere.
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          res.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isUserRoute = nextUrl.pathname.startsWith("/dashboard");

  let res = NextResponse.next();
  const supabase = getSupabaseClient(req, res);
  if (!supabase) return res;

  // Refresh session if needed.
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user && (isAdminRoute || isUserRoute)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("next", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || profile?.role !== "host") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};




