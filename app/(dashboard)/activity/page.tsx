import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { ActivityView } from "@/components/activity/activity-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ActivityPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const activities = memoryDb.getActivities(user.id);

  return <ActivityView activities={activities} />;
}
