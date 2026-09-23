import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { appointmentSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { Appointment } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = memoryDb.getAppointments(user.id);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
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
    const result = appointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const newApp: Appointment = {
      id: "app-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      title: data.title,
      doctorName: data.doctorName,
      specialty: data.specialty || undefined,
      date: data.date,
      time: data.time,
      location: data.location,
      isVirtual: !!data.isVirtual,
      notes: data.notes?.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const saved = memoryDb.addAppointment(newApp);
    return NextResponse.json({ appointment: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

