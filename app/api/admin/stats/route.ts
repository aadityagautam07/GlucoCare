import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { memoryDb } from "@/lib/db";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const stats = memoryDb.getAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

