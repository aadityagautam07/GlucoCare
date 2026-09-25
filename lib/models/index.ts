import mongoose, { Schema, Document, Model } from "mongoose";

// --- User Schema ---
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
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

export interface IMealRationIngredient {
  rationId: string;
  rationName: string;
  quantity: number;
  unit: string;
}

// --- Meal Schema ---
export interface IMeal extends Document {
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

// --- Activity Schema ---
export interface IActivity extends Document {
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

// --- Appointment Schema ---
export interface IAppointment extends Document {
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

// --- Ration Item Schema ---
export interface IRationItem extends Document {
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

export const RationItemModel: Model<IRationItem> =
  mongoose.models.RationItem ||
  mongoose.model<IRationItem>("RationItem", RationItemSchema);

// --- Lab & Diagnostic Report Schema ---
export interface ILabReport extends Document {
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

export const LabReportModel: Model<ILabReport> =
  mongoose.models.LabReport ||
  mongoose.model<ILabReport>("LabReport", LabReportSchema);



