import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { demoUser } from "@/lib/seed-data";
import { MealsView } from "@/components/meals/meals-view";

export default async function MealsPage() {
  const sessionUser = await getSessionUser();
  const user = sessionUser || demoUser;

  const meals = memoryDb.getMeals(user.id);
  const rations = memoryDb.getRations(user.id);

  return <MealsView meals={meals} rations={rations} />;
}
