import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const facultyCode = req.nextUrl.searchParams.get("facultyCode");
  const id = req.nextUrl.searchParams.get("id");

  // Fetch single submission by id (for form edit mode)
  if (id) {
    const { data, error } = await getSupabaseClient()
      .from("submissions")
      .select("id,status,ref_id,version,approver_comment,submitted_at,last_saved,layer1_status,form_data,program_name")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[/api/submissions GET by id]", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ submission: data ?? null });
  }

  // Fetch all submissions for a faculty
  if (facultyCode) {
    const { data, error } = await getSupabaseClient()
      .from("submissions")
      .select("id,status,ref_id,version,approver_comment,submitted_at,last_saved,layer1_status,program_name")
      .eq("faculty_code", facultyCode)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/submissions GET by faculty]", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ submissions: data ?? [] });
  }

  return NextResponse.json({ error: "facultyCode or id is required" }, { status: 400 });
}
