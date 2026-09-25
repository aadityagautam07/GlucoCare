"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextType | undefined>(undefined);

export function useSheet() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within a Sheet provider");
  }
  return context;
}

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  asChild,
  className,
  ...props
}: {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  [key: string]: unknown;
}) {
  const { onOpenChange } = useSheet();

  if (asChild && React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (children.props as any).onClick?.(e);
        onOpenChange(true);
      },
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetContent({
  side = "bottom",
  children,
  className,
}: {
  side?: "bottom" | "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  const { open, onOpenChange } = useSheet();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    bottom:
      "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200",
    right:
      "right-0 top-0 bottom-0 w-full max-w-md border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200",
    left:
      "left-0 top-0 bottom-0 w-full max-w-md border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl overflow-y-auto",
          sideClasses[side],
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Close sheet"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
}

