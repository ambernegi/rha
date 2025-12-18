import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("configurations")
      .select("id,slug,label,price_per_night,active")
      .eq("active", true)
      .order("price_per_night", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch configurations" }, { status: 500 });
    }

    return NextResponse.json({ configurations: data ?? [] });
  } catch (err) {
    console.error("GET /api/supa/configurations error", err);
    return NextResponse.json({ error: "Failed to fetch configurations" }, { status: 500 });
  }
}


