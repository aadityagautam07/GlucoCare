import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { MedicationsView } from "@/components/medications/medications-view";

export default async function MedicationsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const medications = memoryDb.getMedications(user.id);
  const medicationLogs = memoryDb.getMedicationLogs(user.id);

  return <MedicationsView medications={medications} medicationLogs={medicationLogs} />;
}

