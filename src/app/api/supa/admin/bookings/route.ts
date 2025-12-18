import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireHost } from "@/lib/supabase/authz";

const updateSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["confirm", "reject", "cancel"]),
  note: z.string().max(2000).optional(),
});

export async function GET() {
  const auth = await requireHost();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("bookings")
      .select(
        "id,start_date,end_date,status,total_price,created_at,confirmed_at,guest_email,guest_name,decision_note,configuration:configurations(slug,label,price_per_night)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  } catch (err) {
    console.error("GET /api/supa/admin/bookings error", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireHost();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id, action, note } = parsed.data;

  try {
    const admin = createSupabaseAdminClient();

    if (action === "confirm") {
      const { data, error } = await admin.rpc("confirm_booking", { p_booking_id: id });
      if (error) {
        // Constraint violations typically bubble here when locks overlap.
        return NextResponse.json({ error: "Unable to confirm booking (may conflict)" }, { status: 409 });
      }
      return NextResponse.json({ booking: data });
    }

    if (action === "reject") {
      const { data, error } = await admin.rpc("reject_booking", {
        p_booking_id: id,
        p_note: note ?? null,
      });
      if (error) {
        return NextResponse.json({ error: "Unable to reject booking" }, { status: 400 });
      }
      return NextResponse.json({ booking: data });
    }

    // cancel: host cancels any booking; if confirmed, delete locks first.
    const { data: booking, error: fetchErr } = await admin
      .from("bookings")
      .select("id,status")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "confirmed") {
      await admin.from("booking_locks").delete().eq("booking_id", id);
    }

    const { data: updated, error: updErr } = await admin
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), decision_note: note ?? null })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updErr) {
      return NextResponse.json({ error: "Unable to cancel booking" }, { status: 500 });
    }

    return NextResponse.json({ booking: updated });
  } catch (err) {
    console.error("PATCH /api/supa/admin/bookings error", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}


