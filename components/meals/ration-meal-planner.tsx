"use client";

import * as React from "react";
import {
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RationItem, MealType } from "@/types";
import { MealInput } from "@/lib/validations";

interface RecipeIngredient {
  stapleNameMatch: string; // substring or exact match to patient's ration
  quantity: number;
  unit: string;
}

interface RationConfiguredMeal {
  id: string;
  title: string;
  mealType: MealType;
  description: string;
  carbohydrates: number;
  protein: number;
  calories: number;
  glycemicRating: string;
  prepTime: string;
  requiredStaples: RecipeIngredient[];
}

const PRECONFIGURED_RATION_MEALS: RationConfiguredMeal[] = [
  {
    id: "rec-1",
    title: "Steel-Cut Oatmeal & Chia Berry Bowl",
    mealType: "breakfast",
    description: "Slow-digesting oats loaded with soluble beta-glucan fiber and chia omega-3s for steady morning blood sugar.",
    carbohydrates: 38,
    protein: 10,
    calories: 320,
    glycemicRating: "Low Glycemic Load",
    prepTime: "10 mins",
    requiredStaples: [
      { stapleNameMatch: "oats", quantity: 50, unit: "g" },
      { stapleNameMatch: "chia", quantity: 15, unit: "g" },
    ],
  },
  {
    id: "rec-2",
    title: "Moong Dal & Brown Rice Comfort Bowl",
    mealType: "lunch",
    description: "Wholesome diabetic comfort meal combining fiber-rich brown basmati rice with easily digestible moong dal.",
    carbohydrates: 46,
    protein: 18,
    calories: 410,
    glycemicRating: "Balanced Complex Carbs",
    prepTime: "25 mins",
    requiredStaples: [
      { stapleNameMatch: "brown", quantity: 60, unit: "g" },
      { stapleNameMatch: "moong", quantity: 60, unit: "g" },
      { stapleNameMatch: "olive", quantity: 10, unit: "ml" },
    ],
  },
  {
    id: "rec-3",
    title: "Mediterranean Brown Grain & Nut Salad",
    mealType: "lunch",
    description: "Whole brown grain salad tossed with cold-pressed extra virgin olive oil, crisp vegetables, and crunchy raw nuts.",
    carbohydrates: 28,
    protein: 14,
    calories: 380,
    glycemicRating: "Very Low GI",
    prepTime: "15 mins",
    requiredStaples: [
      { stapleNameMatch: "brown", quantity: 50, unit: "g" },
      { stapleNameMatch: "almond", quantity: 20, unit: "g" },
      { stapleNameMatch: "olive", quantity: 15, unit: "ml" },
    ],
  },
  {
    id: "rec-4",
    title: "Spiced Moong Dal Soup with Greens",
    mealType: "dinner",
    description: "Warm, light evening yellow lentil soup flavored with cumin, turmeric, and fresh spinach to support digestion before sleep.",
    carbohydrates: 26,
    protein: 16,
    calories: 270,
    glycemicRating: "Low GI & Bedtime Gentle",
    prepTime: "20 mins",
    requiredStaples: [
      { stapleNameMatch: "moong", quantity: 70, unit: "g" },
      { stapleNameMatch: "olive", quantity: 10, unit: "ml" },
    ],
  },
  {
    id: "rec-5",
    title: "Raw Almond, Walnut & Chia Power Snack",
    mealType: "snack",
    description: "Portion-controlled blend of heart-healthy raw tree nuts and fiber-packed chia seeds to curb 4 PM cravings.",
    carbohydrates: 5,
    protein: 6,
    calories: 180,
    glycemicRating: "Negligible Spike Risk",
    prepTime: "2 mins",
    requiredStaples: [
      { stapleNameMatch: "almond", quantity: 25, unit: "g" },
      { stapleNameMatch: "chia", quantity: 10, unit: "g" },
    ],
  },
];

interface RationMealPlannerProps {
  rations: RationItem[];
  onCookAndLog: (mealData: Partial<MealInput>) => void;
}

