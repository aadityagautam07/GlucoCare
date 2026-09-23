import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { ActivityView } from "@/components/activity/activity-view";

export default async function ActivityPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const activities = memoryDb.getActivities(user.id);

  return <ActivityView activities={activities} />;
}

