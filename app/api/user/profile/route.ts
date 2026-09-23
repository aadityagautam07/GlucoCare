import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const existingUser = memoryDb.getUserById(user.id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = {
      ...existingUser,
      name: body.name ?? existingUser.name,
      diabetesType: body.diabetesType ?? existingUser.diabetesType,
      glucoseUnit: body.glucoseUnit ?? existingUser.glucoseUnit,
      targetRange: body.targetRange ? { ...existingUser.targetRange, ...body.targetRange } : existingUser.targetRange,
      notifications: body.notifications ? { ...existingUser.notifications, ...body.notifications } : existingUser.notifications,
    };

    memoryDb.saveUser(updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

