import { NextResponse } from "next/server";
import { fetchFacultyReadiness } from "@/lib/faculty-readiness";

export const dynamic = "force-dynamic"; // never cache — always fetch fresh from Sheets

export async function GET() {
  try {
    const rows = await fetchFacultyReadiness();
    return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[faculty-readiness/refresh]", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
