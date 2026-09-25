import { NextResponse } from "next/server";
import { getSessionUser, isAdmin, isDoctorOrAdmin, hashPassword } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { DEFAULT_PATIENT_PERMISSIONS } from "@/lib/seed-data";
import { UserProfile, UserRole, UserStatus, UserPermissions } from "@/types";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!isDoctorOrAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Clinical or Administrator privileges required" },
        { status: 403 }
      );
    }

    const users = memoryDb.getAllUsers();
    const stats = memoryDb.getAdminStats();

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, role, status, permissions, diabetesType, glucoseUnit } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = memoryDb.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userId = "usr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);

    const newUser: UserProfile = {
      id: userId,
      name,
      email,
      role: (role as UserRole) || "patient",
      status: (status as UserStatus) || "active",
      permissions: {
        ...DEFAULT_PATIENT_PERMISSIONS,
        ...(permissions as Partial<UserPermissions>),
      },
      diabetesType: diabetesType || "Type 2",
      glucoseUnit: glucoseUnit || "mg/dL",
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

    memoryDb.saveUser({ ...newUser, passwordHash });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

