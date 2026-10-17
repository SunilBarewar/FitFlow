import { NextResponse } from "next/server";
import { connectDB, isDbConnected } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      connected: isDbConnected(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
