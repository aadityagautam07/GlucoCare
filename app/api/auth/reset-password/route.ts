import { NextResponse } from "next/server";
import { memoryDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, newPassword, token } = await req.json();

    if (!email || typeof email !== "string" || !newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Email and new password are required" },
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

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify token if supplied
    if (token) {
      const isValid = memoryDb.verifyResetToken(trimmedEmail, token);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid or expired security code. Please request a new reset email." },
          { status: 400 }
        );
      }
    }

    const user = memoryDb.getUserByEmail(trimmedEmail);
    if (!user) {
      return NextResponse.json(
        { error: `No registered account found with email "${trimmedEmail}". Please register a new account.` },
        { status: 404 }
      );
    }

    const newHash = await hashPassword(newPassword);
    user.passwordHash = newHash;
    memoryDb.saveUser(user);

    // Consume token if it was provided
    if (token) {
      memoryDb.consumeResetToken(trimmedEmail, token);
    }

    return NextResponse.json({
      success: true,
      message: `Password updated for ${user.name}. You can now sign in with your new credentials.`,
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
