"use client";

import * as React from "react";
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
import { Medication, DoseStatus } from "@/types";
import { toast } from "sonner";
import { Pill, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface LogDoseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
  onSuccess?: () => void;
}

export function LogDoseDialog({
  open,
  onOpenChange,
  medication,
  onSuccess,
}: LogDoseDialogProps) {
  const [status, setStatus] = React.useState<DoseStatus>("taken");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStatus("taken");
      setNotes("");
    }
    onOpenChange(newOpen);
  };

  if (!medication) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/medication-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: medication.id,
          status,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to log dose");

      const statusLabels = {
        taken: "marked as taken",
        skipped: "marked as skipped",
        missed: "recorded as missed",
      };

      toast.success(`${medication.name} dose ${statusLabels[status]}`);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to update medication log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Log Dose</DialogTitle>
              <DialogDescription>
                {medication.name} • {medication.dosage} ({medication.instructions || "Scheduled dose"})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Dose Status *</Label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus("taken")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  status === "taken"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-800 font-semibold ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 mb-1 text-emerald-600" />
                <span className="text-xs">Taken</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("skipped")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  status === "skipped"
                    ? "border-amber-500 bg-amber-50/70 text-amber-800 font-semibold ring-2 ring-amber-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <AlertCircle className="h-5 w-5 mb-1 text-amber-600" />
                <span className="text-xs">Skipped</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("missed")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  status === "missed"
                    ? "border-rose-500 bg-rose-50/70 text-rose-800 font-semibold ring-2 ring-rose-500/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <XCircle className="h-5 w-5 mb-1 text-rose-600" />
                <span className="text-xs">Missed</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken 15 minutes after breakfast"
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
              Save Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

