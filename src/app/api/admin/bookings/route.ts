import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        resource: true,
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("GET /api/admin/bookings error", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 },
    );
  }

  if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 },
    );
  }

  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("PATCH /api/admin/bookings error", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}




