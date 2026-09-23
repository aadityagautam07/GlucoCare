"use client";

import * as React from "react";
import { Pill, CheckCircle2, AlertCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Medication, MedicationLog } from "@/types";
import { formatTime } from "@/lib/utils";

interface MedicationCardProps {
  medication: Medication;
  todayLog?: MedicationLog | null;
  onLogDose: (medication: Medication) => void;
  onDeleteMedication: (medication: Medication) => void;
}

export function MedicationCard({
  medication,
  todayLog,
  onLogDose,
  onDeleteMedication,
}: MedicationCardProps) {
  const getScheduleBadgeVariant = (schedule: Medication["schedule"]) => {
    switch (schedule) {
      case "morning":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "afternoon":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "evening":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "bedtime":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-all border-slate-200">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {medication.name}
                </h3>
                <span className="text-xs font-semibold text-teal-700">
                  {medication.dosage}
                </span>
              </div>
            </div>

            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getScheduleBadgeVariant(
                medication.schedule
              )}`}
            >
              {medication.schedule}
            </span>
          </div>

          {/* Details */}
          <div className="mt-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Frequency:</span>
              <span className="font-medium text-slate-700">{medication.frequency}</span>
            </div>
            {medication.instructions && (
              <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-700 block mb-0.5">Instructions:</span>
                {medication.instructions}
              </div>
            )}
          </div>

          {/* Today's Status */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Today&apos;s Status
            </span>
            {todayLog ? (
              todayLog.status === "taken" ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Taken {todayLog.takenAt ? `at ${formatTime(todayLog.takenAt)}` : "today"}
                  </span>
                </div>
              ) : todayLog.status === "skipped" ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Skipped today</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50/70 p-2 rounded-xl border border-rose-200">
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Missed today</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Pending record for today</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => onDeleteMedication(medication)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete medication"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <Button
            size="sm"
            variant={todayLog?.status === "taken" ? "outline" : "teal"}
            onClick={() => onLogDose(medication)}
          >
            {todayLog ? "Update Dose" : "Log Dose"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

