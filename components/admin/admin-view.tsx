"use client";

import * as React from "react";
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Stethoscope,
  Activity as ActivityIcon,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Sliders,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Utensils,
  Pill,
  Footprints,
  Calendar,
  FileText,
  Clock,
  TrendingUp,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AdminUserSummary,
  AdminSystemStats,
  UserRole,
  UserStatus,
  UserProfile,
  GlucoseReading,
  Medication,
  MedicationLog,
  Meal,
  Activity,
  Appointment,
  RationItem,
  DailyLogRecord,
  LabReport,
} from "@/types";
import { UserPermissionsDialog } from "./user-permissions-dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatTime } from "@/lib/utils";

interface PatientDossierResponse {
  user: UserProfile;
  dossier: {
    user: UserProfile;
    glucose: GlucoseReading[];
    medications: Medication[];
    medicationLogs: MedicationLog[];
    meals: Meal[];
    activities: Activity[];
    appointments: Appointment[];
    rations: RationItem[];
    dailyLogs: DailyLogRecord[];
    labReports: LabReport[];
    metrics: {
      totalReadings: number;
      avgGlucose: number;
      totalMinsActive: number;
      totalSteps: number;
      avgAdherence: number;
      activeMedsCount: number;
      mealsLoggedCount: number;
      labReportsCount: number;
    };
  };
  recentActivity: {
    readings: GlucoseReading[];
    medications: Medication[];
    medicationLogs: MedicationLog[];
    meals: Meal[];
    activities: Activity[];
    appointments: Appointment[];
    rations: RationItem[];
    dailyLogs: DailyLogRecord[];
    labReports: LabReport[];
    metrics: {
      totalReadings: number;
      avgGlucose: number;
      totalMinsActive: number;
      totalSteps: number;
      avgAdherence: number;
      activeMedsCount: number;
      mealsLoggedCount: number;
      labReportsCount: number;
    };
  };
}

