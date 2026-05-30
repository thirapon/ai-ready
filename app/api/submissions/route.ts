import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const facultyCode = req.nextUrl.searchParams.get("facultyCode");
  if (!facultyCode) {
    return NextResponse.json({ error: "facultyCode is required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("id,status,ref_id,version,approver_comment,submitted_at,last_saved")
    .eq("faculty_code", facultyCode)
    .maybeSingle();

  if (error) {
    console.error("[/api/submissions] Supabase error:", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ submission: data ?? null });
}
