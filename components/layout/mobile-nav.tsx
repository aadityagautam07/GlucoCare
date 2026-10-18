"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types";

interface MobileNavProps {
  onOpenQuickAction: () => void;
  user?: UserProfile | null;
}

export function MobileNav({ onOpenQuickAction, user }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      setMoreOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const moreLinks = [
    { label: "Medications", href: "/medications", icon: Pill },
    { label: "Meals", href: "/meals", icon: Utensils },
    { label: "Activity", href: "/activity", icon: Footprints },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Doctor Reports", href: "/reports", icon: FileText },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (user?.role === "admin" || user?.role === "doctor") {
    moreLinks.unshift({
      label: user?.role === "doctor" ? "Doctor Portal" : "Admin Portal",
      href: "/admin",
      icon: ShieldCheck,
    });
  }

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-md pb-safe">
        <div className="flex h-16 items-center justify-around px-2 relative max-w-md mx-auto">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              pathname === "/dashboard"
                ? "text-indigo-700 dark:text-indigo-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
                ? "text-indigo-700 dark:text-indigo-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
            <span className="text-[10px] -mt-2 font-medium text-slate-600 dark:text-slate-400">Log</span>
          </div>

          {/* Insights */}
          <Link
            href="/insights"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 transition-colors",
              pathname?.startsWith("/insights")
                ? "text-indigo-700 dark:text-indigo-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
              moreOpen ? "text-indigo-700 dark:text-indigo-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
          <div className="relative z-50 bg-white dark:bg-slate-900 rounded-t-3xl p-6 border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto mb-16 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                All Health Portals & Tools
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
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
                        ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 shadow-xs"
                        : "border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-indigo-700 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Session & Logout Panel */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {user && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : "PT"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {user.role && (
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0",
                        user.role === "admin"
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                          : user.role === "doctor"
                          ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
              )}

              {/* Prominent Red Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-[0.99] transition-all shadow-xs"
              >
                <LogOut className="h-4 w-4 stroke-[2.5]" />
                <span>{isLoggingOut ? "Signing out..." : "Log Out of GlucoCare"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