export function AdminView({ currentUser }: { currentUser?: UserProfile | null }) {
  const [users, setUsers] = React.useState<AdminUserSummary[]>([]);
  const [stats, setStats] = React.useState<AdminSystemStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Dialog state
  const [selectedUserForRights, setSelectedUserForRights] = React.useState<AdminUserSummary | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = React.useState(false);

  // Patient inspector state
  const [inspectedPatient, setInspectedPatient] = React.useState<PatientDossierResponse | null>(null);
  const [inspectLoading, setInspectLoading] = React.useState(false);
  const [inspectActiveTab, setInspectActiveTab] = React.useState<
    "overview" | "glucose" | "meals" | "medications" | "activity" | "routines" | "reports"
  >("overview");

  // Delete dialog state
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

  const isDoctorUser = currentUser?.role === "doctor";

  const fetchUsersAndStats = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error fetching admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsersAndStats();
  }, [fetchUsersAndStats]);

  const handleInspectUser = async (user: AdminUserSummary) => {
    setInspectLoading(true);
    setInspectActiveTab("overview");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (!res.ok) throw new Error("Failed to load user activity dossier");
      const data = await res.json();
      setInspectedPatient(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to inspect patient data");
    } finally {
      setInspectLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete user account");
      }
      toast.success("User account deleted successfully");
      setDeleteUserId(null);
      fetchUsersAndStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isDoctorUser ? "Clinician & Patient Records Portal" : "Admin & Governance Portal"}
            </h1>
            <Badge
              variant="default"
              className={
                isDoctorUser
                  ? "bg-teal-600 text-white"
                  : "bg-purple-600 text-white"
              }
            >
              {isDoctorUser ? "DOCTOR ACCESS" : "SYSTEM ADMIN"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isDoctorUser
              ? "Review comprehensive patient-side health logs, track daily compliance, and monitor clinical trends."
              : "Manage user permissions, monitor system-wide patient activity logs, and configure access rights."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsersAndStats}
            disabled={loading}
            className="border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {!isDoctorUser && (
            <Button
              onClick={() => setCreateUserDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metric Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Accounts
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.totalUsers}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Platform users</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Active Patients
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.activePatients}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Logging data</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              Doctors / Clinicians
            </span>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {stats.totalDoctors}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Medical staff</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              Administrators
            </span>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.totalAdmins}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Full rights</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Glucose Readings
            </span>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.totalReadingsLogged}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Recorded in database</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Prescriptions Tracked
            </span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {stats.totalMedicationsTracked}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Active schedules</span>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patient & User Directory Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Patient & User Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredUsers.length} of {users.length} registered accounts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User / Patient</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Diabetes Profile</th>
                <th className="px-4 py-3.5">Activity Logs</th>
                <th className="px-6 py-3.5 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading user records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users matching criteria. Try adjusting your search or filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        {u.role === "admin" ? (
                          <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : u.role === "doctor" ? (
                          <Badge className="bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                            <Stethoscope className="w-3 h-3 mr-1" />
                            Doctor
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-semibold text-slate-600 dark:text-slate-300">
                            Patient
                          </Badge>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {u.status === "suspended" ? (
                          <Badge variant="high" className="font-bold">
                            <UserX className="w-3 h-3 mr-1" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </td>

                      {/* Diabetes Type */}
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        {u.diabetesType || "Type 2"}
                      </td>

                      {/* Readings */}
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs">
                          <ActivityIcon className="w-3 h-3 text-indigo-600" />
                          {u.readingsCount ?? 0} glucose logs
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleInspectUser(u)}
                            className="h-8 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                            title="Inspect full patient activity logs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Patient Logs</span>
                          </Button>

                          {!isDoctorUser && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForRights(u);
                                  setPermissionsDialogOpen(true);
                                }}
                                className="h-8 text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                title="Configure role, status, and rights"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Rights</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteUserId(u.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE DOCTOR PATIENT ACTIVITY DOSSIER MODAL */}
      {inspectedPatient && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-xl space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <Stethoscope className="w-4 h-4" />
                Comprehensive Clinical Patient Dossier & Logs
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {inspectedPatient.user.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Email: {inspectedPatient.user.email} &bull; Profile: {inspectedPatient.user.diabetesType} &bull; Unit: {inspectedPatient.user.glucoseUnit} &bull; User ID: {inspectedPatient.user.id}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectedPatient(null)}
              className="text-xs border-slate-200 dark:border-slate-700 self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Close Clinical Dossier
            </Button>
          </div>

          {/* Clinical Metrics Snapshot Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Total Readings
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {inspectedPatient.recentActivity.metrics?.totalReadings ?? inspectedPatient.recentActivity.readings.length}
              </div>
              <span className="text-[10px] text-slate-400">Recorded glucose</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Average Glucose
              </span>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {inspectedPatient.recentActivity.metrics?.avgGlucose || 128} mg/dL
              </div>
              <span className="text-[10px] text-slate-400">Cohort benchmark</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Active Prescriptions
              </span>
              <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
                {inspectedPatient.recentActivity.medications.length}
              </div>
              <span className="text-[10px] text-slate-400">Medications</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Meals Logged
              </span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {inspectedPatient.recentActivity.meals.length}
              </div>
              <span className="text-[10px] text-slate-400">Nutrition diary</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Activities Logged
              </span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {inspectedPatient.recentActivity.activities.length}
              </div>
              <span className="text-[10px] text-slate-400">Workouts & walks</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Care Adherence
              </span>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {inspectedPatient.recentActivity.metrics?.avgAdherence || 88}%
              </div>
              <span className="text-[10px] text-slate-400">Daily routine score</span>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setInspectActiveTab("overview")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "overview"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("glucose")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "glucose"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <ActivityIcon className="w-3.5 h-3.5" />
              <span>Glucose Log ({inspectedPatient.recentActivity.readings.length})</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("meals")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "meals"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Meals & Pantry ({inspectedPatient.recentActivity.meals.length})</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("medications")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "medications"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Medications ({inspectedPatient.recentActivity.medications.length})</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("activity")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "activity"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Activity Log ({inspectedPatient.recentActivity.activities.length})</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("routines")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "routines"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Care Routine & Adherence</span>
            </button>

            <button
              onClick={() => setInspectActiveTab("reports")}
              className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                inspectActiveTab === "reports"
                  ? "border-teal-600 text-teal-700 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lab Reports & Appts</span>
            </button>
          </div>

          {/* TAB: OVERVIEW */}
          {inspectActiveTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Patient Health Targets
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Fasting Target Range</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {inspectedPatient.user.targetRange?.fastingMin ?? 70} - {inspectedPatient.user.targetRange?.fastingMax ?? 130} mg/dL
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Post-Meal Cap</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      &lt; {inspectedPatient.user.targetRange?.postMealMax ?? 180} mg/dL
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Preferred Unit</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {inspectedPatient.user.glucoseUnit || "mg/dL"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Diagnosis</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {inspectedPatient.user.diabetesType || "Type 2"}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pt-2">
                  Active Prescriptions
                </h4>
                <div className="space-y-2">
                  {inspectedPatient.recentActivity.medications.length === 0 ? (
                    <p className="text-xs text-slate-500">No active prescriptions.</p>
                  ) : (
                    inspectedPatient.recentActivity.medications.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                        </div>
                        <span className="text-slate-500">
                          {m.dosage} &bull; {m.frequency}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Glucose Readings
                </h4>
                <div className="space-y-2">
                  {inspectedPatient.recentActivity.readings.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-indigo-600 dark:text-indigo-400">
                          {r.value}
                        </span>
                        <span className="text-slate-400 font-medium">{r.unit}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {r.context.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {formatDate(r.date)} {r.time}
                      </span>
                    </div>
                  ))}
                  {inspectedPatient.recentActivity.readings.length === 0 && (
                    <p className="text-xs text-slate-500">No glucose readings logged yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GLUCOSE */}
          {inspectActiveTab === "glucose" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                All Recorded Blood Glucose Entries ({inspectedPatient.recentActivity.readings.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Glucose Level</th>
                      <th className="px-4 py-2.5">Context</th>
                      <th className="px-4 py-2.5">Status Flag</th>
                      <th className="px-4 py-2.5">Patient Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inspectedPatient.recentActivity.readings.map((r) => {
                      const isHigh = r.value > 180;
                      const isLow = r.value < 70;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-medium">
                            {formatDate(r.date)} at {r.time}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-sm text-slate-900 dark:text-white">
                            {r.value} <span className="text-xs font-normal text-slate-400">{r.unit}</span>
                          </td>
                          <td className="px-4 py-2.5 capitalize text-slate-600 dark:text-slate-300">
                            {r.context.replace("_", " ")}
                          </td>
                          <td className="px-4 py-2.5">
                            {isHigh ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                ELEVATED
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                                LOW SUGAR
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                IN TARGET
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400 italic">
                            {r.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MEALS */}
          {inspectActiveTab === "meals" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Food Diary & Nutrition Logs ({inspectedPatient.recentActivity.meals.length})
              </h4>
              <div className="space-y-2">
                {inspectedPatient.recentActivity.meals.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold uppercase text-[10px]">
                          {m.mealType}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {m.description}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        {formatDate(m.date)} at {m.time}
                        {m.notes && <span className="ml-2 italic">&bull; &quot;{m.notes}&quot;</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-300">
                      {m.carbohydrates !== undefined && (
                        <span>{m.carbohydrates}g carbs</span>
                      )}
                      {m.calories !== undefined && (
                        <span>{m.calories} kcal</span>
                      )}
                      {m.protein !== undefined && (
                        <span>{m.protein}g protein</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MEDICATIONS */}
          {inspectActiveTab === "medications" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Active Prescriptions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectedPatient.recentActivity.medications.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600" />
                        {m.name}
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        <strong>Dosage:</strong> {m.dosage} &bull; <strong>Frequency:</strong> {m.frequency}
                      </div>
                      {m.instructions && (
                        <div className="text-slate-500 italic">Instructions: {m.instructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Dose Execution Log ({inspectedPatient.recentActivity.medicationLogs?.length || 0})
                </h4>
                <div className="space-y-1.5">
                  {inspectedPatient.recentActivity.medicationLogs?.slice(0, 10).map((l) => (
                    <div
                      key={l.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {l.medicationName || "Prescription Dose"}
                      </span>
                      <span className="text-slate-400">
                        Scheduled: {new Date(l.scheduledAt).toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          l.status === "taken"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {inspectActiveTab === "activity" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Physical Activity & Workout Sessions ({inspectedPatient.recentActivity.activities.length})
              </h4>
              <div className="space-y-2">
                {inspectedPatient.recentActivity.activities.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">
                          {a.activityType} ({a.durationMinutes} minutes)
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {formatDate(a.date)} at {a.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {a.steps && <div className="font-bold text-slate-900 dark:text-white">{a.steps.toLocaleString()} steps</div>}
                      {a.notes && <div className="text-slate-400 italic text-[11px]">&quot;{a.notes}&quot;</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ROUTINES & CHECKLIST */}
          {inspectActiveTab === "routines" && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Routine Adherence & Checklist Records
              </h4>
              <div className="space-y-2">
                {inspectedPatient.recentActivity.dailyLogs?.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Date: {formatDate(l.date)} &bull; Day Mode: {l.dayMode || "workday"}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Tasks Completed: {l.tasksCompleted} / {l.totalTasks}
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-sm text-teal-600 dark:text-teal-400">
                      {l.adherencePercentage}% Compliance
                    </div>
                  </div>
                ))}
                {(!inspectedPatient.recentActivity.dailyLogs || inspectedPatient.recentActivity.dailyLogs.length === 0) && (
                  <p className="text-xs text-slate-500">No daily logs recorded yet for this patient.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: LAB REPORTS & APPOINTMENTS */}
          {inspectActiveTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Lab & Diagnostic Reports ({inspectedPatient.recentActivity.labReports?.length || 0})
                </h4>
                <div className="space-y-2">
                  {inspectedPatient.recentActivity.labReports?.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        {r.title}
                      </div>
                      <div className="text-slate-500">
                        {r.doctorOrLab} &bull; {formatDate(r.date)} &bull; Category: {r.category}
                      </div>
                      {r.summaryMetrics && <div className="text-slate-700 dark:text-slate-300 font-medium">{r.summaryMetrics}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Appointments ({inspectedPatient.recentActivity.appointments?.length || 0})
                </h4>
                <div className="space-y-2">
                  {inspectedPatient.recentActivity.appointments?.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {app.doctorName} {app.specialty ? `(${app.specialty})` : ""}
                      </div>
                      <div className="text-slate-500">
                        {formatDate(app.date)} at {app.time} &bull; {app.location}
                      </div>
                      {app.title && <div className="text-slate-600 dark:text-slate-300">{app.title}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permissions & Rights Dialog */}
      <UserPermissionsDialog
        user={selectedUserForRights}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        onSaved={fetchUsersAndStats}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        onCreated={fetchUsersAndStats}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User Account"
        description="Are you sure you want to permanently delete this user and all their associated health records? This action cannot be undone."
        confirmLabel="Delete Account"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
