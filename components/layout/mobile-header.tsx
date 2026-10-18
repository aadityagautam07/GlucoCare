"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeartPulse, Plus, User, ShieldCheck, LogOut } from "lucide-react";
import { UserProfile } from "@/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";

interface MobileHeaderProps {
  user?: UserProfile | null;
  onOpenQuickAction: () => void;
}

export function MobileHeader({ user, onOpenQuickAction }: MobileHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-3.5 backdrop-blur-md">
      <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white shadow-xs">
          <HeartPulse className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Gluco<span className="text-teal-600 dark:text-teal-400">Care</span>
        </span>
      </Link>

      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle className="h-8 w-8" />
        {(user?.role === "admin" || user?.role === "doctor") && (
          <Link
            href="/admin"
            className="flex h-8 items-center gap-1 px-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[11px] font-bold hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
            title={user?.role === "doctor" ? "Clinical Patient Portal" : "Admin Portal"}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400" />
            <span className="hidden xs:inline">{user?.role === "doctor" ? "Doctor" : "Admin"}</span>
          </Link>
        )}

        <button
          onClick={onOpenQuickAction}
          className="flex h-8 items-center gap-1 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log</span>
        </button>

        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={user?.name || "Profile"}
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
        </Link>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          title="Sign out of account"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
