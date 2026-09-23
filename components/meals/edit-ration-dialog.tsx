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
import { RationItem } from "@/types";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

interface EditRationDialogProps {
  ration: RationItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function EditRationForm({
  ration,
  onClose,
  onSuccess,
}: {
  ration: RationItem;
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
      name: ration.name,
      category: ration.category,
      allocatedQuantity: ration.allocatedQuantity,
      usedQuantity: ration.usedQuantity,
      unit: ration.unit,
      month: ration.month,
      lowStockThreshold: ration.lowStockThreshold ?? null,
      notes: ration.notes || "",
    },
  });

  const onSubmit = async (data: RationItemInput) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/rations/${ration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update ration item");

      toast.success("Ration staple updated", {
        description: `${data.name} balance updated`,
      });

      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to update ration item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Staple Name *</Label>
        <Input id="edit-name" {...register("name")} autoFocus />
        {errors.name && (
          <p className="text-xs text-rose-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-category">Category *</Label>
          <Select id="edit-category" {...register("category")}>
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
          <Label htmlFor="edit-month">Month (YYYY-MM)</Label>
          <Input id="edit-month" type="month" {...register("month")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-allocatedQuantity">Monthly Allocation *</Label>
          <Input
            id="edit-allocatedQuantity"
            type="number"
            step="any"
            {...register("allocatedQuantity", { valueAsNumber: true })}
          />
          {errors.allocatedQuantity && (
            <p className="text-xs text-rose-600">
              {errors.allocatedQuantity.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-usedQuantity">Used / Consumed so far</Label>
          <Input
            id="edit-usedQuantity"
            type="number"
            step="any"
            {...register("usedQuantity", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="edit-unit">Unit *</Label>
          <Select id="edit-unit" {...register("unit")}>
            <option value="g">grams (g)</option>
            <option value="kg">kilograms (kg)</option>
            <option value="ml">milliliters (ml)</option>
            <option value="L">liters (L)</option>
            <option value="packets">packets</option>
            <option value="cups">cups</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-lowStockThreshold">Low Stock Alert</Label>
          <Input
            id="edit-lowStockThreshold"
            type="number"
            step="any"
            placeholder="e.g. 200"
            {...register("lowStockThreshold", {
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-notes">Notes</Label>
        <Input id="edit-notes" {...register("notes")} />
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
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditRationDialog({
  ration,
  onClose,
  onSuccess,
}: EditRationDialogProps) {
  if (!ration) return null;

  return (
    <Dialog open={!!ration} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Ration Staple</DialogTitle>
              <DialogDescription>
                Adjust monthly quota, restock amounts, or manual consumption corrections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <EditRationForm
          key={ration.id}
          ration={ration}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
