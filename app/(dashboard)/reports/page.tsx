import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const initialReadings = memoryDb.getGlucoseReadings(user.id);
  const medications = memoryDb.getMedications(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);

  return (
    <ReportsView
      user={user}
      initialReadings={initialReadings}
      medications={medications}
      medicationLogs={medicationLogs}
    />
  );
}

