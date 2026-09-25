"use client";

import * as React from "react";
import { Utensils, Trash2, Clock, Flame, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Meal } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "sonner";

interface MealTimelineProps {
  meals: Meal[];
  onRefresh?: () => void;
}

export function MealTimeline({ meals, onRefresh }: MealTimelineProps) {
  const [deleteTarget, setDeleteTarget] = React.useState<Meal | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const getMealBadgeColor = (type: Meal["mealType"]) => {
    switch (type) {
      case "breakfast":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "lunch":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "dinner":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "snack":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/meals/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete meal");
      toast.success("Meal record deleted");
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      toast.error("Failed to delete meal");
    } finally {
      setIsDeleting(false);
    }
  };

  if (meals.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        No meals recorded yet. Log your breakfast, lunch, dinner, or snacks to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <Card
          key={meal.id}
          className="shadow-xs hover:border-amber-200 dark:hover:border-amber-800 transition-all border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${getMealBadgeColor(
                      meal.mealType
                    )}`}
                  >
                    {meal.mealType}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(meal.date)} at {formatTime(meal.time)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {meal.description}
                </h4>

                {/* Macros */}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {meal.carbohydrates !== undefined && meal.carbohydrates !== null && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {meal.carbohydrates}g carbs
                    </span>
                  )}
                  {meal.protein !== undefined && meal.protein !== null && (
                    <span>{meal.protein}g protein</span>
                  )}
                  {meal.calories !== undefined && meal.calories !== null && (
                    <span className="flex items-center gap-0.5">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      {meal.calories} kcal
                    </span>
                  )}
                </div>

                {meal.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                    &quot;{meal.notes}&quot;
                  </p>
                )}

                {/* Ration Ingredients Used */}
                {meal.rationIngredients && meal.rationIngredients.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {meal.rationIngredients.map((ing, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 font-medium"
                      >
                        <Package className="h-3 w-3 text-amber-600" />
                        {ing.rationName}: {ing.quantity}{ing.unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center self-end sm:self-center">
              <button
                onClick={() => setDeleteTarget(meal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete meal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Meal Record"
        description="Are you sure you want to delete this meal entry?"
        confirmLabel="Delete Meal"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

