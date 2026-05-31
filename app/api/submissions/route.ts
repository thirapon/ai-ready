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
      .select("id,status,ref_id,version,approver_comment,submitted_at,last_saved,program_name,layer1_mapping,layer2_mapping")
      .eq("faculty_code", facultyCode)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[/api/submissions GET by faculty]", error.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Compute row counts and strip the full mapping arrays from the response
    const submissions = (data ?? []).map(({ layer1_mapping, layer2_mapping, ...s }) => ({
      ...s,
      layer1_count: Array.isArray(layer1_mapping) ? (layer1_mapping as unknown[]).length : 0,
      layer2_count: Array.isArray(layer2_mapping) ? (layer2_mapping as unknown[]).length : 0,
    }));

    return NextResponse.json({ submissions });
  }

  return NextResponse.json({ error: "facultyCode or id is required" }, { status: 400 });
}
