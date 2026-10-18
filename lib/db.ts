import mongoose from "mongoose";
import dns from "dns";
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
import {
  UserModel,
  GlucoseReadingModel,
  MedicationModel,
  MedicationLogModel,
  MealModel,
  ActivityModel,
  AppointmentModel,
  RationItemModel,
  LabReportModel,
  AppleFitnessDayLogModel,
  DailyLogRecordModel,
  ResetTokenModel,
} from "./models";

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
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
      // ignore
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log("[MongoDB] Connected to Atlas cluster successfully");
        return m;
      })
      .catch((err) => {
        console.warn("[MongoDB] Connection warning, using in-memory store:", err.message);
        cached.promise = null;
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

// Automatically initiate connection on import
if (process.env.MONGODB_URI) {
  connectToDatabase().catch(() => {});
}

function formatMongoDoc<T = any>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id && !obj.id) {
    obj.id = obj._id.toString();
  }
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

// -------------------------------------------------------------
// In-Memory & File-Backed Fallback Data Repository
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
  } catch {
    // EROFS on serverless or filesystem restrictions
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

  if (
    global.memoryStore &&
    global.lastLoadedDiskMtime &&
    fileMtime <= global.lastLoadedDiskMtime
  ) {
    return global.memoryStore;
  }

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
    } catch {
      // fall through to seed
    }
  }

  const userMap = new Map<string, UserProfile & { passwordHash?: string }>();

  for (const seed of demoSeedUsers) {
    userMap.set(seed.id, {
      ...seed,
      passwordHash: "$2a$10$wT282gY6E1G6v6hQ.q1j2uR4v6zQZ7yK1m0N3p5s9o4X8j7h6f5d2",
    });
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

// -------------------------------------------------------------
// Unified Persistent Hybrid Database Engine
// Reads & writes to MongoDB Atlas when connected, with local fallback
// -------------------------------------------------------------

export const memoryDb = {
  getStore: getMemoryStore,
  persist: persistStoreToDisk,

  // --- User Operations ---
  async getUserById(id: string): Promise<UserProfile | undefined> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const u = await UserModel.findOne({ id }).lean();
        if (u) {
          const formatted = formatMongoDoc<UserProfile & { passwordHash?: string }>(u);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { passwordHash, ...profile } = formatted;
          return profile as UserProfile;
        }
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const u = store.users.get(id);
    if (!u) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...profile } = u;
    return profile;
  },

  async getUserByEmail(email: string): Promise<(UserProfile & { passwordHash?: string }) | undefined> {
    const normalized = email.toLowerCase().trim();
    try {
      const m = await connectToDatabase();
      if (m) {
        const u = await UserModel.findOne({ email: normalized }).lean();
        if (u) {
          return formatMongoDoc<UserProfile & { passwordHash?: string }>(u);
        }
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return u;
      }
    }
    return undefined;
  },

  async saveUser(user: UserProfile & { passwordHash?: string }) {
    try {
      const m = await connectToDatabase();
      if (m) {
        await UserModel.findOneAndUpdate(
          { id: user.id },
          { ...user, email: user.email.toLowerCase().trim() },
          { upsert: true, new: true }
        );
      }
    } catch (err: any) {
      console.warn("[MongoDB] saveUser warning:", err.message);
    }

    const store = getMemoryStore();
    store.users.set(user.id, user);
    persistStoreToDisk();
    return user;
  },

  async getAllUsers(): Promise<AdminUserSummary[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const users = await UserModel.find({}).lean();
        if (users && users.length > 0) {
          const summaries: AdminUserSummary[] = [];
          for (const u of users) {
            const count = await GlucoseReadingModel.countDocuments({ userId: u.id });
            const latest = await GlucoseReadingModel.findOne({ userId: u.id }).sort({ measuredAt: -1 }).lean();
            summaries.push({
              id: u.id,
              name: u.name,
              email: u.email,
              role: (u.role as UserRole) || "patient",
              status: (u.status as UserStatus) || "active",
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
              diabetesType: u.diabetesType as any,
              readingsCount: count,
              lastActive: latest ? latest.date : new Date(u.createdAt).toISOString(),
              createdAt: new Date(u.createdAt).toISOString(),
            });
          }
          return summaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    } catch {
      // fallback
    }

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

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const updated = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
        if (updated) {
          const formatted = formatMongoDoc<UserProfile & { passwordHash?: string }>(updated);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { passwordHash, ...profile } = formatted;
          return profile as UserProfile;
        }
      }
    } catch {
      // fallback
    }

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

  async updateUserRoleAndPermissions(
    id: string,
    role: UserRole,
    status: UserStatus,
    permissions: Partial<UserPermissions>
  ): Promise<UserProfile | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const existing = await UserModel.findOne({ id }).lean();
        if (existing) {
          const mergedPermissions = { ...existing.permissions, ...permissions };
          const updated = await UserModel.findOneAndUpdate(
            { id },
            { $set: { role, status, permissions: mergedPermissions } },
            { new: true }
          ).lean();
          if (updated) {
            const formatted = formatMongoDoc<UserProfile & { passwordHash?: string }>(updated);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { passwordHash, ...profile } = formatted;
            return profile as UserProfile;
          }
        }
      }
    } catch {
      // fallback
    }

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

  async deleteUser(id: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await UserModel.deleteOne({ id });
        await GlucoseReadingModel.deleteMany({ userId: id });
        await MedicationModel.deleteMany({ userId: id });
        await MedicationLogModel.deleteMany({ userId: id });
        await MealModel.deleteMany({ userId: id });
        await ActivityModel.deleteMany({ userId: id });
        await AppointmentModel.deleteMany({ userId: id });
        await RationItemModel.deleteMany({ userId: id });
        await DailyLogRecordModel.deleteMany({ userId: id });
        await LabReportModel.deleteMany({ userId: id });
        await AppleFitnessDayLogModel.deleteMany({ userId: id });
      }
    } catch {
      // fallback
    }

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

  async getAdminStats(): Promise<AdminSystemStats> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const totalUsers = await UserModel.countDocuments({});
        const activePatients = await UserModel.countDocuments({ role: "patient", status: "active" });
        const totalDoctors = await UserModel.countDocuments({ role: "doctor" });
        const totalAdmins = await UserModel.countDocuments({ role: "admin" });
        const totalReadingsLogged = await GlucoseReadingModel.countDocuments({});
        const totalMedicationsTracked = await MedicationModel.countDocuments({});
        const suspendedUsers = await UserModel.countDocuments({ status: "suspended" });

        return {
          totalUsers,
          activePatients,
          totalDoctors,
          totalAdmins,
          totalReadingsLogged,
          totalMedicationsTracked,
          suspendedUsers,
        };
      }
    } catch {
      // fallback
    }

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
      ];
      store.appleFitnessLogs.push(...demoFitness);
      hasChanges = true;
    }

    if (hasChanges) {
      persistStoreToDisk();
    }
  },

  // --- Blood Glucose Operations ---
  async getGlucoseReadings(userId: string): Promise<GlucoseReading[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await GlucoseReadingModel.find({ userId }).sort({ measuredAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.glucose
      .filter((g) => g.userId === userId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  },

  async addGlucoseReading(reading: GlucoseReading): Promise<GlucoseReading> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await GlucoseReadingModel.findOneAndUpdate(
          { id: reading.id },
          reading,
          { upsert: true, new: true }
        );
      }
    } catch (err: any) {
      console.warn("[MongoDB] addGlucoseReading warning:", err.message);
    }

    const store = getMemoryStore();
    store.glucose.unshift(reading);
    persistStoreToDisk();
    return reading;
  },

  async updateGlucoseReading(id: string, userId: string, updates: Partial<GlucoseReading>): Promise<GlucoseReading | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const updated = await GlucoseReadingModel.findOneAndUpdate(
          { id, userId },
          { $set: { ...updates, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
        if (updated) return formatMongoDoc(updated);
      }
    } catch {
      // fallback
    }

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

  async deleteGlucoseReading(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await GlucoseReadingModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const initialLen = store.glucose.length;
    store.glucose = store.glucose.filter((g) => !(g.id === id && g.userId === userId));
    const changed = store.glucose.length < initialLen;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Medication Operations ---
  async getMedications(userId: string): Promise<Medication[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await MedicationModel.find({ userId }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.medications.filter((m) => m.userId === userId);
  },

  async addMedication(med: Medication): Promise<Medication> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await MedicationModel.findOneAndUpdate({ id: med.id }, med, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addMedication warning:", err.message);
    }

    const store = getMemoryStore();
    store.medications.push(med);
    persistStoreToDisk();
    return med;
  },

  async updateMedication(id: string, userId: string, updates: Partial<Medication>): Promise<Medication | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const updated = await MedicationModel.findOneAndUpdate({ id, userId }, { $set: updates }, { new: true }).lean();
        if (updated) return formatMongoDoc(updated);
      }
    } catch {
      // fallback
    }

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

  async deleteMedication(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await MedicationModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const initialLen = store.medications.length;
    store.medications = store.medications.filter((m) => !(m.id === id && m.userId === userId));
    const changed = store.medications.length < initialLen;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Medication Log Operations ---
  async getMedicationLogs(userId: string): Promise<MedicationLog[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await MedicationLogModel.find({ userId }).sort({ scheduledAt: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.medicationLogs
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },

  async addMedicationLog(log: MedicationLog): Promise<MedicationLog> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await MedicationLogModel.findOneAndUpdate({ id: log.id }, log, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addMedicationLog warning:", err.message);
    }

    const store = getMemoryStore();
    store.medicationLogs.unshift(log);
    persistStoreToDisk();
    return log;
  },

  // --- Meal Operations ---
  async getMeals(userId: string): Promise<Meal[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await MealModel.find({ userId }).sort({ date: -1, time: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.meals
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addMeal(meal: Meal): Promise<Meal> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await MealModel.findOneAndUpdate({ id: meal.id }, meal, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addMeal warning:", err.message);
    }

    const store = getMemoryStore();
    store.meals.unshift(meal);

    if (meal.rationIngredients && meal.rationIngredients.length > 0) {
      for (const ing of meal.rationIngredients) {
        this.deductRation(ing.rationId, meal.userId, ing.quantity);
      }
    }

    persistStoreToDisk();
    return meal;
  },

  async deleteMeal(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await MealModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const targetMeal = store.meals.find((m) => m.id === id && m.userId === userId);
    if (!targetMeal) return false;

    if (targetMeal.rationIngredients && targetMeal.rationIngredients.length > 0) {
      for (const ing of targetMeal.rationIngredients) {
        this.restoreRation(ing.rationId, userId, ing.quantity);
      }
    }

    store.meals = store.meals.filter((m) => m.id !== id);
    persistStoreToDisk();
    return true;
  },

  // --- Physical Activity Operations ---
  async getActivities(userId: string): Promise<Activity[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await ActivityModel.find({ userId }).sort({ date: -1, time: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.activities
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());
  },

  async addActivity(act: Activity): Promise<Activity> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await ActivityModel.findOneAndUpdate({ id: act.id }, act, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addActivity warning:", err.message);
    }

    const store = getMemoryStore();
    store.activities.unshift(act);
    persistStoreToDisk();
    return act;
  },

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await ActivityModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const len = store.activities.length;
    store.activities = store.activities.filter((a) => !(a.id === id && a.userId === userId));
    const changed = store.activities.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Appointment Operations ---
  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await AppointmentModel.find({ userId }).sort({ date: 1, time: 1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.appointments
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());
  },

  async addAppointment(app: Appointment): Promise<Appointment> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await AppointmentModel.findOneAndUpdate({ id: app.id }, app, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addAppointment warning:", err.message);
    }

    const store = getMemoryStore();
    store.appointments.push(app);
    persistStoreToDisk();
    return app;
  },

  async updateAppointment(id: string, userId: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const updated = await AppointmentModel.findOneAndUpdate({ id, userId }, { $set: updates }, { new: true }).lean();
        if (updated) return formatMongoDoc(updated);
      }
    } catch {
      // fallback
    }

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

  async deleteAppointment(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await AppointmentModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const len = store.appointments.length;
    store.appointments = store.appointments.filter((a) => !(a.id === id && a.userId === userId));
    const changed = store.appointments.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Ration & Pantry Operations ---
  async getRations(userId: string, month?: string): Promise<RationItem[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const query: any = { userId };
        if (month) query.month = month;
        const docs = await RationItemModel.find(query).sort({ name: 1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.rations
      .filter((r) => r.userId === userId && (!month || r.month === month))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getRationItems(userId: string, month?: string): Promise<RationItem[]> {
    return this.getRations(userId, month);
  },

  async addRationItem(item: RationItem): Promise<RationItem> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await RationItemModel.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addRationItem warning:", err.message);
    }

    const store = getMemoryStore();
    store.rations.push(item);
    persistStoreToDisk();
    return item;
  },

  async addRation(ration: RationItem): Promise<RationItem> {
    return this.addRationItem(ration);
  },

  async updateRationItem(id: string, userId: string, updates: Partial<RationItem>): Promise<RationItem | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const updated = await RationItemModel.findOneAndUpdate(
          { id, userId },
          { $set: { ...updates, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
        if (updated) return formatMongoDoc(updated);
      }
    } catch {
      // fallback
    }

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

  async updateRation(id: string, userId: string, updates: Partial<RationItem>): Promise<RationItem | null> {
    return this.updateRationItem(id, userId, updates);
  },

  async deleteRationItem(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await RationItemModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const len = store.rations.length;
    store.rations = store.rations.filter((r) => !(r.id === id && r.userId === userId));
    const changed = store.rations.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  async deleteRation(id: string, userId: string): Promise<boolean> {
    return this.deleteRationItem(id, userId);
  },

  async deductRation(rationId: string, userId: string, quantity: number): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await RationItemModel.updateOne(
          { id: rationId, userId },
          { $inc: { usedQuantity: quantity } }
        );
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity + quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    persistStoreToDisk();
    return true;
  },

  async restoreRation(rationId: string, userId: string, quantity: number): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await RationItemModel.updateOne(
          { id: rationId, userId },
          { $inc: { usedQuantity: -quantity } }
        );
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity - quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    persistStoreToDisk();
    return true;
  },

  // --- Diagnostic Lab Reports ---
  async getLabReports(userId: string): Promise<LabReport[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await LabReportModel.find({ userId }).sort({ date: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return store.labReports
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addLabReport(report: LabReport): Promise<LabReport> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await LabReportModel.findOneAndUpdate({ id: report.id }, report, { upsert: true, new: true });
      }
    } catch (err: any) {
      console.warn("[MongoDB] addLabReport warning:", err.message);
    }

    const store = getMemoryStore();
    store.labReports.unshift(report);
    persistStoreToDisk();
    return report;
  },

  async deleteLabReport(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await LabReportModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const len = store.labReports.length;
    store.labReports = store.labReports.filter((r) => !(r.id === id && r.userId === userId));
    const changed = store.labReports.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Apple Fitness Daily Logs (3 Strict Metrics: Calories, Steps, Distance) ---
  async getAppleFitnessLogs(userId: string): Promise<AppleFitnessDayLog[]> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const docs = await AppleFitnessDayLogModel.find({ userId }).sort({ date: -1 }).lean();
        if (docs && docs.length > 0) {
          return docs.map((d: any) => formatMongoDoc(d));
        }
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    return (store.appleFitnessLogs || [])
      .filter((f) => f.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async getAppleFitnessLogForDate(userId: string, date: string): Promise<AppleFitnessDayLog | null> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const doc = await AppleFitnessDayLogModel.findOne({ userId, date }).lean();
        if (doc) return formatMongoDoc(doc);
      }
    } catch {
      // fallback
    }

    this.ensureUserStarterData(userId);
    const store = getMemoryStore();
    const found = (store.appleFitnessLogs || []).find(
      (f) => f.userId === userId && f.date === date
    );
    return found || null;
  },

  async saveAppleFitnessLog(userId: string, data: AppleFitnessLogInput): Promise<AppleFitnessDayLog> {
    const now = new Date().toISOString();
    const id = `fit-${userId}-${data.date}`;
    const logDoc: AppleFitnessDayLog = {
      id,
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

    try {
      const m = await connectToDatabase();
      if (m) {
        await AppleFitnessDayLogModel.findOneAndUpdate(
          { userId, date: data.date },
          { $set: logDoc },
          { upsert: true, new: true }
        );
      }
    } catch (err: any) {
      console.warn("[MongoDB] saveAppleFitnessLog warning:", err.message);
    }

    const store = getMemoryStore();
    if (!store.appleFitnessLogs) store.appleFitnessLogs = [];
    const idx = store.appleFitnessLogs.findIndex((f) => f.userId === userId && f.date === data.date);
    if (idx >= 0) {
      store.appleFitnessLogs[idx] = logDoc;
    } else {
      store.appleFitnessLogs.unshift(logDoc);
    }
    persistStoreToDisk();
    return logDoc;
  },

  async deleteAppleFitnessLog(id: string, userId: string): Promise<boolean> {
    try {
      const m = await connectToDatabase();
      if (m) {
        await AppleFitnessDayLogModel.deleteOne({ id, userId });
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    if (!store.appleFitnessLogs) return false;
    const len = store.appleFitnessLogs.length;
    store.appleFitnessLogs = store.appleFitnessLogs.filter((f) => !(f.id === id && f.userId === userId));
    const changed = store.appleFitnessLogs.length < len;
    if (changed) persistStoreToDisk();
    return changed;
  },

  // --- Daily Checklist Logs ---
  async getDailyLog(userId: string, date: string): Promise<DailyLogRecord | undefined> {
    try {
      const m = await connectToDatabase();
      if (m) {
        const doc = await DailyLogRecordModel.findOne({ userId, date }).lean();
        if (doc) return formatMongoDoc(doc);
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    return store.dailyLogs.find((l) => l.userId === userId && l.date === date);
  },

  async saveDailyLog(log: DailyLogRecord): Promise<DailyLogRecord> {
    const now = new Date().toISOString();
    const id = log.id || `daily-log-${log.userId}-${log.date}`;
    const record = { ...log, id, updatedAt: now };

    try {
      const m = await connectToDatabase();
      if (m) {
        await DailyLogRecordModel.findOneAndUpdate(
          { userId: log.userId, date: log.date },
          { $set: record },
          { upsert: true, new: true }
        );
      }
    } catch (err: any) {
      console.warn("[MongoDB] saveDailyLog warning:", err.message);
    }

    const store = getMemoryStore();
    const idx = store.dailyLogs.findIndex((l) => l.userId === log.userId && l.date === log.date);
    if (idx >= 0) {
      store.dailyLogs[idx] = record;
    } else {
      store.dailyLogs.push(record);
    }
    persistStoreToDisk();
    return record;
  },

  // --- Password Reset Security Tokens ---
  async saveResetToken(email: string, token: string, expiresInMs = 60 * 60 * 1000): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + expiresInMs);

    try {
      const m = await connectToDatabase();
      if (m) {
        await ResetTokenModel.deleteMany({ email: normalizedEmail });
        await ResetTokenModel.create({ email: normalizedEmail, token, expiresAt });
      }
    } catch (err: any) {
      console.warn("[MongoDB] saveResetToken warning:", err.message);
    }

    const store = getMemoryStore();
    if (!store.resetTokens) store.resetTokens = [];
    store.resetTokens = store.resetTokens.filter(
      (r) => r.email !== normalizedEmail && r.expiresAt > Date.now()
    );
    store.resetTokens.push({
      email: normalizedEmail,
      token,
      expiresAt: expiresAt.getTime(),
    });
    persistStoreToDisk();
  },

  async verifyResetToken(email: string, token: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const m = await connectToDatabase();
      if (m) {
        const found = await ResetTokenModel.findOne({
          email: normalizedEmail,
          token,
          expiresAt: { $gt: new Date() },
        }).lean();
        if (found) return true;
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
    const found = store.resetTokens?.find(
      (r) => r.email === normalizedEmail && r.token === token && r.expiresAt > Date.now()
    );
    return Boolean(found);
  },

  async consumeResetToken(email: string, token: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      const m = await connectToDatabase();
      if (m) {
        const res = await ResetTokenModel.deleteOne({ email: normalizedEmail, token });
        if (res.deletedCount && res.deletedCount > 0) return true;
      }
    } catch {
      // fallback
    }

    const store = getMemoryStore();
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

  // --- Clinician Inspection Dossier ---
  async getPatientFullDossier(patientId: string) {
    this.ensureUserStarterData(patientId);
    const user = await this.getUserById(patientId);
    if (!user) return null;

    const glucose = await this.getGlucoseReadings(patientId);
    const medications = await this.getMedications(patientId);
    const medicationLogs = await this.getMedicationLogs(patientId);
    const meals = await this.getMeals(patientId);
    const activities = await this.getActivities(patientId);
    const appointments = await this.getAppointments(patientId);
    const rations = await this.getRations(patientId);
    const labReports = await this.getLabReports(patientId);
    const appleFitnessLogs = await this.getAppleFitnessLogs(patientId);

    const store = getMemoryStore();
    const dailyLogs = store.dailyLogs
      .filter((l) => l.userId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalReadings = glucose.length;
    const avgGlucose = totalReadings > 0
      ? Math.round(glucose.reduce((acc, g) => acc + g.value, 0) / totalReadings)
      : 0;
    const totalMinsActive = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
    const totalSteps = activities.reduce((acc, a) => acc + (a.steps || 0), 0);
    const adherenceLogs = dailyLogs.slice(0, 14);
    const avgAdherence = adherenceLogs.length > 0
      ? Math.round(adherenceLogs.reduce((acc, l) => acc + ((l as any).adherencePercentage || 0), 0) / adherenceLogs.length)
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
