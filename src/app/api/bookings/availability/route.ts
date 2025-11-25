import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get("resourceId");

  if (!resourceId) {
    return NextResponse.json(
      { error: "resourceId is required" },
      { status: 400 },
    );
  }

  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
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
      resourceIdsToCheck.push(...resource.children.map((c) => c.id));
    } else if (resource.parentId) {
      resourceIdsToCheck.push(resource.parentId);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        resourceId: { in: resourceIdsToCheck },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        id: true,
        resourceId: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("GET /api/bookings/availability error", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}




