import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const glucoseReadings = await memoryDb.getGlucoseReadings(user.id);
  const medications = await memoryDb.getMedications(user.id);
  const medicationLogs = await memoryDb.getMedicationLogs(user.id);
  const meals = await memoryDb.getMeals(user.id);
  const activities = await memoryDb.getActivities(user.id);
  const appointments = await memoryDb.getAppointments(user.id);
  const rations = await memoryDb.getRations(user.id);
  const appleFitnessLogs = await memoryDb.getAppleFitnessLogs(user.id);

  return (
    <DashboardView
      user={user}
      glucoseReadings={glucoseReadings}
      medications={medications}
      medicationLogs={medicationLogs}
      meals={meals}
      activities={activities}
      appointments={appointments}
      rations={rations}
      appleFitnessLogs={appleFitnessLogs}
    />
  );
}
