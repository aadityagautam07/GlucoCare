"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, Clock, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading, UserProfile } from "@/types";
import { formatGlucoseValue, formatTime, getGlucoseStatus } from "@/lib/utils";

interface PrimaryGlucoseCardProps {
  latestReading?: GlucoseReading | null;
  user?: UserProfile | null;
  onAddReading: () => void;
}

export function PrimaryGlucoseCard({
  latestReading,
  user,
  onAddReading,
}: PrimaryGlucoseCardProps) {
  const unit = user?.glucoseUnit || "mg/dL";

  if (!latestReading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-200 backdrop-blur-md">
              <Clock className="h-3.5 w-3.5" />
              No readings today yet
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              Ready to check your blood sugar?
            </h2>
            <p className="mt-1 text-sm text-indigo-200 max-w-md">
              Recording your morning fasting or post-meal glucose keeps your daily trends accurate and actionable.
            </p>
          </div>
          <Button
            onClick={onAddReading}
            size="lg"
            className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-md font-semibold shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add First Reading
          </Button>
        </div>
      </div>
    );
  }

  const status = getGlucoseStatus(
    latestReading.value,
    latestReading.context,
    user?.targetRange
  );

  const displayValue = formatGlucoseValue(latestReading.value, unit);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10">
      {/* Subtle decorative background glow */}
      <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -top-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-indigo-200">
              Today&apos;s Latest Glucose
            </span>
            <span className="text-indigo-400">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-indigo-200">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(latestReading.time || latestReading.measuredAt)}
            </span>
            <span className="text-indigo-400">•</span>
            <span className="text-xs text-indigo-200 capitalize">
              {latestReading.context.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-black tracking-tight">
              {displayValue}
            </span>
            <span className="text-xl md:text-2xl font-medium text-indigo-200">
              {unit}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Badge
              variant={
                status.variant === "target"
                  ? "target"
                  : status.variant === "warning"
                  ? "warning"
                  : status.variant === "high"
                  ? "high"
                  : "low"
              }
              className="bg-white/15 text-white border-white/20 text-xs px-3 py-1 backdrop-blur-md"
            >
              {status.variant === "target" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
              {status.label}: {status.message}
            </Badge>

            <span className="text-xs text-indigo-200 flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-teal-400" />
              Target: {user?.targetRange?.fastingMin ?? 70}–{user?.targetRange?.postMealMax ?? 180} {unit}
            </span>
          </div>
        </div>

        <div className="flex sm:flex-col items-stretch gap-2.5 shrink-0 pt-2 md:pt-0">
          <Button
            onClick={onAddReading}
            size="lg"
            className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-md font-semibold justify-center"
          >
            <Plus className="h-4 w-4" />
            Add Glucose
          </Button>

          <Link href="/glucose" className="w-full">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-indigo-200 hover:text-white hover:bg-white/10 text-xs font-normal"
            >
              View History <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

