import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { GlucoseView } from "@/components/glucose/glucose-view";

export default async function GlucosePage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const readings = memoryDb.getGlucoseReadings(user.id);

  return <GlucoseView user={user} readings={readings} />;
}

