import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { glucoseReadingSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { convertToMgDl } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = glucoseReadingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const normalizedMgDl = convertToMgDl(data.value, data.unit);

    const updated = memoryDb.updateGlucoseReading(id, user.id, {
      value: normalizedMgDl,
      unit: data.unit,
      context: data.context,
      date: data.date,
      time: data.time,
      measuredAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
      notes: data.notes?.trim() || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({ reading: updated });
  } catch (error) {
    console.error("PUT /api/glucose/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = memoryDb.deleteGlucoseReading(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Reading deleted" });
  } catch (error) {
    console.error("DELETE /api/glucose/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

