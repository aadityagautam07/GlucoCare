import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { MedicationsView } from "@/components/medications/medications-view";

export default async function MedicationsPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const medications = memoryDb.getMedications(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);

  return <MedicationsView medications={medications} medicationLogs={medicationLogs} />;
}

