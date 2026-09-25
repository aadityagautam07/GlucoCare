"use client";

import * as React from "react";
import { Plus, Footprints, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityBarChart } from "./activity-bar-chart";
import { AddActivityDialog } from "./add-activity-dialog";
import { AppleFitnessRings } from "./apple-fitness-rings";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Activity } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActivityViewProps {
  activities: Activity[];
}

export function ActivityView({ activities }: ActivityViewProps) {
  const router = useRouter();
  const [activityList, setActivityList] = React.useState<Activity[]>(activities);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setActivityList(activities);
  }, [activities]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayActs = activityList.filter((a) => a.date === todayStr);
  const todayMins = todayActs.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const todaySteps = todayActs.reduce((sum, a) => sum + (a.steps || 0), 0);
  const todayCals = Math.round(todayMins * 5.5 + todaySteps * 0.04);

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

  const handleRefresh = React.useCallback(() => {
    fetchActivities();
    router.refresh();
  }, [fetchActivities, router]);

  const handleActivityCreated = (newAct?: Activity) => {
    if (newAct) {
      setActivityList((prev) => [newAct, ...prev.filter((a) => a.id !== newAct.id)]);
    }
    handleRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/activities/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete activity");
      toast.success("Activity log deleted");
      setActivityList((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      handleRefresh();
    } catch {
      toast.error("Failed to delete activity");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Physical Activity & Exercise
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track walks, workouts, Apple Watch exercise rings, and daily movement patterns.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Log Activity</span>
        </Button>
      </div>

      {/* Apple Fitness Activity Rings Card */}
      <AppleFitnessRings
        activeCalories={todayCals || 380}
        exerciseMinutes={todayMins || 25}
        totalSteps={todaySteps || 6400}
      />

      {/* Weekly Activity Chart */}
      <ActivityBarChart activities={activityList} />

      {/* Activity Log List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Activity History
        </h2>

        {activityList.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
            No activities logged yet. Record your daily walks or exercises.
          </div>
        ) : (
          <div className="space-y-3">
            {activityList.map((act) => (
              <Card
                key={act.id}
                className="shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-all border-slate-200/80 dark:border-slate-800"
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
                    onClick={() => setDeleteTarget(act)}
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

      <AddActivityDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleActivityCreated}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Activity Entry"
        description="Are you sure you want to delete this recorded activity?"
        confirmLabel="Delete Activity"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
