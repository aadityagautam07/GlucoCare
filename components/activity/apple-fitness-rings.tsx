"use client";

import * as React from "react";
import { Flame, Footprints, MapPin, Award, Plus, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AppleFitnessRingsProps {
  calories?: number; // Active calories (kcal), default goal 500
  caloriesGoal?: number;
  stepCount?: number; // Daily steps, default goal 10,000
  stepCountGoal?: number;
  stepDistance?: number; // Step distance in km, default goal 5.0 km
  stepDistanceGoal?: number;
  date?: string; // YYYY-MM-DD
  onLogClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function AppleFitnessRings({
  calories = 520,
  caloriesGoal = 500,
  stepCount = 8450,
  stepCountGoal = 10000,
  stepDistance = 6.2,
  stepDistanceGoal = 5.0,
  date,
  onLogClick,
  className = "",
  compact = false,
}: AppleFitnessRingsProps) {
  // Calculate percentages (clamped to min 0, max 200% for visual overshoot)
  const caloriesPct = Math.min(2, Math.max(0, calories / Math.max(1, caloriesGoal)));
  const stepsPct = Math.min(2, Math.max(0, stepCount / Math.max(1, stepCountGoal)));
  const distancePct = Math.min(2, Math.max(0, stepDistance / Math.max(0.1, stepDistanceGoal)));

  // Circular ring constants
  const size = compact ? 160 : 200;
  const center = size / 2;
  const strokeWidth = compact ? 10 : 13;

  // Radii for 3 concentric rings (Calories outer, Step count middle, Step distance inner)
  const caloriesRadius = center - strokeWidth;
  const stepsRadius = caloriesRadius - strokeWidth - (compact ? 3 : 5);
  const distanceRadius = stepsRadius - strokeWidth - (compact ? 3 : 5);

  const getCircumference = (r: number) => 2 * Math.PI * r;

  const caloriesCircumference = getCircumference(caloriesRadius);
  const stepsCircumference = getCircumference(stepsRadius);
  const distanceCircumference = getCircumference(distanceRadius);

  const caloriesOffset = caloriesCircumference * (1 - Math.min(1, caloriesPct));
  const stepsOffset = stepsCircumference * (1 - Math.min(1, stepsPct));
  const distanceOffset = distanceCircumference * (1 - Math.min(1, distancePct));

  const ringsClosed =
    (caloriesPct >= 1 ? 1 : 0) + (stepsPct >= 1 ? 1 : 0) + (distancePct >= 1 ? 1 : 0);

  return (
    <Card
      className={`overflow-hidden border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${className}`}
    >
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-rose-50/20 to-teal-50/20 dark:from-slate-900 dark:via-rose-950/10 dark:to-teal-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black tracking-widest uppercase">
              <Award className="w-3 h-3 text-rose-400" />
              Apple Fitness Activity Rings
            </div>
            <CardTitle className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Daily Movement & Rings</span>
              {date && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </span>
              )}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {ringsClosed}/3 Rings Closed
            </span>

            {onLogClick && (
              <Button
                size="sm"
                variant="outline"
                onClick={onLogClick}
                className="h-8 text-xs font-bold gap-1 shadow-2xs border-slate-200 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5 text-rose-500" />
                <span>Log Fitness</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div
          className={`flex ${
            compact ? "flex-col items-center" : "flex-col sm:flex-row items-center"
          } justify-around gap-6`}
        >
          {/* SVG Concentric Rings */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 drop-shadow-md"
            >
              <defs>
                {/* 🔴 Calories Gradient */}
                <linearGradient id="fitCaloriesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FA114F" />
                  <stop offset="100%" stopColor="#FF5A79" />
                </linearGradient>
                {/* 🟢 Steps Gradient */}
                <linearGradient id="fitStepsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#92E82A" />
                  <stop offset="100%" stopColor="#A7FF00" />
                </linearGradient>
                {/* 🔵 Distance Gradient */}
                <linearGradient id="fitDistanceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#0088FF" />
                </linearGradient>
              </defs>

              {/* Background Track Rings */}
              <circle
                cx={center}
                cy={center}
                r={caloriesRadius}
                stroke="#FA114F"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />
              <circle
                cx={center}
                cy={center}
                r={stepsRadius}
                stroke="#92E82A"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />
              <circle
                cx={center}
                cy={center}
                r={distanceRadius}
                stroke="#00E5FF"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />

              {/* Foreground Animated Progress Rings */}
              {/* 1. Calories Ring (Red) */}
              <circle
                cx={center}
                cy={center}
                r={caloriesRadius}
                stroke="url(#fitCaloriesGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={caloriesCircumference}
                strokeDashoffset={caloriesOffset}
                className="transition-all duration-700 ease-out"
              />

              {/* 2. Step Count Ring (Green) */}
              <circle
                cx={center}
                cy={center}
                r={stepsRadius}
                stroke="url(#fitStepsGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={stepsCircumference}
                strokeDashoffset={stepsOffset}
                className="transition-all duration-700 ease-out"
              />

              {/* 3. Step Distance Ring (Blue) */}
              <circle
                cx={center}
                cy={center}
                r={distanceRadius}
                stroke="url(#fitDistanceGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={distanceCircumference}
                strokeDashoffset={distanceOffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Ring Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Steps
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                {stepCount.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                of {stepCountGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3 Ring Metrics Breakdown (Strictly Calories, Step Count, Step Distance) */}
          <div className="flex-1 w-full space-y-3">
            {/* 🔴 1. Active Calories (Move) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#FA114F]">
                  <Flame className="w-3.5 h-3.5" />
                  ACTIVE CALORIES
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{calories}</strong> / {caloriesGoal}{" "}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">KCAL</span>
                  <span className="ml-1.5 text-[10px] font-extrabold text-[#FA114F]">
                    ({Math.round(caloriesPct * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FA114F] to-[#FF5A79] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(caloriesPct * 100))}%` }}
                />
              </div>
            </div>

            {/* 🟢 2. Step Count */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#92E82A] dark:text-[#A7FF00]">
                  <Footprints className="w-3.5 h-3.5" />
                  STEP COUNT
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{stepCount.toLocaleString()}</strong> / {stepCountGoal.toLocaleString()}{" "}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">STEPS</span>
                  <span className="ml-1.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    ({Math.round(stepsPct * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#92E82A] to-[#A7FF00] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(stepsPct * 100))}%` }}
                />
              </div>
            </div>

            {/* 🔵 3. Step Distance */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#00E5FF]">
                  <MapPin className="w-3.5 h-3.5" />
                  STEP DISTANCE
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{stepDistance}</strong> / {stepDistanceGoal}{" "}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">KM</span>
                  <span className="ml-1.5 text-[10px] font-extrabold text-sky-600 dark:text-sky-400">
                    ({Math.round(distancePct * 100)}%)
                  </span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#0088FF] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(distancePct * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
