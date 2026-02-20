import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";

function computeMatchScore(
  male: { dateOfBirth: Date; branch: string; occupation: string | null },
  female: { dateOfBirth: Date; branch: string; occupation: string | null }
): number {
  let score = 50; // base score

  const maleAge = calculateAge(male.dateOfBirth);
  const femaleAge = calculateAge(female.dateOfBirth);
  const ageDiff = Math.abs(maleAge - femaleAge);

  // Age compatibility: closer ages score higher, male slightly older is ideal
  if (maleAge >= femaleAge && ageDiff <= 3) {
    score += 30;
  } else if (maleAge >= femaleAge && ageDiff <= 5) {
    score += 20;
  } else if (ageDiff <= 2) {
    score += 25;
  } else if (ageDiff <= 7) {
    score += 10;
  } else {
    score -= 10;
  }

  // Same branch church bonus
  if (male.branch.toLowerCase() === female.branch.toLowerCase()) {
    score += 15;
  }

  // Both have occupations listed
  if (male.occupation && female.occupation) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        male: true,
        female: true,
      },
      orderBy: { score: "desc" },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Generate new matches
    if (action === "generate") {
      const males = await prisma.youth.findMany({
        where: { gender: "male", status: "active" },
      });
      const females = await prisma.youth.findMany({
        where: { gender: "female", status: "active" },
      });

      const newMatches: { maleId: string; femaleId: string; score: number }[] = [];

      for (const male of males) {
        for (const female of females) {
          const existing = await prisma.match.findUnique({
            where: { maleId_femaleId: { maleId: male.id, femaleId: female.id } },
          });
          if (!existing) {
            const score = computeMatchScore(male, female);
            if (score >= 60) {
              newMatches.push({ maleId: male.id, femaleId: female.id, score });
            }
          }
        }
      }

      if (newMatches.length > 0) {
        await prisma.match.createMany({ data: newMatches });
      }

      const allMatches = await prisma.match.findMany({
        include: { male: true, female: true },
        orderBy: { score: "desc" },
      });

      return NextResponse.json(allMatches);
    }

    // Update match status
    const body = await request.json();
    const match = await prisma.match.update({
      where: { id: body.matchId },
      data: { status: body.status },
      include: { male: true, female: true },
    });

    // If approved, mark both as matched
    if (body.status === "approved") {
      await prisma.youth.updateMany({
        where: { id: { in: [match.maleId, match.femaleId] } },
        data: { status: "matched" },
      });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error with matches:", error);
    return NextResponse.json({ error: "Match operation failed" }, { status: 500 });
  }
}
