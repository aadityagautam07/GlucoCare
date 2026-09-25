import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { InsightCards } from "@/components/insights/insight-cards";

export default async function InsightsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const glucoseReadings = memoryDb.getGlucoseReadings(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);
  const meals = memoryDb.getMeals(user.id);
  const activities = memoryDb.getActivities(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Health Insights & Patterns
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Observational summaries of your self-recorded tracking data to help you understand your daily rhythms.
        </p>
      </div>

      <InsightCards
        glucoseReadings={glucoseReadings}
        medicationLogs={medicationLogs}
        meals={meals}
        activities={activities}
        user={user}
      />
    </div>
  );
}

