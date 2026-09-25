"use client";

import * as React from "react";
import { Flame, Clock, Footprints, Award, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AppleFitnessRingsProps {
  activeCalories?: number; // Move (kcal), default goal 600
  calorieGoal?: number;
  exerciseMinutes?: number; // Exercise (mins), default goal 30
  exerciseGoal?: number;
  standHours?: number; // Stand (hrs), default goal 12
  standGoal?: number;
  totalSteps?: number;
  stepsGoal?: number;
  className?: string;
  compact?: boolean;
}

export function AppleFitnessRings({
  activeCalories = 420,
  calorieGoal = 600,
  exerciseMinutes = 35,
  exerciseGoal = 30,
  standHours = 9,
  standGoal = 12,
  totalSteps = 7850,
  stepsGoal = 10000,
  className = "",
  compact = false,
}: AppleFitnessRingsProps) {
  // Calculate percentages (clamped to min 0, max 200% for visual overshoot)
  const movePct = Math.min(2, Math.max(0, activeCalories / calorieGoal));
  const exercisePct = Math.min(2, Math.max(0, exerciseMinutes / exerciseGoal));
  const standPct = Math.min(2, Math.max(0, standHours / standGoal));

  // Circular ring constants
  const size = compact ? 160 : 200;
  const center = size / 2;
  const strokeWidth = compact ? 10 : 13;

  // Radii for 3 concentric rings
  const moveRadius = center - strokeWidth;
  const exerciseRadius = moveRadius - strokeWidth - (compact ? 3 : 5);
  const standRadius = exerciseRadius - strokeWidth - (compact ? 3 : 5);

  const getCircumference = (r: number) => 2 * Math.PI * r;

  const moveCircumference = getCircumference(moveRadius);
  const exerciseCircumference = getCircumference(exerciseRadius);
  const standCircumference = getCircumference(standRadius);

  const moveOffset = moveCircumference * (1 - Math.min(1, movePct));
  const exerciseOffset = exerciseCircumference * (1 - Math.min(1, exercisePct));
  const standOffset = standCircumference * (1 - Math.min(1, standPct));

  const ringsClosed = (movePct >= 1 ? 1 : 0) + (exercisePct >= 1 ? 1 : 0) + (standPct >= 1 ? 1 : 0);

  return (
    <Card className={`overflow-hidden border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${className}`}>
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-rose-50/20 to-teal-50/20 dark:from-slate-900 dark:via-rose-950/10 dark:to-teal-950/10">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black tracking-widest uppercase">
              <Award className="w-3 h-3 text-rose-400" />
              Apple Fitness Activity Rings
            </div>
            <CardTitle className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Daily Movement & Rings
            </CardTitle>
          </div>

          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {ringsClosed}/3 Rings Closed
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className={`flex ${compact ? "flex-col items-center" : "flex-col sm:flex-row items-center"} justify-around gap-6`}>
          {/* SVG Concentric Rings */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 drop-shadow-md"
            >
              <defs>
                {/* 🔴 Move Gradient */}
                <linearGradient id="moveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FA114F" />
                  <stop offset="100%" stopColor="#FF5A79" />
                </linearGradient>
                {/* 🟢 Exercise Gradient */}
                <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#92E82A" />
                  <stop offset="100%" stopColor="#A7FF00" />
                </linearGradient>
                {/* 🔵 Stand Gradient */}
                <linearGradient id="standGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="100%" stopColor="#0088FF" />
                </linearGradient>
              </defs>

              {/* Background Track Rings */}
              <circle
                cx={center}
                cy={center}
                r={moveRadius}
                stroke="#FA114F"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />
              <circle
                cx={center}
                cy={center}
                r={exerciseRadius}
                stroke="#92E82A"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />
              <circle
                cx={center}
                cy={center}
                r={standRadius}
                stroke="#00E5FF"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.18}
              />

              {/* Foreground Animated Progress Rings */}
              {/* Move Ring */}
              <circle
                cx={center}
                cy={center}
                r={moveRadius}
                stroke="url(#moveGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={moveCircumference}
                strokeDashoffset={moveOffset}
                className="transition-all duration-700 ease-out"
              />

              {/* Exercise Ring */}
              <circle
                cx={center}
                cy={center}
                r={exerciseRadius}
                stroke="url(#exerciseGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={exerciseCircumference}
                strokeDashoffset={exerciseOffset}
                className="transition-all duration-700 ease-out"
              />

              {/* Stand Ring */}
              <circle
                cx={center}
                cy={center}
                r={standRadius}
                stroke="url(#standGradient)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={standCircumference}
                strokeDashoffset={standOffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Ring Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Steps
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                {totalSteps.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                of {stepsGoal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ring Metrics Breakdown (Apple Fitness Style) */}
          <div className="flex-1 w-full space-y-3">
            {/* 🔴 Move Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#FA114F]">
                  <Flame className="w-3.5 h-3.5" />
                  MOVE
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{activeCalories}</strong> / {calorieGoal} <span className="text-[10px] text-slate-500 font-normal">CAL</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FA114F] to-[#FF5A79] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(movePct * 100))}%` }}
                />
              </div>
            </div>

            {/* 🟢 Exercise Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#92E82A] dark:text-[#A7FF00]">
                  <Clock className="w-3.5 h-3.5" />
                  EXERCISE
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{exerciseMinutes}</strong> / {exerciseGoal} <span className="text-[10px] text-slate-500 font-normal">MIN</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#92E82A] to-[#A7FF00] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(exercisePct * 100))}%` }}
                />
              </div>
            </div>

            {/* 🔵 Stand Bar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1.5 text-[#00E5FF]">
                  <Footprints className="w-3.5 h-3.5" />
                  STAND & STEPS
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  <strong>{standHours}</strong> / {standGoal} <span className="text-[10px] text-slate-500 font-normal">HRS</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#0088FF] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(standPct * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
