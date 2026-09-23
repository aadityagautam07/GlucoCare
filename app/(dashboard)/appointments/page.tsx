import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { AppointmentsView } from "@/components/appointments/appointments-view";

export default async function AppointmentsPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const appointments = memoryDb.getAppointments(user.id);

  return <AppointmentsView appointments={appointments} />;
}

