import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    // Seeded records all have emails matching the pattern: firstname.lastnameN@email.com
    const seeded = await prisma.youth.findMany({
      where: { email: { endsWith: "@email.com" } },
      select: { id: true },
    });

    const seededIds = seeded.map((y) => y.id);

    if (seededIds.length === 0) {
      return NextResponse.json({ message: "No seeded data found", deleted: 0 });
    }

    // Delete matches involving seeded youth first
    await prisma.match.deleteMany({
      where: {
        OR: [
          { maleId: { in: seededIds } },
          { femaleId: { in: seededIds } },
        ],
      },
    });

    // Delete seeded youth
    const result = await prisma.youth.deleteMany({
      where: { id: { in: seededIds } },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} seeded records`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error cleaning up seed data:", error);
    return NextResponse.json({ error: "Failed to clean up seed data" }, { status: 500 });
  }
}
