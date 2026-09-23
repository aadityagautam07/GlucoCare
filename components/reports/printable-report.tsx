"use client";

import { Printer, Download, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlucoseReading, UserProfile, Medication, MedicationLog } from "@/types";
import { formatGlucoseValue, formatDate, formatTime } from "@/lib/utils";

interface ReportData {
  periodDays: number;
  totalReadings: number;
  averageGlucose: number;
  highestGlucose: number;
  lowestGlucose: number;
  timeInRangePct: number;
  aboveRangePct: number;
  belowRangePct: number;
  estimatedA1c: string;
  medicationAdherencePct: number;
  totalActivityMinutes: number;
  totalSteps: number;
  totalMeals: number;
  readings: GlucoseReading[];
  user: UserProfile;
}

interface PrintableReportProps {
  reportData: ReportData;
  medications: Medication[];
  medicationLogs?: MedicationLog[];
}

export function PrintableReport({
  reportData,
  medications,
}: PrintableReportProps) {
  const { user, readings } = reportData;
  const unit = user.glucoseUnit || "mg/dL";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs no-print">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Clinical Health Summary Report ({reportData.periodDays} Days)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Formatted for consultation review with your primary care provider or endocrinologist.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={handlePrint} size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Save as PDF
          </Button>
        </div>
      </div>

      {/* Printable Paper Document */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white shadow-xs">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Gluco<span className="text-teal-600">Care</span> Health Summary
              </h1>
              <p className="text-xs text-slate-500">
                Patient Self-Recorded Tracking Log
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <p>
              <span className="font-semibold text-slate-800">Patient:</span> {user.name}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Diagnosis:</span> {user.diabetesType}
            </p>
            <p>
              <span className="font-semibold text-slate-800">Report Window:</span> Last {reportData.periodDays} Days
            </p>
            <p>
              <span className="font-semibold text-slate-800">Generated:</span> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Notice for Healthcare Professional:</strong> This document contains self-reported observational information recorded by the patient through the GlucoCare application. It does not replace laboratory venous blood testing or clinical diagnosis.
        </div>

        {/* Summary Metric Grid */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Glucose Metrics Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Average Glucose</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {reportData.totalReadings > 0 ? formatGlucoseValue(reportData.averageGlucose, unit) : "—"}{" "}
                <span className="text-xs font-normal text-slate-500">{unit}</span>
              </span>
              <span className="text-[11px] text-slate-400">Target: 70–180 {unit}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Estimated A1c</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block">
                {reportData.totalReadings > 0 ? `${reportData.estimatedA1c}%` : "—"}
              </span>
              <span className="text-[11px] text-slate-400">eAG conversion</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Time in Target Range</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {reportData.timeInRangePct}%
              </span>
              <span className="text-[11px] text-slate-400">Above: {reportData.aboveRangePct}% | Below: {reportData.belowRangePct}%</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Logged Checks</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {reportData.totalReadings}
              </span>
              <span className="text-[11px] text-slate-400">Checks in period</span>
            </div>
          </div>
        </div>

        {/* Medication Regimen & Adherence */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Active Medications & Logged Adherence ({reportData.medicationAdherencePct}% adherence)
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Schedule / Timing</th>
                  <th className="p-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.map((m) => (
                  <tr key={m.id}>
                    <td className="p-3 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3 text-slate-700">{m.dosage}</td>
                    <td className="p-3 text-slate-700">{m.frequency}</td>
                    <td className="p-3 text-slate-700 capitalize">{m.schedule}</td>
                    <td className="p-3 text-slate-500">{m.instructions || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity & Meals Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Physical Activity Summary
            </h4>
            <div className="space-y-1 text-xs text-slate-700">
              <p>
                <span className="font-semibold">Total active duration:</span>{" "}
                {reportData.totalActivityMinutes} minutes
              </p>
              <p>
                <span className="font-semibold">Total recorded steps:</span>{" "}
                {reportData.totalSteps.toLocaleString()} steps
              </p>
              <p>
                <span className="font-semibold">Daily active average:</span>{" "}
                {Math.round(reportData.totalActivityMinutes / reportData.periodDays)} minutes/day
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Meals & Nutrition Summary
            </h4>
            <div className="space-y-1 text-xs text-slate-700">
              <p>
                <span className="font-semibold">Total meals logged:</span>{" "}
                {reportData.totalMeals} meals
              </p>
              <p className="text-slate-500 leading-relaxed">
                Patient maintains food diary recording meal types and carbohydrate content for correlation analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Glucose Log Entries */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Recent Readings Log ({Math.min(readings.length, 12)} of {readings.length} shown)
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Level ({unit})</th>
                  <th className="p-2.5">Context</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.slice(0, 12).map((r) => (
                  <tr key={r.id}>
                    <td className="p-2.5 font-medium text-slate-800">{formatDate(r.date)}</td>
                    <td className="p-2.5 text-slate-600">{formatTime(r.time)}</td>
                    <td className="p-2.5 font-bold text-slate-900">{formatGlucoseValue(r.value, unit)}</td>
                    <td className="p-2.5 capitalize text-slate-700">{r.context.replace("_", " ")}</td>
                    <td className="p-2.5 text-slate-500">{r.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Generated with GlucoCare • Modern Diabetes Management Platform</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}

