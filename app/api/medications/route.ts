import { NextResponse } from "next/server";
import { getSessionUser, isAdmin, isSuspended, hasPermission } from "@/lib/auth";
import { medicationSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { Medication } from "@/types";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isSuspended(user)) {
      return NextResponse.json({ error: "Account suspended by administrator" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");
    const effectiveUserId = (isAdmin(user) && targetUserId) ? targetUserId : user.id;

    const medications = memoryDb.getMedications(effectiveUserId);
    return NextResponse.json({ medications });
  } catch (error) {
    console.error("GET /api/medications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isSuspended(user)) {
      return NextResponse.json({ error: "Account suspended by administrator" }, { status: 403 });
    }

    if (!hasPermission(user, "canManageMedications")) {
      return NextResponse.json(
        { error: "Access denied: Medication management permission has been restricted by your administrator" },
        { status: 403 }
      );
    }


    const body = await req.json();
    const result = medicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const newMed: Medication = {
      id: "med-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      instructions: data.instructions || "",
      schedule: data.schedule,
      startDate: data.startDate,
      endDate: data.endDate,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = memoryDb.addMedication(newMed);
    return NextResponse.json({ medication: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/medications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

