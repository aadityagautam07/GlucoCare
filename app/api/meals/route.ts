import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { mealSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { Meal } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meals = memoryDb.getMeals(user.id);
    return NextResponse.json({ meals });
  } catch (error) {
    console.error("GET /api/meals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = mealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const newMeal: Meal = {
      id: "meal-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      mealType: data.mealType,
      description: data.description,
      date: data.date,
      time: data.time,
      carbohydrates: data.carbohydrates ?? undefined,
      calories: data.calories ?? undefined,
      protein: data.protein ?? undefined,
      notes: data.notes?.trim() || undefined,
      rationIngredients:
        data.rationIngredients && data.rationIngredients.length > 0
          ? data.rationIngredients
          : undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = memoryDb.addMeal(newMeal);
    return NextResponse.json({ meal: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/meals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

