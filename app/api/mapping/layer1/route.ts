import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const facultyCode = req.nextUrl.searchParams.get("facultyCode");
  if (!facultyCode) {
    return NextResponse.json({ error: "facultyCode is required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("*")
    .eq("faculty_code", facultyCode)
    .maybeSingle();

  if (error) {
    console.error("[/api/mapping/layer1 GET]", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "No submission found" }, { status: 404 });
  }

  return NextResponse.json({
    submissionStatus: data.status,
    refId: data.ref_id,
    facultyName: data.faculty_name,
    formData: data.form_data ?? {},
    layer1Mapping: data.layer1_mapping ?? {},
    layer1Status: data.layer1_status ?? "not_started",
  });
}

export async function POST(req: NextRequest) {
  let body: {
    facultyCode?: string;
    mapping?: Record<string, string[]>;
    action?: "draft" | "submit";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { facultyCode, mapping, action = "draft" } = body;

  if (!facultyCode) {
    return NextResponse.json({ error: "facultyCode is required." }, { status: 422 });
  }

  const { error } = await getSupabaseClient()
    .from("submissions")
    .update({
      layer1_mapping: mapping ?? {},
      layer1_status: action === "submit" ? "submitted" : "in_progress",
    })
    .eq("faculty_code", facultyCode);

  if (error) {
    console.error("[/api/mapping/layer1 POST]", error.message);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
