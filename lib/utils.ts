import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGlucoseValue(value: number, unit: "mg/dL" | "mmol/L"): string {
  if (unit === "mmol/L") {
    // If value was entered in mg/dL and needs to be shown in mmol/L
    return (value / 18.0182).toFixed(1);
  }
  return Math.round(value).toString();
}

export function convertToMgDl(value: number, unit: "mg/dL" | "mmol/L"): number {
  if (unit === "mmol/L") {
    return Math.round(value * 18.0182);
  }
  return Math.round(value);
}

export function getGlucoseStatus(
  valueInMgDl: number,
  context: string,
  targetRange?: { fastingMin?: number; fastingMax?: number; postMealMax?: number }
): {
  label: "Low" | "In Target" | "Elevated" | "High";
  variant: "low" | "target" | "warning" | "high";
  message: string;
} {
  const fastingMin = targetRange?.fastingMin ?? 70;
  const fastingMax = targetRange?.fastingMax ?? 130;
  const postMealMax = targetRange?.postMealMax ?? 180;

  const isFasting = context === "fasting" || context === "before_meal";

  if (valueInMgDl < fastingMin) {
    return {
      label: "Low",
      variant: "low",
      message: "Below your standard target range",
    };
  }

  if (isFasting) {
    if (valueInMgDl <= fastingMax) {
      return {
        label: "In Target",
        variant: "target",
        message: "Within your fasting target range",
      };
    } else if (valueInMgDl <= 160) {
      return {
        label: "Elevated",
        variant: "warning",
        message: "Slightly above fasting target",
      };
    } else {
      return {
        label: "High",
        variant: "high",
        message: "Above fasting target range",
      };
    }
  } else {
    // After meal or random
    if (valueInMgDl <= postMealMax) {
      return {
        label: "In Target",
        variant: "target",
        message: "Within your target range",
      };
    } else if (valueInMgDl <= 220) {
      return {
        label: "Elevated",
        variant: "warning",
        message: "Slightly above target range",
      };
    } else {
      return {
        label: "High",
        variant: "high",
        message: "Above post-meal target range",
      };
    }
  }
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(timeOrDateString: string | Date): string {
  if (typeof timeOrDateString === "string" && timeOrDateString.includes(":")) {
    const parts = timeOrDateString.split(":");
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const min = parts[1].slice(0, 2);
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour}:${min} ${period}`;
    }
  }
  const date = typeof timeOrDateString === "string" ? new Date(timeOrDateString) : timeOrDateString;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

