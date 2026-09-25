import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { DailyLogRecord, DayModeType } from "@/types";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const log = memoryDb.getDailyLog(user.id, date);

    return NextResponse.json({
      success: true,
      log: log || null,
      date,
    });
  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const date = body.date || new Date().toISOString().split("T")[0];
    const dayMode: DayModeType = body.dayMode || "office";

    const dailyLog: DailyLogRecord = {
      id: body.id || `daily-log-${user.id}-${date}`,
      userId: user.id,
      date,
      dayMode,
      tasksCompleted: Number(body.tasksCompleted) || 0,
      totalTasks: Number(body.totalTasks) || 0,
      adherencePercentage: Number(body.adherencePercentage) || 0,
      tasks: Array.isArray(body.tasks) ? body.tasks : [],
      notes: typeof body.notes === "string" ? body.notes : undefined,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = memoryDb.saveDailyLog(dailyLog);

    return NextResponse.json({
      success: true,
      log: saved,
    });
  } catch (error) {
    console.error("Error saving daily log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

