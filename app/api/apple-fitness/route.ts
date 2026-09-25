import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { appleFitnessLogSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      const log = db.getAppleFitnessLogForDate(user.id, date);
      return NextResponse.json({ log });
    }

    const logs = db.getAppleFitnessLogs(user.id);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching Apple Fitness logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch Apple Fitness logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = appleFitnessLogSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const savedLog = db.saveAppleFitnessLog(user.id, result.data);
    return NextResponse.json({ log: savedLog }, { status: 201 });
  } catch (error) {
    console.error("Error saving Apple Fitness log:", error);
    return NextResponse.json(
      { error: "Failed to save Apple Fitness log" },
      { status: 500 }
    );
  }
}
