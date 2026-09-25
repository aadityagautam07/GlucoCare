"use client";

import * as React from "react";
import {
  Plus,
  Calendar,
  MapPin,
  Video,
  Trash2,
  CheckCircle2,
  Clock,
  Bell,
  BellRing,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddAppointmentDialog } from "./add-appointment-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Appointment } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppointmentsViewProps {
  appointments: Appointment[];
}

function getAlarmLabel(code?: string): string {
  switch (code) {
    case "15m":
      return "15 mins before";
    case "30m":
      return "30 mins before";
    case "1h":
      return "1 hour before";
    case "2h":
      return "2 hours before";
    case "1d":
      return "1 day before";
    case "none":
      return "No alarm";
    default:
      return "1 hour before";
  }
}

function getIcsAlarmTrigger(code?: string): string | null {
  switch (code) {
    case "15m":
      return "-PT15M";
    case "30m":
      return "-PT30M";
    case "1h":
      return "-PT1H";
    case "2h":
      return "-PT2H";
    case "1d":
      return "-P1D";
    case "none":
      return null;
    default:
      return "-PT1H";
  }
}

function playAlarmChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.5);
    });
  } catch (err) {
    console.warn("Audio alarm playback error:", err);
  }
}

function downloadIcsCalendar(appointments: Appointment[], filename = "GlucoCare-Appointments.ics") {
  if (appointments.length === 0) return;

  const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GlucoCare//Health Management Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n");

  appointments.forEach((app) => {
    // Parse Date and Time (format: YYYY-MM-DD and HH:MM)
    const [year, month, day] = app.date.split("-");
    const [hours, mins] = app.time.split(":");
    const startDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(mins)
    );
    const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45 min default duration

    const pad = (n: number) => n.toString().padStart(2, "0");
    const dtStart = `${year}${month}${day}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
    const dtEnd = `${year}${month}${day}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const summary = `${app.title} - ${app.doctorName}`;
    const description = `Doctor/Specialist: ${app.doctorName}${app.specialty ? ` (${app.specialty})` : ""}\\nLocation: ${app.location}${app.notes ? `\\nNotes: ${app.notes}` : ""}`;
    const trigger = getIcsAlarmTrigger(app.reminderAlarm);

    let eventStr = [
      "",
      "BEGIN:VEVENT",
      `UID:${app.id}@glucocare.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${app.location}`,
      "STATUS:CONFIRMED",
    ].join("\r\n");

    if (trigger) {
      eventStr += "\r\n" + [
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder: ${summary}`,
        `TRIGGER:${trigger}`,
        "END:VALARM",
      ].join("\r\n");
    }

    eventStr += "\r\nEND:VEVENT";
    icsContent += eventStr;
  });

  icsContent += "\r\nEND:VCALENDAR";

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Calendar exported (.ics)", {
    description: "Imported file syncs reminders directly to Apple Calendar, iPhone, and Google Calendar.",
  });
}

export function AppointmentsView({ appointments }: AppointmentsViewProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleToggleComplete = async (app: Appointment) => {
    try {
      const res = await fetch(`/api/appointments/${app.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !app.completed }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(app.completed ? "Marked as upcoming" : "Appointment marked as completed");
      handleRefresh();
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/appointments/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete appointment");
      toast.success("Appointment deleted");
      setDeleteTarget(null);
      handleRefresh();
    } catch {
      toast.error("Failed to delete appointment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTestAlarm = (app: Appointment) => {
    playAlarmChime();
    toast.info(`🔔 Alarm Preview: ${app.title}`, {
      description: `With ${app.doctorName} at ${formatTime(app.time)}. Alarm is configured for ${getAlarmLabel(app.reminderAlarm)}.`,
      duration: 6000,
    });
  };

  const upcomingList = appointments.filter((a) => !a.completed);
  const pastList = appointments.filter((a) => a.completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Healthcare Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of doctor visits, endocrinologist check-ups, eye exams, and lab appointments with notification alarms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {upcomingList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadIcsCalendar(upcomingList, "GlucoCare-Upcoming-Appointments.ics")}
              className="gap-1.5 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export to Calendar (.ics)</span>
            </Button>
          )}

          <Button onClick={() => setAddModalOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Upcoming Visits</span>
          <Badge variant="default" className="text-[11px] font-semibold">
            {upcomingList.length}
          </Badge>
        </h2>

        {upcomingList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingList.map((app) => (
              <Card
                key={app.id}
                className="shadow-xs hover:border-indigo-200 transition-all border-slate-200/80"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.title}
                        </h3>
                        {app.isVirtual && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            <Video className="h-3 w-3" /> Telehealth
                          </span>
                        )}

                        {/* Alarm Badge */}
                        {app.reminderAlarm && app.reminderAlarm !== "none" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                            <Bell className="h-3 w-3 text-indigo-600 animate-pulse" />
                            Alarm: {getAlarmLabel(app.reminderAlarm)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            <Bell className="h-3 w-3 text-slate-300" />
                            No alarm
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {app.doctorName}{" "}
                        {app.specialty && (
                          <span className="text-slate-400 font-normal">
                            ({app.specialty})
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-indigo-900 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-indigo-600" />
                          {formatDate(app.date)} at {formatTime(app.time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {app.location}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong className="text-slate-700 block mb-0.5">Notes:</strong>
                          {app.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {/* Test Alarm Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTestAlarm(app)}
                      className="text-xs text-indigo-700 hover:bg-indigo-50 gap-1 h-8 px-2"
                      title="Test alarm sound and notification"
                    >
                      <BellRing className="h-3.5 w-3.5" />
                      <span>Test Alarm</span>
                    </Button>

                    {/* Export .ics button for Apple Calendar / iPhone */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadIcsCalendar([app], `Appointment-${app.date}.ics`)}
                      className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1 h-8 px-2"
                      title="Export to Apple / Google Calendar"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>.ics</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleComplete(app)}
                      className="text-xs h-8"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Done
                    </Button>

                    <button
                      onClick={() => setDeleteTarget(app)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastList.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-base font-bold text-slate-700">
            Past Appointments
          </h2>

          <div className="space-y-2">
            {pastList.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600"
              >
                <div>
                  <span className="font-semibold text-slate-800">
                    {app.title}
                  </span>{" "}
                  • {app.doctorName} • {formatDate(app.date)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Completed
                  </span>
                  <button
                    onClick={() => setDeleteTarget(app)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddAppointmentDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleRefresh}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Appointment"
        description="Are you sure you want to remove this appointment record?"
        confirmLabel="Delete Appointment"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
