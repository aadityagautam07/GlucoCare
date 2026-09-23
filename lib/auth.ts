import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { memoryDb } from "./db";
import { UserProfile } from "@/types";
import { DEMO_USER_ID, demoUser } from "./seed-data";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET || "glucocare-super-secret-production-grade-key-2025-health";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
export const AUTH_COOKIE_NAME = "glucocare_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  diabetesType: string;
  glucoseUnit: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifySessionToken(token);
    if (!payload?.userId) {
      return null;
    }

    if (payload.userId === DEMO_USER_ID) {
      const user = memoryDb.getUserById(DEMO_USER_ID);
      return user || demoUser;
    }

    const user = memoryDb.getUserById(payload.userId);
    if (user) {
      return user;
    }

    // Fallback profile from payload
    return {
      id: payload.userId,
      name: payload.name || "Patient",
      email: payload.email,
      diabetesType: (payload.diabetesType as UserProfile["diabetesType"]) || "Type 2",
      glucoseUnit: (payload.glucoseUnit as UserProfile["glucoseUnit"]) || "mg/dL",
      targetRange: {
        fastingMin: 70,
        fastingMax: 130,
        postMealMax: 180,
      },
      notifications: {
        medicationReminders: true,
        glucoseReminders: true,
        appointmentReminders: true,
      },
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

