import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select(
      "id,faculty_code,faculty_name,status,ref_id,version,approver_comment,submitted_at,last_saved,form_data,created_at"
    )
    .neq("status", "draft") // only show submitted ones
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[/api/approver/submissions]", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
