import { createSupabaseServerClient } from "./server";

export async function requireSupabaseUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  return { ok: true as const, supabase, user: data.user };
}

export async function requireHost() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) return auth;

  const { data, error } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500 as const, error: "Auth check failed" };
  }

  if (data?.role !== "host") {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }

  return auth;
}


