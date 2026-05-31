import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("id, ref_id, faculty_name, faculty_code, program_name, form_data, layer1_mapping, layer2_mapping, status, submitted_at, last_saved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[/api/approver/mapping]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
