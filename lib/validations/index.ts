import { z } from "zod";

export const glucoseReadingSchema = z.object({
  value: z
    .number()
    .min(20, "Glucose reading must be at least 20 mg/dL")
    .max(600, "Glucose reading must be below 600 mg/dL"),
  unit: z.enum(["mg/dL", "mmol/L"]).default("mg/dL"),
  context: z.enum([
    "fasting",
    "before_meal",
    "after_meal",
    "bedtime",
    "random",
    "other",
  ]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

export type GlucoseReadingInput = z.infer<typeof glucoseReadingSchema>;

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(100),
  dosage: z.string().min(1, "Dosage is required (e.g. 500 mg, 10 units)").max(50),
  frequency: z.enum([
    "Once daily",
    "Twice daily",
    "Three times daily",
    "As needed",
    "Custom",
  ]),
  instructions: z.string().max(200).optional(),
  schedule: z.enum(["morning", "afternoon", "evening", "bedtime", "multiple"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

export type MedicationInput = z.infer<typeof medicationSchema>;

export const medicationLogSchema = z.object({
  medicationId: z.string().min(1, "Medication ID is required"),
  status: z.enum(["taken", "skipped", "missed"]),
  takenAt: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export type MedicationLogInput = z.infer<typeof medicationLogSchema>;

export const mealRationIngredientSchema = z.object({
  rationId: z.string().min(1),
  rationName: z.string().min(1),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1),
});

export const mealSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  description: z.string().min(1, "Food description is required").max(200),
  time: z.string().min(1, "Time is required"),
  date: z.string().min(1, "Date is required"),
  calories: z.number().min(0).max(5000).optional().nullable(),
  carbohydrates: z.number().min(0).max(500).optional().nullable(),
  protein: z.number().min(0).max(500).optional().nullable(),
  notes: z.string().max(250).optional(),
  rationIngredients: z.array(mealRationIngredientSchema).optional(),
});

export type MealInput = z.infer<typeof mealSchema>;

export const rationItemSchema = z.object({
  name: z.string().min(1, "Staple name is required").max(100),
  category: z.enum([
    "grains",
    "pulses",
    "nuts_seeds",
    "oils",
    "flours",
    "dairy",
    "other",
  ]),
  allocatedQuantity: z.number().min(0.1, "Allocated quantity must be positive"),
  usedQuantity: z.number().min(0).default(0),
  unit: z.enum(["g", "kg", "ml", "L", "packets", "cups"]),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  lowStockThreshold: z.number().min(0).optional().nullable(),
  notes: z.string().max(250).optional(),
});

export type RationItemInput = z.infer<typeof rationItemSchema>;

export const activitySchema = z.object({
  activityType: z.enum([
    "walking",
    "running",
    "cycling",
    "gym",
    "yoga",
    "swimming",
    "other",
  ]),
  durationMinutes: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(720, "Duration cannot exceed 12 hours"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  steps: z.number().min(0).max(100000).optional().nullable(),
  notes: z.string().max(250).optional(),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  doctorName: z.string().min(1, "Doctor or provider name is required").max(100),
  specialty: z.string().max(100).optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(1, "Location is required").max(200),
  isVirtual: z.boolean().default(false),
  notes: z.string().max(300).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(70),
  email: z.string().email("Invalid email address"),
  diabetesType: z.enum(["Type 1", "Type 2", "Prediabetes", "Gestational", "Other"]),
  glucoseUnit: z.enum(["mg/dL", "mmol/L"]),
  targetRange: z.object({
    fastingMin: z.number().min(50).max(120),
    fastingMax: z.number().min(80).max(200),
    postMealMax: z.number().min(120).max(300),
  }),
  notifications: z.object({
    medicationReminders: z.boolean(),
    glucoseReminders: z.boolean(),
    appointmentReminders: z.boolean(),
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  diabetesType: z.enum(["Type 1", "Type 2", "Prediabetes", "Gestational", "Other"]),
  glucoseUnit: z.enum(["mg/dL", "mmol/L"]).default("mg/dL"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

