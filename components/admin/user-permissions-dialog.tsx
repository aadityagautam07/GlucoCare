"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield,
  Activity,
  Pill,
  Utensils,
  Package,
  Footprints,
  Calendar,
  FileText,
  Download,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { AdminUserSummary, UserRole, UserStatus, UserPermissions } from "@/types";

interface UserPermissionsDialogProps {
  user: AdminUserSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const PERMISSION_CONFIG: {
  key: keyof UserPermissions;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "canLogGlucose",
    label: "Blood Glucose Logging",
    description: "Record, edit, and delete blood glucose measurements",
    icon: Activity,
  },
  {
    key: "canManageMedications",
    label: "Medication Management",
    description: "Add prescription schedules and log dose compliance",
    icon: Pill,
  },
  {
    key: "canLogMeals",
    label: "Meals & Nutrition Log",
    description: "Record breakfast, lunch, dinner, snacks, and carbs",
    icon: Utensils,
  },
  {
    key: "canManageRation",
    label: "Monthly Ration Tracking",
    description: "Configure monthly ration stock and auto-deduct quotas",
    icon: Package,
  },
  {
    key: "canLogActivity",
    label: "Physical Activity Tracking",
    description: "Record workouts, walking duration, and daily steps",
    icon: Footprints,
  },
  {
    key: "canManageAppointments",
    label: "Doctor Appointments",
    description: "Schedule consultations and clinical checkups",
    icon: Calendar,
  },
  {
    key: "canViewReports",
    label: "Clinical Health Reports",
    description: "Generate and review printable physician summaries",
    icon: FileText,
  },
  {
    key: "canExportData",
    label: "Data Export",
    description: "Download CSV and clinical report summaries",
    icon: Download,
  },
];

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: UserPermissionsDialogProps) {
  const [role, setRole] = React.useState<UserRole>("patient");
  const [status, setStatus] = React.useState<UserStatus>("active");
  const [permissions, setPermissions] = React.useState<UserPermissions>({
    canLogGlucose: true,
    canManageMedications: true,
    canLogMeals: true,
    canManageRation: true,
    canLogActivity: true,
    canManageAppointments: true,
    canViewReports: true,
    canExportData: true,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setRole(user.role || "patient");
      setStatus(user.status || "active");
      setPermissions(
        user.permissions || {
          canLogGlucose: true,
          canManageMedications: true,
          canLogMeals: true,
          canManageRation: true,
          canLogActivity: true,
          canManageAppointments: true,
          canViewReports: true,
          canExportData: true,
        }
      );
    }
  }, [user]);

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setAllPermissions = (value: boolean) => {
    const updated: UserPermissions = {
      canLogGlucose: value,
      canManageMedications: value,
      canLogMeals: value,
      canManageRation: value,
      canLogActivity: value,
      canManageAppointments: value,
      canViewReports: value,
      canExportData: value,
    };
    setPermissions(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          status,
          permissions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update rights");
      }

      toast.success(`Access rights updated for ${user.name}`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user rights");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Manage Access Rights & Permissions</DialogTitle>
              <DialogDescription>
                Configure role, account standing, and granular permissions for{" "}
                <span className="font-semibold text-slate-800">{user.name}</span> ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Role and Account Status Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Assigned Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["patient", "doctor", "caregiver", "admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all text-left flex items-center justify-between ${
                      role === r
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span>{r}</span>
                    {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Standing
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("active")}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    status === "active"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Active</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("suspended")}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    status === "suspended"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suspended</span>
                </button>
              </div>
              {status === "suspended" && (
                <p className="text-[11px] text-rose-600 mt-2">
                  Suspended accounts are instantly locked out and prevented from signing in or syncing data.
                </p>
              )}
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Granular Module Rights</h4>
              <p className="text-xs text-slate-500">
                Choose exactly what features this user can access or operate.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => setAllPermissions(true)}
              >
                Grant All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-slate-500 hover:text-slate-700"
                onClick={() => setAllPermissions(false)}
              >
                Revoke All
              </Button>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERMISSION_CONFIG.map(({ key, label, description, icon: Icon }) => {
              const isEnabled = permissions[key];
              return (
                <div
                  key={key}
                  onClick={() => togglePermission(key)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isEnabled
                      ? "bg-white border-indigo-200/80 shadow-xs hover:border-indigo-400"
                      : "bg-slate-50/80 border-slate-200 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isEnabled ? "bg-indigo-50 text-indigo-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold ${isEnabled ? "text-slate-900" : "text-slate-600"}`}>
                        {label}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 font-medium ${
                          isEnabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isEnabled ? "Allowed" : "Restricted"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {saving ? "Saving Changes..." : "Save User Rights"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

