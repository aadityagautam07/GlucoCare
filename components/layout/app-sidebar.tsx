"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity as GlucoseIcon,
  Pill,
  Utensils,
  Footprints,
  Sparkles,
  Calendar,
  FileText,
  Settings,
  User,
  LogOut,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types";
import { toast } from "sonner";
import {
  CREATOR_INFO,
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
} from "@/components/common/creator-credit";

interface AppSidebarProps {
  user?: UserProfile | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Glucose", href: "/glucose", icon: GlucoseIcon },
    { label: "Medications", href: "/medications", icon: Pill },
    { label: "Meals", href: "/meals", icon: Utensils },
    { label: "Activity", href: "/activity", icon: Footprints },
    { label: "Insights", href: "/insights", icon: Sparkles },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Reports", href: "/reports", icon: FileText },
  ];

  const secondaryItems = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200/80 z-30 select-none">
      {/* Brand Wordmark & Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <HeartPulse className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              Gluco<span className="text-teal-600">Care</span>
            </span>
            <span className="text-[10px] font-medium text-slate-600 tracking-wider uppercase mt-0.5">
              Daily Companion
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Overview & Care
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-indigo-700" : "text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {user?.role === "admin" && (
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center justify-between">
              <span>Governance</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                PRO
              </span>
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                  pathname?.startsWith("/admin")
                    ? "bg-purple-50 text-purple-900 border border-purple-200/80 shadow-xs"
                    : "text-purple-700 hover:bg-purple-50/70"
                )}
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-purple-600" />
                <span>Admin Portal</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-purple-200/70 text-purple-900 uppercase tracking-wider">
                  Admin
                </span>
              </Link>
            </nav>
          </div>
        )}

        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Account & Preferences
          </div>
          <nav className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-indigo-700" : "text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/40">
        <span>By <strong className="text-slate-700">Aaditya Gautam</strong></span>
        <div className="flex items-center gap-2">
          <a
            href={CREATOR_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-800 transition-colors"
            title="GitHub"
          >
            <GithubIcon className="h-3 w-3" />
          </a>
          <a
            href={CREATOR_INFO.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-sky-600 transition-colors"
            title="LinkedIn"
          >
            <LinkedinIcon className="h-3 w-3" />
          </a>
          <a
            href={CREATOR_INFO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-pink-600 transition-colors"
            title="Instagram"
          >
            <InstagramIcon className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* User Profile Pill & Signout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <Link href="/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "PT"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || "Patient"}
                </p>
                {user?.role && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "doctor"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                {user?.diabetesType || "Type 2"} • {user?.glucoseUnit || "mg/dL"}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

