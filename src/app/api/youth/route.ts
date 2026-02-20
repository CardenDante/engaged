import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const gender = searchParams.get("gender") || "";
    const branch = searchParams.get("branch") || "";
    const status = searchParams.get("status") || "active";

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (gender) {
      where.gender = gender;
    }

    if (branch) {
      where.branch = { contains: branch };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const youth = await prisma.youth.findMany({
      where,
      orderBy: { dateOfBirth: "asc" },
    });

    return NextResponse.json(youth);
  } catch (error) {
    console.error("Error fetching youth:", error);
    return NextResponse.json({ error: "Failed to fetch youth" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const youth = await prisma.youth.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dateOfBirth: new Date(body.dateOfBirth),
        phone: body.phone || null,
        email: body.email || null,
        branch: body.branch,
        occupation: body.occupation || null,
        bio: body.bio || null,
        photoUrl: body.photoUrl || null,
        registeredBy: body.registeredBy,
      },
    });

    return NextResponse.json(youth, { status: 201 });
  } catch (error) {
    console.error("Error creating youth:", error);
    return NextResponse.json({ error: "Failed to create youth" }, { status: 500 });
  }
}
