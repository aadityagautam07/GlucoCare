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
import { Meal, RationItem, UserProfile } from "@/types";
import { MealInput } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { PermissionRestricted } from "@/components/common/permission-guard";

interface MealsViewProps {
  meals: Meal[];
  rations: RationItem[];
  user?: UserProfile | null;
}

type MealsTab = "diary" | "rations" | "planner";

export function MealsView({ meals, rations, user }: MealsViewProps) {
  const router = useRouter();
  const [mealList, setMealList] = React.useState<Meal[]>(meals);
  const [rationList, setRationList] = React.useState<RationItem[]>(rations);
  const [activeTab, setActiveTab] = React.useState<MealsTab>("diary");
  const canManageRation = user?.role === "admin" || (user?.permissions?.canManageRation ?? true);

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [prefilledMeal, setPrefilledMeal] = React.useState<
    Partial<MealInput> | undefined
  >(undefined);

  React.useEffect(() => {
    setMealList(meals);
  }, [meals]);

  React.useEffect(() => {
    setRationList(rations);
  }, [rations]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentRations = rationList.filter((r) => r.month === currentMonth);

  // Check low stock count for badge
  const lowStockCount = currentRations.filter((r) => {
    const rem = Math.max(0, r.allocatedQuantity - r.usedQuantity);
    const th = r.lowStockThreshold ?? r.allocatedQuantity * 0.2;
    return rem <= th;
  }).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMeals = mealList.filter((m) => m.date === todayStr);

  const totalCarbsToday = todayMeals.reduce(
    (sum, m) => sum + (m.carbohydrates || 0),
    0
  );
  const totalCaloriesToday = todayMeals.reduce(
    (sum, m) => sum + (m.calories || 0),
    0
  );

  const fetchMeals = React.useCallback(async () => {
    try {
      const res = await fetch("/api/meals");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.meals)) {
          setMealList(data.meals);
        }
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const fetchRations = React.useCallback(async () => {
    try {
      const res = await fetch("/api/rations");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rations)) {
          setRationList(data.rations);
        }
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const handleRefresh = React.useCallback(() => {
    fetchMeals();
    fetchRations();
    router.refresh();
  }, [fetchMeals, fetchRations, router]);

  const handleMealCreated = (newMeal?: Meal) => {
    if (newMeal) {
      setMealList((prev) => [newMeal, ...prev.filter((m) => m.id !== newMeal.id)]);
    }
    handleRefresh();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Meals & Nutrition Log
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep a food diary, monitor your monthly pantry rations, and plan meals matching your supplies.
          </p>
        </div>

        <Button onClick={handleOpenAddMeal} className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Log Meal</span>
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("diary")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "diary"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Food Diary</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            {todayMeals.length} today
          </span>
        </button>

        <button
          onClick={() => setActiveTab("rations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "rations"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Monthly Pantry & Rations</span>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} low
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("planner")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "planner"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <ChefHat className="h-4 w-4" />
          <span>Ration Meal Suggester</span>
        </button>
      </div>

      {/* TAB 1: Food Diary */}
      {activeTab === "diary" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Meals Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {todayMeals.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Utensils className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Carbs Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {totalCarbsToday}{" "}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      grams
                    </span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Calories Today
                  </span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {totalCaloriesToday}{" "}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                      kcal
                    </span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                  <Flame className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chronological Timeline */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Meal History</h2>
            <MealTimeline meals={mealList} onRefresh={handleRefresh} />
          </div>
        </div>
      )}

      {/* TAB 2: Monthly Rations & Pantry */}
      {activeTab === "rations" && (
        canManageRation ? (
          <RationInventory rations={rationList} onRefresh={handleRefresh} />
        ) : (
          <PermissionRestricted
            title="Monthly Ration Management Restricted"
            description="Access to monthly pantry inventory and staple quota tracking has been restricted for your account by your system administrator."
          />
        )
      )}

      {/* TAB 3: Ration-Based Meal Configurator */}
      {activeTab === "planner" && (
        canManageRation ? (
          <RationMealPlanner
            rations={rationList}
            onCookAndLog={handleCookAndLog}
          />
        ) : (
          <PermissionRestricted
            title="Ration Meal Planner Restricted"
            description="Automated ration meal planning and recipe suggestions have been restricted for your account by your system administrator."
          />
        )
      )}

      {/* Add Meal Dialog */}
      <AddMealDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        initialData={prefilledMeal}
        availableRations={currentRations}
        onSuccess={handleMealCreated}
      />
    </div>
  );
}
