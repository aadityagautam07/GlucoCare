import mongoose, { Schema, Document, Model } from "mongoose";

// --- User Schema ---
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "patient" | "doctor" | "admin" | "caregiver";
  status: "active" | "suspended";
  permissions: {
    canLogGlucose: boolean;
    canManageMedications: boolean;
    canLogMeals: boolean;
    canManageRation: boolean;
    canLogActivity: boolean;
    canManageAppointments: boolean;
    canViewReports: boolean;
    canExportData: boolean;
  };
  diabetesType: string;
  glucoseUnit: string;
  targetRange: {
    fastingMin: number;
    fastingMax: number;
    postMealMax: number;
  };
  notifications: {
    medicationReminders: boolean;
    glucoseReminders: boolean;
    appointmentReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor", "admin", "caregiver"], default: "patient" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    permissions: {
      canLogGlucose: { type: Boolean, default: true },
      canManageMedications: { type: Boolean, default: true },
      canLogMeals: { type: Boolean, default: true },
      canManageRation: { type: Boolean, default: true },
      canLogActivity: { type: Boolean, default: true },
      canManageAppointments: { type: Boolean, default: true },
      canViewReports: { type: Boolean, default: true },
      canExportData: { type: Boolean, default: true },
    },
    diabetesType: { type: String, default: "Type 2" },
    glucoseUnit: { type: String, default: "mg/dL" },
    targetRange: {
      fastingMin: { type: Number, default: 70 },
      fastingMax: { type: Number, default: 130 },
      postMealMax: { type: Number, default: 180 },
    },
    notifications: {
      medicationReminders: { type: Boolean, default: true },
      glucoseReminders: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// --- Glucose Reading Schema ---
export interface IGlucoseReading extends Document {
  id: string;
  userId: string;
  value: number; // Stored in mg/dL
  unit: string;
  context: string;
  measuredAt: Date;
  date: string;
  time: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GlucoseReadingSchema = new Schema<IGlucoseReading>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    value: { type: Number, required: true },
    unit: { type: String, default: "mg/dL" },
    context: { type: String, required: true },
    measuredAt: { type: Date, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);
GlucoseReadingSchema.index({ userId: 1, measuredAt: -1 });

// --- Medication Schema ---
export interface IMedication extends Document {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  schedule: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    instructions: { type: String },
    schedule: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// --- Medication Log Schema ---
export interface IMedicationLog extends Document {
  id: string;
  userId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledAt: Date;
  takenAt?: Date;
  status: string;
  notes?: string;
  createdAt: Date;
}

const MedicationLogSchema = new Schema<IMedicationLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    medicationId: { type: String, required: true, index: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    takenAt: { type: Date },
    status: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
MedicationLogSchema.index({ userId: 1, scheduledAt: -1 });

export interface IMealRationIngredient {
  rationId: string;
  rationName: string;
  quantity: number;
  unit: string;
}

// --- Meal Schema ---
export interface IMeal extends Document {
  id: string;
  userId: string;
  mealType: string;
  description: string;
  time: string;
  date: string;
  calories?: number;
  carbohydrates?: number;
  protein?: number;
  notes?: string;
  rationIngredients?: IMealRationIngredient[];
  createdAt: Date;
}

const MealSchema = new Schema<IMeal>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    mealType: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    calories: { type: Number },
    carbohydrates: { type: Number },
    protein: { type: Number },
    notes: { type: String },
    rationIngredients: [
      {
        rationId: { type: String, required: true },
        rationName: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
MealSchema.index({ userId: 1, date: -1 });

// --- Activity Schema ---
export interface IActivity extends Document {
  id: string;
  userId: string;
  activityType: string;
  durationMinutes: number;
  date: string;
  time: string;
  steps?: number;
  notes?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    activityType: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    steps: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);
ActivitySchema.index({ userId: 1, date: -1 });

// --- Appointment Schema ---
export interface IAppointment extends Document {
  id: string;
  userId: string;
  title: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  notes?: string;
  reminderAlarm?: string;
  completed: boolean;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialty: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    isVirtual: { type: Boolean, default: false },
    reminderAlarm: { type: String, default: "1h" },
    notes: { type: String },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);
AppointmentSchema.index({ userId: 1, date: 1 });

// --- Ration Item Schema ---
export interface IRationItem extends Document {
  id: string;
  userId: string;
  name: string;
  category: string;
  allocatedQuantity: number;
  usedQuantity: number;
  unit: string;
  month: string; // "YYYY-MM"
  lowStockThreshold?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RationItemSchema = new Schema<IRationItem>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    allocatedQuantity: { type: Number, required: true },
    usedQuantity: { type: Number, default: 0 },
    unit: { type: String, required: true },
    month: { type: String, required: true, index: true },
    lowStockThreshold: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);
RationItemSchema.index({ userId: 1, month: 1 });

// --- Lab & Diagnostic Report Schema ---
export interface ILabReport extends Document {
  id: string;
  userId: string;
  title: string;
  doctorOrLab: string;
  category: string;
  date: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  summaryMetrics?: string;
  notes?: string;
  createdAt: Date;
}

const LabReportSchema = new Schema<ILabReport>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    doctorOrLab: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: String },
    fileType: { type: String },
    summaryMetrics: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);
LabReportSchema.index({ userId: 1, date: -1 });

// --- Apple Fitness Day Log Schema (Strict 3 Metrics: Calories, Steps, Distance) ---
export interface IAppleFitnessDayLog extends Document {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calories: number;
  stepCount: number;
  stepDistance: number;
  caloriesGoal: number;
  stepCountGoal: number;
  stepDistanceGoal: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppleFitnessDayLogSchema = new Schema<IAppleFitnessDayLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    calories: { type: Number, required: true, default: 0 },
    stepCount: { type: Number, required: true, default: 0 },
    stepDistance: { type: Number, required: true, default: 0 },
    caloriesGoal: { type: Number, default: 500 },
    stepCountGoal: { type: Number, default: 10000 },
    stepDistanceGoal: { type: Number, default: 5.0 },
    notes: { type: String },
  },
  { timestamps: true }
);
AppleFitnessDayLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// --- Daily Checklist Log Schema ---
export interface IDailyLogRecord extends Document {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  fastingBloodSugar?: boolean;
  breakfastLogged?: boolean;
  morningMedsTaken?: boolean;
  physicalActivityLogged?: boolean;
  lunchLogged?: boolean;
  dinnerLogged?: boolean;
  eveningMedsTaken?: boolean;
  bedtimeBloodSugar?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DailyLogRecordSchema = new Schema<IDailyLogRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    fastingBloodSugar: { type: Boolean, default: false },
    breakfastLogged: { type: Boolean, default: false },
    morningMedsTaken: { type: Boolean, default: false },
    physicalActivityLogged: { type: Boolean, default: false },
    lunchLogged: { type: Boolean, default: false },
    dinnerLogged: { type: Boolean, default: false },
    eveningMedsTaken: { type: Boolean, default: false },
    bedtimeBloodSugar: { type: Boolean, default: false },
  },
  { timestamps: true }
);
DailyLogRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

// --- Reset Token Schema ---
export interface IResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const ResetTokenSchema = new Schema<IResetToken>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-deletes on expiry
  },
  { timestamps: true }
);

