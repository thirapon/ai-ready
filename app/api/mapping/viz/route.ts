import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("id, status, ref_id, faculty_name, program_name, form_data, layer1_mapping, layer2_mapping")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[/api/mapping/viz]", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    submissionStatus: data.status,
    refId: data.ref_id,
    facultyName: data.faculty_name,
    programName: data.program_name,
    layer1Mapping: data.layer1_mapping ?? [],
    layer2Mapping: data.layer2_mapping ?? [],
  });
}
