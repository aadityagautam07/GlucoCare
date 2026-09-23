"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GlucoseReading, UserProfile } from "@/types";
import { formatGlucoseValue } from "@/lib/utils";
import { Activity as GlucoseIcon, ArrowUp, ArrowDown, Target } from "lucide-react";

interface GlucoseStatsCardsProps {
  readings: GlucoseReading[];
  user?: UserProfile | null;
}

export function GlucoseStatsCards({ readings, user }: GlucoseStatsCardsProps) {
  const unit = user?.glucoseUnit || "mg/dL";
  const fastingMin = user?.targetRange?.fastingMin ?? 70;
  const postMealMax = user?.targetRange?.postMealMax ?? 180;

  const count = readings.length;
  const values = readings.map((r) => r.value);

  const avg = count > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / count) : 0;
  const highest = count > 0 ? Math.max(...values) : 0;
  const lowest = count > 0 ? Math.min(...values) : 0;

  const inRangeCount = values.filter((v) => v >= fastingMin && v <= postMealMax).length;
  const inRangePct = count > 0 ? Math.round((inRangeCount / count) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Average */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <GlucoseIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-900">
              {count > 0 ? formatGlucoseValue(avg, unit) : "—"}
            </span>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {count} total readings</p>
        </CardContent>
      </Card>

      {/* Highest */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Highest</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-900">
              {count > 0 ? formatGlucoseValue(highest, unit) : "—"}
            </span>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Max in recorded period</p>
        </CardContent>
      </Card>

      {/* Lowest */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lowest</span>
            <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <ArrowDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-900">
              {count > 0 ? formatGlucoseValue(lowest, unit) : "—"}
            </span>
            <span className="text-xs text-slate-500">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Min in recorded period</p>
        </CardContent>
      </Card>

      {/* Time in range */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Target</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-slate-900">
              {count > 0 ? `${inRangePct}%` : "—"}
            </span>
            <span className="text-xs text-slate-500">of checks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target range adherence</p>
        </CardContent>
      </Card>
    </div>
  );
}

