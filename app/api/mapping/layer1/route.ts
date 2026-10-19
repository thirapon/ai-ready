import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { requireSession, forbidden, submissionFacultyCode } from "@/lib/auth";
import { canAccessFaculty } from "@/lib/session";
import { upsertMappingRow } from "@/lib/mapping-merge";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req, ["faculty", "approver", "viewer"]);
  if (auth instanceof NextResponse) return auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseClient()
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[/api/mapping/layer1 GET]", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "No submission found" }, { status: 404 });
  }
  if (!canAccessFaculty(auth, data.faculty_code)) return forbidden();

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
  const auth = await requireSession(req, ["faculty"]);
  if (auth instanceof NextResponse) return auth;

  let body: {
    id?: string;
    row?: { id: string } & Record<string, unknown>;
    deleteId?: string;
    action?: "draft" | "submit";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { id, row, deleteId, action } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 422 });
  }
  const owner = await submissionFacultyCode(id);
  if (!owner) return NextResponse.json({ error: "No submission found" }, { status: 404 });
  if (!canAccessFaculty(auth, owner)) return forbidden();

  const result = await upsertMappingRow({
    submissionId: id,
    mappingColumn: "layer1_mapping",
    statusColumn: "layer1_status",
    row,
    deleteId,
    statusAction: action,
  });

  if ("error" in result) {
    console.error("[/api/mapping/layer1 POST]", result.error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
  if ("notFound" in result) {
    return NextResponse.json({ error: "No submission found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, mapping: result.mapping });
}
