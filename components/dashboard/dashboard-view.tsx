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
import {
  UserProfile,
  GlucoseReading,
  Medication,
  MedicationLog,
  Meal,
  Activity,
  Appointment,
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
}

export function DashboardView({
  user,
  glucoseReadings,
  medications,
  medicationLogs,
  meals,
  activities,
  appointments,
}: DashboardViewProps) {
  const router = useRouter();
  const [addGlucoseOpen, setAddGlucoseOpen] = React.useState(false);
  const [addMedOpen, setAddMedOpen] = React.useState(false);
  const [addMealOpen, setAddMealOpen] = React.useState(false);
  const [addActOpen, setAddActOpen] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayReadings = glucoseReadings.filter((g) => g.date === todayStr);
  const latestReading = todayReadings[0] || glucoseReadings[0] || null;

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
    if (type === "meal") setAddMealOpen(true);
    if (type === "activity") setAddActOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s your diabetes overview and daily care routine for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* Main Content Grid: Glucose Trend + Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <GlucoseTrendChart
            readings={glucoseReadings}
            user={user}
            onAddReading={() => setAddGlucoseOpen(true)}
            title="Blood Glucose Trend"
          />

          <UpcomingAppointmentCard appointments={appointments} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <TodayPlan />
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
        onOpenChange={setAddMealOpen}
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

