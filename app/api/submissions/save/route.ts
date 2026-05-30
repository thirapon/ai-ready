import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: {
    facultyCode?: string;
    facultyName?: string;
    formData?: Record<string, unknown>;
    action?: "draft" | "submit";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { facultyCode, facultyName, formData, action = "draft" } = body;

  if (!facultyCode || !facultyName) {
    return NextResponse.json({ error: "facultyCode and facultyName are required." }, { status: 422 });
  }

  const now = new Date().toISOString();
  const isSubmit = action === "submit";

  // Upsert — one submission per faculty
  const patch: Record<string, unknown> = {
    faculty_code: facultyCode,
    faculty_name: facultyName,
    form_data: formData ?? {},
    last_saved: now,
  };

  if (isSubmit) {
    patch.status = "pending";
    patch.submitted_at = now;

    // Increment version — need to read current first
    const { data: existing } = await getSupabaseClient()
      .from("submissions")
      .select("version")
      .eq("faculty_code", facultyCode)
      .maybeSingle();

    patch.version = (existing?.version ?? 0) + 1;

    // Generate ref ID on first submit
    if (!existing || (existing as { version?: number }).version === 0) {
      const year = new Date().getFullYear();
      const rand = String(Math.floor(Math.random() * 9000) + 1000);
      patch.ref_id = `AIRC-${year}-${rand}`;
    }
  } else {
    patch.status = "draft";
  }

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .upsert(patch, { onConflict: "faculty_code" })
    .select("id, status, ref_id, version, last_saved")
    .single();

  if (error) {
    console.error("[/api/submissions/save]", error.message);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ success: true, submission: data }, { status: 200 });
}
