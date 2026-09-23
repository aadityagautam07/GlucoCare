import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { medicationSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { Medication } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medications = memoryDb.getMedications(user.id);
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

