import { NextResponse } from "next/server";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { DEMO_USER_ID, demoUser } from "@/lib/seed-data";

export async function POST() {
  try {
    const token = await createSessionToken({
      userId: DEMO_USER_ID,
      email: demoUser.email,
      name: demoUser.name,
      diabetesType: demoUser.diabetesType,
      glucoseUnit: demoUser.glucoseUnit,
    });

    const response = NextResponse.json({
      success: true,
      user: demoUser,
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
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Failed to sign in as demo patient" }, { status: 500 });
  }
}

