import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <SettingsView user={user} />;
}

