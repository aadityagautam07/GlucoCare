"use client";

import * as React from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  TrendingDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RationItem, RationCategory } from "@/types";
import { AddRationDialog } from "./add-ration-dialog";
import { EditRationDialog } from "./edit-ration-dialog";
import { toast } from "sonner";

interface RationInventoryProps {
  rations: RationItem[];
  onRefresh?: () => void;
}

export function RationInventory({ rations, onRefresh }: RationInventoryProps) {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthStr);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<RationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<RationItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter by selected month
  const monthRations = rations.filter((r) => r.month === selectedMonth);

  // Filter by category
  const filteredRations =
    categoryFilter === "all"
      ? monthRations
      : monthRations.filter((r) => r.category === categoryFilter);

  // Compute metrics
  const totalItems = monthRations.length;
  const lowStockItems = monthRations.filter((r) => {
    const remaining = Math.max(0, r.allocatedQuantity - r.usedQuantity);
    const threshold = r.lowStockThreshold ?? r.allocatedQuantity * 0.2;
    return remaining <= threshold && remaining > 0;
  });
  const depletedItems = monthRations.filter(
    (r) => r.allocatedQuantity - r.usedQuantity <= 0
  );

  // Days remaining in month
  const now = new Date();
  const year = parseInt(selectedMonth.split("-")[0]);
  const month = parseInt(selectedMonth.split("-")[1]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = selectedMonth === currentMonthStr;
  const daysLeft = isCurrentMonth ? Math.max(0, daysInMonth - now.getDate()) : 0;

  const getCategoryLabel = (cat: RationCategory) => {
    switch (cat) {
      case "grains":
        return "Whole Grains";
      case "pulses":
        return "Lentils & Pulses";
      case "nuts_seeds":
        return "Nuts & Seeds";
      case "oils":
        return "Healthy Oils";
      case "flours":
        return "Whole Flours";
      case "dairy":
        return "Dairy";
      default:
        return "Staple";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/rations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete ration staple");
      toast.success("Ration staple removed");
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      toast.error("Failed to delete ration item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Month & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Household Pantry & Ration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your allocated diabetic staple supplies to prevent running out mid-month.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-200 font-semibold focus:outline-hidden"
            />
          </div>

          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            className="shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add Staple</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="shadow-xs border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Staples
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {totalItems}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Low Stock
              </span>
              <p
                className={`text-2xl font-bold mt-0.5 ${
                  lowStockItems.length > 0 ? "text-amber-600" : "text-slate-900"
                }`}
              >
                {lowStockItems.length}
              </p>
            </div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                lowStockItems.length > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Depleted
              </span>
              <p
                className={`text-2xl font-bold mt-0.5 ${
                  depletedItems.length > 0 ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {depletedItems.length}
              </p>
            </div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                depletedItems.length > 0
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {depletedItems.length > 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Month Pacing
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {isCurrentMonth ? `${daysLeft}d left` : "Archived"}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "All Staples" },
          { id: "grains", label: "Whole Grains" },
          { id: "pulses", label: "Lentils & Pulses" },
          { id: "nuts_seeds", label: "Nuts & Seeds" },
          { id: "oils", label: "Healthy Oils" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              categoryFilter === tab.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rations Grid */}
      {filteredRations.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <Package className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            No ration staples found for {selectedMonth}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Add Staple&quot; above to set up your monthly quota for oats, whole grains, lentils, or healthy fats.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            className="mt-4"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Staple</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRations.map((item) => {
            const remaining = Math.max(
              0,
              item.allocatedQuantity - item.usedQuantity
            );
            const percentRemaining = Math.max(
              0,
              Math.min(
                100,
                Math.round((remaining / item.allocatedQuantity) * 100)
              )
            );
            const percentUsed = 100 - percentRemaining;
            const threshold =
              item.lowStockThreshold ?? item.allocatedQuantity * 0.2;

            const isDepleted = remaining <= 0;
            const isLowStock = !isDepleted && remaining <= threshold;

            return (
              <Card
                key={item.id}
                className="shadow-xs border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3.5">
                  {/* Title & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {getCategoryLabel(item.category)}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                    </div>

                    {/* Stock Status Badge */}
                    {isDepleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Depleted
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Quantities & Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {remaining}{" "}
                        <span className="font-normal text-slate-500">
                          {item.unit} left
                        </span>
                      </span>
                      <span className="text-slate-500">
                        {item.allocatedQuantity} {item.unit} quota
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDepleted
                            ? "bg-rose-500"
                            : isLowStock
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${percentRemaining}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{percentRemaining}% remaining</span>
                      <span>{item.usedQuantity} {item.unit} ({percentUsed}%) consumed</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{item.notes}&quot;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditTarget(item)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      <span>Adjust / Restock</span>
                    </Button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete staple"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <AddRationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultMonth={selectedMonth}
        onSuccess={onRefresh}
      />

      {/* Edit Dialog */}
      <EditRationDialog
        ration={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Ration Staple"
        description={`Are you sure you want to remove ${deleteTarget?.name} from your ${deleteTarget?.month} ration list?`}
        confirmLabel="Remove Staple"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
