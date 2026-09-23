"use client";

import * as React from "react";
import { Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { GlucoseReading, UserProfile } from "@/types";
import { formatGlucoseValue, formatDate, formatTime, getGlucoseStatus } from "@/lib/utils";
import { toast } from "sonner";

interface GlucoseTableProps {
  readings: GlucoseReading[];
  user?: UserProfile | null;
  onRefresh?: () => void;
  onEditReading?: (reading: GlucoseReading) => void;
}

export function GlucoseTable({
  readings,
  user,
  onRefresh,
  onEditReading,
}: GlucoseTableProps) {
  const [filterContext, setFilterContext] = React.useState<string>("all");
  const [deleteTarget, setDeleteTarget] = React.useState<GlucoseReading | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const unit = user?.glucoseUnit || "mg/dL";

  const contexts = [
    { id: "all", label: "All Checks" },
    { id: "fasting", label: "Fasting" },
    { id: "after_meal", label: "After Meal" },
    { id: "before_meal", label: "Before Meal" },
    { id: "bedtime", label: "Bedtime" },
  ];

  const filtered = readings.filter((r) => {
    if (filterContext === "all") return true;
    return r.context === filterContext;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/glucose/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete reading");

      toast.success("Glucose reading deleted");
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      toast.error("Failed to delete reading");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Context Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {contexts.map((ctx) => (
            <button
              key={ctx.id}
              onClick={() => setFilterContext(ctx.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterContext === ctx.id
                  ? "bg-white text-indigo-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {ctx.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} entries
        </span>
      </div>

      {/* Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No readings found matching the selected context.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Level</th>
                  <th className="px-5 py-3.5">Context & Status</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reading) => {
                  const status = getGlucoseStatus(
                    reading.value,
                    reading.context,
                    user?.targetRange
                  );
                  const displayVal = formatGlucoseValue(reading.value, unit);

                  return (
                    <tr
                      key={reading.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Glucose Value */}
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        <span className="text-lg">{displayVal}</span>{" "}
                        <span className="text-xs font-normal text-slate-500">
                          {unit}
                        </span>
                      </td>

                      {/* Context & Badge */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs capitalize font-medium text-slate-700">
                            {reading.context.replace("_", " ")}
                          </span>
                          <Badge
                            variant={
                              status.variant === "target"
                                ? "target"
                                : status.variant === "warning"
                                ? "warning"
                                : status.variant === "high"
                                ? "high"
                                : "low"
                            }
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {formatDate(reading.date)}
                        </span>
                        <span className="block text-slate-400">
                          {formatTime(reading.time)}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                        {reading.notes || "—"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {onEditReading && (
                            <button
                              onClick={() => onEditReading(reading)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit reading"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTarget(reading)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete reading"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Glucose Reading"
        description={`Are you sure you want to remove this reading of ${
          deleteTarget ? formatGlucoseValue(deleteTarget.value, unit) : ""
        } ${unit}? This action cannot be undone.`}
        confirmLabel="Delete Reading"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}

