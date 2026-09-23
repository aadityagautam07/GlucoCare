"use client";

import * as React from "react";
import { AppSidebar } from "./app-sidebar";
import { MobileHeader } from "./mobile-header";
import { MobileNav } from "./mobile-nav";
import { QuickActionSheet } from "./quick-action-sheet";
import { AddGlucoseDialog } from "@/components/glucose/add-glucose-dialog";
import { AddMedicationDialog } from "@/components/medications/add-medication-dialog";
import { AddMealDialog } from "@/components/meals/add-meal-dialog";
import { AddActivityDialog } from "@/components/activity/add-activity-dialog";
import { UserProfile } from "@/types";
import { useRouter } from "next/navigation";

interface DashboardShellProps {
  user: UserProfile | null;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const [quickSheetOpen, setQuickSheetOpen] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<
    "glucose" | "medication" | "meal" | "activity" | null
  >(null);

  const handleSelectQuickAction = (action: "glucose" | "medication" | "meal" | "activity") => {
    setActiveModal(action);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Desktop Sidebar */}
      <AppSidebar user={user} />

      {/* Mobile Top Header */}
      <MobileHeader
        user={user}
        onOpenQuickAction={() => setQuickSheetOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickAction={() => setQuickSheetOpen(true)} />

      {/* Central Quick Action Sheet */}
      <QuickActionSheet
        open={quickSheetOpen}
        onOpenChange={setQuickSheetOpen}
        onSelectAction={handleSelectQuickAction}
      />

      {/* Global Quick Action Dialogs */}
      <AddGlucoseDialog
        open={activeModal === "glucose"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        defaultUnit={user?.glucoseUnit || "mg/dL"}
        onSuccess={handleRefresh}
      />

      <AddMedicationDialog
        open={activeModal === "medication"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleRefresh}
      />

      <AddMealDialog
        open={activeModal === "meal"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleRefresh}
      />

      <AddActivityDialog
        open={activeModal === "activity"}
        onOpenChange={(open) => !open && setActiveModal(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

