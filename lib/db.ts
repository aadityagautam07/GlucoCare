import mongoose from "mongoose";
import {
  demoUser,
  demoGlucoseReadings,
  demoMedications,
  demoMedicationLogs,
  demoMeals,
  demoActivities,
  demoAppointments,
  demoRationItems,
  DEMO_USER_ID,
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
} from "@/types";

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
    // In-memory demo mode active
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
        console.warn("MongoDB connection failed, falling back to memory store:", err.message);
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
// In-Memory Repository Store (Guarantees zero-friction offline/demo execution)
// -------------------------------------------------------------

interface InMemStore {
  users: Map<string, UserProfile & { passwordHash?: string }>;
  glucose: GlucoseReading[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  meals: Meal[];
  activities: Activity[];
  appointments: Appointment[];
  rations: RationItem[];
}

declare global {
  var memoryStore: InMemStore | undefined;
}

function getMemoryStore(): InMemStore {
  if (!global.memoryStore) {
    const userMap = new Map<string, UserProfile & { passwordHash?: string }>();
    userMap.set(DEMO_USER_ID, {
      ...demoUser,
      passwordHash: "$2a$10$wT282gY6E1G6v6hQ.q1j2uR4v6zQZ7yK1m0N3p5s9o4X8j7h6f5d2", // "demopatient123"
    });

    global.memoryStore = {
      users: userMap,
      glucose: [...demoGlucoseReadings],
      medications: [...demoMedications],
      medicationLogs: [...demoMedicationLogs],
      meals: [...demoMeals],
      activities: [...demoActivities],
      appointments: [...demoAppointments],
      rations: [...demoRationItems],
    };
  }
  return global.memoryStore;
}

export const memoryDb = {
  getStore: getMemoryStore,

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
    return user;
  },

  // Glucose
  getGlucoseReadings(userId: string): GlucoseReading[] {
    const store = getMemoryStore();
    return store.glucose
      .filter((g) => g.userId === userId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
  },

  addGlucoseReading(reading: GlucoseReading): GlucoseReading {
    const store = getMemoryStore();
    store.glucose.unshift(reading);
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
    return store.glucose[index];
  },

  deleteGlucoseReading(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const initialLen = store.glucose.length;
    store.glucose = store.glucose.filter((g) => !(g.id === id && g.userId === userId));
    return store.glucose.length < initialLen;
  },

  // Medications
  getMedications(userId: string): Medication[] {
    const store = getMemoryStore();
    return store.medications.filter((m) => m.userId === userId);
  },

  addMedication(med: Medication): Medication {
    const store = getMemoryStore();
    store.medications.push(med);
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
    return store.medications[index];
  },

  deleteMedication(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const initialLen = store.medications.length;
    store.medications = store.medications.filter((m) => !(m.id === id && m.userId === userId));
    return store.medications.length < initialLen;
  },

  // Medication Logs
  getMedicationLogs(userId: string): MedicationLog[] {
    const store = getMemoryStore();
    return store.medicationLogs
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },

  addMedicationLog(log: MedicationLog): MedicationLog {
    const store = getMemoryStore();
    store.medicationLogs.unshift(log);
    return log;
  },

  // Meals
  getMeals(userId: string): Meal[] {
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
    return true;
  },

  // Activities
  getActivities(userId: string): Activity[] {
    const store = getMemoryStore();
    return store.activities
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime());
  },

  addActivity(act: Activity): Activity {
    const store = getMemoryStore();
    store.activities.unshift(act);
    return act;
  },

  deleteActivity(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.activities.length;
    store.activities = store.activities.filter((a) => !(a.id === id && a.userId === userId));
    return store.activities.length < len;
  },

  // Appointments
  getAppointments(userId: string): Appointment[] {
    const store = getMemoryStore();
    return store.appointments
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());
  },

  addAppointment(app: Appointment): Appointment {
    const store = getMemoryStore();
    store.appointments.push(app);
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
    return store.appointments[index];
  },

  deleteAppointment(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.appointments.length;
    store.appointments = store.appointments.filter((a) => !(a.id === id && a.userId === userId));
    return store.appointments.length < len;
  },

  // Rations
  getRations(userId: string, month?: string): RationItem[] {
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
    return store.rations[idx];
  },

  deleteRation(id: string, userId: string): boolean {
    const store = getMemoryStore();
    const len = store.rations.length;
    store.rations = store.rations.filter((r) => !(r.id === id && r.userId === userId));
    return store.rations.length < len;
  },

  deductRation(rationId: string, userId: string, quantity: number): boolean {
    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity + quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    return true;
  },

  restoreRation(rationId: string, userId: string, quantity: number): boolean {
    const store = getMemoryStore();
    const item = store.rations.find((r) => r.id === rationId && r.userId === userId);
    if (!item) return false;
    item.usedQuantity = Math.max(0, Number((item.usedQuantity - quantity).toFixed(2)));
    item.updatedAt = new Date().toISOString();
    return true;
  },
};

