import { NextResponse } from "next/server";
import { memoryDb } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const user = memoryDb.getUserByEmail(trimmedEmail);
    if (!user) {
      // Security best practice: don't reveal user existence, but for demo clarity give clear guidance
      return NextResponse.json(
        {
          error: `No registered account found with email "${trimmedEmail}". Please verify your email or register a new account.`,
        },
        { status: 404 }
      );
    }

    // Generate 6-digit security token and a URL-safe token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenSecret = crypto.randomBytes(16).toString("hex");
    const combinedToken = `${token}-${tokenSecret}`;

    // Save token with 1 hour expiration in persistent store
    memoryDb.saveResetToken(trimmedEmail, combinedToken, 60 * 60 * 1000);
    // Also save simple 6-digit code for direct user entry
    memoryDb.saveResetToken(trimmedEmail, token, 60 * 60 * 1000);

    // Determine host URL for reset link
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const resetUrl = `${origin}/forgot-password?token=${encodeURIComponent(
      combinedToken
    )}&email=${encodeURIComponent(trimmedEmail)}`;

    // Dispatch email via SMTP
    const emailResult = await sendPasswordResetEmail({
      to: trimmedEmail,
      name: user.name || "GlucoCare User",
      token,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${trimmedEmail} via email.`,
      previewUrl: emailResult.previewUrl,
      // Provide security token in response as fallback if email inbox is inaccessible
      verificationCode: token,
      resetUrl,
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}

