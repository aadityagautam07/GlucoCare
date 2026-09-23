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
import { Select } from "@/components/ui/select";
import { activitySchema, ActivityInput } from "@/lib/validations";
import { toast } from "sonner";
import { Footprints } from "lucide-react";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddActivityDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(activitySchema) as any,
    defaultValues: {
      activityType: "walking",
      durationMinutes: 30,
      date: currentDate,
      time: currentTime,
      steps: undefined,
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      const n = new Date();
      reset({
        activityType: "walking",
        durationMinutes: 30,
        date: n.toISOString().split("T")[0],
        time: n.toTimeString().slice(0, 5),
        steps: undefined,
        notes: "",
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: ActivityInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to record activity");

      toast.success("Activity logged", {
        description: `${data.durationMinutes} min ${data.activityType} recorded`,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to save activity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Footprints className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Log Physical Activity</DialogTitle>
              <DialogDescription>
                Regular gentle movement directly assists with insulin sensitivity and glucose regulation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select id="activityType" {...register("activityType")}>
                <option value="walking">Walking</option>
                <option value="running">Running / Jogging</option>
                <option value="cycling">Cycling</option>
                <option value="gym">Gym / Strength</option>
                <option value="yoga">Yoga / Stretching</option>
                <option value="swimming">Swimming</option>
                <option value="other">Other</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                type="number"
                placeholder="30"
                {...register("durationMinutes", { valueAsNumber: true })}
                autoFocus
              />
              {errors.durationMinutes && (
                <p className="text-xs text-rose-600">{errors.durationMinutes.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register("time")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="steps">Steps (optional)</Label>
            <Input
              id="steps"
              type="number"
              placeholder="e.g. 3500"
              {...register("steps", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="e.g. Brisk neighborhood pace, felt energetic"
              {...register("notes")}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

