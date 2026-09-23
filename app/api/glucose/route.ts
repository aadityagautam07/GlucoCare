import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { glucoseReadingSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { GlucoseReading } from "@/types";
import { convertToMgDl } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const readings = memoryDb.getGlucoseReadings(user.id);
    const sliced = limit ? readings.slice(0, limit) : readings;

    return NextResponse.json({ readings: sliced });
  } catch (error) {
    console.error("GET /api/glucose error:", error);
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
    const result = glucoseReadingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    // Normalize value to mg/dL for consistent multi-day analytics
    const normalizedMgDl = convertToMgDl(data.value, data.unit);

    const newReading: GlucoseReading = {
      id: "glu-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      value: normalizedMgDl,
      unit: data.unit,
      context: data.context,
      date: data.date,
      time: data.time,
      measuredAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = memoryDb.addGlucoseReading(newReading);
    return NextResponse.json({ reading: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/glucose error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

