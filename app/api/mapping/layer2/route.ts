import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[/api/mapping/layer2 GET]", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    submissionStatus: data.status,
    refId: data.ref_id,
    facultyName: data.faculty_name,
    formData: data.form_data ?? {},
    layer2Mapping: data.layer2_mapping ?? [],
    layer2Status: data.layer2_status ?? "not_started",
  });
}

export async function POST(req: NextRequest) {
  let body: { id?: string; mapping?: unknown[]; action?: "draft" | "submit" };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const { id, mapping, action = "draft" } = body;
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 422 });

  const { error } = await getSupabaseClient()
    .from("submissions")
    .update({
      layer2_mapping: mapping ?? [],
      layer2_status: action === "submit" ? "submitted" : "in_progress",
    })
    .eq("id", id);

  if (error) {
    console.error("[/api/mapping/layer2 POST]", error.message);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
