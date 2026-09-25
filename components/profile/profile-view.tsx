"use client";

import * as React from "react";
import { User, Target, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UserProfile, DiabetesType, GlucoseUnit } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreatorProfileCard } from "./creator-profile-card";

interface ProfileViewProps {
  user: UserProfile;
}

export function ProfileView({ user }: ProfileViewProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const [name, setName] = React.useState(user.name);
  const [email] = React.useState(user.email);
  const [diabetesType, setDiabetesType] = React.useState<DiabetesType>(user.diabetesType);
  const [glucoseUnit, setGlucoseUnit] = React.useState<GlucoseUnit>(user.glucoseUnit);

  const [fastingMin, setFastingMin] = React.useState(user.targetRange?.fastingMin ?? 70);
  const [fastingMax, setFastingMax] = React.useState(user.targetRange?.fastingMax ?? 130);
  const [postMealMax, setPostMealMax] = React.useState(user.targetRange?.postMealMax ?? 180);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          diabetesType,
          glucoseUnit,
          targetRange: {
            fastingMin: Number(fastingMin),
            fastingMax: Number(fastingMax),
            postMealMax: Number(postMealMax),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile preferences updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Patient Profile & Targets
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal diabetes management profile and personalized glucose target ranges.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <Card className="shadow-xs border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Personal Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="diabetesType">Diabetes Type</Label>
                <Select
                  id="diabetesType"
                  value={diabetesType}
                  onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
                >
                  <option value="Type 2">Type 2 Diabetes</option>
                  <option value="Type 1">Type 1 Diabetes</option>
                  <option value="Prediabetes">Prediabetes</option>
                  <option value="Gestational">Gestational Diabetes</option>
                  <option value="Other">Other / Unspecified</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="glucoseUnit">Preferred Glucose Unit</Label>
                <Select
                  id="glucoseUnit"
                  value={glucoseUnit}
                  onChange={(e) => setGlucoseUnit(e.target.value as GlucoseUnit)}
                >
                  <option value="mg/dL">mg/dL (Standard in US, India, etc.)</option>
                  <option value="mmol/L">mmol/L (Standard in UK, Canada, Australia)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalized Target Ranges */}
        <Card className="shadow-xs border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Target Glucose Ranges (in mg/dL)
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configured with your healthcare team to establish your personalized &quot;in-target&quot; zones.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fastingMin">Fasting Minimum</Label>
                <Input
                  id="fastingMin"
                  type="number"
                  value={fastingMin}
                  onChange={(e) => setFastingMin(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Default: 70 mg/dL</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fastingMax">Fasting Maximum</Label>
                <Input
                  id="fastingMax"
                  type="number"
                  value={fastingMax}
                  onChange={(e) => setFastingMax(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Default: 130 mg/dL</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="postMealMax">Post-Meal Maximum</Label>
                <Input
                  id="postMealMax"
                  type="number"
                  value={postMealMax}
                  onChange={(e) => setPostMealMax(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Default: 180 mg/dL</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Developer & Contact Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <CreatorProfileCard />
      </div>
    </div>
  );
}

