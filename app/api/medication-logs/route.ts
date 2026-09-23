import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { medicationLogSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { MedicationLog } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = memoryDb.getMedicationLogs(user.id);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("GET /api/medication-logs error:", error);
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
    const result = medicationLogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { medicationId, status, notes } = result.data;
    const medications = memoryDb.getMedications(user.id);
    const medication = medications.find((m) => m.id === medicationId);

    const newLog: MedicationLog = {
      id: "mlog-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      medicationId,
      medicationName: medication ? `${medication.name} (${medication.dosage})` : "Medication",
      dosage: medication?.dosage || "",
      scheduledAt: new Date().toISOString(),
      takenAt: status === "taken" ? new Date().toISOString() : undefined,
      status,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = memoryDb.addMedicationLog(newLog);
    return NextResponse.json({ log: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/medication-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

