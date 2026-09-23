"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse, Plus, User, ShieldCheck } from "lucide-react";
import { UserProfile } from "@/types";

interface MobileHeaderProps {
  user?: UserProfile | null;
  onOpenQuickAction: () => void;
}

export function MobileHeader({ user, onOpenQuickAction }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-teal-600 text-white shadow-xs">
          <HeartPulse className="h-4 w-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900">
          Gluco<span className="text-teal-600">Care</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="flex h-8 items-center gap-1 px-2 rounded-lg bg-purple-100 text-purple-800 text-[11px] font-bold hover:bg-purple-200 transition-colors"
            title="Admin Portal"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
            <span>Admin</span>
          </Link>
        )}

        <button
          onClick={onOpenQuickAction}
          className="flex h-8 items-center gap-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Log</span>
        </button>

        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          title={user?.name || "Profile"}
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
        </Link>
      </div>
    </header>
  );
}

