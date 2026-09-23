"use client";

import * as React from "react";
import {
  Bell,
  Scale,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UserProfile, GlucoseUnit } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SettingsViewProps {
  user: UserProfile;
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const [glucoseUnit, setGlucoseUnit] = React.useState<GlucoseUnit>(user.glucoseUnit);
  const [medReminders, setMedReminders] = React.useState(
    user.notifications?.medicationReminders ?? true
  );
  const [gluReminders, setGluReminders] = React.useState(
    user.notifications?.glucoseReminders ?? true
  );
  const [appReminders, setAppReminders] = React.useState(
    user.notifications?.appointmentReminders ?? true
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          glucoseUnit,
          notifications: {
            medicationReminders: medReminders,
            glucoseReminders: gluReminders,
            appointmentReminders: appReminders,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update settings");

      toast.success("Settings saved successfully");
      router.refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize notifications, measurement units, security, and privacy preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Measurement Units */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Measurement Units
              </CardTitle>
              <p className="text-xs text-slate-500">
                Configure your blood glucose unit across all charts, tables, and reports.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2 max-w-md">
              <Label htmlFor="unit-select">Blood Sugar Measurement Standard</Label>
              <Select
                id="unit-select"
                value={glucoseUnit}
                onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
              >
                <option value="mg/dL">mg/dL — Milligrams per deciliter</option>
                <option value="mmol/L">mmol/L — Millimoles per liter</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Reminders */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Notification Preferences
              </CardTitle>
              <p className="text-xs text-slate-500">
                Configure gentle reminders for daily routine tasks.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="medReminders"
                checked={medReminders}
                onCheckedChange={setMedReminders}
              />
              <div className="space-y-0.5">
                <Label htmlFor="medReminders" className="cursor-pointer text-sm font-semibold text-slate-800">
                  Medication Reminders
                </Label>
                <p className="text-xs text-slate-500">
                  Remind me when scheduled morning, evening, or bedtime medication doses are due.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="gluReminders"
                checked={gluReminders}
                onCheckedChange={setGluReminders}
              />
              <div className="space-y-0.5">
                <Label htmlFor="gluReminders" className="cursor-pointer text-sm font-semibold text-slate-800">
                  Glucose Check Prompts
                </Label>
                <p className="text-xs text-slate-500">
                  Daily prompts to record morning fasting levels and 2-hour post-meal checks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="appReminders"
                checked={appReminders}
                onCheckedChange={setAppReminders}
              />
              <div className="space-y-0.5">
                <Label htmlFor="appReminders" className="cursor-pointer text-sm font-semibold text-slate-800">
                  Appointment Alerts
                </Label>
                <p className="text-xs text-slate-500">
                  Advance notifications for upcoming medical check-ups and specialist visits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Health Data Policy */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Privacy & Medical Data Protection
              </CardTitle>
              <p className="text-xs text-slate-500">
                Your health data is completely private, isolated, and encrypted.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Session isolation: Your records are strictly scoped to your authenticated account.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>No URL health leak: Sensitive medical parameters are never passed via URL query strings.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Zero medical diagnosis claims: All summaries are strictly observational tracking aids.</span>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

