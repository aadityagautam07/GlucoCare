import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = memoryDb.deleteMeal(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Meal deleted" });
  } catch (error) {
    console.error("DELETE /api/meals/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

