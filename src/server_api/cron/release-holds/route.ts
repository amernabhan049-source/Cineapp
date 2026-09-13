import { NextResponse } from "next/server";
import { cinemaStore } from "@/lib/booking-service";

export async function GET(req: Request) {
  return handleRelease(req);
}

export async function POST(req: Request) {
  return handleRelease(req);
}

async function handleRelease(req: Request) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("secret");

  const expectedSecret =
    process.env.CRON_SECRET || "cinebook_cron_secret_secure_token_xyz987";

  // Check Bearer token or secret query param
  const isAuthorized =
    authHeader === `Bearer ${expectedSecret}` ||
    secretParam === expectedSecret ||
    req.headers.get("x-cron-secret") === expectedSecret;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  // Idempotent execution
  const result = cinemaStore.releaseExpiredSeatHolds();

  return NextResponse.json({
    success: true,
    message: `Idempotent hold cleanup completed. Released ${result.releasedCount} expired seat holds.`,
    releasedCount: result.releasedCount,
    timestamp: result.timestamp,
  });
}
