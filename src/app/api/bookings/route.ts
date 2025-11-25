import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBookingSchema = z.object({
  resourceId: z.string().cuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        resource: true,
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("GET /api/bookings error", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const parseResult = createBookingSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { resourceId, startDate, endDate } = parseResult.data;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (!(start < end)) {
    return NextResponse.json(
      { error: "Start date must be before end date" },
      { status: 400 },
    );
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        price: true,
        parentId: true,
        parent: { select: { id: true } },
        children: { select: { id: true } },
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const isParent = resource.children.length > 0;

    const resourceIdsToCheck: string[] = [resource.id];

    if (isParent) {
      // Booking parent: check parent + all children
      resourceIdsToCheck.push(...resource.children.map((c) => c.id));
    } else if (resource.parentId) {
      // Booking child: check child + parent
      resourceIdsToCheck.push(resource.parentId);
    }

    const msPerNight = 1000 * 60 * 60 * 24;
    const nights = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / msPerNight),
    );
    const totalPrice = resource.price * nights;

    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          resourceId: { in: resourceIdsToCheck },
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [
            { startDate: { lt: end } },
            { endDate: { gt: start } },
          ],
        },
      });

      if (conflict) {
        throw new Error("CONFLICT");
      }

      return tx.booking.create({
        data: {
          userId: session.user!.id!,
          resourceId: resource.id,
          startDate: start,
          endDate: end,
          totalPrice,
          status: "CONFIRMED",
        },
      });
    });

    return NextResponse.json({ booking });
  } catch (error: any) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json(
        { error: "Selected dates are no longer available" },
        { status: 409 },
      );
    }

    console.error("POST /api/bookings error", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}


