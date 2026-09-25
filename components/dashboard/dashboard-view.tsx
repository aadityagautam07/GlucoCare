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
import { LogAppleFitnessDialog } from "@/components/activity/log-apple-fitness-dialog";
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
  AppleFitnessDayLog,
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
  appleFitnessLogs?: AppleFitnessDayLog[];
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
  appleFitnessLogs = [],
}: DashboardViewProps) {
  const router = useRouter();

  // Local active state to guarantee instant UI reflection
  const [glucoseList, setGlucoseList] = React.useState<GlucoseReading[]>(glucoseReadings);
  const [medList, setMedList] = React.useState<Medication[]>(medications);
  const [medLogList, setMedLogList] = React.useState<MedicationLog[]>(medicationLogs);
  const [mealList, setMealList] = React.useState<Meal[]>(meals);
  const [actList, setActList] = React.useState<Activity[]>(activities);
  const [fitnessLogs, setFitnessLogs] = React.useState<AppleFitnessDayLog[]>(appleFitnessLogs);

  React.useEffect(() => { setGlucoseList(glucoseReadings); }, [glucoseReadings]);
  React.useEffect(() => { setMedList(medications); }, [medications]);
  React.useEffect(() => { setMedLogList(medicationLogs); }, [medicationLogs]);
  React.useEffect(() => { setMealList(meals); }, [meals]);
  React.useEffect(() => { setActList(activities); }, [activities]);
  React.useEffect(() => { setFitnessLogs(appleFitnessLogs); }, [appleFitnessLogs]);

  const [addGlucoseOpen, setAddGlucoseOpen] = React.useState(false);
  const [addMedOpen, setAddMedOpen] = React.useState(false);
  const [addMealOpen, setAddMealOpen] = React.useState(false);
  const [prefilledMeal, setPrefilledMeal] = React.useState<Partial<MealInput> | undefined>(undefined);
  const [addActOpen, setAddActOpen] = React.useState(false);
  const [logFitnessOpen, setLogFitnessOpen] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReadings = glucoseList.filter((g) => g.date === todayStr);
  const latestReading = todayReadings[0] || glucoseList[0] || null;
  const todayMeals = mealList.filter((m) => m.date === todayStr);
  const todayActs = actList.filter((a) => a.date === todayStr);
  const todayMins = todayActs.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const todaySteps = todayActs.reduce((sum, a) => sum + (a.steps || 0), 0);
  const todayCals = Math.round(todayMins * 5.5 + todaySteps * 0.04);
  const todayMedLogs = medLogList.filter((l) => l.scheduledAt.startsWith(todayStr));
  const todayFitnessLog = fitnessLogs.find((f) => f.date === todayStr) || fitnessLogs[0] || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleRefresh = React.useCallback(async () => {
    try {
      const [gluRes, mealRes, actRes, medRes, logRes, fitRes] = await Promise.all([
        fetch("/api/glucose"),
        fetch("/api/meals"),
        fetch("/api/activities"),
        fetch("/api/medications"),
        fetch("/api/medication-logs"),
        fetch("/api/apple-fitness"),
      ]);
      if (gluRes.ok) {
        const d = await gluRes.json();
        if (Array.isArray(d.readings)) setGlucoseList(d.readings);
      }
      if (mealRes.ok) {
        const d = await mealRes.json();
        if (Array.isArray(d.meals)) setMealList(d.meals);
      }
      if (actRes.ok) {
        const d = await actRes.json();
        if (Array.isArray(d.activities)) setActList(d.activities);
      }
      if (medRes.ok) {
        const d = await medRes.json();
        if (Array.isArray(d.medications)) setMedList(d.medications);
      }
      if (logRes.ok) {
        const d = await logRes.json();
        if (Array.isArray(d.logs)) setMedLogList(d.logs);
      }
      if (fitRes.ok) {
        const d = await fitRes.json();
        if (Array.isArray(d.logs)) setFitnessLogs(d.logs);
      }
    } catch {
      // quiet fallback
    }
    router.refresh();
  }, [router]);

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
        glucoseReadings={glucoseList}
        medications={medList}
        medicationLogs={medLogList}
        meals={mealList}
        activities={actList}
        user={user}
        onOpenQuickAction={handleQuickAction}
      />

      {/* Main Content Grid: Balanced 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Clinical Trend Chart & Smart Meal Suggester */}
        <div className="lg:col-span-7 space-y-6">
          <GlucoseTrendChart
            readings={glucoseList}
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
            calories={todayFitnessLog?.calories ?? 0}
            caloriesGoal={todayFitnessLog?.caloriesGoal ?? 500}
            stepCount={todayFitnessLog?.stepCount ?? 0}
            stepCountGoal={todayFitnessLog?.stepCountGoal ?? 10000}
            stepDistance={todayFitnessLog?.stepDistance ?? 0}
            stepDistanceGoal={todayFitnessLog?.stepDistanceGoal ?? 5.0}
            date={todayFitnessLog?.date || todayStr}
            onLogClick={() => setLogFitnessOpen(true)}
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
        onSuccess={(newReading) => {
          if (newReading) {
            setGlucoseList((prev) => [newReading, ...prev.filter((g) => g.id !== newReading.id)]);
          }
          handleRefresh();
        }}
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
        onSuccess={(newMeal) => {
          if (newMeal) {
            setMealList((prev) => [newMeal, ...prev.filter((m) => m.id !== newMeal.id)]);
          }
          handleRefresh();
        }}
      />

      <AddActivityDialog
        open={addActOpen}
        onOpenChange={setAddActOpen}
        onSuccess={(newAct) => {
          if (newAct) {
            setActList((prev) => [newAct, ...prev.filter((a) => a.id !== newAct.id)]);
          }
          handleRefresh();
        }}
      />

      <LogAppleFitnessDialog
        open={logFitnessOpen}
        onOpenChange={setLogFitnessOpen}
        initialData={
          todayFitnessLog || {
            date: todayStr,
            calories: 500,
            stepCount: 8000,
            stepDistance: 5.5,
          }
        }
        onSuccess={(saved) => {
          setFitnessLogs((prev) => {
            const exists = prev.some((f) => f.id === saved.id || f.date === saved.date);
            if (exists) {
              return prev.map((f) => (f.id === saved.id || f.date === saved.date ? saved : f));
            }
            return [saved, ...prev].sort((a, b) => b.date.localeCompare(a.date));
          });
          handleRefresh();
        }}
      />
    </div>
  );
}
