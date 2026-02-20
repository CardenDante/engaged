import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";

interface YouthRecord {
  id: string;
  dateOfBirth: Date;
  branch: string;
  occupation: string | null;
  interests: string | null;
  educationLevel: string | null;
  minAgePref: number | null;
  maxAgePref: number | null;
  branchPref: string;
  fellowship: string | null;
  createdAt: Date;
}

interface ScoreBreakdown {
  age: number;
  agePref: number;
  branch: number;
  interests: number;
  education: number;
  fellowship: number;
  profile: number;
  total: number;
}

const EDUCATION_RANKS: Record<string, number> = {
  high_school: 1,
  diploma: 2,
  bachelors: 3,
  masters: 4,
  doctorate: 5,
};

const FELLOWSHIP_RANKS: Record<string, number> = {
  "1": 1,
  "2-3": 2,
  "4-5": 3,
  "6+": 4,
};

function parseInterests(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function computeMatch(
  male: YouthRecord,
  female: YouthRecord
): { score: number; breakdown: ScoreBreakdown } {
  const maleAge = calculateAge(male.dateOfBirth);
  const femaleAge = calculateAge(female.dateOfBirth);
  const ageDiff = maleAge - femaleAge;
  const absAgeDiff = Math.abs(ageDiff);

  let ageScore = 0;
  if (ageDiff >= 0 && ageDiff <= 4) {
    ageScore = 25;
  } else if (ageDiff >= 5 && ageDiff <= 7) {
    ageScore = 20 - (ageDiff - 5) * 3;
  } else if (ageDiff < 0 && absAgeDiff <= 2) {
    ageScore = 18;
  } else if (absAgeDiff <= 10) {
    ageScore = Math.max(0, 12 - absAgeDiff);
  }

  let agePrefScore = 0;
  const maleInFemalePref =
    (!female.minAgePref || maleAge >= female.minAgePref) &&
    (!female.maxAgePref || maleAge <= female.maxAgePref);
  const femaleInMalePref =
    (!male.minAgePref || femaleAge >= male.minAgePref) &&
    (!male.maxAgePref || femaleAge <= male.maxAgePref);

  if (male.minAgePref || male.maxAgePref || female.minAgePref || female.maxAgePref) {
    if (maleInFemalePref && femaleInMalePref) {
      agePrefScore = 20;
    } else if (maleInFemalePref || femaleInMalePref) {
      agePrefScore = 10;
    }
  } else {
    agePrefScore = 12;
  }

  let branchScore = 0;
  const sameBranch =
    male.branch.toLowerCase().trim() === female.branch.toLowerCase().trim();

  if (sameBranch) {
    branchScore = 15;
  } else if (male.branchPref === "same" || female.branchPref === "same") {
    branchScore = 0;
  } else {
    branchScore = 7;
  }

  let interestsScore = 0;
  const maleInterests = parseInterests(male.interests);
  const femaleInterests = parseInterests(female.interests);

  if (maleInterests.length > 0 && femaleInterests.length > 0) {
    const shared = maleInterests.filter((i) => femaleInterests.includes(i));
    const totalUnique = new Set([...maleInterests, ...femaleInterests]).size;
    const overlapRatio = shared.length / totalUnique;

    if (shared.length >= 3) interestsScore = 20;
    else if (shared.length === 2) interestsScore = 15;
    else if (shared.length === 1) interestsScore = 10;

    interestsScore = Math.min(20, interestsScore + Math.round(overlapRatio * 5));
  } else {
    interestsScore = 5;
  }

  let educationScore = 0;
  if (male.educationLevel && female.educationLevel) {
    const mRank = EDUCATION_RANKS[male.educationLevel] || 0;
    const fRank = EDUCATION_RANKS[female.educationLevel] || 0;
    const diff = Math.abs(mRank - fRank);
    if (diff === 0) educationScore = 10;
    else if (diff === 1) educationScore = 7;
    else if (diff === 2) educationScore = 4;
    else educationScore = 1;
  } else {
    educationScore = 3;
  }

  let fellowshipScore = 0;
  if (male.fellowship && female.fellowship) {
    const mRank = FELLOWSHIP_RANKS[male.fellowship] || 0;
    const fRank = FELLOWSHIP_RANKS[female.fellowship] || 0;
    const diff = Math.abs(mRank - fRank);
    if (diff === 0) fellowshipScore = 5;
    else if (diff === 1) fellowshipScore = 3;
    else fellowshipScore = 1;
  } else {
    fellowshipScore = 2;
  }

  const fieldsFilled = (y: YouthRecord) => {
    let n = 0;
    if (y.occupation) n++;
    if (y.interests) n++;
    if (y.educationLevel) n++;
    if (y.fellowship) n++;
    if (y.minAgePref || y.maxAgePref) n++;
    return n;
  };
  const profileScore = Math.min(
    5,
    Math.round(((fieldsFilled(male) + fieldsFilled(female)) / 10) * 5)
  );

  const total = Math.min(
    100,
    ageScore + agePrefScore + branchScore + interestsScore + educationScore + fellowshipScore + profileScore
  );

  return {
    score: total,
    breakdown: {
      age: ageScore,
      agePref: agePrefScore,
      branch: branchScore,
      interests: interestsScore,
      education: educationScore,
      fellowship: fellowshipScore,
      profile: profileScore,
      total,
    },
  };
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: { male: true, female: true },
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

    if (action === "generate") {
      // Delete all non-approved matches so they get recalculated fresh
      await prisma.match.deleteMany({
        where: { status: { in: ["suggested", "rejected"] } },
      });

      const males = await prisma.youth.findMany({
        where: { gender: "male", status: "active" },
      });
      const females = await prisma.youth.findMany({
        where: { gender: "female", status: "active" },
      });

      const newMatches: {
        maleId: string;
        femaleId: string;
        score: number;
        breakdown: string;
      }[] = [];

      for (const male of males) {
        for (const female of females) {
          // Skip pairs that already have an approved match
          const existing = await prisma.match.findUnique({
            where: {
              maleId_femaleId: { maleId: male.id, femaleId: female.id },
            },
          });
          if (existing) continue;

          const { score, breakdown } = computeMatch(male, female);
          if (score >= 45) {
            newMatches.push({
              maleId: male.id,
              femaleId: female.id,
              score,
              breakdown: JSON.stringify(breakdown),
            });
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
