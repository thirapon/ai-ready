import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req, ["approver", "viewer"]);
  if (auth instanceof NextResponse) return auth;

  let query = getSupabaseClient()
    .from("submissions")
    .select("id, ref_id, faculty_name, faculty_code, program_name, form_data, layer1_mapping, layer2_mapping, status, progress_status, submitted_at, last_saved")
    .order("created_at", { ascending: false });
  // Scoped viewers only get their own faculties
  if (auth.role === "viewer") query = query.in("faculty_code", auth.scope);
  const { data, error } = await query;

  if (error) {
    console.error("[/api/approver/mapping]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
