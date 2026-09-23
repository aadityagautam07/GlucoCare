import { getSessionUser } from "@/lib/auth";
import { demoUser } from "@/lib/seed-data";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}

