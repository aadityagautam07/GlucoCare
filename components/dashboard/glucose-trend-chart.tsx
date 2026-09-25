"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GlucoseReading, UserProfile } from "@/types";
import { Activity as GlucoseIcon, TrendingUp } from "lucide-react";

interface GlucoseTrendChartProps {
  readings: GlucoseReading[];
  user?: UserProfile | null;
  onAddReading: () => void;
  title?: string;
  showTimeframeSelector?: boolean;
}

export function GlucoseTrendChart({
  readings,
  user,
  onAddReading,
  title = "Glucose Trend",
  showTimeframeSelector = true,
}: GlucoseTrendChartProps) {
  const [timeframe, setTimeframe] = React.useState<"7D" | "14D" | "30D" | "90D">("7D");
  const unit = user?.glucoseUnit || "mg/dL";

  const fastingMin = user?.targetRange?.fastingMin ?? 70;
  const postMealMax = user?.targetRange?.postMealMax ?? 180;

  // Filter by timeframe
  const daysMap = { "7D": 7, "14D": 14, "30D": 30, "90D": 90 };
  const cutoffDays = daysMap[timeframe];

  const filteredReadings = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cutoffDays);
    return readings
      .filter((r) => new Date(r.measuredAt).getTime() >= cutoff.getTime())
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  }, [readings, cutoffDays]);

  // Format chart data points
  const chartData = React.useMemo(() => {
    return filteredReadings.map((r) => {
      const d = new Date(r.measuredAt);
      const label =
        timeframe === "7D" || timeframe === "14D"
          ? `${d.toLocaleDateString("en-US", { weekday: "short" })} ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const val = unit === "mmol/L" ? Number((r.value / 18.0182).toFixed(1)) : r.value;

      return {
        id: r.id,
        rawTime: r.measuredAt,
        label,
        value: val,
        context: r.context.replace("_", " "),
        unit,
      };
    });
  }, [filteredReadings, timeframe, unit]);

  const targetMinVal = unit === "mmol/L" ? Number((fastingMin / 18.0182).toFixed(1)) : fastingMin;
  const targetMaxVal = unit === "mmol/L" ? Number((postMealMax / 18.0182).toFixed(1)) : postMealMax;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              {title}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Target range: {targetMinVal} – {targetMaxVal} {unit}
            </p>
          </div>
        </div>

        {showTimeframeSelector && (
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto">
            {(["7D", "14D", "30D", "90D"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-white dark:bg-slate-700 text-indigo-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <EmptyState
            icon={<GlucoseIcon className="h-6 w-6" />}
            title="No glucose readings recorded"
            description="Your glucose trend will appear here after you add your first reading."
            actionLabel="Add first reading"
            onAction={onAddReading}
          />
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                {/* Shaded Target Range Band */}
                <ReferenceArea
                  y1={targetMinVal}
                  y2={targetMaxVal}
                  fill="#10b981"
                  fillOpacity={0.06}
                />

                <ReferenceLine
                  y={targetMaxVal}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />
                <ReferenceLine
                  y={targetMinVal}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[
                    unit === "mmol/L" ? 2 : 40,
                    unit === "mmol/L" ? 18 : 260,
                  ]}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-lg text-xs">
                          <p className="font-semibold text-slate-800 dark:text-white">{data.label}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                              {data.value} {data.unit}
                            </span>
                          </div>
                          <span className="mt-1 block text-slate-500 dark:text-slate-400 capitalize">
                            Context: {data.context}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4338ca"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#4338ca", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