// --- Export Mongoose Models ---
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export const GlucoseReadingModel: Model<IGlucoseReading> =
  mongoose.models.GlucoseReading ||
  mongoose.model<IGlucoseReading>("GlucoseReading", GlucoseReadingSchema);

export const MedicationModel: Model<IMedication> =
  mongoose.models.Medication ||
  mongoose.model<IMedication>("Medication", MedicationSchema);

export const MedicationLogModel: Model<IMedicationLog> =
  mongoose.models.MedicationLog ||
  mongoose.model<IMedicationLog>("MedicationLog", MedicationLogSchema);

export const MealModel: Model<IMeal> =
  mongoose.models.Meal || mongoose.model<IMeal>("Meal", MealSchema);

export const ActivityModel: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export const AppointmentModel: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export const RationItemModel: Model<IRationItem> =
  mongoose.models.RationItem ||
  mongoose.model<IRationItem>("RationItem", RationItemSchema);

export const LabReportModel: Model<ILabReport> =
  mongoose.models.LabReport ||
  mongoose.model<ILabReport>("LabReport", LabReportSchema);

export const AppleFitnessDayLogModel: Model<IAppleFitnessDayLog> =
  mongoose.models.AppleFitnessDayLog ||
  mongoose.model<IAppleFitnessDayLog>("AppleFitnessDayLog", AppleFitnessDayLogSchema);

export const DailyLogRecordModel: Model<IDailyLogRecord> =
  mongoose.models.DailyLogRecord ||
  mongoose.model<IDailyLogRecord>("DailyLogRecord", DailyLogRecordSchema);

export const ResetTokenModel: Model<IResetToken> =
  mongoose.models.ResetToken ||
  mongoose.model<IResetToken>("ResetToken", ResetTokenSchema);
