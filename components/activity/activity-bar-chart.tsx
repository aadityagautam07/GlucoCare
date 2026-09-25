"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "@/types";
import { Footprints } from "lucide-react";

interface ActivityBarChartProps {
  activities: Activity[];
}

export function ActivityBarChart({ activities }: ActivityBarChartProps) {
  // Aggregate last 7 days
  const last7DaysData = React.useMemo(() => {
    const days: { dateStr: string; dayLabel: string; minutes: number; steps: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayActs = activities.filter((a) => a.date === dateStr);
      const minutes = dayActs.reduce((acc, a) => acc + a.durationMinutes, 0);
      const steps = dayActs.reduce((acc, a) => acc + (a.steps || 0), 0);

      days.push({ dateStr, dayLabel, minutes, steps });
    }
    return days;
  }, [activities]);

  const totalWeeklyMinutes = last7DaysData.reduce((acc, d) => acc + d.minutes, 0);
  const totalWeeklySteps = last7DaysData.reduce((acc, d) => acc + d.steps, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Footprints className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Activity
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active minutes vs 30 min daily recommendation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">Total this week:</span>{" "}
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalWeeklyMinutes} mins</span>
          </div>
          {totalWeeklySteps > 0 && (
            <div>
              <span className="text-slate-400">Steps:</span>{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {totalWeeklySteps.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last7DaysData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              {/* Daily 30 min recommended benchmark */}
              <ReferenceLine
                y={30}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: "30 min goal",
                  fill: "#059669",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-lg text-xs">
                        <p className="font-bold text-slate-800 dark:text-white">{data.dayLabel} ({data.dateStr})</p>
                        <div className="mt-1 flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <Footprints className="h-3.5 w-3.5" />
                          <span>{data.minutes} active minutes</span>
                        </div>
                        {data.steps > 0 && (
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                            {data.steps.toLocaleString()} steps
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="minutes"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

