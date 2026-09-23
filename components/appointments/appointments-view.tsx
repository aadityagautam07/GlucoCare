"use client";

import * as React from "react";
import { Plus, Calendar, MapPin, Video, Trash2, CheckCircle2, Clock } from "lucide-react";
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
            Keep track of doctor visits, endocrinologist check-ups, eye exams, and lab appointments.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>New Appointment</span>
        </Button>
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

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleComplete(app)}
                      className="text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Done
                    </Button>
                    <button
                      onClick={() => setDeleteTarget(app)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

