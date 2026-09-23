import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { activitySchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { Activity } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = memoryDb.getActivities(user.id);
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("GET /api/activities error:", error);
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
    const result = activitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const newAct: Activity = {
      id: "act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      activityType: data.activityType,
      durationMinutes: data.durationMinutes,
      date: data.date,
      time: data.time,
      steps: data.steps ?? undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = memoryDb.addActivity(newAct);
    return NextResponse.json({ activity: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

