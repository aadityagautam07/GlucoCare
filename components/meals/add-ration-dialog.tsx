"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { rationItemSchema, RationItemInput } from "@/lib/validations";
import { toast } from "sonner";
import { Package } from "lucide-react";

interface AddRationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth?: string;
  onSuccess?: () => void;
}

function AddRationForm({
  defaultMonth,
  onClose,
  onSuccess,
}: {
  defaultMonth: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RationItemInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(rationItemSchema) as any,
    defaultValues: {
      name: "",
      category: "grains",
      allocatedQuantity: 1000,
      usedQuantity: 0,
      unit: "g",
      month: defaultMonth,
      notes: "",
    },
  });

  const onSubmit = async (data: RationItemInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/rations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create ration item");

      toast.success("Ration staple added", {
        description: `${data.name} (${data.allocatedQuantity} ${data.unit} for ${data.month})`,
      });

      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to add ration item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Staple Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Steel-cut Oats, Brown Rice, Moong Dal"
          {...register("name")}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-rose-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select id="category" {...register("category")}>
            <option value="grains">Whole Grains</option>
            <option value="pulses">Lentils & Pulses</option>
            <option value="nuts_seeds">Nuts & Seeds</option>
            <option value="oils">Healthy Oils</option>
            <option value="flours">Whole Flours</option>
            <option value="dairy">Dairy & Alternatives</option>
            <option value="other">Other Staples</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="month">Month (YYYY-MM) *</Label>
          <Input
            id="month"
            type="month"
            {...register("month")}
          />
          {errors.month && (
            <p className="text-xs text-rose-600">{errors.month.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="allocatedQuantity">Monthly Allocation *</Label>
          <Input
            id="allocatedQuantity"
            type="number"
            step="any"
            placeholder="e.g. 2000"
            {...register("allocatedQuantity", { valueAsNumber: true })}
          />
          {errors.allocatedQuantity && (
            <p className="text-xs text-rose-600">
              {errors.allocatedQuantity.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit *</Label>
          <Select id="unit" {...register("unit")}>
            <option value="g">grams (g)</option>
            <option value="kg">kilograms (kg)</option>
            <option value="ml">milliliters (ml)</option>
            <option value="L">liters (L)</option>
            <option value="packets">packets</option>
            <option value="cups">cups</option>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
        <Input
          id="lowStockThreshold"
          type="number"
          step="any"
          placeholder="e.g. 400 (leave empty for 20% default)"
          {...register("lowStockThreshold", {
            setValueAs: (v) => (v === "" ? null : Number(v)),
          })}
        />
        <p className="text-xs text-slate-500">
          Get a warning badge when remaining quantity drops below this value.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="e.g. Organic brand, low glycemic load batch"
          {...register("notes")}
        />
      </div>

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Add to Monthly Ration
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddRationDialog({
  open,
  onOpenChange,
  defaultMonth = new Date().toISOString().slice(0, 7),
  onSuccess,
}: AddRationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Monthly Ration</DialogTitle>
              <DialogDescription>
                Define a staple food supply quota for this month to monitor usage and plan healthy meals.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <AddRationForm
            defaultMonth={defaultMonth}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
