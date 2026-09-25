import { NextResponse } from "next/server";
import { memoryDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { valid: false, error: "Email and token are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isValid = memoryDb.verifyResetToken(trimmedEmail, token);

    return NextResponse.json({
      valid: isValid,
      error: isValid ? undefined : "This password reset token has expired or is invalid.",
    });
  } catch (error) {
    console.error("POST /api/auth/verify-reset-token error:", error);
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}

