import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "teal";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default:
        "bg-indigo-700 text-white shadow-sm hover:bg-indigo-800 active:scale-[0.98]",
      secondary:
        "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98]",
      outline:
        "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-[0.98]",
      ghost:
        "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
      destructive:
        "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98]",
      link:
        "text-indigo-600 underline-offset-4 hover:underline p-0 h-auto",
      teal:
        "bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:scale-[0.98]",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm rounded-xl",
      sm: "h-8 px-3 text-xs rounded-lg",
      lg: "h-12 px-6 text-base rounded-xl font-semibold",
      icon: "h-10 w-10 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

