import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { AppointmentsView } from "@/components/appointments/appointments-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AppointmentsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const appointments = memoryDb.getAppointments(user.id);

  return <AppointmentsView appointments={appointments} />;
}
