import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { GlucoseView } from "@/components/glucose/glucose-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GlucosePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const readings = memoryDb.getGlucoseReadings(user.id);

  return <GlucoseView user={user} readings={readings} />;
}
