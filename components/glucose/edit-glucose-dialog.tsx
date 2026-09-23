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
import { GlucoseReading, GlucoseUnit } from "@/types";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

interface EditGlucoseDialogProps {
  reading: GlucoseReading | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditGlucoseForm({
  reading,
  onClose,
  onSuccess,
}: {
  reading: GlucoseReading;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedUnit, setSelectedUnit] = React.useState<GlucoseUnit>(reading.unit);

  const displayVal =
    reading.unit === "mmol/L"
      ? Number((reading.value / 18.0182).toFixed(1))
      : reading.value;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GlucoseReadingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(glucoseReadingSchema) as any,
    defaultValues: {
      value: displayVal,
      unit: reading.unit,
      context: reading.context,
      date: reading.date,
      time: reading.time,
      notes: reading.notes || "",
    },
  });

  const onSubmit = async (data: GlucoseReadingInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/glucose/${reading.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update reading");

      toast.success("Glucose reading updated successfully");
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to update reading. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="edit-value">Blood Glucose Level *</Label>
          <Input
            id="edit-value"
            type="number"
            step={selectedUnit === "mmol/L" ? "0.1" : "1"}
            {...register("value", { valueAsNumber: true })}
            autoFocus
          />
          {errors.value && (
            <p className="text-xs text-rose-600">{errors.value.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-unit">Unit</Label>
          <Select
            id="edit-unit"
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
        <Label htmlFor="edit-context">Context</Label>
        <Select id="edit-context" {...register("context")}>
          <option value="fasting">Fasting</option>
          <option value="before_meal">Before Meal</option>
          <option value="after_meal">After Meal</option>
          <option value="bedtime">Bedtime</option>
          <option value="random">Random</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-date">Date</Label>
          <Input id="edit-date" type="date" {...register("date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-time">Time</Label>
          <Input id="edit-time" type="time" {...register("time")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-notes">Notes</Label>
        <Input id="edit-notes" {...register("notes")} />
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
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditGlucoseDialog({
  reading,
  onClose,
  onSuccess,
}: EditGlucoseDialogProps) {
  if (!reading) return null;

  return (
    <Dialog open={!!reading} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Reading</DialogTitle>
              <DialogDescription>
                Update blood sugar reading or measurement context.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <EditGlucoseForm
          key={reading.id}
          reading={reading}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
