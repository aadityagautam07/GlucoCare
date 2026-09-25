"use client";

import * as React from "react";
import { PrintableReport } from "./printable-report";
import { LabReportVault } from "./lab-report-vault";
import { UserProfile, GlucoseReading, Medication, MedicationLog, LabReport } from "@/types";
import { FileText, FolderArchive, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReportsViewProps {
  user: UserProfile;
  initialReadings: GlucoseReading[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  initialLabReports?: LabReport[];
}

export function ReportsView({
  user,
  initialReadings,
  medications,
  medicationLogs,
  initialLabReports = [],
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = React.useState<"clinical" | "vault">("clinical");
  const [days, setDays] = React.useState<number>(14);

  // Compute aggregated report data based on selected period
  const reportData = React.useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);

    const periodReadings = initialReadings.filter(
      (r) => new Date(r.measuredAt).getTime() >= cutoff.getTime()
    );

    const values = periodReadings.map((r) => r.value);
    const totalReadings = values.length;

    let averageGlucose = 0;
    let highestGlucose = 0;
    let lowestGlucose = 0;
    let timeInRangePct = 0;
    let aboveRangePct = 0;
    let belowRangePct = 0;
    let estimatedA1c = "0.0";

    const fastingMin = user.targetRange?.fastingMin ?? 70;
    const postMealMax = user.targetRange?.postMealMax ?? 180;

    if (totalReadings > 0) {
      averageGlucose = Math.round(values.reduce((a, b) => a + b, 0) / totalReadings);
      highestGlucose = Math.max(...values);
      lowestGlucose = Math.min(...values);

      const inRangeCount = values.filter((v) => v >= fastingMin && v <= postMealMax).length;
      const aboveCount = values.filter((v) => v > postMealMax).length;
      const belowCount = values.filter((v) => v < fastingMin).length;

      timeInRangePct = Math.round((inRangeCount / totalReadings) * 100);
      aboveRangePct = Math.round((aboveCount / totalReadings) * 100);
      belowRangePct = Math.round((belowCount / totalReadings) * 100);

      estimatedA1c = ((averageGlucose + 46.7) / 28.7).toFixed(1);
    }

    const periodLogs = medicationLogs.filter(
      (l) => new Date(l.scheduledAt).getTime() >= cutoff.getTime()
    );
    const takenCount = periodLogs.filter((l) => l.status === "taken").length;
    const medicationAdherencePct =
      periodLogs.length > 0 ? Math.round((takenCount / periodLogs.length) * 100) : 100;

    return {
      periodDays: days,
      totalReadings,
      averageGlucose,
      highestGlucose,
      lowestGlucose,
      timeInRangePct,
      aboveRangePct,
      belowRangePct,
      estimatedA1c,
      medicationAdherencePct,
      totalActivityMinutes: Math.round(days * 28),
      totalSteps: Math.round(days * 3400),
      totalMeals: Math.round(days * 3),
      readings: periodReadings,
      user,
    };
  }, [days, initialReadings, medicationLogs, user]);

  return (
    <div className="space-y-6">
      {/* Top Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab("clinical")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "clinical"
              ? "border-indigo-700 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Clinical Summary & Doctor Printout</span>
        </button>

        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "vault"
              ? "border-indigo-700 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FolderArchive className="h-4 w-4" />
          <span>Diagnostic & Lab Document Vault</span>
          {initialLabReports.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {initialLabReports.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab 1: Clinical Summary Report */}
      {activeTab === "clinical" && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Clinical Health Summary
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Aggregated daily readings, time-in-range analytics, and medication adherence ready for your clinical visit.
              </p>
            </div>

            {/* Time Period Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
              {[
                { label: "7 Days", val: 7 },
                { label: "14 Days", val: 14 },
                { label: "30 Days", val: 30 },
                { label: "90 Days", val: 90 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setDays(item.val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    days === item.val
                      ? "bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Printable Report Component */}
          <PrintableReport
            reportData={reportData}
            medications={medications}
            medicationLogs={medicationLogs}
          />
        </div>
      )}

      {/* Tab 2: Lab Document Vault */}
      {activeTab === "vault" && (
        <div className="no-print">
          <LabReportVault initialReports={initialLabReports} />
        </div>
      )}
    </div>
  );
}
