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
import { Checkbox } from "@/components/ui/checkbox";
import { appointmentSchema, AppointmentInput } from "@/lib/validations";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function AddAppointmentForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isVirtual, setIsVirtual] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: {
      title: "",
      doctorName: "",
      specialty: "Endocrinology",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      location: "",
      isVirtual: false,
      notes: "",
    },
  });

  const onSubmit = async (data: AppointmentInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create appointment");

      toast.success("Appointment scheduled", {
        description: `${data.title} with ${data.doctorName}`,
      });

      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to add appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Appointment Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Quarterly Diabetes Follow-up"
          {...register("title")}
          autoFocus
        />
        {errors.title && (
          <p className="text-xs text-rose-600">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="doctorName">Doctor / Specialist *</Label>
          <Input
            id="doctorName"
            placeholder="e.g. Dr. Sarah Jenkins"
            {...register("doctorName")}
          />
          {errors.doctorName && (
            <p className="text-xs text-rose-600">{errors.doctorName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            placeholder="e.g. Endocrinology, Eye Clinic"
            {...register("specialty")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date *</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-xs text-rose-600">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time">Time *</Label>
          <Input id="time" type="time" {...register("time")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Location / Clinic *</Label>
        <Input
          id="location"
          placeholder={isVirtual ? "e.g. Video call link" : "e.g. Main Hospital, Suite 300"}
          {...register("location")}
        />
        {errors.location && (
          <p className="text-xs text-rose-600">{errors.location.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="isVirtual"
          checked={isVirtual}
          onCheckedChange={(checked) => {
            setValue("isVirtual", checked);
            setIsVirtual(checked);
          }}
        />
        <Label htmlFor="isVirtual" className="cursor-pointer text-xs text-slate-700">
          This is a virtual telehealth consultation
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes & Questions to ask</Label>
        <Input
          id="notes"
          placeholder="e.g. Bring recent 90-day reports, ask about morning spikes"
          {...register("notes")}
        />
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
          Save Appointment
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddAppointmentDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>
                Schedule an upcoming clinic visit, lab check, or specialist consultation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <AddAppointmentForm
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
