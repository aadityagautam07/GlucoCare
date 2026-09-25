import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { labReportSchema } from "@/lib/validations";
import { memoryDb } from "@/lib/db";
import { LabReport } from "@/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = memoryDb.getLabReports(user.id);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("GET /api/lab-reports error:", error);
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
    const result = labReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid lab report data", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    const newReport: LabReport = {
      id: "rep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      title: data.title,
      doctorOrLab: data.doctorOrLab,
      category: data.category,
      date: data.date,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      summaryMetrics: data.summaryMetrics?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = memoryDb.addLabReport(newReport);
    return NextResponse.json({ report: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/lab-reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

