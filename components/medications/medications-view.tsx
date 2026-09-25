"use client";

import * as React from "react";
import { Plus, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MedicationCard } from "./medication-card";
import { AddMedicationDialog } from "./add-medication-dialog";
import { LogDoseDialog } from "./log-dose-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Medication, MedicationLog } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MedicationsViewProps {
  medications: Medication[];
  medicationLogs: MedicationLog[];
}

export function MedicationsView({
  medications,
  medicationLogs,
}: MedicationsViewProps) {
  const router = useRouter();
  const [medList, setMedList] = React.useState<Medication[]>(medications);
  const [logList, setLogList] = React.useState<MedicationLog[]>(medicationLogs);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [loggingMedication, setLoggingMedication] = React.useState<Medication | null>(null);
  const [deletingMedication, setDeletingMedication] = React.useState<Medication | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setMedList(medications);
  }, [medications]);

  React.useEffect(() => {
    setLogList(medicationLogs);
  }, [medicationLogs]);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchMedsAndLogs = React.useCallback(async () => {
    try {
      const [medsRes, logsRes] = await Promise.all([
        fetch("/api/medications"),
        fetch("/api/medication-logs"),
      ]);
      if (medsRes.ok) {
        const d = await medsRes.json();
        if (Array.isArray(d.medications)) setMedList(d.medications);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        if (Array.isArray(d.logs)) setLogList(d.logs);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const handleRefresh = React.useCallback(() => {
    fetchMedsAndLogs();
    router.refresh();
  }, [fetchMedsAndLogs, router]);

  const handleDelete = async () => {
    if (!deletingMedication) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/medications/${deletingMedication.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete medication");

      toast.success(`${deletingMedication.name} removed`);
      setMedList((prev) => prev.filter((m) => m.id !== deletingMedication.id));
      setDeletingMedication(null);
      handleRefresh();
    } catch {
      toast.error("Failed to delete medication");
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
            Medications & Prescriptions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize daily dosages, instructions, and record each scheduled dose.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} variant="teal" className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Medication</span>
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 text-teal-900 dark:text-teal-200 text-xs leading-relaxed">
        <strong className="font-semibold">Note:</strong> GlucoCare provides medication tracking and reminder organization only. Always adhere strictly to the prescription instructions provided by your healthcare professional. Do not adjust your dosages without consulting your doctor.
      </div>

      {/* Medication Grid */}
      {medList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Pill className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No medications configured</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Add your prescriptions to start tracking your daily doses and adherence.
          </p>
          <div className="mt-4">
            <Button onClick={() => setAddModalOpen(true)} variant="teal" size="sm">
              Add Your First Medication
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medList.map((med) => {
            const todayLog = logList.find(
              (l) => l.medicationId === med.id && l.scheduledAt.startsWith(todayStr)
            );

            return (
              <MedicationCard
                key={med.id}
                medication={med}
                todayLog={todayLog}
                onLogDose={(m) => setLoggingMedication(m)}
                onDeleteMedication={(m) => setDeletingMedication(m)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddMedicationDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleRefresh}
      />

      <LogDoseDialog
        open={!!loggingMedication}
        onOpenChange={(open) => !open && setLoggingMedication(null)}
        medication={loggingMedication}
        onSuccess={handleRefresh}
      />

      <ConfirmDialog
        open={!!deletingMedication}
        onOpenChange={(open) => !open && setDeletingMedication(null)}
        title="Delete Medication"
        description={`Are you sure you want to remove ${deletingMedication?.name}? This will remove it from your active medication list.`}
        confirmLabel="Remove Medication"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
