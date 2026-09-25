export type GlucoseUnit = "mg/dL" | "mmol/L";

export type DiabetesType = "Type 1" | "Type 2" | "Prediabetes" | "Gestational" | "Other";

export type GlucoseContext =
  | "fasting"
  | "before_meal"
  | "after_meal"
  | "bedtime"
  | "random"
  | "other";

export interface UserTargetRange {
  fastingMin: number; // default 70 mg/dL
  fastingMax: number; // default 130 mg/dL
  postMealMax: number; // default 180 mg/dL
}

export type UserRole = "admin" | "doctor" | "patient" | "caregiver";

export type UserStatus = "active" | "suspended";

export interface UserPermissions {
  canLogGlucose: boolean;
  canManageMedications: boolean;
  canLogMeals: boolean;
  canManageRation: boolean;
  canLogActivity: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canExportData: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
  diabetesType: DiabetesType;
  glucoseUnit: GlucoseUnit;
  targetRange: UserTargetRange;
  notifications: {
    medicationReminders: boolean;
    glucoseReminders: boolean;
    appointmentReminders: boolean;
  };
  lifestyleProfile?: UserLifestyleProfile;
  createdAt: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: UserPermissions;
  diabetesType: DiabetesType;
  readingsCount?: number;
  lastActive?: string;
  createdAt: string;
}

export interface AdminSystemStats {
  totalUsers: number;
  activePatients: number;
  totalDoctors: number;
  totalAdmins: number;
  totalReadingsLogged: number;
  totalMedicationsTracked: number;
  suspendedUsers: number;
}


export interface GlucoseReading {
  id: string;
  userId: string;
  value: number; // stored in mg/dL for normalized aggregation
  unit: GlucoseUnit;
  context: GlucoseContext;
  measuredAt: string; // ISO date string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: "Once daily" | "Twice daily" | "Three times daily" | "As needed" | "Custom";
  instructions: string; // e.g., "After breakfast", "Before bed"
  schedule: "morning" | "afternoon" | "evening" | "bedtime" | "multiple";
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DoseStatus = "taken" | "skipped" | "missed";

export interface MedicationLog {
  id: string;
  userId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledAt: string;
  takenAt?: string;
  status: DoseStatus;
  notes?: string;
  createdAt: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type RationCategory =
  | "grains"
  | "pulses"
  | "nuts_seeds"
  | "oils"
  | "flours"
  | "dairy"
  | "other";

export type RationUnit = "g" | "kg" | "ml" | "L" | "packets" | "cups";

export interface RationItem {
  id: string;
  userId: string;
  name: string;
  category: RationCategory;
  allocatedQuantity: number;
  usedQuantity: number;
  unit: RationUnit;
  month: string; // "YYYY-MM"
  lowStockThreshold?: number | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealRationIngredient {
  rationId: string;
  rationName: string;
  quantity: number;
  unit: string;
}

export interface Meal {
  id: string;
  userId: string;
  mealType: MealType;
  description: string;
  time: string;
  date: string;
  calories?: number;
  carbohydrates?: number; // in grams
  protein?: number; // in grams
  notes?: string;
  rationIngredients?: MealRationIngredient[];
  createdAt: string;
}

export type ActivityType = "walking" | "running" | "cycling" | "gym" | "yoga" | "swimming" | "other";

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  durationMinutes: number;
  date: string;
  time: string;
  steps?: number;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  location: string;
  isVirtual?: boolean;
  notes?: string;
  reminderAlarm?: "15m" | "30m" | "1h" | "2h" | "1d" | "none";
  completed?: boolean;
  createdAt: string;
}

export interface TodayPlanItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  category: "medication" | "glucose" | "meal" | "activity";
  completed: boolean;
  actionId?: string;
}

export type DayModeType = "office" | "weekend" | "festival" | "travel";

export interface UserLifestyleProfile {
  occupation?: string; // e.g. "Working Professional"
  workSchedule?: "mon_fri" | "shifts" | "flexible" | "custom";
  workDays?: number[]; // [1, 2, 3, 4, 5] (Monday to Friday)
  weekendDays?: number[]; // [0, 6] (Sunday, Saturday)
  defaultDayMode?: DayModeType;
}

export interface DailyTaskLogItem {
  id: string;
  sectionId: string;
  title: string;
  category: string;
  done: boolean;
  time: string;
  stamp?: string;
  isCustom?: boolean;
}

export interface DailyLogRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dayMode: DayModeType;
  tasksCompleted: number;
  totalTasks: number;
  adherencePercentage: number;
  tasks: DailyTaskLogItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LabReportCategory =
  | "hba1c"
  | "blood_glucose"
  | "lipid_panel"
  | "kidney_function"
  | "liver_panel"
  | "prescription"
  | "doctor_notes"
  | "other";

export interface LabReport {
  id: string;
  userId: string;
  title: string;
  doctorOrLab: string;
  category: LabReportCategory;
  date: string; // YYYY-MM-DD
  fileUrl?: string; // base64 data url or public URL
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  summaryMetrics?: string; // e.g. "HbA1c: 6.8%, Fasting: 110 mg/dL"
  notes?: string;
  createdAt: string;
}

export interface AppleFitnessDayLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calories: number; // Active calories (kcal)
  stepCount: number; // Total step count
  stepDistance: number; // Step distance in km
  caloriesGoal?: number; // default 500 kcal
  stepCountGoal?: number; // default 10000 steps
  stepDistanceGoal?: number; // default 5.0 km
  notes?: string;
  createdAt: string;
  updatedAt: string;
}


