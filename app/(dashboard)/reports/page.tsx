import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { ReportsView } from "@/components/reports/reports-view";

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const initialReadings = memoryDb.getGlucoseReadings(user.id);
  const medications = memoryDb.getMedications(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);
  const initialLabReports = memoryDb.getLabReports(user.id);

  return (
    <ReportsView
      user={user}
      initialReadings={initialReadings}
      medications={medications}
      medicationLogs={medicationLogs}
      initialLabReports={initialLabReports}
    />
  );
}

