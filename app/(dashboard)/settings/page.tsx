import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings/settings-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return <SettingsView user={user} />;
}

