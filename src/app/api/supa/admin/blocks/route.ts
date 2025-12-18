import { NextResponse } from "next/server";
import { z } from "zod";
import { requireHost } from "@/lib/supabase/authz";

const createBlockSchema = z.object({
  configurationSlug: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const auth = await requireHost();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { configurationSlug, startDate, endDate, note } = parsed.data;
  if (!(startDate < endDate)) {
    return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
  }

  try {
    const supabase = await auth.supabase;
    const { data, error } = await supabase.rpc("create_manual_block", {
      p_configuration_slug: configurationSlug,
      p_start_date: startDate,
      p_end_date: endDate,
      p_note: note ?? null,
    });

    if (error) {
      // Overlap conflicts will surface here due to booking_locks exclusion constraint.
      return NextResponse.json(
        { error: "Unable to create block (may conflict with existing booking)" },
        { status: 409 },
      );
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("POST /api/supa/admin/blocks error", err);
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 });
  }
}


