"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlucoseStatsCards } from "./glucose-stats-cards";
import { GlucoseTrendChart } from "@/components/dashboard/glucose-trend-chart";
import { GlucoseTable } from "./glucose-table";
import { AddGlucoseDialog } from "./add-glucose-dialog";
import { EditGlucoseDialog } from "./edit-glucose-dialog";
import { GlucoseReading, UserProfile } from "@/types";
import { useRouter } from "next/navigation";

interface GlucoseViewProps {
  user: UserProfile;
  readings: GlucoseReading[];
}

export function GlucoseView({ user, readings }: GlucoseViewProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editingReading, setEditingReading] = React.useState<GlucoseReading | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Blood Glucose Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log and review your blood sugar readings across fasting, meals, and bedtime.
          </p>
        </div>

        <Button onClick={() => setAddModalOpen(true)} className="shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Reading</span>
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <GlucoseStatsCards readings={readings} user={user} />

      {/* Large Interactive Trend Chart */}
      <GlucoseTrendChart
        readings={readings}
        user={user}
        onAddReading={() => setAddModalOpen(true)}
        title="Interactive Blood Glucose Log"
      />

      {/* Recent Readings History Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Readings History
        </h2>
        <GlucoseTable
          readings={readings}
          user={user}
          onRefresh={handleRefresh}
          onEditReading={(r) => setEditingReading(r)}
        />
      </div>

      {/* Add Reading Dialog */}
      <AddGlucoseDialog
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        defaultUnit={user.glucoseUnit}
        onSuccess={handleRefresh}
      />

      {/* Edit Reading Dialog */}
      <EditGlucoseDialog
        reading={editingReading}
        onClose={() => setEditingReading(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

