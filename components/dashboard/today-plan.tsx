"use client";

import * as React from "react";
import {
  CheckCircle2,
  Calendar,
  Share2,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  RotateCcw,
  Pill,
  Activity as GlucoseIcon,
  Utensils,
  Footprints,
  Droplets,
  Apple,
  Moon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface ChecklistTask {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  category: "medication" | "glucose" | "meal" | "activity" | "hydration" | "snack";
  done: boolean;
  stamp?: string;
  isCustom?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  iconName: "morning" | "midday" | "afternoon" | "evening";
  tasks: ChecklistTask[];
}

function getDefaultSections(): ChecklistSection[] {
  return [
    {
      id: "morning_block",
      title: "🌅 Morning Awakening (7:00 AM - 9:30 AM)",
      iconName: "morning",
      tasks: [
        {
          id: "m1",
          time: "07:30 AM",
          title: "Prebiotic Hydration: Gond Katira + Chia Lemon Water",
          subtitle: "With pinch of kala namak. Coats gut & prevents morning dehydration.",
          category: "hydration",
          done: false,
        },
        {
          id: "m2",
          time: "08:15 AM",
          title: "High-Protein Breakfast: Besan / Moong Dal Chila or Sprouts",
          subtitle: "Low glycemic anchor with grated paneer or curd. Zero refined carbs.",
          category: "meal",
          done: false,
        },
        {
          id: "m3",
          time: "09:00 AM",
          title: "Morning Brisk Walk (3,500 - 4,000 steps)",
          subtitle: "Conversational pace. Stimulates natural glucose muscle uptake.",
          category: "activity",
          done: false,
        },
      ],
    },
    {
      id: "midday_block",
      title: "🍱 Midday & Lunch Armor (10:30 AM - 2:30 PM)",
      iconName: "midday",
      tasks: [
        {
          id: "d1",
          time: "10:30 AM",
          title: "Hydration Milestone 1: 1.0 Litre Water Completed",
          subtitle: "Steady kidney filtration & cellular osmotic replenishment.",
          category: "hydration",
          done: false,
        },
        {
          id: "d2",
          time: "11:30 AM",
          title: "Chilled Salted Chaas (Buttermilk) OR Nariyal Pani",
          subtitle: "Natural electrolytes to balance blood volume & stop midday fatigue.",
          category: "snack",
          done: false,
        },
        {
          id: "d3",
          time: "01:15 PM",
          title: "Raw Salad Armor (Beetroot + Carrot + Kheera)",
          subtitle: "EAT 5-10 MINS BEFORE LUNCH. Soluble fiber blunts post-meal glucose peak.",
          category: "meal",
          done: false,
        },
        {
          id: "d4",
          time: "01:30 PM",
          title: "Balanced Lunch: Dal + Green Sabzi + Jowar/Missi Roti",
          subtitle: "High fiber, lean protein, moderate complex carb portion.",
          category: "meal",
          done: false,
        },
        {
          id: "d5",
          time: "02:00 PM",
          title: "12-Minute Post-Lunch Relaxed Walk (1,500 steps)",
          subtitle: "Thigh & calf muscle contractions clear glucose without insulin spikes.",
          category: "activity",
          done: false,
        },
      ],
    },
    {
      id: "afternoon_block",
      title: "🍎 Afternoon Energy & Steps (3:30 PM - 7:00 PM)",
      iconName: "afternoon",
      tasks: [
        {
          id: "a1",
          time: "03:30 PM",
          title: "Hydration Milestone 2: 2.0 Litres Water Completed",
          subtitle: "Kidney hydration check.",
          category: "hydration",
          done: false,
        },
        {
          id: "a2",
          time: "04:30 PM",
          title: "Low-GI Whole Fruit: Crunchy Guava (Amrood) OR Pear",
          subtitle: "High pectin fiber prevents late-afternoon sweet cravings.",
          category: "snack",
          done: false,
        },
        {
          id: "a3",
          time: "05:30 PM",
          title: "Healthy Snack: Roasted Bhuna Chana + Green Tea",
          subtitle: "Slow digesting protein and polyphenol antioxidants.",
          category: "snack",
          done: false,
        },
        {
          id: "a4",
          time: "06:30 PM",
          title: "Evening Walk (Closing towards 10,000 - 14,000 steps)",
          subtitle: "Major insulin-independent GLUT4 glucose clearance session.",
          category: "activity",
          done: false,
        },
      ],
    },
    {
      id: "evening_block",
      title: "🌙 Dinner, Strength & Sleep (8:00 PM - 11:00 PM)",
      iconName: "evening",
      tasks: [
        {
          id: "e1",
          time: "08:15 PM",
          title: "Light Dinner: Veggie Daliya / Palak Paneer / Lauki / Karela",
          subtitle: "Easy digestion dinner. Prevents nighttime glucose elevation.",
          category: "meal",
          done: false,
        },
        {
          id: "e2",
          time: "09:00 PM",
          title: "10-Minute Post-Dinner Stroll",
          subtitle: "Aids gastric emptying and stabilizes fasting sugar baseline.",
          category: "activity",
          done: false,
        },
        {
          id: "e3",
          time: "09:30 PM",
          title: "Hydration Milestone 3: 3.5 Litres Daily Master Target Reached",
          subtitle: "Full daily water quota achieved.",
          category: "hydration",
          done: false,
        },
        {
          id: "e4",
          time: "10:00 PM",
          title: "Prescribed Evening Medications Taken",
          subtitle: "Take with water as directed by your clinician.",
          category: "medication",
          done: false,
        },
        {
          id: "e5",
          time: "10:15 PM",
          title: "15 Chair Squats + 10 Wall Push-ups",
          subtitle: "Gentle bodyweight resistance. Muscle glycogen glucose sinks.",
          category: "activity",
          done: false,
        },
        {
          id: "e6",
          time: "10:30 PM",
          title: "Tomorrow Prep: Soak Gond Katira & Chia Seeds",
          subtitle: "30-second prep for morning hydration. Lights out by 11:00 PM!",
          category: "hydration",
          done: false,
        },
      ],
    },
  ];
}

export function TodayPlan() {
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [sections, setSections] = React.useState<ChecklistSection[]>(() => getDefaultSections());
  const [newTaskText, setNewTaskText] = React.useState<{ [secId: string]: string }>({});
  const [isClient, setIsClient] = React.useState(false);
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);

  // Load from localStorage on mount & when date changes
  React.useEffect(() => {
    setIsClient(true);
    const storageKey = `glucocare_checklist_${selectedDate}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSections(JSON.parse(saved));
      } else {
        setSections(getDefaultSections());
      }
    } catch {
      setSections(getDefaultSections());
    }
  }, [selectedDate]);

  // Save to localStorage whenever sections change
  const saveSections = (newSections: ChecklistSection[]) => {
    setSections(newSections);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`glucocare_checklist_${selectedDate}`, JSON.stringify(newSections));
      } catch (err) {
        console.error("Failed to save checklist state:", err);
      }
    }
  };

  // Toggle single task with zero event conflict
  const handleToggleTask = (secId: string, taskId: string) => {
    const updated = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        tasks: sec.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const nextDone = !task.done;
          const stamp = nextDone
            ? `Logged at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : undefined;

          if (nextDone) {
            toast.success(`Completed: ${task.title}`);
          }
          return {
            ...task,
            done: nextDone,
            stamp,
          };
        }),
      };
    });

    saveSections(updated);
  };

  // Add custom task to a section
  const handleAddTask = (secId: string) => {
    const text = newTaskText[secId]?.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const updated = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        tasks: [
          ...sec.tasks,
          {
            id: "task-" + Date.now(),
            time: timeStr,
            title: text,
            subtitle: "Custom daily goal",
            category: "activity" as const,
            done: false,
            isCustom: true,
          },
        ],
      };
    });

    saveSections(updated);
    setNewTaskText((prev) => ({ ...prev, [secId]: "" }));
    toast.success("Task added to daily checklist!");
  };

  // Delete task
  const handleDeleteTask = (secId: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        tasks: sec.tasks.filter((t) => t.id !== taskId),
      };
    });
    saveSections(updated);
    toast.info("Task removed");
  };

  // Reset to default template
  const handleResetTemplate = () => {
    if (confirm("Reset today's checklist back to standard metabolic routine?")) {
      const def = getDefaultSections();
      saveSections(def);
      toast.success("Checklist reset to standard routine!");
    }
  };

  // Compute overall progress
  const allTasks = sections.flatMap((s) => s.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.done).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // WhatsApp share generator
  const handleShareWhatsApp = () => {
    let msg = `🩺 *GlucoCare Daily Compliance Report (${selectedDate})*\n`;
    msg += `📊 *Daily Progress:* ${completedTasks}/${totalTasks} Tasks Completed (${percentage}%)\n`;
    msg += `-----------------------------------------------\n`;

    sections.forEach((sec) => {
      msg += `\n*${sec.title}*\n`;
      sec.tasks.forEach((t) => {
        const mark = t.done ? "✓ [COMPLETED]" : "○ [PENDING]";
        const stamp = t.stamp ? ` (${t.stamp})` : "";
        msg += `${mark} ${t.time}: ${t.title}${stamp}\n`;
      });
    });

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const getCategoryIcon = (category: ChecklistTask["category"]) => {
    switch (category) {
      case "medication":
        return <Pill className="h-3.5 w-3.5 text-teal-600" />;
      case "glucose":
        return <GlucoseIcon className="h-3.5 w-3.5 text-indigo-600" />;
      case "meal":
        return <Utensils className="h-3.5 w-3.5 text-amber-600" />;
      case "activity":
        return <Footprints className="h-3.5 w-3.5 text-emerald-600" />;
      case "hydration":
        return <Droplets className="h-3.5 w-3.5 text-sky-600" />;
      case "snack":
        return <Apple className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <Card className="shadow-xs border-slate-200/90 overflow-hidden">
      {/* Header with Title and Overall Real-Time Progress */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              Metabolic Routine & Day Plan
            </div>
            <CardTitle className="text-xl font-black tracking-tight text-white">
              Daily Care Checklist
            </CardTitle>
            <p className="text-xs text-slate-300">
              Interactive timeline designed to prevent glucose spikes, sustain hydration, and track medications.
            </p>
          </div>

          {/* Date Picker & WhatsApp Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl border border-white/15 text-xs text-white">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-sm"
              title="Share live status via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Real-Time Progress Bar Strip */}
        <div className="mt-5 p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200">Today&apos;s Compliance Score</span>
            <span className="text-teal-300 font-extrabold text-sm">{percentage}%</span>
          </div>

          <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-400"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
            <span>
              {completedTasks} of {totalTasks} tasks completed
            </span>
            <span>Target: 100% Daily Adherence</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6 bg-slate-50/40">
        {/* Sections */}
        {sections.map((sec) => {
          const secDone = sec.tasks.filter((t) => t.done).length;
          const secTotal = sec.tasks.length;
          const isCollapsed = activeSectionId === sec.id;

          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {sec.title}
                  </h3>
                </div>

                <Badge
                  variant="secondary"
                  className={`text-[11px] font-bold ${
                    secDone === secTotal && secTotal > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {secDone}/{secTotal} Done
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {sec.tasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(sec.id, task.id)}
                      className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        task.done
                          ? "bg-emerald-50/60 border-emerald-200/80 text-slate-600 shadow-2xs"
                          : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 text-slate-800 shadow-2xs"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(sec.id, task.id);
                        }}
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.done
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "border-2 border-slate-300 hover:border-indigo-600 bg-white"
                        }`}
                        aria-label={task.title}
                      >
                        {task.done && <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </button>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            <Clock className="w-2.5 h-2.5" />
                            {task.time}
                          </span>

                          <div className="flex items-center gap-1">
                            {getCategoryIcon(task.category)}
                          </div>

                          {task.stamp && (
                            <span className="text-[10px] font-bold text-emerald-700 ml-auto">
                              ✓ {task.stamp}
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-xs sm:text-sm font-semibold leading-snug ${
                            task.done ? "line-through text-slate-400 font-medium" : "text-slate-800"
                          }`}
                        >
                          {task.title}
                        </p>

                        {task.subtitle && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {task.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Delete Task Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTask(sec.id, task.id, e)}
                        title="Delete task"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Task Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add custom item (e.g. Sautéed Paneer, Karela, Evening Gym)..."
                  value={newTaskText[sec.id] || ""}
                  onChange={(e) =>
                    setNewTaskText((prev) => ({ ...prev, [sec.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask(sec.id);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTask(sec.id)}
                  className="h-8 text-xs gap-1 border-slate-200 hover:bg-slate-100"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>
            </div>
          );
        })}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={handleResetTemplate}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Metabolic Routine</span>
          </button>

          <span className="text-[11px] text-slate-400">
            Checks and custom items are saved automatically for this date.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
