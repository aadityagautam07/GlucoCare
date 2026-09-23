"use client";

import * as React from "react";
import {
  Plus,
  Utensils,
  Flame,
  Sparkles,
  Package,
  ChefHat,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MealTimeline } from "./meal-timeline";
import { AddMealDialog } from "./add-meal-dialog";
import { RationInventory } from "./ration-inventory";
import { RationMealPlanner } from "./ration-meal-planner";
import { Meal, RationItem } from "@/types";
import { MealInput } from "@/lib/validations";
import { useRouter } from "next/navigation";

interface MealsViewProps {
  meals: Meal[];
  rations: RationItem[];
}

type MealsTab = "diary" | "rations" | "planner";

export function MealsView({ meals, rations }: MealsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<MealsTab>("diary");
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [prefilledMeal, setPrefilledMeal] = React.useState<
    Partial<MealInput> | undefined
  >(undefined);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRations = rations.filter((r) => r.month === currentMonth);

  // Check low stock count for badge
  const lowStockCount = currentRations.filter((r) => {
    const rem = Math.max(0, r.allocatedQuantity - r.usedQuantity);
    const th = r.lowStockThreshold ?? r.allocatedQuantity * 0.2;
    return rem <= th;
  }).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter((m) => m.date === todayStr);

  const totalCarbsToday = todayMeals.reduce(
    (sum, m) => sum + (m.carbohydrates || 0),
    0
  );
  const totalCaloriesToday = todayMeals.reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );

  const handleRefresh = () => {
    router.refresh();
  };

  const handleOpenAddMeal = () => {
    setPrefilledMeal(undefined);
    setAddModalOpen(true);
  };

  const handleCookAndLog = (recipeData: Partial<MealInput>) => {
    setPrefilledMeal(recipeData);
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meals & Nutrition Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep a food diary, monitor your monthly pantry rations, and plan meals matching your supplies.
          </p>
        </div>

        <Button onClick={handleOpenAddMeal} className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Log Meal</span>
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("diary")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors px-1 ${
            activeTab === "diary"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Meal Diary & History</span>
        </button>

        <button
          onClick={() => setActiveTab("rations")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors px-1 ${
            activeTab === "rations"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Monthly Rations & Pantry</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" />
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("planner")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors px-1 ${
            activeTab === "planner"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <ChefHat className="h-4 w-4" />
          <span>Ration Meal Configurator</span>
        </button>
      </div>

      {/* TAB 1: Meal Diary & History */}
      {activeTab === "diary" && (
        <div className="space-y-6">
          {/* Today's Meal Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Meals Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {todayMeals.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Utensils className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Carbs Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalCarbsToday}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      grams
                    </span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Calories Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalCaloriesToday}{" "}
                    <span className="text-sm font-normal text-slate-500">
                      kcal
                    </span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Flame className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chronological Timeline */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Meal History</h2>
            <MealTimeline meals={meals} onRefresh={handleRefresh} />
          </div>
        </div>
      )}

      {/* TAB 2: Monthly Rations & Pantry */}
      {activeTab === "rations" && (
        <RationInventory rations={rations} onRefresh={handleRefresh} />
      )}

      {/* TAB 3: Ration-Based Meal Configurator */}
      {activeTab === "planner" && (
        <RationMealPlanner
          rations={rations}
          onCookAndLog={handleCookAndLog}
        />
      )}

      {/* Add Meal Dialog */}
      <AddMealDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        initialData={prefilledMeal}
        availableRations={currentRations}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
