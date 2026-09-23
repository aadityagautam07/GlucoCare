import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { memoryDb } from "@/lib/db";
import { UserRole, UserStatus, UserPermissions } from "@/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = memoryDb.getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const readings = memoryDb.getGlucoseReadings(id).slice(0, 10);
    const medications = memoryDb.getMedications(id);
    const meals = memoryDb.getMeals(id).slice(0, 10);
    const rations = memoryDb.getRations(id);

    return NextResponse.json({
      user,
      recentActivity: {
        readings,
        medications,
        meals,
        rations,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { role, status, permissions, name, email } = body;

    const existing = memoryDb.getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = memoryDb.updateUserRoleAndPermissions(
      id,
      (role as UserRole) || existing.role,
      (status as UserStatus) || existing.status,
      permissions as Partial<UserPermissions>
    );

    if (name || email) {
      memoryDb.updateUser(id, {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!isAdmin(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting own admin session
    if (sessionUser?.id === id) {
      return NextResponse.json(
        { error: "Cannot delete your own active administrator account" },
        { status: 400 }
      );
    }

    const deleted = memoryDb.deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

