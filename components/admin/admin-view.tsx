"use client";

import * as React from "react";
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Stethoscope,
  Activity,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminUserSummary, AdminSystemStats, UserRole, UserStatus } from "@/types";
import { UserPermissionsDialog } from "./user-permissions-dialog";
import { CreateUserDialog } from "./create-user-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


interface PatientInspectData {
  user: AdminUserSummary;
  recentActivity: {
    readings: Array<{ id: string; value: number; unit: string; context: string; date: string; time: string }>;
    medications: Array<{ id: string; name: string; dosage: string; frequency: string }>;
    meals: Array<{ id: string; mealType: string; description: string; date: string }>;
    rations: Array<{ id: string; name: string; allocatedQuantity: number; usedQuantity: number; unit: string }>;
  };
}

export function AdminView() {
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
  const [inspectedPatient, setInspectedPatient] = React.useState<PatientInspectData | null>(null);
  const [inspectLoading, setInspectLoading] = React.useState(false);

  // Delete dialog state
  const [deleteUserId, setDeleteUserId] = React.useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

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
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (!res.ok) throw new Error("Failed to load user activity");
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }
      toast.success("User removed successfully");
      if (inspectedPatient?.user.id === deleteUserId) {
        setInspectedPatient(null);
      }
      fetchUsersAndStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteUserId(null);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" />
            System Administration Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Rights & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Govern user permissions, restrict or grant module rights, and monitor live healthcare activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsersAndStats}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateUserDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Provision User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalUsers ?? users.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">{stats?.activePatients ?? 0} active</span>
            <span>•</span>
            <span className="text-rose-500 font-medium">{stats?.suspendedUsers ?? 0} suspended</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Patients</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.activePatients ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Patients tracking daily health metrics
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Clinical Staff & Admins</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {(stats?.totalDoctors ?? 0) + (stats?.totalAdmins ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.totalDoctors ?? 0} Doctors • {stats?.totalAdmins ?? 0} Admins
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Glucose Readings</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalReadingsLogged ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Aggregated across all registered patients
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email address..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Administrators</option>
              <option value="caregiver">Caregivers</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Registered Accounts ({filteredUsers.length})
          </h3>
          <span className="text-xs text-slate-500">
            Click &quot;Edit Rights&quot; to customize permissions for any account
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <th className="px-6 py-3">User & Contact</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Granular Rights</th>
                <th className="px-4 py-3">Readings</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const permissionsCount = Object.values(u.permissions || {}).filter(Boolean).length;
                  const totalRights = 8;
                  const isRestricted = permissionsCount < totalRights;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center uppercase text-xs shrink-0 border border-slate-200">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className={`capitalize font-semibold text-[11px] px-2 py-0.5 ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 border-purple-200"
                              : u.role === "doctor"
                              ? "bg-teal-100 text-teal-800 border-teal-200"
                              : u.role === "caregiver"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Rights / Permissions Status */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-800">
                            {u.role === "admin" ? (
                              <span className="text-purple-700 font-semibold">Master (All Rights)</span>
                            ) : (
                              <span>
                                {permissionsCount} of {totalRights} active
                              </span>
                            )}
                          </span>
                          {isRestricted && u.role !== "admin" && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              Some features restricted
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Readings */}
                      <td className="px-4 py-4 text-slate-600">
                        {u.readingsCount ?? 0} logs
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUserForRights(u);
                              setPermissionsDialogOpen(true);
                            }}
                            className="h-7 text-xs gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            title="Configure role, status, and rights"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            Edit Rights
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInspectUser(u)}
                            className="h-7 text-xs gap-1 text-slate-600 hover:text-slate-900"
                            title="Inspect health activity"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeleteUserId(u.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Patient Health Inspector Drawer / Box */}
      {inspectedPatient && (
        <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Live Patient Health Records Inspector
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {inspectedPatient.user.name} ({inspectedPatient.user.email})
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectedPatient(null)}
              className="text-xs"
            >
              Close Inspector
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Recent Glucose Readings
              </span>
              <div className="text-xl font-bold text-slate-900">
                {inspectedPatient.recentActivity.readings.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {inspectedPatient.recentActivity.readings[0]
                  ? `Latest: ${inspectedPatient.recentActivity.readings[0].value} mg/dL`
                  : "No readings recorded"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Prescribed Medications
              </span>
              <div className="text-xl font-bold text-slate-900">
                {inspectedPatient.recentActivity.medications.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {inspectedPatient.recentActivity.medications.map((m) => m.name).join(", ") ||
                  "No medications"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Logged Meals
              </span>
              <div className="text-xl font-bold text-slate-900">
                {inspectedPatient.recentActivity.meals.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {inspectedPatient.recentActivity.meals[0]?.description || "No recent meals logged"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Monthly Ration Items
              </span>
              <div className="text-xl font-bold text-slate-900">
                {inspectedPatient.recentActivity.rations.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ration tracking:{" "}
                {inspectedPatient.user.permissions.canManageRation ? "Enabled" : "Restricted by Admin"}
              </p>
            </div>
          </div>
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
