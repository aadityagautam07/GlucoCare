"use client";

import * as React from "react";
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Pill,
  Footprints,
  Sparkles,
  Info,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GlucoseReading, MedicationLog, Meal, Activity, UserProfile } from "@/types";
import { formatGlucoseValue } from "@/lib/utils";

interface InsightCardsProps {
  glucoseReadings: GlucoseReading[];
  medicationLogs: MedicationLog[];
  meals: Meal[];
  activities: Activity[];
  user?: UserProfile | null;
}

export function InsightCards({
  glucoseReadings,
  medicationLogs,
  meals,
  activities,
  user,
}: InsightCardsProps) {
  const unit = user?.glucoseUnit || "mg/dL";

  // Calculate 7-day vs previous 7-day average
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const last7Readings = glucoseReadings.filter(
    (r) => new Date(r.measuredAt).getTime() >= sevenDaysAgo.getTime()
  );
  const prev7Readings = glucoseReadings.filter(
    (r) =>
      new Date(r.measuredAt).getTime() >= fourteenDaysAgo.getTime() &&
      new Date(r.measuredAt).getTime() < sevenDaysAgo.getTime()
  );

  const avg7 =
    last7Readings.length > 0
      ? Math.round(last7Readings.reduce((sum, r) => sum + r.value, 0) / last7Readings.length)
      : 0;

  const prevAvg7 =
    prev7Readings.length > 0
      ? Math.round(prev7Readings.reduce((sum, r) => sum + r.value, 0) / prev7Readings.length)
      : 0;

  const diff = avg7 && prevAvg7 ? avg7 - prevAvg7 : null;

  // Reading context breakdown
  const contextCounts: Record<string, number> = {};
  last7Readings.forEach((r) => {
    contextCounts[r.context] = (contextCounts[r.context] || 0) + 1;
  });
  const mostFrequentContext = Object.entries(contextCounts).sort((a, b) => b[1] - a[1])[0];

  // Medication adherence
  const last7Logs = medicationLogs.filter(
    (l) => new Date(l.scheduledAt).getTime() >= sevenDaysAgo.getTime()
  );
  const takenCount = last7Logs.filter((l) => l.status === "taken").length;
  const adherenceRate = last7Logs.length > 0 ? Math.round((takenCount / last7Logs.length) * 100) : 100;

  // Total weekly exercise
  const last7Activities = activities.filter(
    (a) => new Date(a.date).getTime() >= sevenDaysAgo.getTime()
  );
  const weeklyExerciseMinutes = last7Activities.reduce((acc, a) => acc + a.durationMinutes, 0);

  // Meals logged
  const last7Meals = meals.filter(
    (m) => new Date(m.date).getTime() >= sevenDaysAgo.getTime()
  );

  return (
    <div className="space-y-6">
      {/* Medical Safety & Educational Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs">
        <Info className="h-5 w-5 text-indigo-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Observations & Self-Care Summary</span>
          <p className="mt-0.5 text-indigo-800 leading-relaxed">
            These statements summarize your self-recorded tracking data to help prepare for consultations.
            GlucoCare does not diagnose medical conditions or recommend medication changes.
            Always discuss these observations with your healthcare professional.
          </p>
        </div>
      </div>

      {/* Grid of Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Glucose Trend Observation */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Glucose 7-Day Observation
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {last7Readings.length < 3 ? (
              <p className="text-slate-500 text-xs">
                Add more readings over the coming days to see comparative weekly glucose trends.
              </p>
            ) : (
              <>
                <p>
                  Your average glucose was{" "}
                  <strong className="text-slate-900">
                    {formatGlucoseValue(avg7, unit)} {unit}
                  </strong>{" "}
                  over the last 7 days across {last7Readings.length} readings.
                </p>

                {diff !== null && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    {diff < 0 ? (
                      <div className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>{Math.abs(diff)} {unit} lower than previous 7 days</span>
                      </div>
                    ) : diff > 0 ? (
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>{diff} {unit} higher than previous 7 days</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unchanged from previous 7 days</span>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Check Habits Observation */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Check Timing Habits
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {mostFrequentContext ? (
              <>
                <p>
                  Most of your checks this week were recorded in the{" "}
                  <strong className="text-slate-900 capitalize">
                    {mostFrequentContext[0].replace("_", " ")}
                  </strong>{" "}
                  period ({mostFrequentContext[1]} entries).
                </p>
                <p className="text-xs text-slate-500">
                  Consistency in fasting checks provides valuable baseline insights during clinical reviews.
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-xs">
                Log readings with varied contexts (fasting, post-meal, bedtime) to see habit patterns.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Medication Consistency */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Pill className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Medication Adherence
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{adherenceRate}%</span>
              <span className="text-xs text-slate-500">logged on time this week</span>
            </div>
            <p className="text-xs text-slate-600">
              You recorded {takenCount} of {last7Logs.length} scheduled doses as taken.
            </p>
          </CardContent>
        </Card>

        {/* Physical Activity summary */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Footprints className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Weekly Physical Activity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{weeklyExerciseMinutes}</span>
              <span className="text-xs text-slate-500">active minutes in last 7 days</span>
            </div>
            <p className="text-xs text-slate-600">
              Gentle walking and regular movement support muscle glucose uptake throughout the day.
            </p>
          </CardContent>
        </Card>

        {/* Meals Summary */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Utensils className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Meal Log Consistency
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{last7Meals.length}</span>
              <span className="text-xs text-slate-500">meals recorded in last 7 days</span>
            </div>
            <p className="text-xs text-slate-600">
              Tracking meal times and carbohydrate contents helps identify post-prandial glucose patterns.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trust & Clinical Prep Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Preparing for your next doctor&apos;s appointment?
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            You can generate a consolidated PDF or printable report containing your complete 7, 30, or 90-day glucose trends, meal summaries, and medication logs from the Reports section.
          </p>
        </div>
      </div>
    </div>
  );
}

