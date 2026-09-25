"use client";

import * as React from "react";
import {
  Plus,
  Footprints,
  Clock,
  Trash2,
  Flame,
  MapPin,
  Award,
  Calendar,
  Edit2,
  CheckCircle2,
  Watch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ActivityBarChart } from "./activity-bar-chart";
import { AddActivityDialog } from "./add-activity-dialog";
import { AppleFitnessRings } from "./apple-fitness-rings";
import { LogAppleFitnessDialog } from "./log-apple-fitness-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Activity, AppleFitnessDayLog } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActivityViewProps {
  activities: Activity[];
  initialFitnessLogs?: AppleFitnessDayLog[];
}

export function ActivityView({
  activities,
  initialFitnessLogs = [],
}: ActivityViewProps) {
  const router = useRouter();
  const [activityList, setActivityList] = React.useState<Activity[]>(activities);
  const [fitnessLogs, setFitnessLogs] = React.useState<AppleFitnessDayLog[]>(initialFitnessLogs);
  
  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedFitnessDate, setSelectedFitnessDate] = React.useState<string>(todayStr);

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [logFitnessOpen, setLogFitnessOpen] = React.useState(false);
  const [editingFitnessLog, setEditingFitnessLog] = React.useState<AppleFitnessDayLog | null>(null);

  const [deleteActivityTarget, setDeleteActivityTarget] = React.useState<Activity | null>(null);
  const [isDeletingActivity, setIsDeletingActivity] = React.useState(false);

  const [deleteFitnessTarget, setDeleteFitnessTarget] = React.useState<AppleFitnessDayLog | null>(null);
  const [isDeletingFitness, setIsDeletingFitness] = React.useState(false);

  React.useEffect(() => {
    setActivityList(activities);
  }, [activities]);

  React.useEffect(() => {
    if (initialFitnessLogs.length > 0) {
      setFitnessLogs(initialFitnessLogs);
    }
  }, [initialFitnessLogs]);

  const fetchActivities = React.useCallback(async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.activities)) setActivityList(d.activities);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const fetchFitnessLogs = React.useCallback(async () => {
    try {
      const res = await fetch("/api/apple-fitness");
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.logs)) setFitnessLogs(d.logs);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const handleRefresh = React.useCallback(() => {
    fetchActivities();
    fetchFitnessLogs();
    router.refresh();
  }, [fetchActivities, fetchFitnessLogs, router]);

  const handleActivityCreated = (newAct?: Activity) => {
    if (newAct) {
      setActivityList((prev) => [newAct, ...prev.filter((a) => a.id !== newAct.id)]);
    }
    handleRefresh();
  };

  const handleFitnessSaved = (saved: AppleFitnessDayLog) => {
    setFitnessLogs((prev) => {
      const exists = prev.some((f) => f.id === saved.id || f.date === saved.date);
      if (exists) {
        return prev.map((f) => (f.id === saved.id || f.date === saved.date ? saved : f));
      }
      return [saved, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    setSelectedFitnessDate(saved.date);
    handleRefresh();
  };

  const handleDeleteActivity = async () => {
    if (!deleteActivityTarget) return;
    try {
      setIsDeletingActivity(true);
      const res = await fetch(`/api/activities/${deleteActivityTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete activity");
      toast.success("Activity log deleted");
      setActivityList((prev) => prev.filter((a) => a.id !== deleteActivityTarget.id));
      setDeleteActivityTarget(null);
      handleRefresh();
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setIsDeletingActivity(false);
    }
  };

  const handleDeleteFitness = async () => {
    if (!deleteFitnessTarget) return;
    try {
      setIsDeletingFitness(true);
      const res = await fetch(`/api/apple-fitness/${deleteFitnessTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete Apple Fitness log");
      toast.success("Apple Fitness daily log deleted");
      setFitnessLogs((prev) => prev.filter((f) => f.id !== deleteFitnessTarget.id));
      setDeleteFitnessTarget(null);
      handleRefresh();
    } catch {
      toast.error("Failed to delete Apple Fitness log");
    } finally {
      setIsDeletingFitness(false);
    }
  };

  // Find currently selected day log for Apple Fitness Rings
  const currentFitnessLog = React.useMemo(() => {
    const directMatch = fitnessLogs.find((f) => f.date === selectedFitnessDate);
    if (directMatch) return directMatch;
    // fallback to latest if selected date has no log
    return fitnessLogs[0] || null;
  }, [fitnessLogs, selectedFitnessDate]);

  const hasLogForSelectedDate = fitnessLogs.some((f) => f.date === selectedFitnessDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Apple Fitness & Activity Tracker</span>
            <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500">
              <Watch className="w-5 h-5" />
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your 3 Apple Fitness metrics: Active Calories, Step Count, and Step Distance for each day.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              setEditingFitnessLog(null);
              setLogFitnessOpen(true);
            }}
            className="shadow-sm bg-gradient-to-r from-rose-500 to-teal-600 hover:from-rose-600 hover:to-teal-700 text-white font-bold"
          >
            <Plus className="h-4 w-4" />
            <span>Log Apple Fitness</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setAddModalOpen(true)}
            className="shadow-xs border-slate-200 dark:border-slate-700 dark:text-slate-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Workout</span>
          </Button>
        </div>
      </div>

      {/* Date Switcher Strip for Apple Fitness View */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>Active Day View:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {selectedFitnessDate === todayStr ? "Today" : formatDate(selectedFitnessDate)}
          </span>
          {!hasLogForSelectedDate && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              No entry logged for this day
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedFitnessDate}
            onChange={(e) => setSelectedFitnessDate(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
          />
          {selectedFitnessDate !== todayStr && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedFitnessDate(todayStr)}
              className="h-8 text-xs font-bold"
            >
              Back to Today
            </Button>
          )}
        </div>
      </div>

      {/* Apple Fitness Activity Rings Card */}
      <AppleFitnessRings
        calories={currentFitnessLog?.calories ?? 0}
        caloriesGoal={currentFitnessLog?.caloriesGoal ?? 500}
        stepCount={currentFitnessLog?.stepCount ?? 0}
        stepCountGoal={currentFitnessLog?.stepCountGoal ?? 10000}
        stepDistance={currentFitnessLog?.stepDistance ?? 0}
        stepDistanceGoal={currentFitnessLog?.stepDistanceGoal ?? 5.0}
        date={currentFitnessLog?.date || selectedFitnessDate}
        onLogClick={() => {
          setEditingFitnessLog(currentFitnessLog);
          setLogFitnessOpen(true);
        }}
      />

      {/* Daily Apple Fitness Logs Table / Cards */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-black tracking-widest uppercase">
              <Award className="w-3 h-3" />
              Daily History
            </div>
            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              Apple Fitness Daily Logs
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only tracks Active Calories (Move), Step Count, and Step Distance (km) for each day.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingFitnessLog(null);
              setLogFitnessOpen(true);
            }}
            className="h-8 text-xs font-bold gap-1 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Daily Entry</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {fitnessLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No Apple Fitness entries logged yet. Click &quot;Log Daily Entry&quot; to record your calories, step count, and step distance.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fitnessLogs.map((log) => {
                const calGoal = log.caloriesGoal ?? 500;
                const stepGoal = log.stepCountGoal ?? 10000;
                const distGoal = log.stepDistanceGoal ?? 5.0;
                const calPct = Math.round((log.calories / Math.max(1, calGoal)) * 100);
                const stepPct = Math.round((log.stepCount / Math.max(1, stepGoal)) * 100);
                const distPct = Math.round((log.stepDistance / Math.max(0.1, distGoal)) * 100);
                const ringsClosed =
                  (calPct >= 100 ? 1 : 0) + (stepPct >= 100 ? 1 : 0) + (distPct >= 100 ? 1 : 0);
                const isSelected = selectedFitnessDate === log.date;

                return (
                  <div
                    key={log.id}
                    className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                      isSelected
                        ? "bg-slate-50/80 dark:bg-slate-800/40 border-l-4 border-l-rose-500"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-850/50"
                    }`}
                  >
                    {/* Left: Date & Status */}
                    <div className="space-y-1.5 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatDate(log.date)}
                        </span>
                        {log.date === todayStr && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            ringsClosed === 3
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {ringsClosed}/3 Rings Closed
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-xs italic text-slate-500 dark:text-slate-400 line-clamp-1">
                          &quot;{log.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Middle: 3 Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
                      {/* 1. Calories */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            Calories
                          </span>
                          <span className="font-black text-rose-600 dark:text-rose-400 text-[11px]">
                            {calPct}%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 text-sm font-extrabold text-slate-900 dark:text-white">
                          <span>{log.calories}</span>
                          <span className="text-[11px] font-medium text-slate-400">
                            / {calGoal} kcal
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, calPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* 2. Step Count */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                            <Footprints className="w-3.5 h-3.5 text-emerald-500" />
                            Step Count
                          </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-[11px]">
                            {stepPct}%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 text-sm font-extrabold text-slate-900 dark:text-white">
                          <span>{log.stepCount.toLocaleString()}</span>
                          <span className="text-[11px] font-medium text-slate-400">
                            / {stepGoal.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, stepPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* 3. Step Distance */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            Step Distance
                          </span>
                          <span className="font-black text-sky-600 dark:text-sky-400 text-[11px]">
                            {distPct}%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 text-sm font-extrabold text-slate-900 dark:text-white">
                          <span>{log.stepDistance}</span>
                          <span className="text-[11px] font-medium text-slate-400">
                            / {distGoal} km
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, distPct)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        onClick={() => setSelectedFitnessDate(log.date)}
                        className="h-8 text-xs font-bold border-slate-200 dark:border-slate-700 dark:text-slate-200"
                      >
                        {isSelected ? "Active On Rings" : "View On Rings"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingFitnessLog(log);
                          setLogFitnessOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Edit entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteFitnessTarget(log)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Activity Breakdown Chart */}
      <ActivityBarChart activities={activityList} />

      {/* Activity Log List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Logged Workouts & Exercises
        </h2>

        {activityList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
            No workouts logged yet. Record walks, cycling, or gym routines.
          </div>
        ) : (
          <div className="space-y-3">
            {activityList.map((act) => (
              <Card
                key={act.id}
                className="shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-all border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Footprints className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {act.activityType}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(act.date)} at {formatTime(act.time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {act.durationMinutes} minutes
                        </span>
                        {act.steps && (
                          <span>{act.steps.toLocaleString()} steps</span>
                        )}
                        {act.notes && (
                          <span className="text-slate-400 italic">
                            &quot;{act.notes}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteActivityTarget(act)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <LogAppleFitnessDialog
        open={logFitnessOpen}
        onOpenChange={setLogFitnessOpen}
        initialData={
          editingFitnessLog || {
            date: selectedFitnessDate,
            calories: 500,
            stepCount: 8000,
            stepDistance: 5.5,
          }
        }
        onSuccess={handleFitnessSaved}
      />

      <AddActivityDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleActivityCreated}
      />

      <ConfirmDialog
        open={!!deleteActivityTarget}
        onOpenChange={(open) => !open && setDeleteActivityTarget(null)}
        title="Delete Workout Entry"
        description="Are you sure you want to delete this recorded workout activity?"
        confirmLabel="Delete Workout"
        onConfirm={handleDeleteActivity}
        isLoading={isDeletingActivity}
      />

      <ConfirmDialog
        open={!!deleteFitnessTarget}
        onOpenChange={(open) => !open && setDeleteFitnessTarget(null)}
        title="Delete Daily Apple Fitness Log"
        description={`Are you sure you want to delete the Apple Fitness log for ${deleteFitnessTarget?.date}?`}
        confirmLabel="Delete Daily Log"
        onConfirm={handleDeleteFitness}
        isLoading={isDeletingFitness}
      />
    </div>
  );
}
