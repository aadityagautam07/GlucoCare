"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, MapPin, Video, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Appointment } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

interface UpcomingAppointmentCardProps {
  appointments: Appointment[];
}

export function UpcomingAppointmentCard({
  appointments,
}: UpcomingAppointmentCardProps) {
  const upcoming = appointments
    .filter((a) => !a.completed && new Date(a.date).getTime() >= new Date().setHours(0, 0, 0, 0))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (!upcoming) return null;

  return (
    <Card className="shadow-sm border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Upcoming Medical Appointment
            </CardTitle>
          </div>
        </div>

        <Link
          href="/appointments"
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
        >
          All visits <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {upcoming.title}
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {upcoming.doctorName} {upcoming.specialty && `• ${upcoming.specialty}`}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-900">
                {formatDate(upcoming.date)} at {formatTime(upcoming.time)}
              </span>
              <span className="flex items-center gap-1">
                {upcoming.isVirtual ? (
                  <>
                    <Video className="h-3.5 w-3.5 text-teal-600" />
                    Telehealth consultation
                  </>
                ) : (
                  <>
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {upcoming.location}
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

