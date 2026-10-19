import { NextRequest, NextResponse } from "next/server";
import { fetchFacultyReadiness, rowsVisibleTo } from "@/lib/faculty-readiness";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic"; // never cache — always fetch fresh from Sheets

export async function GET(req: NextRequest) {
  const auth = await requireSession(req, ["faculty", "approver", "viewer"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const rows = rowsVisibleTo(await fetchFacultyReadiness(), auth);
    return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[faculty-readiness/refresh]", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
