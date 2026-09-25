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
  Briefcase,
  Home,
  Plane,
  Bell,
  BellRing,
  BellOff,
  Cloud,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DayModeType } from "@/types";

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
  shortTitle: string;
  iconName: "morning" | "midday" | "afternoon" | "evening";
  tasks: ChecklistTask[];
}

function getDefaultSections(): ChecklistSection[] {
  return [
    {
      id: "morning_block",
      title: "🌅 Morning Awakening (7:00 AM - 9:30 AM)",
      shortTitle: "Morning",
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
      shortTitle: "Midday",
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
      shortTitle: "Afternoon",
      iconName: "afternoon",
      tasks: [
        {
          id: "a1",
          time: "03:30 PM",
          title: "Hydration Milestone 2: 2.0 Litres Water Completed",
          subtitle: "Midday cellular hydration benchmark.",
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
          title: "Desk Armor: Roasted Bhuna Chana + Green Tea",
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
      shortTitle: "Night",
      iconName: "evening",
      tasks: [
        {
          id: "e1",
          time: "08:15 PM",
          title: "Light Dinner: Veggie Daliya / Palak Paneer / Lauki",
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
          title: "Hydration Milestone 3: 3.5 Litres Daily Master Target",
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

// iOS & Modern Browser Web Audio synthesized gentle bell chime
function playWebAudioChime() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio autoplay restrictions if user has not tapped
  }
}

export function TodayPlan() {
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Auto-detect Day Mode based on day of week (Mon-Fri = Office, Sat-Sun = Weekend)
  const defaultDayMode: DayModeType = React.useMemo(() => {
    const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6 ? "weekend" : "office";
  }, []);

  const [dayMode, setDayMode] = React.useState<DayModeType>(defaultDayMode);
  const [sections, setSections] = React.useState<ChecklistSection[]>(() => getDefaultSections());
  const [newTaskText, setNewTaskText] = React.useState<{ [secId: string]: string }>({});
  const [remindersEnabled, setRemindersEnabled] = React.useState(false);
  const [showIosTip, setShowIosTip] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Time-slot filter: auto-select current slot based on time
  const currentSlotId = React.useMemo(() => {
    const hr = new Date().getHours();
    if (hr >= 6 && hr < 10) return "morning_block";
    if (hr >= 10 && hr < 15) return "midday_block";
    if (hr >= 15 && hr < 19) return "afternoon_block";
    return "evening_block";
  }, []);

  const [activeTab, setActiveTab] = React.useState<string>(currentSlotId);

  // Load from local storage or remote daily-logs API
  React.useEffect(() => {
    const storageKey = `glucocare_checklist_${selectedDate}`;
    let loadedFromLocal = false;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSections(JSON.parse(saved));
        loadedFromLocal = true;
      }
    } catch {
      // fallback
    }

    // Also fetch cloud daily-log record
    fetch(`/api/daily-logs?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.log) {
          if (data.log.dayMode) setDayMode(data.log.dayMode);
          if (!loadedFromLocal && data.log.tasks && data.log.tasks.length > 0) {
            // reconcile with default sections
            const def = getDefaultSections();
            const updated = def.map((sec) => ({
              ...sec,
              tasks: sec.tasks.map((task) => {
                const found = data.log.tasks.find((t: { id: string }) => t.id === task.id);
                return found ? { ...task, done: found.done, stamp: found.stamp } : task;
              }),
            }));
            setSections(updated);
          }
        }
      })
      .catch(() => {
        // quiet offline fallback
      });
  }, [selectedDate]);

  // Save to localStorage & sync to API
  const saveSections = (newSections: ChecklistSection[], updatedDayMode = dayMode) => {
    setSections(newSections);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`glucocare_checklist_${selectedDate}`, JSON.stringify(newSections));
      } catch (err) {
        console.error("Local storage save error:", err);
      }
    }

    // Debounced or direct cloud sync
    const all = newSections.flatMap((s) => s.tasks);
    const completed = all.filter((t) => t.done).length;
    const total = all.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    setIsSyncing(true);
    fetch("/api/daily-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        dayMode: updatedDayMode,
        tasksCompleted: completed,
        totalTasks: total,
        adherencePercentage: pct,
        tasks: all.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          done: t.done,
          time: t.time,
          stamp: t.stamp,
          isCustom: t.isCustom,
        })),
      }),
    })
      .catch(() => {})
      .finally(() => setIsSyncing(false));
  };

  // Toggle single task
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
            if (remindersEnabled) {
              playWebAudioChime();
            }
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

  // Add custom task
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
            subtitle: "Custom goal",
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

  // Toggle Reminder system (catered for iOS & Web)
  const handleToggleReminders = async () => {
    playWebAudioChime();

    if (!remindersEnabled) {
      setRemindersEnabled(true);
      toast.success("In-app alert chimes enabled!", {
        description: "You will hear gentle audio cues for your milestone times while using the portal.",
      });

      // Check browser notification permission (supports iOS 16.4+ when added to homescreen)
      if (typeof window !== "undefined" && "Notification" in window) {
        try {
          if (Notification.permission === "default") {
            const perm = await Notification.requestPermission();
            if (perm === "granted") {
              toast.success("Browser push notifications active!");
            }
          }
        } catch {
          // iOS Safari without PWA or denied
        }
      }
    } else {
      setRemindersEnabled(false);
      toast.info("Reminders silenced.");
    }
  };

  // Change Day Mode
  const handleChangeDayMode = (newMode: DayModeType) => {
    setDayMode(newMode);
    saveSections(sections, newMode);
    toast.success(`Switched to ${newMode.toUpperCase()} routine.`);
  };

  // Compute overall progress
  const allTasks = sections.flatMap((s) => s.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.done).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // WhatsApp share generator
  const handleShareWhatsApp = () => {
    let msg = `🩺 *GlucoCare Daily Compliance Report (${selectedDate})*\n`;
    msg += `📍 *Routine Mode:* ${dayMode.toUpperCase()}\n`;
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

  // Filter sections based on activeTab
  const visibleSections = activeTab === "all" ? sections : sections.filter((s) => s.id === activeTab);

  return (
    <Card className="shadow-xs border-slate-200/90 overflow-hidden bg-white">
      {/* Sleek, Theme-Harmonized Card Header (Clean Slate/Teal Palette) */}
      <CardHeader className="bg-gradient-to-r from-slate-50 via-teal-50/20 to-indigo-50/30 p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Daily Care Protocol
            </div>
            <CardTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              Today&apos;s Metabolic Routine
            </CardTitle>
          </div>

          {/* Date Picker, Reminder Bell & WhatsApp Button */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {/* Day Mode Switcher Pill */}
            <div className="flex items-center bg-white px-2 py-1 rounded-xl border border-slate-200 text-xs shadow-2xs gap-1.5">
              {dayMode === "office" && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
              {dayMode === "weekend" && <Home className="w-3.5 h-3.5 text-teal-600" />}
              {dayMode === "festival" && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
              {dayMode === "travel" && <Plane className="w-3.5 h-3.5 text-sky-600" />}

              <select
                value={dayMode}
                onChange={(e) => handleChangeDayMode(e.target.value as DayModeType)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-none cursor-pointer"
              >
                <option value="office">🏢 Office Day</option>
                <option value="weekend">🏡 Weekend Off</option>
                <option value="festival">🎉 Festival</option>
                <option value="travel">✈️ Travel</option>
              </select>
            </div>

            {/* In-App / iOS Reminder Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleReminders}
              className={`h-8 px-2.5 text-xs gap-1 shadow-2xs ${
                remindersEnabled
                  ? "bg-teal-50 border-teal-300 text-teal-800"
                  : "bg-white text-slate-600 hover:text-slate-900"
              }`}
              title="Toggle audio & in-app reminder chimes"
            >
              {remindersEnabled ? (
                <BellRing className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {remindersEnabled ? "Alerts On" : "Reminders"}
              </span>
            </Button>

            {/* Date Input */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-2xs">
              <Calendar className="w-3 h-3 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* WhatsApp Share */}
            <Button
              type="button"
              size="sm"
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1 shadow-2xs"
              title="Share status via WhatsApp"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <span>Today&apos;s Adherence:</span>
              <span className="text-slate-900 font-extrabold">{completedTasks}/{totalTasks}</span>
              <span className="text-slate-400 font-normal">tasks completed</span>
            </span>
            <span className="text-teal-700 font-black text-sm">{percentage}%</span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* iOS User Tip Accordion */}
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Cloud className="w-3 h-3 text-teal-600" />
            <span>{isSyncing ? "Saving cloud log..." : "Syncs across iPhone, Mac & PC"}</span>
          </span>

          <button
            type="button"
            onClick={() => setShowIosTip(!showIosTip)}
            className="text-teal-700 hover:underline inline-flex items-center gap-0.5 font-medium"
          >
            <Info className="w-3 h-3" />
            <span>iPhone App Tip</span>
          </button>
        </div>

        {showIosTip && (
          <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-[11px] text-teal-900 leading-snug">
            📱 <strong>For iPhone / iPad Users:</strong> Open in Safari, tap the <strong>Share button</strong> (square with arrow up 📤) and choose <strong>&ldquo;Add to Home Screen&rdquo;</strong>. It transforms GlucoCare into a standalone app with full screen view and native sound alerts!
          </div>
        )}

        {/* Segmented Time-Slot Tabs (Solves Length Issue!) */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs overflow-x-auto">
          {sections.map((sec) => {
            const doneCnt = sec.tasks.filter((t) => t.done).length;
            const isCurrent = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                  isCurrent
                    ? "bg-white text-teal-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <span>{sec.shortTitle}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    doneCnt === sec.tasks.length && sec.tasks.length > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {doneCnt}/{sec.tasks.length}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-white text-teal-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            Show All
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Render Only Selected Slot (or all if activeTab is "all") */}
        {visibleSections.map((sec) => {
          const secDone = sec.tasks.filter((t) => t.done).length;
          const secTotal = sec.tasks.length;

          return (
            <div
              key={sec.id}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                  {sec.title}
                </h3>

                <Badge
                  variant="secondary"
                  className={`text-[10px] font-bold ${
                    secDone === secTotal && secTotal > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {secDone}/{secTotal} Completed
                </Badge>
              </div>

              {/* Tasks List */}
              <div className="space-y-1.5">
                {sec.tasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(sec.id, task.id)}
                      className={`group flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                        task.done
                          ? "bg-emerald-50/50 border-emerald-200/70 text-slate-600"
                          : "bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50/50 text-slate-800"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(sec.id, task.id);
                        }}
                        className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.done
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "border-2 border-slate-300 hover:border-teal-600 bg-white"
                        }`}
                        aria-label={task.title}
                      >
                        {task.done && <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />}
                      </button>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
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
                          className={`text-xs font-semibold leading-snug ${
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
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Task Input */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder={`+ Add task to ${sec.shortTitle}...`}
                  value={newTaskText[sec.id] || ""}
                  onChange={(e) =>
                    setNewTaskText((prev) => ({ ...prev, [sec.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTask(sec.id);
                    }
                  }}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-500 transition-colors"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddTask(sec.id)}
                  className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
