"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrimaryGlucoseCard } from "./primary-glucose-card";
import { StatGrid } from "./stat-grid";
import { GlucoseTrendChart } from "./glucose-trend-chart";
import { TodayPlan } from "./today-plan";
import { UpcomingAppointmentCard } from "./upcoming-appointment-card";
import { AddGlucoseDialog } from "@/components/glucose/add-glucose-dialog";
import { AddMedicationDialog } from "@/components/medications/add-medication-dialog";
import { AddMealDialog } from "@/components/meals/add-meal-dialog";
import { AddActivityDialog } from "@/components/activity/add-activity-dialog";
import { SmartMealSuggester } from "@/components/meals/smart-meal-suggester";
import { AppleFitnessRings } from "@/components/activity/apple-fitness-rings";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MealInput } from "@/lib/validations";
import {
  UserProfile,
  GlucoseReading,
  Medication,
  MedicationLog,
  Meal,
  Activity,
  Appointment,
  RationItem,
} from "@/types";
import { useRouter } from "next/navigation";

interface DashboardViewProps {
  user: UserProfile;
  glucoseReadings: GlucoseReading[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  meals: Meal[];
  activities: Activity[];
  appointments: Appointment[];
  rations?: RationItem[];
}

export function DashboardView({
  user,
  glucoseReadings,
  medications,
  medicationLogs,
  meals,
  activities,
  appointments,
  rations = [],
}: DashboardViewProps) {
  const router = useRouter();
  const [addGlucoseOpen, setAddGlucoseOpen] = React.useState(false);
  const [addMedOpen, setAddMedOpen] = React.useState(false);
  const [addMealOpen, setAddMealOpen] = React.useState(false);
  const [prefilledMeal, setPrefilledMeal] = React.useState<Partial<MealInput> | undefined>(undefined);
  const [addActOpen, setAddActOpen] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReadings = glucoseReadings.filter((g) => g.date === todayStr);
  const latestReading = todayReadings[0] || glucoseReadings[0] || null;
  const todayMeals = meals.filter((m) => m.date === todayStr);
  const todayActs = activities.filter((a) => a.date === todayStr);
  const todayMins = todayActs.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const todaySteps = todayActs.reduce((sum, a) => sum + (a.steps || 0), 0);
  const todayCals = Math.round(todayMins * 5.5 + todaySteps * 0.04);
  const todayMedLogs = medicationLogs.filter((l) => l.scheduledAt.startsWith(todayStr));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleQuickAction = (type: "glucose" | "medication" | "meal" | "activity") => {
    if (type === "glucose") setAddGlucoseOpen(true);
    if (type === "medication") setAddMedOpen(true);
    if (type === "meal") {
      setPrefilledMeal(undefined);
      setAddMealOpen(true);
    }
    if (type === "activity") setAddActOpen(true);
  };

  const handleCookAndLog = (recipeData: Partial<MealInput>) => {
    setPrefilledMeal(recipeData);
    setAddMealOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s your diabetes overview and daily care routine for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Button
            onClick={() => setAddGlucoseOpen(true)}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Glucose</span>
          </Button>
        </div>
      </div>

      {/* Primary Glucose Card */}
      <PrimaryGlucoseCard
        latestReading={latestReading}
        user={user}
        onAddReading={() => setAddGlucoseOpen(true)}
      />

      {/* 4 Stat Cards */}
      <StatGrid
        glucoseReadings={glucoseReadings}
        medications={medications}
        medicationLogs={medicationLogs}
        meals={meals}
        activities={activities}
        user={user}
        onOpenQuickAction={handleQuickAction}
      />

      {/* Main Content Grid: Balanced 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Clinical Trend Chart & Smart Meal Suggester */}
        <div className="lg:col-span-7 space-y-6">
          <GlucoseTrendChart
            readings={glucoseReadings}
            user={user}
            onAddReading={() => setAddGlucoseOpen(true)}
            title="Blood Glucose Trend"
          />

          <SmartMealSuggester
            rations={rations}
            onCookAndLog={handleCookAndLog}
            compact
          />
        </div>

        {/* Right Column (5 cols): Apple Fitness Rings + Today's Plan + Upcoming Appointment */}
        <div className="lg:col-span-5 space-y-6">
          <AppleFitnessRings
            activeCalories={todayCals || 380}
            exerciseMinutes={todayMins || 25}
            totalSteps={todaySteps || 6400}
            compact
          />

          <TodayPlan
            todayMeals={todayMeals}
            todayReadings={todayReadings}
            todayMedLogs={todayMedLogs}
            todayActivities={todayActs}
            onRefreshData={handleRefresh}
          />

          <UpcomingAppointmentCard appointments={appointments} />
        </div>
      </div>

      {/* Action Dialogs */}
      <AddGlucoseDialog
        open={addGlucoseOpen}
        onOpenChange={setAddGlucoseOpen}
        defaultUnit={user.glucoseUnit}
        onSuccess={handleRefresh}
      />

      <AddMedicationDialog
        open={addMedOpen}
        onOpenChange={setAddMedOpen}
        onSuccess={handleRefresh}
      />

      <AddMealDialog
        open={addMealOpen}
        onOpenChange={(open) => {
          setAddMealOpen(open);
          if (!open) setPrefilledMeal(undefined);
        }}
        initialData={prefilledMeal}
        availableRations={rations}
        onSuccess={handleRefresh}
      />

      <AddActivityDialog
        open={addActOpen}
        onOpenChange={setAddActOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

