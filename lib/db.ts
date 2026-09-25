import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import {
  demoUser,
  demoAdminUser,
  demoSeedUsers,
  demoGlucoseReadings,
  demoMedications,
  demoMedicationLogs,
  demoMeals,
  demoActivities,
  demoAppointments,
  demoRationItems,
  demoLabReports,
  DEMO_USER_ID,
  DEMO_ADMIN_ID,
} from "./seed-data";
import {
  GlucoseReading,
  Medication,
  MedicationLog,
  Meal,
  Activity,
  Appointment,
  UserProfile,
  RationItem,
  LabReport,
  UserRole,
  UserStatus,
  UserPermissions,
  AdminUserSummary,
  AdminSystemStats,
  DailyLogRecord,
  AppleFitnessDayLog,
} from "@/types";
import { AppleFitnessLogInput } from "@/lib/validations";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    // In-memory / file-backed demo mode active
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => m)
      .catch((err) => {
        console.warn("MongoDB connection failed, falling back to persistent data store:", err.message);
        return null as unknown as typeof mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

// -------------------------------------------------------------
// Persistent File-Backed Data Repository Store
// Synchronizes across all Next.js worker threads and server reloads
// -------------------------------------------------------------

export interface ResetTokenRecord {
  email: string;
  token: string;
  expiresAt: number;
}

interface InMemStore {
  users: Map<string, UserProfile & { passwordHash?: string }>;
  glucose: GlucoseReading[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  meals: Meal[];
  activities: Activity[];
  appointments: Appointment[];
  rations: RationItem[];
  dailyLogs: DailyLogRecord[];
  labReports: LabReport[];
  appleFitnessLogs: AppleFitnessDayLog[];
  resetTokens: ResetTokenRecord[];
}

declare global {
  var memoryStore: InMemStore | undefined;
  var lastLoadedDiskMtime: number | undefined;
}

const DATA_STORE_PATH = path.resolve(process.cwd(), "lib/data-store.json");

function persistStoreToDisk() {
  try {
    const store = global.memoryStore;
    if (!store) return;

    const serialized = {
      users: Array.from(store.users.values()),
      glucose: store.glucose,
      medications: store.medications,
      medicationLogs: store.medicationLogs,
      meals: store.meals,
      activities: store.activities,
      appointments: store.appointments,
      rations: store.rations,
      dailyLogs: store.dailyLogs,
      labReports: store.labReports,
      appleFitnessLogs: store.appleFitnessLogs || [],
      resetTokens: store.resetTokens || [],
    };

    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(serialized, null, 2), "utf-8");
    if (fs.existsSync(DATA_STORE_PATH)) {
      global.lastLoadedDiskMtime = fs.statSync(DATA_STORE_PATH).mtimeMs;
    }
  } catch (err) {
    console.error("Failed to persist data store to disk:", err);
  }
}

function getMemoryStore(): InMemStore {
  let fileMtime = 0;
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      fileMtime = fs.statSync(DATA_STORE_PATH).mtimeMs;
    }
  } catch {
    // ignore
  }

  // If memoryStore exists and disk file has not been modified externally, return memory store
  if (
    global.memoryStore &&
    global.lastLoadedDiskMtime &&
    fileMtime <= global.lastLoadedDiskMtime
  ) {
    return global.memoryStore;
  }

  // Try loading from disk file if available
  if (fs.existsSync(DATA_STORE_PATH)) {
    try {
      const content = fs.readFileSync(DATA_STORE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      const userMap = new Map<string, UserProfile & { passwordHash?: string }>();

      if (Array.isArray(parsed.users)) {
        for (const u of parsed.users) {
          userMap.set(u.id, u);
        }
      }

      global.memoryStore = {
        users: userMap,
        glucose: Array.isArray(parsed.glucose) ? parsed.glucose : [],
        medications: Array.isArray(parsed.medications) ? parsed.medications : [],
        medicationLogs: Array.isArray(parsed.medicationLogs) ? parsed.medicationLogs : [],
        meals: Array.isArray(parsed.meals) ? parsed.meals : [],
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
        appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
        rations: Array.isArray(parsed.rations) ? parsed.rations : [],
        dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
        labReports: Array.isArray(parsed.labReports) ? parsed.labReports : [],
        appleFitnessLogs: Array.isArray(parsed.appleFitnessLogs) ? parsed.appleFitnessLogs : [],
        resetTokens: Array.isArray(parsed.resetTokens) ? parsed.resetTokens : [],
      };

      global.lastLoadedDiskMtime = fileMtime;
      return global.memoryStore;
    } catch (err) {
      console.error("Error reading data-store.json, creating initial store:", err);
    }
  }

  // Otherwise initialize fresh from seed data
  const userMap = new Map<string, UserProfile & { passwordHash?: string }>();

  // Populate seed users
  for (const seed of demoSeedUsers) {
    userMap.set(seed.id, {
      ...seed,
      passwordHash: "$2a$10$wT282gY6E1G6v6hQ.q1j2uR4v6zQZ7yK1m0N3p5s9o4X8j7h6f5d2", // default demo hash
    });
  }

  // Load local admin accounts created via CLI if present
  try {
    const adminStorePath = path.resolve(process.cwd(), "lib/admin-store.json");
    if (fs.existsSync(adminStorePath)) {
      const localAdmins = JSON.parse(fs.readFileSync(adminStorePath, "utf-8"));
      for (const a of localAdmins) {
        userMap.set(a.id, a);
      }
    }
  } catch {
    // Ignore if not present
  }

  global.memoryStore = {
    users: userMap,
    glucose: [...demoGlucoseReadings],
    medications: [...demoMedications],
    medicationLogs: [...demoMedicationLogs],
    meals: [...demoMeals],
    activities: [...demoActivities],
    appointments: [...demoAppointments],
    rations: [...demoRationItems],
    dailyLogs: [],
    labReports: [...demoLabReports],
    resetTokens: [],
    appleFitnessLogs: [],
  };

  persistStoreToDisk();
  return global.memoryStore!;
}

export const memoryDb = {
  getStore: getMemoryStore,
  persist: persistStoreToDisk,

  // User
  getUserById(id: string): UserProfile | undefined {
    const store = getMemoryStore();
    const u = store.users.get(id);
    if (!u) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = u;
    return profile;
  },

  getUserByEmail(email: string): (UserProfile & { passwordHash?: string }) | undefined {
    const store = getMemoryStore();
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  },

  saveUser(user: UserProfile & { passwordHash?: string }) {
    const store = getMemoryStore();
    store.users.set(user.id, user);
    persistStoreToDisk();
    return user;
  },

  getAllUsers(): AdminUserSummary[] {
    const store = getMemoryStore();
    const summaries: AdminUserSummary[] = [];

    for (const u of store.users.values()) {
      const readings = store.glucose.filter((g) => g.userId === u.id);
      const latestReading = readings[0];

      summaries.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || "patient",
        status: u.status || "active",
        permissions: u.permissions || {
          canLogGlucose: true,
          canManageMedications: true,
          canLogMeals: true,
          canManageRation: true,
          canLogActivity: true,
          canManageAppointments: true,
          canViewReports: true,
          canExportData: true,
        },
        diabetesType: u.diabetesType,
        readingsCount: readings.length,
        lastActive: latestReading ? latestReading.measuredAt : u.createdAt,
        createdAt: u.createdAt,
      });
    }

    return summaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const store = getMemoryStore();
    const existing = store.users.get(id);
    if (!existing) return null;

    const updated: UserProfile & { passwordHash?: string } = {
      ...existing,
      ...updates,
      permissions: updates.permissions
        ? { ...existing.permissions, ...updates.permissions }
        : existing.permissions,
    };
    store.users.set(id, updated);
    persistStoreToDisk();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = updated;
    return profile;
  },

  updateUserRoleAndPermissions(
    id: string,
    role: UserRole,
    status: UserStatus,
    permissions: Partial<UserPermissions>
  ): UserProfile | null {
    const store = getMemoryStore();
    const existing = store.users.get(id);
    if (!existing) return null;

    const updated: UserProfile & { passwordHash?: string } = {
      ...existing,
      role,
      status,
      permissions: {
        ...existing.permissions,
        ...permissions,
      },
    };
    store.users.set(id, updated);
    persistStoreToDisk();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = updated;
    return profile;
  },

  deleteUser(id: string): boolean {
    const store = getMemoryStore();
    const deleted = store.users.delete(id);
    if (deleted) {
      store.glucose = store.glucose.filter((g) => g.userId !== id);
      store.medications = store.medications.filter((m) => m.userId !== id);
      store.medicationLogs = store.medicationLogs.filter((l) => l.userId !== id);
      store.meals = store.meals.filter((m) => m.userId !== id);
      store.activities = store.activities.filter((a) => a.userId !== id);
      store.appointments = store.appointments.filter((a) => a.userId !== id);
      store.rations = store.rations.filter((r) => r.userId !== id);
      store.dailyLogs = store.dailyLogs.filter((l) => l.userId !== id);
      store.labReports = store.labReports.filter((r) => r.userId !== id);
      persistStoreToDisk();
    }
    return deleted;
  },

  getAdminStats(): AdminSystemStats {
    const store = getMemoryStore();
    const users = Array.from(store.users.values());

    return {
      totalUsers: users.length,
      activePatients: users.filter((u) => (u.role || "patient") === "patient" && (u.status || "active") === "active").length,
      totalDoctors: users.filter((u) => u.role === "doctor").length,
      totalAdmins: users.filter((u) => u.role === "admin").length,
      totalReadingsLogged: store.glucose.length,
      totalMedicationsTracked: store.medications.length,
      suspendedUsers: users.filter((u) => u.status === "suspended").length,
    };
  },

  ensureUserStarterData(userId: string) {
    if (!userId) return;
    const store = getMemoryStore();
    let hasChanges = false;

    // Starter glucose
    const hasGlucose = store.glucose.some((g) => g.userId === userId);
    if (!hasGlucose) {
      const clonedGlucose = demoGlucoseReadings.slice(0, 15).map((g, idx) => ({
        ...g,
        id: `glu-${userId}-${idx}-${Date.now()}`,
        userId,
      }));
      store.glucose.push(...clonedGlucose);
      hasChanges = true;
    }

    // Starter medications
    const hasMeds = store.medications.some((m) => m.userId === userId);
    if (!hasMeds) {
      const clonedMeds = demoMedications.map((m, idx) => ({
        ...m,
        id: `med-${userId}-${idx}`,
        userId,
      }));
      store.medications.push(...clonedMeds);

      const clonedLogs = demoMedicationLogs.map((l, idx) => ({
        ...l,
        id: `medlog-${userId}-${idx}`,
        userId,
        medicationId: `med-${userId}-0`,
      }));
      store.medicationLogs.push(...clonedLogs);
      hasChanges = true;
    }

    // Starter meals
    const hasMeals = store.meals.some((m) => m.userId === userId);
    if (!hasMeals) {
      const clonedMeals = demoMeals.map((m, idx) => ({
        ...m,
        id: `meal-${userId}-${idx}`,
        userId,
      }));
      store.meals.push(...clonedMeals);
      hasChanges = true;
    }

    // Starter activities
    const hasActivities = store.activities.some((a) => a.userId === userId);
    if (!hasActivities) {
      const clonedActs = demoActivities.map((a, idx) => ({
        ...a,
        id: `act-${userId}-${idx}`,
        userId,
      }));
      store.activities.push(...clonedActs);
      hasChanges = true;
    }

    // Starter appointments
    const hasAppts = store.appointments.some((a) => a.userId === userId);
    if (!hasAppts) {
      const clonedAppts = demoAppointments.map((a, idx) => ({
        ...a,
        id: `appt-${userId}-${idx}`,
        userId,
      }));
      store.appointments.push(...clonedAppts);
      hasChanges = true;
    }

    // Starter rations
    const hasRations = store.rations.some((r) => r.userId === userId);
    if (!hasRations) {
      const clonedRations = demoRationItems.map((r, idx) => ({
        ...r,
        id: `rat-${userId}-${idx}`,
        userId,
      }));
      store.rations.push(...clonedRations);
      hasChanges = true;
    }

    // Starter lab & diagnostic reports
    const hasLabReports = store.labReports.some((r) => r.userId === userId);
    if (!hasLabReports) {
      const clonedReports = demoLabReports.map((r, idx) => ({
        ...r,
        id: `rep-${userId}-${idx}`,
        userId,
      }));
      store.labReports.push(...clonedReports);
      hasChanges = true;
    }

    // Starter Apple Fitness Daily Logs (Calories, Step Count, Step Distance)
    if (!store.appleFitnessLogs) store.appleFitnessLogs = [];
    const hasFitnessLogs = store.appleFitnessLogs.some((f) => f.userId === userId);
    if (!hasFitnessLogs) {
      const today = new Date();
      const demoFitness: AppleFitnessDayLog[] = [
        {
          id: `fit-${userId}-0`,
          userId,
          date: today.toISOString().split("T")[0],
          calories: 520,
          stepCount: 8450,
          stepDistance: 6.2,
          caloriesGoal: 500,
          stepCountGoal: 10000,
          stepDistanceGoal: 5.0,
          notes: "Daily walk & commute movement",
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: `fit-${userId}-1`,
          userId,
          date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
          calories: 580,
          stepCount: 9800,
          stepDistance: 7.3,
          caloriesGoal: 500,
          stepCountGoal: 10000,
          stepDistanceGoal: 5.0,
          notes: "Brisk evening walk after dinner",
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: `fit-${userId}-2`,
          userId,
          date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
          calories: 460,
          stepCount: 7200,
          stepDistance: 5.1,
          caloriesGoal: 500,
          stepCountGoal: 10000,
          stepDistanceGoal: 5.0,
          notes: "Desk work + stair intervals",
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
        {
          id: `fit-${userId}-3`,
          userId,
          date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
          calories: 610,
          stepCount: 10400,
          stepDistance: 7.8,
          caloriesGoal: 500,
          stepCountGoal: 10000,
          stepDistanceGoal: 5.0,
          notes: "Closed all 3 rings! Jog + weekend hike",
          createdAt: today.toISOString(),
          updatedAt: today.toISOString(),
        },
      ];
      store.appleFitnessLogs.push(...demoFitness);
      hasChanges = true;
    }

    if (hasChanges) {
      persistStoreToDisk();
    }
  },

  // Glucose
  getGlucoseReadings(userId: string): GlucoseReading[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.glucose
      .filter((g) => g.userId === userId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  },

  addGlucoseReading(reading: GlucoseReading): GlucoseReading {
    const store = getMemoryStore();
    store.glucose.unshift(reading);
    persistStoreToDisk();
    return reading;
  },

  updateGlucoseReading(id: string, userId: string, updates: Partial<GlucoseReading>): GlucoseReading | null {
    const store = getMemoryStore();
    const index = store.glucose.findIndex((g) => g.id === id && g.userId === userId);
    if (index === -1) return null;
    store.glucose[index] = {
      ...store.glucose[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persistStoreToDisk();
    return store.glucose[index];
  },

  deleteGlucoseReading(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const initialLen = store.glucose.length;
    store.glucose = store.glucose.filter((g) => !(g.id === id && g.userId === userId));
    const changed = store.glucose.length < initialLen;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Medications
  getMedications(userId: string): Medication[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.medications.filter((m) => m.userId === userId);
  },

  addMedication(med: Medication): Medication {
    const store = getMemoryStore();
    store.medications.push(med);
    persistStoreToDisk();
    return med;
  },

  updateMedication(id: string, userId: string, updates: Partial<Medication>): Medication | null {
    const store = getMemoryStore();
    const index = store.medications.findIndex((m) => m.id === id && m.userId === userId);
    if (index === -1) return null;
    store.medications[index] = {
      ...store.medications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persistStoreToDisk();
    return store.medications[index];
  },

  deleteMedication(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const initialLen = store.medications.length;
    store.medications = store.medications.filter((m) => !(m.id === id && m.userId === userId));
    const changed = store.medications.length < initialLen;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Medication Logs
  getMedicationLogs(userId: string): MedicationLog[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.medicationLogs
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },

  addMedicationLog(log: MedicationLog): MedicationLog {
    const store = getMemoryStore();
    store.medicationLogs.unshift(log);
    persistStoreToDisk();
    return log;
  },

  // Meals
  getMeals(userId: string): Meal[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.meals
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addMeal(meal: Meal): Meal {
    const store = getMemoryStore();
    store.meals.unshift(meal);

    // Auto-deduct connected ration ingredients from this month's ration
    if (meal.rationIngredients && meal.rationIngredients.length > 0) {
      for (const ing of meal.rationIngredients) {
        memoryDb.deductRation(ing.rationId, meal.userId, ing.quantity);
      }
    }

    persistStoreToDisk();
    return meal;
  },

  deleteMeal(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const targetMeal = store.meals.find((m) => m.id === id && m.userId === userId);
    if (!targetMeal) return false;

    // Restore connected ration quantities if any
    if (targetMeal.rationIngredients && targetMeal.rationIngredients.length > 0) {
      for (const ing of targetMeal.rationIngredients) {
        memoryDb.restoreRation(ing.rationId, userId, ing.quantity);
      }
    }

    store.meals = store.meals.filter((m) => m.id !== id);
    persistStoreToDisk();
    return true;
  },

  // Activities
  getActivities(userId: string): Activity[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.activities
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());
  },

  addActivity(act: Activity): Activity {
    const store = getMemoryStore();
    store.activities.unshift(act);
    persistStoreToDisk();
    return act;
  },

  deleteActivity(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.activities.length;
    store.activities = store.activities.filter((a) => !(a.id === id && a.userId === userId));
    const changed = store.activities.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Appointments
  getAppointments(userId: string): Appointment[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.appointments
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());
  },

  addAppointment(app: Appointment): Appointment {
    const store = getMemoryStore();
    store.appointments.push(app);
    persistStoreToDisk();
    return app;
  },

  updateAppointment(id: string, userId: string, updates: Partial<Appointment>): Appointment | null {
    const store = getMemoryStore();
    const index = store.appointments.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return null;
    store.appointments[index] = {
      ...store.appointments[index],
      ...updates,
    };
    persistStoreToDisk();
    return store.appointments[index];
  },

  deleteAppointment(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.appointments.length;
    store.appointments = store.appointments.filter((a) => !(a.id === id && a.userId === userId));
    const changed = store.appointments.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Rations
  getRations(userId: string, month?: string): RationItem[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.rations
      .filter((r) => r.userId === userId && (!month || r.month === month))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getRationById(id: string, userId: string): RationItem | undefined {
    const store = getMemoryStore();
    return store.rations.find((r) => r.id === id && r.userId === userId);
  },

  addRation(ration: RationItem): RationItem {
    const store = getMemoryStore();
    store.rations.push(ration);
    persistStoreToDisk();
    return ration;
  },

  updateRation(id: string, userId: string, updates: Partial<RationItem>): RationItem | null {
    const store = getMemoryStore();
    const idx = store.rations.findIndex((r) => r.id === id && r.userId === userId);
    if (idx === -1) return null;
    store.rations[idx] = {
      ...store.rations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persistStoreToDisk();
    return store.rations[idx];
  },

  deleteRation(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.rations.length;
    store.rations = store.rations.filter((r) => !(r.id === id && r.userId === userId));
    const changed = store.rations.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  deductRation(rationId: string, userId: string, quantity: number): boolean {
    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity + quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    persistStoreToDisk();
    return true;
  },

  restoreRation(rationId: string, userId: string, quantity: number): boolean {
    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity - quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    persistStoreToDisk();
    return true;
  },

  // Daily Logs & Routines
  getDailyLog(userId: string, date: string): DailyLogRecord | undefined {
    const store = getMemoryStore();
    return store.dailyLogs.find((l) => l.userId === userId && l.date === date);
  },

  saveDailyLog(log: DailyLogRecord): DailyLogRecord {
    const store = getMemoryStore();
    const idx = store.dailyLogs.findIndex((l) => l.userId === log.userId && l.date === log.date);
    const now = new Date().toISOString();
    let result: DailyLogRecord;
    if (idx >= 0) {
      store.dailyLogs[idx] = {
        ...store.dailyLogs[idx],
        ...log,
        updatedAt: now,
      };
      result = store.dailyLogs[idx];
    } else {
      const newLog = {
        ...log,
        id: log.id || `daily-log-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      store.dailyLogs.push(newLog);
      result = newLog;
    }
    persistStoreToDisk();
    return result;
  },

  getDailyLogs(userId: string, limit = 30): DailyLogRecord[] {
    const store = getMemoryStore();
    return store.dailyLogs
      .filter((l) => l.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  },

  // Lab & Diagnostic Reports
  getLabReports(userId: string): LabReport[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.labReports
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addLabReport(report: LabReport): LabReport {
    const store = getMemoryStore();
    store.labReports.unshift(report);
    persistStoreToDisk();
    return report;
  },

  deleteLabReport(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.labReports.length;
    store.labReports = store.labReports.filter((r) => !(r.id === id && r.userId === userId));
    const changed = store.labReports.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Apple Fitness Daily Logs (Calories, Step Count, Step Distance)
  getAppleFitnessLogs(userId: string): AppleFitnessDayLog[] {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return (store.appleFitnessLogs || [])
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getAppleFitnessLogForDate(userId: string, date: string): AppleFitnessDayLog | null {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    const found = (store.appleFitnessLogs || []).find(
      (f) => f.userId === userId && f.date === date
    );
    return found || null;
  },

  saveAppleFitnessLog(userId: string, data: AppleFitnessLogInput): AppleFitnessDayLog {
    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    if (!store.appleFitnessLogs) store.appleFitnessLogs = [];

    const existingIdx = store.appleFitnessLogs.findIndex(
      (f) => f.userId === userId && f.date === data.date
    );

    const now = new Date().toISOString();

    if (existingIdx >= 0) {
      const existing = store.appleFitnessLogs[existingIdx];
      const updated: AppleFitnessDayLog = {
        ...existing,
        calories: Number(data.calories),
        stepCount: Number(data.stepCount),
        stepDistance: Number(data.stepDistance),
        caloriesGoal: data.caloriesGoal ? Number(data.caloriesGoal) : (existing.caloriesGoal || 500),
        stepCountGoal: data.stepCountGoal ? Number(data.stepCountGoal) : (existing.stepCountGoal || 10000),
        stepDistanceGoal: data.stepDistanceGoal ? Number(data.stepDistanceGoal) : (existing.stepDistanceGoal || 5.0),
        notes: data.notes !== undefined ? data.notes : existing.notes,
        updatedAt: now,
      };
      store.appleFitnessLogs[existingIdx] = updated;
      persistStoreToDisk();
      return updated;
    } else {
      const newLog: AppleFitnessDayLog = {
        id: `fit-${userId}-${data.date}-${Date.now()}`,
        userId,
        date: data.date,
        calories: Number(data.calories),
        stepCount: Number(data.stepCount),
        stepDistance: Number(data.stepDistance),
        caloriesGoal: Number(data.caloriesGoal || 500),
        stepCountGoal: Number(data.stepCountGoal || 10000),
        stepDistanceGoal: Number(data.stepDistanceGoal || 5.0),
        notes: data.notes || "",
        createdAt: now,
        updatedAt: now,
      };
      store.appleFitnessLogs.unshift(newLog);
      persistStoreToDisk();
      return newLog;
    }
  },

  deleteAppleFitnessLog(id: string, userId: string): boolean {
    const store = getMemoryStore();
    if (!store.appleFitnessLogs) return false;
    const len = store.appleFitnessLogs.length;
    store.appleFitnessLogs = store.appleFitnessLogs.filter(
      (f) => !(f.id === id && f.userId === userId)
    );
    const changed = store.appleFitnessLogs.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // Password Reset Tokens
  saveResetToken(email: string, token: string, expiresInMs = 60 * 60 * 1000): void {
    const store = getMemoryStore();
    const normalizedEmail = email.toLowerCase().trim();
    if (!store.resetTokens) store.resetTokens = [];
    store.resetTokens = store.resetTokens.filter(
      (r) => r.email !== normalizedEmail && r.expiresAt > Date.now()
    );
    store.resetTokens.push({
      email: normalizedEmail,
      token,
      expiresAt: Date.now() + expiresInMs,
    });
    persistStoreToDisk();
  },

  verifyResetToken(email: string, token: string): boolean {
    const store = getMemoryStore();
    const normalizedEmail = email.toLowerCase().trim();
    const found = store.resetTokens?.find(
      (r) => r.email === normalizedEmail && r.token === token && r.expiresAt > Date.now()
    );
    return Boolean(found);
  },

  consumeResetToken(email: string, token: string): boolean {
    const store = getMemoryStore();
    const normalizedEmail = email.toLowerCase().trim();
    const idx = store.resetTokens?.findIndex(
      (r) => r.email === normalizedEmail && r.token === token && r.expiresAt > Date.now()
    );
    if (idx !== undefined && idx >= 0) {
      store.resetTokens.splice(idx, 1);
      persistStoreToDisk();
      return true;
    }
    return false;
  },

  // Doctor Clinical Portal: Patient Full Clinical Dossier
  getPatientFullDossier(patientId: string) {
    this.ensureUserStarterData(patientId);
    const store = getMemoryStore();
    const user = this.getUserById(patientId);
    if (!user) return null;

    const glucose = store.glucose
      .filter((g) => g.userId === patientId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());

    const medications = store.medications.filter((m) => m.userId === patientId);
    const medicationLogs = store.medicationLogs
      .filter((l) => l.userId === patientId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const meals = store.meals
      .filter((m) => m.userId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activities = store.activities
      .filter((a) => a.userId === patientId)
      .sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());

    const appointments = store.appointments
      .filter((a) => a.userId === patientId)
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

    const rations = store.rations
      .filter((r) => r.userId === patientId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const dailyLogs = store.dailyLogs
      .filter((l) => l.userId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date));

    const labReports = store.labReports
      .filter((r) => r.userId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const appleFitnessLogs = (store.appleFitnessLogs || [])
      .filter((f) => f.userId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalReadings = glucose.length;
    const avgGlucose = totalReadings > 0
      ? Math.round(glucose.reduce((acc, g) => acc + g.value, 0) / totalReadings)
      : 0;
    const totalMinsActive = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
    const totalSteps = activities.reduce((acc, a) => acc + (a.steps || 0), 0);
    const adherenceLogs = dailyLogs.slice(0, 14);
    const avgAdherence = adherenceLogs.length > 0
      ? Math.round(adherenceLogs.reduce((acc, l) => acc + (l.adherencePercentage || 0), 0) / adherenceLogs.length)
      : 85;

    return {
      user,
      glucose,
      medications,
      medicationLogs,
      meals,
      activities,
      appointments,
      rations,
      dailyLogs,
      labReports,
      appleFitnessLogs,
      metrics: {
        totalReadings,
        avgGlucose,
        totalMinsActive,
        totalSteps,
        avgAdherence,
        activeMedsCount: medications.length,
        mealsLoggedCount: meals.length,
        labReportsCount: labReports.length,
        fitnessLogsCount: appleFitnessLogs.length,
        latestFitness: appleFitnessLogs[0] || null,
      },
    };
  },
};

export const db = memoryDb;
