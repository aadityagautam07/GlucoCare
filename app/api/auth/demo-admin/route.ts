import { NextResponse } from "next/server";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { DEMO_ADMIN_ID, demoAdminUser } from "@/lib/seed-data";

export async function POST() {
  try {
    const token = await createSessionToken({
      userId: DEMO_ADMIN_ID,
      email: demoAdminUser.email,
      name: demoAdminUser.name,
      role: "admin",
      status: "active",
      diabetesType: demoAdminUser.diabetesType,
      glucoseUnit: demoAdminUser.glucoseUnit,
    });

    const response = NextResponse.json({
      success: true,
      user: demoAdminUser,
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
    console.error("Demo admin login error:", error);
    return NextResponse.json({ error: "Failed to sign in as demo administrator" }, { status: 500 });
  }
}

