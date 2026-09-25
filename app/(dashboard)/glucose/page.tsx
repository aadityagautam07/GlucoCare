import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { GlucoseView } from "@/components/glucose/glucose-view";

export default async function GlucosePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const readings = memoryDb.getGlucoseReadings(user.id);

  return <GlucoseView user={user} readings={readings} />;
}

