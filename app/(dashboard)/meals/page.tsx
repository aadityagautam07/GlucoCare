import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { MealsView } from "@/components/meals/meals-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MealsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const meals = memoryDb.getMeals(user.id);
  const rations = memoryDb.getRations(user.id);

  return <MealsView meals={meals} rations={rations} user={user} />;
}
