import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "7", 10);

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysParam);

    const allReadings = memoryDb.getGlucoseReadings(user.id);
    const periodReadings = allReadings.filter(
      (r) => new Date(r.measuredAt).getTime() >= cutoffDate.getTime()
    );

    const values = periodReadings.map((r) => r.value);
    const totalReadings = values.length;

    let averageGlucose = 0;
    let highestGlucose = 0;
    let lowestGlucose = 0;
    let timeInRangePct = 0;
    let aboveRangePct = 0;
    let belowRangePct = 0;
    let estimatedA1c = "0.0";

    const fastingMin = user.targetRange?.fastingMin ?? 70;
    const postMealMax = user.targetRange?.postMealMax ?? 180;

    if (totalReadings > 0) {
      averageGlucose = Math.round(values.reduce((a, b) => a + b, 0) / totalReadings);
      highestGlucose = Math.max(...values);
      lowestGlucose = Math.min(...values);

      const inRangeCount = values.filter((v) => v >= fastingMin && v <= postMealMax).length;
      const aboveCount = values.filter((v) => v > postMealMax).length;
      const belowCount = values.filter((v) => v < fastingMin).length;

      timeInRangePct = Math.round((inRangeCount / totalReadings) * 100);
      aboveRangePct = Math.round((aboveCount / totalReadings) * 100);
      belowRangePct = Math.round((belowCount / totalReadings) * 100);

      // Nathan et al. formula: eAG (mg/dL) = 28.7 * A1c - 46.7  => A1c = (eAG + 46.7) / 28.7
      estimatedA1c = ((averageGlucose + 46.7) / 28.7).toFixed(1);
    }

    // Medication adherence
    const logs = memoryDb.getMedicationLogs(user.id).filter(
      (l) => new Date(l.scheduledAt).getTime() >= cutoffDate.getTime()
    );
    const takenCount = logs.filter((l) => l.status === "taken").length;
    const medicationAdherencePct = logs.length > 0 ? Math.round((takenCount / logs.length) * 100) : 100;

    // Activity stats
    const activities = memoryDb.getActivities(user.id).filter(
      (a) => new Date(a.date).getTime() >= cutoffDate.getTime()
    );
    const totalActivityMinutes = activities.reduce((acc, a) => acc + a.durationMinutes, 0);
    const totalSteps = activities.reduce((acc, a) => acc + (a.steps || 0), 0);

    // Meals stats
    const meals = memoryDb.getMeals(user.id).filter(
      (m) => new Date(m.date).getTime() >= cutoffDate.getTime()
    );

    return NextResponse.json({
      periodDays: daysParam,
      totalReadings,
      averageGlucose,
      highestGlucose,
      lowestGlucose,
      timeInRangePct,
      aboveRangePct,
      belowRangePct,
      estimatedA1c,
      medicationAdherencePct,
      totalActivityMinutes,
      totalSteps,
      totalMeals: meals.length,
      readings: periodReadings,
      user,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

