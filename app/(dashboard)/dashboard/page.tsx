import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const glucoseReadings = memoryDb.getGlucoseReadings(user.id);
  const medications = memoryDb.getMedications(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);
  const meals = memoryDb.getMeals(user.id);
  const activities = memoryDb.getActivities(user.id);
  const appointments = memoryDb.getAppointments(user.id);

  return (
    <DashboardView
      user={user}
      glucoseReadings={glucoseReadings}
      medications={medications}
      medicationLogs={medicationLogs}
      meals={meals}
      activities={activities}
      appointments={appointments}
    />
  );
}

