"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appleFitnessLogSchema, AppleFitnessLogInput } from "@/lib/validations";
import { AppleFitnessDayLog } from "@/types";
import { toast } from "sonner";
import { Flame, Footprints, MapPin, Award } from "lucide-react";

interface LogAppleFitnessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<AppleFitnessDayLog>;
  onSuccess?: (log: AppleFitnessDayLog) => void;
}

export function LogAppleFitnessDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: LogAppleFitnessDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<AppleFitnessLogInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appleFitnessLogSchema) as any,
    defaultValues: {
      date: initialData?.date || todayStr,
      calories: initialData?.calories ?? 500,
      stepCount: initialData?.stepCount ?? 8000,
      stepDistance: initialData?.stepDistance ?? 5.5,
      caloriesGoal: initialData?.caloriesGoal ?? 500,
      stepCountGoal: initialData?.stepCountGoal ?? 10000,
      stepDistanceGoal: initialData?.stepDistanceGoal ?? 5.0,
      notes: initialData?.notes || "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        date: initialData?.date || todayStr,
        calories: initialData?.calories ?? 500,
        stepCount: initialData?.stepCount ?? 8000,
        stepDistance: initialData?.stepDistance ?? 5.5,
        caloriesGoal: initialData?.caloriesGoal ?? 500,
        stepCountGoal: initialData?.stepCountGoal ?? 10000,
        stepDistanceGoal: initialData?.stepDistanceGoal ?? 5.0,
        notes: initialData?.notes || "",
      });
    }
  }, [open, initialData, todayStr, form]);

  const onSubmit = async (values: AppleFitnessLogInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/apple-fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save daily fitness log");
      }

      const data = await res.json();
      toast.success("Apple Fitness logged successfully", {
        description: `${values.date}: ${values.calories} kcal • ${values.stepCount.toLocaleString()} steps • ${values.stepDistance} km`,
      });

      onOpenChange(false);
      onSuccess?.(data.log);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record fitness");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Log Daily Apple Fitness
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Record your 3 core Apple Watch & Health metrics for any day.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 pt-2">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Log Date
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
            {form.formState.errors.date && (
              <p className="text-[11px] text-rose-500">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* 3 Core Apple Fitness Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Active Calories (Move) */}
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FA114F]">
                <Flame className="w-3.5 h-3.5" />
                <span>Calories</span>
              </div>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="500"
                {...form.register("calories", { valueAsNumber: true })}
                className="text-xs h-9 bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800 font-bold"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Unit: kcal</span>
              {form.formState.errors.calories && (
                <p className="text-[10px] text-rose-500">{form.formState.errors.calories.message}</p>
              )}
            </div>

            {/* 2. Step Count */}
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#92E82A] dark:text-[#A7FF00]">
                <Footprints className="w-3.5 h-3.5" />
                <span>Step Count</span>
              </div>
              <Input
                type="number"
                step="1"
                min="0"
                placeholder="8000"
                {...form.register("stepCount", { valueAsNumber: true })}
                className="text-xs h-9 bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 font-bold"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Unit: steps</span>
              {form.formState.errors.stepCount && (
                <p className="text-[10px] text-rose-500">{form.formState.errors.stepCount.message}</p>
              )}
            </div>

            {/* 3. Step Distance */}
            <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#00E5FF]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Distance</span>
              </div>
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="5.5"
                {...form.register("stepDistance", { valueAsNumber: true })}
                className="text-xs h-9 bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-800 font-bold"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Unit: km</span>
              {form.formState.errors.stepDistance && (
                <p className="text-[10px] text-rose-500">{form.formState.errors.stepDistance.message}</p>
              )}
            </div>
          </div>

          {/* Daily Goals (Optional Customization) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              Targets for this Day:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500 dark:text-slate-400">Calorie Goal</Label>
                <Input
                  type="number"
                  {...form.register("caloriesGoal", { valueAsNumber: true })}
                  className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 dark:text-slate-400">Step Goal</Label>
                <Input
                  type="number"
                  {...form.register("stepCountGoal", { valueAsNumber: true })}
                  className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 dark:text-slate-400">Distance (km)</Label>
                <Input
                  type="number"
                  step="0.5"
                  {...form.register("stepDistanceGoal", { valueAsNumber: true })}
                  className="text-xs h-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Activity Notes (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="e.g., Morning brisk walk + evening steps"
              {...form.register("notes")}
              className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9 border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isSubmitting ? "Saving..." : "Save Daily Fitness"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
