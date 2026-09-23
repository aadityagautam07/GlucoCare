import { getSessionUser } from "@/lib/auth";
import { demoUser } from "@/lib/seed-data";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  return <SettingsView user={user} />;
}