export function RationMealPlanner({
  rations,
  onCookAndLog,
}: RationMealPlannerProps) {
  const [mealFilter, setMealFilter] = React.useState<string>("all");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRations = rations.filter((r) => r.month === currentMonth);

  const filteredMeals =
    mealFilter === "all"
      ? PRECONFIGURED_RATION_MEALS
      : PRECONFIGURED_RATION_MEALS.filter((m) => m.mealType === mealFilter);

  // Helper to match required staple with actual user ration item
  const findMatchingRation = (matchKey: string): RationItem | undefined => {
    return currentRations.find((r) =>
      r.name.toLowerCase().includes(matchKey.toLowerCase())
    );
  };

  const handleSelectRecipe = (meal: RationConfiguredMeal) => {
    // Build attached ration ingredients
    const attachedIngredients: {
      rationId: string;
      rationName: string;
      quantity: number;
      unit: string;
    }[] = [];

    for (const req of meal.requiredStaples) {
      const match = findMatchingRation(req.stapleNameMatch);
      if (match) {
        attachedIngredients.push({
          rationId: match.id,
          rationName: match.name,
          quantity: req.quantity,
          unit: match.unit,
        });
      }
    }

    onCookAndLog({
      mealType: meal.mealType,
      description: meal.title,
      carbohydrates: meal.carbohydrates,
      protein: meal.protein,
      calories: meal.calories,
      rationIngredients: attachedIngredients,
      notes: `Planned from monthly ration: ${meal.glycemicRating}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ration-Configured Meal Planner
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Diabetic-friendly meals calibrated to match the staple foods currently stocked in your monthly pantry.
            </p>
          </div>
        </div>

        {/* Meal Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {["all", "breakfast", "lunch", "dinner", "snack"].map((type) => (
            <button
              key={type}
              onClick={() => setMealFilter(type)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                mealFilter === type
                  ? "bg-amber-700 text-white"
                  : "bg-white/80 border border-amber-200 text-slate-700 hover:bg-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeals.map((meal) => {
          // Check feasibility of required staples against user's actual pantry
          let allInStock = true;
          let hasMissing = false;

          const stapleDetails = meal.requiredStaples.map((req) => {
            const match = findMatchingRation(req.stapleNameMatch);
            if (!match) {
              allInStock = false;
              hasMissing = true;
              return {
                name: req.stapleNameMatch,
                required: `${req.quantity}${req.unit}`,
                status: "missing",
                remaining: 0,
              };
            }

            const remaining = Math.max(
              0,
              match.allocatedQuantity - match.usedQuantity
            );
            if (remaining < req.quantity) {
              allInStock = false;
            }

            return {
              name: match.name,
              required: `${req.quantity}${req.unit}`,
              status: remaining >= req.quantity ? "ok" : "low",
              remaining,
              unit: match.unit,
            };
          });

          return (
            <Card
              key={meal.id}
              className="shadow-xs border-slate-200/90 hover:border-amber-200 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-4 space-y-3.5">
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize border border-slate-200">
                      {meal.mealType}
                    </span>

                    {/* Stock Status Badge */}
                    {allInStock ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        All Rations Available
                      </span>
                    ) : hasMissing ? (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Ration Not Stocked
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Low In Pantry
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-2">
                    {meal.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {meal.description}
                  </p>
                </div>

                {/* Nutrition & Glycemic Metrics */}
                <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700">
                    {meal.carbohydrates}g carbs
                  </span>
                  <span className="text-slate-500">{meal.protein}g protein</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Flame className="h-3 w-3 text-amber-500" />
                    {meal.calories} kcal
                  </span>
                  <span className="text-amber-800 font-medium ml-auto flex items-center gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    {meal.glycemicRating}
                  </span>
                </div>

                {/* Ration Staples Required */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                    Ration Ingredients Needed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stapleDetails.map((staple, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          staple.status === "ok"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : staple.status === "low"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <strong>{staple.name}</strong> ({staple.required})
                        {staple.remaining !== undefined && (
                          <span className="text-[10px] text-slate-500">
                            • {staple.remaining}
                            {staple.unit} in pantry
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Prep: {meal.prepTime}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => handleSelectRecipe(meal)}
                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                  >
                    <span>Cook & Log Meal</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
