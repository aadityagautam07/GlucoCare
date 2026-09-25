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
import { mealSchema, MealInput } from "@/lib/validations";
import { RationItem, MealRationIngredient } from "@/types";
import { toast } from "sonner";
import { Utensils, Package, Plus, X, AlertCircle } from "lucide-react";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<MealInput>;
  availableRations?: RationItem[];
  onSuccess?: () => void;
}

function AddMealForm({
  initialData,
  availableRations = [],
  onClose,
  onSuccess,
}: {
  initialData?: Partial<MealInput>;
  availableRations?: RationItem[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 5);

  const [attachedRations, setAttachedRations] = React.useState<MealRationIngredient[]>(
    initialData?.rationIngredients || []
  );

  const [selectedRationId, setSelectedRationId] = React.useState<string>(
    availableRations.length > 0 ? availableRations[0].id : ""
  );
  const [rationQty, setRationQty] = React.useState<number>(50);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MealInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(mealSchema) as any,
    defaultValues: {
      mealType: initialData?.mealType || "breakfast",
      description: initialData?.description || "",
      date: initialData?.date || currentDate,
      time: initialData?.time || currentTime,
      carbohydrates: initialData?.carbohydrates ?? undefined,
      calories: initialData?.calories ?? undefined,
      protein: initialData?.protein ?? undefined,
      notes: initialData?.notes || "",
    },
  });

  const handleAddRationIngredient = () => {
    if (!selectedRationId) return;
    const staple = availableRations.find((r) => r.id === selectedRationId);
    if (!staple) return;

    if (rationQty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Check if already added
    const existingIdx = attachedRations.findIndex((r) => r.rationId === staple.id);
    if (existingIdx !== -1) {
      const updated = [...attachedRations];
      updated[existingIdx].quantity += rationQty;
      setAttachedRations(updated);
    } else {
      setAttachedRations([
        ...attachedRations,
        {
          rationId: staple.id,
          rationName: staple.name,
          quantity: rationQty,
          unit: staple.unit,
        },
      ]);
    }
  };

  const handleRemoveRationIngredient = (idx: number) => {
    setAttachedRations(attachedRations.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: MealInput) => {
    try {
      setIsSubmitting(true);

      const payload: MealInput = {
        ...data,
        rationIngredients:
          attachedRations.length > 0 ? attachedRations : undefined,
      };

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to record meal");

      toast.success("Meal logged successfully", {
        description: `${data.mealType.toUpperCase()}: ${data.description}`,
      });

      onClose();
      onSuccess?.();
    } catch {
      toast.error("Failed to save meal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStaple = availableRations.find((r) => r.id === selectedRationId);
  const selectedRemaining = selectedStaple
    ? Math.max(0, selectedStaple.allocatedQuantity - selectedStaple.usedQuantity)
    : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="mealType">Meal Type</Label>
          <Select id="mealType" {...register("mealType")}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" {...register("time")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">What did you eat? *</Label>
        <Input
          id="description"
          placeholder="e.g. Steel-cut oatmeal with chia seeds & blueberries"
          {...register("description")}
          autoFocus
        />
        {errors.description && (
          <p className="text-xs text-rose-600">{errors.description.message}</p>
        )}
      </div>

      {/* Monthly Ration Ingredients Used */}
      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
            Use Monthly Ration Staples
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-400">
            Deducts from your pantry inventory
          </span>
        </div>

        {availableRations.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="rationSelect" className="text-[11px] text-slate-600 dark:text-slate-400">
                  Select Staple
                </Label>
                <Select
                  id="rationSelect"
                  value={selectedRationId}
                  onChange={(e) => setSelectedRationId(e.target.value)}
                  className="h-9 sm:h-8 text-xs bg-white dark:bg-slate-800"
                >
                  {availableRations.map((r) => {
                    const rem = Math.max(0, r.allocatedQuantity - r.usedQuantity);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.name} ({rem} {r.unit} left)
                      </option>
                    );
                  })}
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <div className="w-28 space-y-1">
                  <Label htmlFor="rationQty" className="text-[11px] text-slate-600 dark:text-slate-400">
                    Qty ({selectedStaple?.unit || "g"})
                  </Label>
                  <Input
                    id="rationQty"
                    type="number"
                    step="any"
                    value={rationQty}
                    onChange={(e) => setRationQty(Number(e.target.value))}
                    className="h-9 sm:h-8 text-xs bg-white dark:bg-slate-800"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRationIngredient}
                  className="h-9 sm:h-8 px-3 text-xs bg-white dark:bg-slate-800 hover:bg-amber-100/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-0.5 shrink-0" />
                  Add
                </Button>
              </div>
            </div>

            {selectedStaple && rationQty > selectedRemaining && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                Note: {rationQty} {selectedStaple.unit} exceeds remaining {selectedRemaining} {selectedStaple.unit}.
              </p>
            )}

            {/* Attached Ration Staples List */}
            {attachedRations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {attachedRations.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 border border-amber-200"
                  >
                    <span>
                      {ing.rationName}: <strong>{ing.quantity}{ing.unit}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRationIngredient(idx)}
                      className="hover:text-rose-700 ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-amber-800">
            No active staples configured for this month. You can add rations in the &quot;Monthly Rations&quot; tab.
          </p>
        )}
      </div>

      {/* Optional Nutrition Data */}
      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-3">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          Optional Nutrition Data
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="carbs" className="text-xs text-slate-500">
              Carbs (g)
            </Label>
            <Input
              id="carbs"
              type="number"
              placeholder="e.g. 35"
              className="h-9 text-xs"
              {...register("carbohydrates", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="protein" className="text-xs text-slate-500">
              Protein (g)
            </Label>
            <Input
              id="protein"
              type="number"
              placeholder="e.g. 25"
              className="h-9 text-xs"
              {...register("protein", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="calories" className="text-xs text-slate-500">
              Calories
            </Label>
            <Input
              id="calories"
              type="number"
              placeholder="e.g. 420"
              className="h-9 text-xs"
              {...register("calories", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="e.g. Drank plenty of water; low glycemic response"
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
          Save Meal
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddMealDialog({
  open,
  onOpenChange,
  initialData,
  availableRations = [],
  onSuccess,
}: AddMealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Log Meal</DialogTitle>
              <DialogDescription>
                Record your food intake and deduct pantry staples from this month&apos;s ration.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <AddMealForm
            initialData={initialData}
            availableRations={availableRations}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
