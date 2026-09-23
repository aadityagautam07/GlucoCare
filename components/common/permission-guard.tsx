import * as React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PermissionRestrictedProps {
  title?: string;
  description?: string;
  actionText?: string;
}

export function PermissionRestricted({
  title = "Feature Access Restricted",
  description = "Access to this section has been restricted for your account by your healthcare system administrator. Please reach out to your clinic or care team if you need this feature enabled.",
  actionText = "Back to Dashboard",
}: PermissionRestrictedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5 ring-8 ring-amber-500/5">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        {description}
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        {actionText}
      </Link>
    </div>
  );
}
