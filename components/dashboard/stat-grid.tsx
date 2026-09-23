"use client";

import * as React from "react";
import Link from "next/link";
import { Activity as GlucoseIcon, Pill, Utensils, Footprints, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GlucoseReading, Medication, MedicationLog, Meal, Activity, UserProfile } from "@/types";
import { formatGlucoseValue } from "@/lib/utils";

interface StatGridProps {
  glucoseReadings: GlucoseReading[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  meals: Meal[];
  activities: Activity[];
  user?: UserProfile | null;
  onOpenQuickAction: (type: "glucose" | "medication" | "meal" | "activity") => void;
}

export function StatGrid({
  glucoseReadings,
  medications,
  medicationLogs,
  meals,
  activities,
  user,
  onOpenQuickAction,
}: StatGridProps) {
  const unit = user?.glucoseUnit || "mg/dL";
  const todayStr = new Date().toISOString().split("T")[0];

  // Glucose stats for today
  const todayReadings = glucoseReadings.filter((g) => g.date === todayStr);
  const todayAvg =
    todayReadings.length > 0
      ? Math.round(todayReadings.reduce((sum, r) => sum + r.value, 0) / todayReadings.length)
      : null;

  // Medications scheduled vs taken today
  const activeMeds = medications.filter((m) => m.active);
  const todayTakenCount = medicationLogs.filter(
    (l) => l.scheduledAt.startsWith(todayStr) && l.status === "taken"
  ).length;
  const totalDosesExpected = activeMeds.length || 3;
  const medProgressPct = Math.min(
    100,
    Math.round((todayTakenCount / totalDosesExpected) * 100)
  );

  // Activity today
  const todayActivities = activities.filter((a) => a.date === todayStr);
  const todayActiveMinutes = todayActivities.reduce((acc, a) => acc + a.durationMinutes, 0);
  const todaySteps = todayActivities.reduce((acc, a) => acc + (a.steps || 0), 0);

  // Meals today
  const todayMeals = meals.filter((m) => m.date === todayStr);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Glucose Card */}
      <Card className="hover:border-indigo-200 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Daily Glucose
          </CardTitle>
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <GlucoseIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {todayAvg ? formatGlucoseValue(todayAvg, unit) : "—"}
            </span>
            <span className="text-xs text-slate-500 font-medium">{unit} avg</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {todayReadings.length === 1
              ? "1 check recorded today"
              : `${todayReadings.length} checks recorded today`}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenQuickAction("glucose")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
            >
              + Log check
            </button>
            <Link
              href="/glucose"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center"
            >
              Trend <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Medication Card */}
      <Card className="hover:border-teal-200 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Medication
          </CardTitle>
          <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Pill className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {todayTakenCount} of {totalDosesExpected}
            </span>
            <span className="text-xs text-slate-500 font-medium">doses logged</span>
          </div>
          <div className="mt-2">
            <Progress value={medProgressPct} indicatorClassName="bg-teal-600" />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenQuickAction("medication")}
              className="text-xs font-medium text-teal-700 hover:text-teal-900"
            >
              + Record dose
            </button>
            <Link
              href="/medications"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center"
            >
              Prescriptions <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 3. Activity Card */}
      <Card className="hover:border-emerald-200 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Physical Activity
          </CardTitle>
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Footprints className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {todayActiveMinutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">min active today</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {todaySteps > 0
              ? `${todaySteps.toLocaleString()} steps logged`
              : "30 min daily goal"}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenQuickAction("activity")}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
            >
              + Log workout
            </button>
            <Link
              href="/activity"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center"
            >
              Weekly <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 4. Meals Card */}
      <Card className="hover:border-amber-200 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Meals & Food
          </CardTitle>
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Utensils className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {todayMeals.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">meals logged today</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {todayMeals.length > 0
              ? `Latest: ${todayMeals[0].description}`
              : "Track carbs and calories"}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onOpenQuickAction("meal")}
              className="text-xs font-medium text-amber-700 hover:text-amber-900"
            >
              + Log meal
            </button>
            <Link
              href="/meals"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center"
            >
              Timeline <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

