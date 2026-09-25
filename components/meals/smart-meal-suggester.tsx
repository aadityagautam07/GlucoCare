"use client";

import * as React from "react";
import {
  ChefHat,
  Briefcase,
  Home,
  Sparkles,
  Plane,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ArrowRight,
  PackageCheck,
  Utensils,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RationItem, MealType, DayModeType } from "@/types";
import { MealInput } from "@/lib/validations";

export interface ContextualRecipe {
  id: string;
  title: string;
  mealType: MealType;
  dayModes: DayModeType[];
  description: string;
  carbohydrates: number;
  protein: number;
  calories: number;
  glycemicTag: string;
  prepTime: string;
  rationMatches: Array<{
    stapleKey: string;
    requiredQty: number;
    unit: string;
  }>;
  tips: string;
}

export const CONTEXTUAL_RECIPES: ContextualRecipe[] = [
  // 🏢 Office / Working Day (Mon-Fri)
  {
    id: "off-1",
    title: "High-Protein Besan & Paneer Tiffin Wrap",
    mealType: "lunch",
    dayModes: ["office"],
    description: "Compact, non-messy office tiffin. Gram flour chila loaded with fresh grated paneer, onions, and coriander. Zero refined flour.",
    carbohydrates: 24,
    protein: 19,
    calories: 320,
    glycemicTag: "Very Low GI • No Desk Slump",
    prepTime: "12 mins",
    rationMatches: [
      { stapleKey: "besan", requiredQty: 50, unit: "g" },
      { stapleKey: "paneer", requiredQty: 60, unit: "g" },
      { stapleKey: "oil", requiredQty: 5, unit: "ml" },
    ],
    tips: "Tiffin-friendly: Wrap in foil or parchment; keeps soft without getting soggy.",
  },
  {
    id: "off-2",
    title: "Overnight Oats & Chia Desk Jar",
    mealType: "breakfast",
    dayModes: ["office"],
    description: "Quick grab-and-go morning breakfast for busy working professionals. Rolled oats soaked in almond milk with chia seeds & cinnamon.",
    carbohydrates: 34,
    protein: 11,
    calories: 290,
    glycemicTag: "Slow-Release Beta-Glucan",
    prepTime: "5 mins (prev night)",
    rationMatches: [
      { stapleKey: "oats", requiredQty: 45, unit: "g" },
      { stapleKey: "chia", requiredQty: 15, unit: "g" },
    ],
    tips: "Prep the night before in a mason jar. Eat at your desk before 9:00 AM meetings.",
  },
  {
    id: "off-3",
    title: "Desk Armor: Roasted Chana & Almond Snack Box",
    mealType: "snack",
    dayModes: ["office"],
    description: "Keep in your office desk drawer to combat 4:30 PM chai-time biscuit cravings. High satiety and zinc-rich.",
    carbohydrates: 14,
    protein: 9,
    calories: 190,
    glycemicTag: "Zero Glucose Spike",
    prepTime: "2 mins",
    rationMatches: [
      { stapleKey: "chana", requiredQty: 30, unit: "g" },
      { stapleKey: "almond", requiredQty: 15, unit: "g" },
    ],
    tips: "Avoid office pantry cookies and samosas by keeping this portion-controlled jar handy.",
  },

  // 🏡 Weekend / Rest Day (Sat-Sun)
  {
    id: "wkd-1",
    title: "Moong Dal & Brown Rice Wholesome Khichdi",
    mealType: "lunch",
    dayModes: ["weekend"],
    description: "Relaxed weekend comfort food. Equal parts split yellow moong dal and brown basmati rice tempered with cumin, hing, and turmeric.",
    carbohydrates: 44,
    protein: 16,
    calories: 360,
    glycemicTag: "Balanced Complex Carbs",
    prepTime: "25 mins",
    rationMatches: [
      { stapleKey: "moong", requiredQty: 60, unit: "g" },
      { stapleKey: "brown", requiredQty: 50, unit: "g" },
      { stapleKey: "oil", requiredQty: 8, unit: "ml" },
    ],
    tips: "Pair with fresh home-set curd and sliced cucumber salad for optimum digestive enzymes.",
  },
  {
    id: "wkd-2",
    title: "Weekend Post-Walk Recovery Daliya & Greens",
    mealType: "breakfast",
    dayModes: ["weekend"],
    description: "Hearty weekend post-exercise breakfast. Roasted broken wheat cooked with seasonal vegetables and crushed flaxseed.",
    carbohydrates: 38,
    protein: 12,
    calories: 280,
    glycemicTag: "High Insoluble Fiber",
    prepTime: "20 mins",
    rationMatches: [
      { stapleKey: "daliya", requiredQty: 50, unit: "g" },
      { stapleKey: "flax", requiredQty: 10, unit: "g" },
    ],
    tips: "Enjoy relaxed Sunday morning dining after your 5,000-step outdoor walk.",
  },

  // 🎉 Festival / Celebration Mode
  {
    id: "fst-1",
    title: "Festive Roasted Makhana & Almond Kheer",
    mealType: "dinner",
    dayModes: ["festival"],
    description: "Celebration dessert without the glucose aftermath. Puffed lotus seeds (makhana) simmered in toned milk, crushed cardamom, and stevia.",
    carbohydrates: 18,
    protein: 8,
    calories: 210,
    glycemicTag: "Diabetic-Safe Sweet Alternative",
    prepTime: "15 mins",
    rationMatches: [
      { stapleKey: "makhana", requiredQty: 35, unit: "g" },
      { stapleKey: "almond", requiredQty: 15, unit: "g" },
    ],
    tips: "Consume after your high-fiber dinner to avoid rapid gastric emptying and insulin surges.",
  },
  {
    id: "fst-2",
    title: "Festival Pre-Feast Salad & Gond Katira Armor",
    mealType: "lunch",
    dayModes: ["festival"],
    description: "The ultimate metabolic shield before attending festive parties or family dinners. High viscosity soluble fiber buffers incoming carbs.",
    carbohydrates: 10,
    protein: 4,
    calories: 95,
    glycemicTag: "Glucose Surge Blunter",
    prepTime: "5 mins",
    rationMatches: [
      { stapleKey: "gond", requiredQty: 10, unit: "g" },
      { stapleKey: "chia", requiredQty: 10, unit: "g" },
    ],
    tips: "Eat 15-20 minutes before sitting down at any wedding or festival dinner buffet.",
  },

  // ✈️ Travel / Trip / Out of Station Mode
  {
    id: "trv-1",
    title: "Portable Dry Travel Ration: Spiced Seed & Nut Trail",
    mealType: "snack",
    dayModes: ["travel"],
    description: "Non-perishable, airport & railway compliant. Roasted pumpkin seeds, almonds, walnuts, and dried coconut with a pinch of rock salt.",
    carbohydrates: 8,
    protein: 11,
    calories: 220,
    glycemicTag: "Travel-Safe Sustained Fuel",
    prepTime: "1 min",
    rationMatches: [
      { stapleKey: "almond", requiredQty: 25, unit: "g" },
      { stapleKey: "chia", requiredQty: 10, unit: "g" },
    ],
    tips: "Zero refrigeration needed. Keeps for weeks in zip-lock pouches.",
  },
  {
    id: "trv-2",
    title: "Travel Morning Sachet: Chia Lime Hydration Flask",
    mealType: "breakfast",
    dayModes: ["travel"],
    description: "Overcomes hotel and flight dehydration. Add dry chia sachet into room-temperature bottled water with fresh lime juice.",
    carbohydrates: 5,
    protein: 3,
    calories: 70,
    glycemicTag: "Travel Hydration & Bowel Regularity",
    prepTime: "2 mins",
    rationMatches: [
      { stapleKey: "chia", requiredQty: 15, unit: "g" },
    ],
    tips: "Drink 500ml before boarding flights or long car trips to prevent circulatory sluggishness.",
  },
];

