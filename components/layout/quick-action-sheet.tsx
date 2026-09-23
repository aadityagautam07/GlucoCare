"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Activity as GlucoseIcon, Pill, Utensils, Footprints } from "lucide-react";

interface QuickActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAction: (action: "glucose" | "medication" | "meal" | "activity") => void;
}

export function QuickActionSheet({
  open,
  onOpenChange,
  onSelectAction,
}: QuickActionSheetProps) {
  const actions = [
    {
      id: "glucose" as const,
      title: "Add Glucose",
      description: "Record blood sugar level & context",
      icon: GlucoseIcon,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "medication" as const,
      title: "Log Medication",
      description: "Mark dose taken, skipped, or missed",
      icon: Pill,
      color: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      id: "meal" as const,
      title: "Log Meal",
      description: "Track breakfast, lunch, dinner, or snack",
      icon: Utensils,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "activity" as const,
      title: "Log Activity",
      description: "Record walking, cardio, or workout",
      icon: Footprints,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-lg mx-auto pb-8">
        <SheetHeader className="text-center sm:text-left">
          <SheetTitle className="text-lg font-bold text-slate-900">
            Quick Log
          </SheetTitle>
          <p className="text-xs text-slate-500">
            Select an action to record your health entry today.
          </p>
        </SheetHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onOpenChange(false);
                  onSelectAction(act.id);
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all text-left shadow-xs group"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${act.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

