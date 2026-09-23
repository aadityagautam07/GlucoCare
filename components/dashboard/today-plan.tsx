"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, ListTodo, Pill, Activity as GlucoseIcon, Utensils, Footprints } from "lucide-react";
import { TodayPlanItem } from "@/types";
import { toast } from "sonner";

interface TodayPlanProps {
  initialItems?: TodayPlanItem[];
}

export function TodayPlan({ initialItems }: TodayPlanProps) {
  const [items, setItems] = React.useState<TodayPlanItem[]>(
    initialItems || [
      {
        id: "plan-1",
        title: "Morning Medication",
        subtitle: "Metformin (500 mg) & Glipizide (5 mg)",
        time: "8:00 AM",
        category: "medication",
        completed: true,
      },
      {
        id: "plan-2",
        title: "Breakfast Log",
        subtitle: "Record meal carbs & calories",
        time: "8:30 AM",
        category: "meal",
        completed: true,
      },
      {
        id: "plan-3",
        title: "Post-Lunch Glucose Check",
        subtitle: "Check 2 hours after lunch",
        time: "1:40 PM",
        category: "glucose",
        completed: true,
      },
      {
        id: "plan-4",
        title: "Evening Medication",
        subtitle: "Metformin (500 mg) with dinner",
        time: "7:00 PM",
        category: "medication",
        completed: false,
      },
      {
        id: "plan-5",
        title: "Evening Walk / Gentle Cardio",
        subtitle: "Aim for 20-30 minutes active time",
        time: "7:45 PM",
        category: "activity",
        completed: false,
      },
      {
        id: "plan-6",
        title: "Bedtime Medication & Check",
        subtitle: "Atorvastatin (20 mg)",
        time: "10:00 PM",
        category: "medication",
        completed: false,
      },
    ]
  );

  const completedCount = items.filter((i) => i.completed).length;

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.completed;
          if (next) {
            toast.success(`Completed: ${item.title}`);
          }
          return { ...item, completed: next };
        }
        return item;
      })
    );
  };

  const getCategoryIcon = (category: TodayPlanItem["category"]) => {
    switch (category) {
      case "medication":
        return <Pill className="h-4 w-4 text-teal-600" />;
      case "glucose":
        return <GlucoseIcon className="h-4 w-4 text-indigo-600" />;
      case "meal":
        return <Utensils className="h-4 w-4 text-amber-600" />;
      case "activity":
        return <Footprints className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Today&apos;s Plan
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedCount} of {items.length} tasks completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{Math.round((completedCount / items.length) * 100)}%</span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                item.completed
                  ? "bg-slate-50/70 border-slate-100 text-slate-400"
                  : "bg-white border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50 text-slate-800 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  aria-label={item.title}
                />
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      item.completed ? "line-through text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-medium text-slate-500 shrink-0 ml-2">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

