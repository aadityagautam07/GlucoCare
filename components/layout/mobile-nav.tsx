"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity as GlucoseIcon,
  Plus,
  Sparkles,
  Menu,
  Pill,
  Utensils,
  Footprints,
  Calendar,
  FileText,
  Settings,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onOpenQuickAction: () => void;
}

export function MobileNav({ onOpenQuickAction }: MobileNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const moreLinks = [
    { label: "Medications", href: "/medications", icon: Pill },
    { label: "Meals", href: "/meals", icon: Utensils },
    { label: "Activity", href: "/activity", icon: Footprints },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Doctor Reports", href: "/reports", icon: FileText },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-slate-200/80 backdrop-blur-md pb-safe">
        <div className="flex h-16 items-center justify-around px-2 relative max-w-md mx-auto">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              pathname === "/dashboard"
                ? "text-indigo-700 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[11px] mt-1 font-medium">Home</span>
          </Link>

          {/* Glucose */}
          <Link
            href="/glucose"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              pathname?.startsWith("/glucose")
                ? "text-indigo-700 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <GlucoseIcon className="h-5 w-5" />
            <span className="text-[11px] mt-1 font-medium">Glucose</span>
          </Link>

          {/* Central Prominent Quick Action Button */}
          <div className="flex flex-col items-center justify-center flex-1">
            <button
              type="button"
              onClick={onOpenQuickAction}
              aria-label="Add health entry"
              className="relative -top-3 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] -mt-2 font-medium text-slate-600">Log</span>
          </div>

          {/* Insights */}
          <Link
            href="/insights"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              pathname?.startsWith("/insights")
                ? "text-indigo-700 font-semibold"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[11px] mt-1 font-medium">Insights</span>
          </Link>

          {/* More Menu */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              moreOpen ? "text-indigo-700 font-semibold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[11px] mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* More Navigation Drawer Modal for Mobile */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-50 bg-white rounded-t-3xl p-6 border-t border-slate-200 shadow-2xl max-h-[80vh] overflow-y-auto mb-16 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Additional Sections
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all",
                      isActive
                        ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs"
                        : "border-slate-100 bg-slate-50/70 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-indigo-700" : "text-slate-500"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

