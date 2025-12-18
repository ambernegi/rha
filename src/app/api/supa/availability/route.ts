import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const availabilityQuerySchema = z.object({
  configurationSlug: z.string().min(1),
  from: z.string().optional(), // YYYY-MM-DD
  to: z.string().optional(), // YYYY-MM-DD
});

function isIsoDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parseResult = availabilityQuerySchema.safeParse({
    configurationSlug: searchParams.get("configurationSlug") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const { configurationSlug, from, to } = parseResult.data;

  if ((from && !isIsoDateOnly(from)) || (to && !isIsoDateOnly(to))) {
    return NextResponse.json({ error: "from/to must be YYYY-MM-DD" }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: config, error: configErr } = await supabase
      .from("configurations")
      .select("id,slug")
      .eq("slug", configurationSlug)
      .maybeSingle();

    if (configErr) {
      return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
    if (!config) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }

    const { data: mapping, error: mapErr } = await supabase
      .from("configuration_resources")
      .select("resource_id")
      .eq("configuration_id", config.id);

    if (mapErr) {
      return NextResponse.json({ error: "Failed to fetch configuration resources" }, { status: 500 });
    }

    const resourceIds = (mapping ?? []).map((m) => m.resource_id);
    if (resourceIds.length === 0) {
      return NextResponse.json({ locks: [] });
    }

    // Locks are non-PII and represent confirmed occupancy.
    let query = supabase
      .from("booking_locks")
      .select("id,resource_id,start_date,end_date,booking_id")
      .in("resource_id", resourceIds)
      .order("start_date", { ascending: true });

    // Optional window filter. Overlap rule: lock.start < to AND lock.end > from
    if (to) query = query.lt("start_date", to);
    if (from) query = query.gt("end_date", from);

    const { data: locks, error: locksErr } = await query;
    if (locksErr) {
      return NextResponse.json({ error: "Failed to fetch locks" }, { status: 500 });
    }

    return NextResponse.json({ locks: locks ?? [] });
  } catch (err) {
    console.error("GET /api/supa/availability error", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}


