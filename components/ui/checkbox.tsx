"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  id,
  className,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border border-slate-300 dark:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
        checked
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600",
        className
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
    </button>
  );
}

