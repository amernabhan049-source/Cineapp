import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = [...cinemaStore.auditLogs].reverse();
  return NextResponse.json({ logs, count: logs.length });
}
