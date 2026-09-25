import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { createSessionToken, comparePassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { DEMO_USER_ID } from "@/lib/seed-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const userWithHash = memoryDb.getUserByEmail(email);

    if (!userWithHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password hash (or allow demo patient fallback)
    const isDemo = userWithHash.id === DEMO_USER_ID && password === "demopatient123";
    const passwordMatch =
      isDemo ||
      (userWithHash.passwordHash &&
        (await comparePassword(password, userWithHash.passwordHash)));

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: userWithHash.id,
      email: userWithHash.email,
      name: userWithHash.name,
      role: userWithHash.role || "patient",
      status: userWithHash.status || "active",
      diabetesType: userWithHash.diabetesType,
      glucoseUnit: userWithHash.glucoseUnit,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userWithHash.id,
        name: userWithHash.name,
        email: userWithHash.email,
        role: userWithHash.role || "patient",
        status: userWithHash.status || "active",
        permissions: userWithHash.permissions,
        diabetesType: userWithHash.diabetesType,
        glucoseUnit: userWithHash.glucoseUnit,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

