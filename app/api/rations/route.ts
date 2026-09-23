import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { rationItemSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { RationItem } from "@/types";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || undefined;

    const rations = memoryDb.getRations(user.id, month);
    return NextResponse.json({ rations });
  } catch (error) {
    console.error("GET /api/rations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = rationItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const now = new Date().toISOString();

    const newRation: RationItem = {
      id: "rat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      name: data.name.trim(),
      category: data.category,
      allocatedQuantity: data.allocatedQuantity,
      usedQuantity: data.usedQuantity || 0,
      unit: data.unit,
      month: data.month,
      lowStockThreshold:
        data.lowStockThreshold ?? Math.round(data.allocatedQuantity * 0.2),
      notes: data.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = memoryDb.addRation(newRation);
    return NextResponse.json({ ration: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
