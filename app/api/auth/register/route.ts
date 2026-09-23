import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { createSessionToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { UserProfile } from "@/types";
import { DEFAULT_PATIENT_PERMISSIONS } from "@/lib/seed-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, diabetesType, glucoseUnit } = result.data;

    // Check existing
    const existing = memoryDb.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUserId = "user-" + Date.now();

    const newUser: UserProfile & { passwordHash?: string } = {
      id: newUserId,
      name,
      email,
      role: "patient",
      status: "active",
      permissions: { ...DEFAULT_PATIENT_PERMISSIONS },
      passwordHash,
      diabetesType,
      glucoseUnit,
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

    memoryDb.saveUser(newUser);

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      diabetesType: newUser.diabetesType,
      glucoseUnit: newUser.glucoseUnit,
    });


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeProfile } = newUser;

    const response = NextResponse.json({
      success: true,
      user: safeProfile,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

