import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { rationItemSchema } from "@/lib/validations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = rationItemSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const updated = memoryDb.updateRation(id, user.id, result.data);

    if (!updated) {
      return NextResponse.json({ error: "Ration item not found" }, { status: 404 });
    }

    return NextResponse.json({ ration: updated });
  } catch (error) {
    console.error("PUT /api/rations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const deleted = memoryDb.deleteRation(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Ration item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Ration item deleted" });
  } catch (error) {
    console.error("DELETE /api/rations/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