interface SmartMealSuggesterProps {
  rations?: RationItem[];
  currentDayMode?: DayModeType;
  onCookAndLog?: (mealData: Partial<MealInput>) => void;
  compact?: boolean;
}

export function SmartMealSuggester({
  rations = [],
  currentDayMode,
  onCookAndLog,
  compact = false,
}: SmartMealSuggesterProps) {
  // Auto-detect day mode based on today's day of week if not set
  const defaultMode: DayModeType = React.useMemo(() => {
    if (currentDayMode) return currentDayMode;
    const day = new Date().getDay(); // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6 ? "weekend" : "office";
  }, [currentDayMode]);

  const [selectedMode, setSelectedMode] = React.useState<DayModeType>(defaultMode);
  const [selectedMealType, setSelectedMealType] = React.useState<string>("all");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const activeRations = rations.filter((r) => r.month === currentMonth || !r.month);

  // Filter recipes matching mode and mealType
  const matchingRecipes = React.useMemo(() => {
    return CONTEXTUAL_RECIPES.filter((r) => {
      const modeMatch = r.dayModes.includes(selectedMode);
      const typeMatch = selectedMealType === "all" || r.mealType === selectedMealType;
      return modeMatch && typeMatch;
    });
  }, [selectedMode, selectedMealType]);

  // Check user's pantry ration availability
  const checkRationAvailability = (reqMatches: ContextualRecipe["rationMatches"]) => {
    return reqMatches.map((req) => {
      const matchedRation = activeRations.find((r) =>
        r.name.toLowerCase().includes(req.stapleKey.toLowerCase())
      );
      if (!matchedRation) {
        return {
          name: req.stapleKey,
          neededQty: req.requiredQty,
          unit: req.unit,
          available: false,
          remaining: 0,
        };
      }
      const rem = Math.max(0, matchedRation.allocatedQuantity - matchedRation.usedQuantity);
      return {
        name: matchedRation.name,
        rationId: matchedRation.id,
        neededQty: req.requiredQty,
        unit: matchedRation.unit,
        available: rem >= req.requiredQty,
        remaining: rem,
      };
    });
  };

  const handleSelectRecipe = (recipe: ContextualRecipe) => {
    if (!onCookAndLog) return;

    const rationResults = checkRationAvailability(recipe.rationMatches);
    const attachedIngredients = rationResults
      .filter((r) => r.available && r.rationId)
      .map((r) => ({
        rationId: r.rationId!,
        rationName: r.name,
        quantity: r.neededQty,
        unit: r.unit,
      }));

    onCookAndLog({
      mealType: recipe.mealType,
      description: recipe.title,
      carbohydrates: recipe.carbohydrates,
      protein: recipe.protein,
      calories: recipe.calories,
      rationIngredients: attachedIngredients,
      notes: `Suggested for [${selectedMode.toUpperCase()}]: ${recipe.glycemicTag}. ${recipe.tips}`,
    });
  };

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-teal-50/50 p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
              <ChefHat className="w-3.5 h-3.5 text-amber-700" />
              Pantry & Lifestyle Meal Suggester
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Personalized Diabetic Meal Suggestions
            </CardTitle>
            <p className="text-xs text-slate-500">
              Matches your monthly rations and adapts recipes to your workdays, weekends, festivals, and trips.
            </p>
          </div>

          {/* Day Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedMode("office")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedMode === "office"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Office Day (Mon-Fri Routine, Quick Tiffin, Desk Snacks)"
            >
              <Briefcase className="w-3 h-3" />
              <span>Office (Mon-Fri)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("weekend")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedMode === "weekend"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Weekend (Sat-Sun Off, Relaxed Cooking, Restorative)"
            >
              <Home className="w-3 h-3" />
              <span>Weekend Off</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("festival")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedMode === "festival"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Festival / Celebration Mode (Diabetic Sweets & Fiber Armor)"
            >
              <Sparkles className="w-3 h-3" />
              <span>Festival</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("travel")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedMode === "travel"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Travel / Trip (Dry Rations, Airport/Train Survival)"
            >
              <Plane className="w-3 h-3" />
              <span>Travel</span>
            </button>
          </div>
        </div>

        {/* Meal Type Filter Chips */}
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Slot:
          </span>
          {["all", "breakfast", "lunch", "dinner", "snack"].map((mType) => (
            <button
              key={mType}
              type="button"
              onClick={() => setSelectedMealType(mType)}
              className={`capitalize px-2 py-0.5 rounded-md font-medium text-xs transition-colors ${
                selectedMealType === mType
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {mType}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 bg-slate-50/30">
        {matchingRecipes.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No recipes matching this slot for {selectedMode} mode. Try selecting another slot above.
          </div>
        ) : (
          <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
            {matchingRecipes.map((recipe) => {
              const availability = checkRationAvailability(recipe.rationMatches);
              const allAvailable = availability.every((a) => a.available);
              const someAvailable = availability.some((a) => a.available);

              return (
                <div
                  key={recipe.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="capitalize text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {recipe.mealType}
                          </span>
                          <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            {recipe.glycemicTag}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {recipe.title}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {recipe.prepTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {recipe.description}
                    </p>

                    {/* Nutrition Macro Badges */}
                    <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100 text-slate-700">
                      <span>
                        🔥 <strong>{recipe.calories}</strong> kcal
                      </span>
                      <span>
                        🍞 <strong>{recipe.carbohydrates}g</strong> carbs
                      </span>
                      <span>
                        💪 <strong>{recipe.protein}g</strong> protein
                      </span>
                    </div>

                    {/* Required Staples & Pantry Inventory Status */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pantry Ingredients:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availability.map((av, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                              av.available
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {av.available ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                            )}
                            <span className="capitalize">{av.name}</span>
                            <span className="opacity-75">
                              ({av.neededQty}
                              {av.unit})
                            </span>
                            {av.available && (
                              <span className="text-[10px] text-emerald-600 font-bold">
                                ✓ in pantry
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      💡 {recipe.tips}
                    </p>
                  </div>

                  {/* Cook & Log Action Button */}
                  {onCookAndLog && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-xs font-bold gap-1.5 shadow-2xs bg-amber-600 hover:bg-amber-700 text-white mt-1"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Cook & Log to Food Diary</span>
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

