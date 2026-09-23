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
import { glucoseReadingSchema, GlucoseReadingInput } from "@/lib/validations";
import { GlucoseUnit } from "@/types";
import { toast } from "sonner";
import { Activity as GlucoseIcon } from "lucide-react";

interface AddGlucoseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUnit?: GlucoseUnit;
  onSuccess?: () => void;
}

function AddGlucoseForm({
  defaultUnit,
  onClose,
  onSuccess,
}: {
  defaultUnit: GlucoseUnit;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedUnit, setSelectedUnit] = React.useState<GlucoseUnit>(defaultUnit);

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GlucoseReadingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(glucoseReadingSchema) as any,
    defaultValues: {
      value: undefined,
      unit: defaultUnit,
      context: "fasting",
      date: currentDate,
      time: currentTime,
      notes: "",
    },
  });

  const onSubmit = async (data: GlucoseReadingInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/glucose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save glucose reading");
      }

      toast.success("Glucose reading saved successfully", {
        description: `${data.value} ${data.unit} (${data.context.replace("_", " ")})`,
      });

      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to record glucose reading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="value">Blood Glucose Level *</Label>
          <Input
            id="value"
            type="number"
            step={selectedUnit === "mmol/L" ? "0.1" : "1"}
            placeholder={selectedUnit === "mmol/L" ? "e.g. 6.4" : "e.g. 115"}
            {...register("value", { valueAsNumber: true })}
            autoFocus
          />
          {errors.value && (
            <p className="text-xs text-rose-600">{errors.value.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit</Label>
          <Select
            id="unit"
            {...register("unit")}
            onChange={(e) => {
              const val = e.target.value as GlucoseUnit;
              setValue("unit", val);
              setSelectedUnit(val);
            }}
          >
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="context">Measurement Context *</Label>
        <Select id="context" {...register("context")}>
          <option value="fasting">Fasting (morning before food)</option>
          <option value="before_meal">Before Meal</option>
          <option value="after_meal">After Meal (post-prandial)</option>
          <option value="bedtime">Bedtime</option>
          <option value="random">Random check</option>
          <option value="other">Other</option>
        </Select>
        {errors.context && (
          <p className="text-xs text-rose-600">{errors.context.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-xs text-rose-600">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" {...register("time")} />
          {errors.time && (
            <p className="text-xs text-rose-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Optional Notes</Label>
        <Input
          id="notes"
          placeholder="e.g. 2 hours after lunch, felt slightly tired"
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-xs text-rose-600">{errors.notes.message}</p>
        )}
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Reading
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddGlucoseDialog({
  open,
  onOpenChange,
  defaultUnit = "mg/dL",
  onSuccess,
}: AddGlucoseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <GlucoseIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Blood Glucose</DialogTitle>
              <DialogDescription>
                Record your blood sugar measurement and context.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <AddGlucoseForm
            defaultUnit={defaultUnit}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
