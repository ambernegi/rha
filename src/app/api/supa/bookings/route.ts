import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSupabaseUser } from "@/lib/supabase/authz";
import { sendEmailViaGmailApi } from "@/lib/email/gmail";

const createBookingSchema = z.object({
  configurationSlug: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestName: z.string().min(1).max(200).optional(),
});

function daysBetween(startDate: string, endDate: string) {
  // Both are YYYY-MM-DD. Use UTC to avoid timezone skew.
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = await auth.supabase;
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,start_date,end_date,status,total_price,created_at,confirmed_at,configuration:configurations(slug,label,price_per_night)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (err) {
    console.error("GET /api/supa/bookings error", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireSupabaseUser();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { configurationSlug, startDate, endDate, guestName } = parsed.data;

  // Basic date order validation.
  if (!(startDate < endDate)) {
    return NextResponse.json({ error: "startDate must be before endDate" }, { status: 400 });
  }

  const nights = daysBetween(startDate, endDate);
  if (nights <= 0) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  try {
    // Use the authenticated user's session; RLS enforces access.
    const supabase = await auth.supabase;

    const { data: config, error: configErr } = await supabase
      .from("configurations")
      .select("id,price_per_night,active")
      .eq("slug", configurationSlug)
      .maybeSingle();

    if (configErr) {
      return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
    if (!config || !config.active) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 });
    }

    const totalPrice = Number(config.price_per_night) * nights;

    const { data: booking, error: insertErr } = await supabase
      .from("bookings")
      .insert({
        user_id: auth.user.id,
        configuration_id: config.id,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
        total_price: totalPrice,
        guest_email: auth.user.email ?? null,
        guest_name: guestName ?? auth.user.user_metadata?.full_name ?? null,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
    }

    // Email host notification (best-effort).
    const hostEmail = process.env.HOST_EMAIL;
    if (hostEmail) {
      const subject = `New booking request: ${configurationSlug} (${startDate} → ${endDate})`;
      const text = [
        "New booking request received.",
        "",
        `Guest: ${auth.user.email ?? "Unknown"}`,
        `Option: ${configurationSlug}`,
        `Dates: ${startDate} → ${endDate}`,
        `Total (estimate): ₹${totalPrice.toFixed(0)}`,
        "",
        `Booking ID: ${booking.id}`,
      ].join("\n");
      await sendEmailViaGmailApi({ to: hostEmail, subject, text });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("POST /api/supa/bookings error", err);
    return NextResponse.json({ error: "Failed to create booking request" }, { status: 500 });
  }
}


