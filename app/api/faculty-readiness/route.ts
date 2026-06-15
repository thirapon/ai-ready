import { NextResponse } from "next/server";
import { fetchFacultyReadiness } from "@/lib/faculty-readiness";

export const revalidate = 900; // cache 15 minutes

export async function GET() {
  try {
    const rows = await fetchFacultyReadiness();
return NextResponse.json({ rows, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[faculty-readiness]", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
