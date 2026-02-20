import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const youth = await prisma.youth.findUnique({ where: { id } });

    if (!youth) {
      return NextResponse.json({ error: "Youth not found" }, { status: 404 });
    }

    return NextResponse.json(youth);
  } catch (error) {
    console.error("Error fetching youth:", error);
    return NextResponse.json({ error: "Failed to fetch youth" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.dateOfBirth !== undefined) data.dateOfBirth = new Date(body.dateOfBirth);
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.branch !== undefined) data.branch = body.branch;
    if (body.occupation !== undefined) data.occupation = body.occupation;
    if (body.bio !== undefined) data.bio = body.bio;
    if (body.photoUrl !== undefined) data.photoUrl = body.photoUrl;
    if (body.status !== undefined) data.status = body.status;
    if (body.registeredBy !== undefined) data.registeredBy = body.registeredBy;

    const youth = await prisma.youth.update({
      where: { id },
      data,
    });

    return NextResponse.json(youth);
  } catch (error) {
    console.error("Error updating youth:", error);
    return NextResponse.json({ error: "Failed to update youth" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.youth.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting youth:", error);
    return NextResponse.json({ error: "Failed to delete youth" }, { status: 500 });
  }
}
