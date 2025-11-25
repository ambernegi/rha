// Simple script to simulate concurrent bookings against the API layer.
// Run after `npm run prisma:push` and with your DATABASE_URL configured.
//
// npm run test:bookings

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding a test user and resources...");

  const user = await prisma.user.upsert({
    where: { email: "test-user@example.com" },
    update: {},
    create: {
      email: "test-user@example.com",
      name: "Test User",
    },
  });

  const villa = await prisma.resource.upsert({
    where: { id: "villa-seed-id" },
    update: {},
    create: {
      id: "villa-seed-id",
      name: "Entire Villa",
      description: "Seed villa for concurrency test",
      price: 500,
    },
  });

  const room = await prisma.resource.upsert({
    where: { id: "room-seed-id" },
    update: {},
    create: {
      id: "room-seed-id",
      name: "Room 1",
      description: "Seed room for concurrency test",
      price: 200,
      parentId: villa.id,
    },
  });

  const start = new Date();
  const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);

  console.log("Running two concurrent bookings on the same room...");

  await prisma.booking.deleteMany({
    where: { resourceId: { in: [villa.id, room.id] } },
  });

  const createBooking = () =>
    prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          resourceId: { in: [room.id, villa.id] },
          status: { in: ["PENDING", "CONFIRMED"] },
          AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
        },
      });

      if (conflict) {
        throw new Error("CONFLICT");
      }

      return tx.booking.create({
        data: {
          userId: user.id,
          resourceId: room.id,
          startDate: start,
          endDate: end,
          totalPrice: 200 * 3,
          status: "CONFIRMED",
        },
      });
    });

  const results = await Promise.allSettled([createBooking(), createBooking()]);

  console.log("Results of concurrent bookings:", results);

  const bookings = await prisma.booking.findMany({
    where: { resourceId: room.id },
  });

  console.log("Bookings stored in DB:", bookings.length);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});




