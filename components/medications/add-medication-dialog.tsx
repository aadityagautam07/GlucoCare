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
import { medicationSchema, MedicationInput } from "@/lib/validations";
import { toast } from "sonner";
import { Pill } from "lucide-react";

interface AddMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMedicationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMedicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicationInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(medicationSchema) as any,
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "Once daily",
      instructions: "",
      schedule: "morning",
      startDate: todayStr,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: "",
        dosage: "",
        frequency: "Once daily",
        instructions: "",
        schedule: "morning",
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: MedicationInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to add medication");

      toast.success(`${data.name} added to your active medications`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to add medication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Medication</DialogTitle>
              <DialogDescription>
                Track a prescribed medication or daily supplement.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Medication Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Metformin, Glipizide, Lisinopril"
              {...register("name")}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                placeholder="e.g. 500 mg, 10 units"
                {...register("dosage")}
              />
              {errors.dosage && (
                <p className="text-xs text-rose-600">{errors.dosage.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="frequency">Frequency</Label>
              <Select id="frequency" {...register("frequency")}>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="As needed">As needed</option>
                <option value="Custom">Custom</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="schedule">Primary Timing</Label>
              <Select id="schedule" {...register("schedule")}>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="bedtime">Bedtime</option>
                <option value="multiple">Multiple times</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions">Instructions / Notes (optional)</Label>
            <Input
              id="instructions"
              placeholder="e.g. Take with breakfast to avoid stomach upset"
              {...register("instructions")}
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
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              Add Medication
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

