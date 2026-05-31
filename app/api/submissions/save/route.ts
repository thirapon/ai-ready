import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { sendSubmissionNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: {
    submissionId?: string;
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

  const { submissionId, facultyCode, facultyName, formData, action = "draft" } = body;

  if (!facultyCode || !facultyName) {
    return NextResponse.json({ error: "facultyCode and facultyName are required." }, { status: 422 });
  }

  const now = new Date().toISOString();
  const isSubmit = action === "submit";
  const programName = (formData?.program as string) ?? "";

  if (submissionId) {
    // ── Edit existing submission by id ──────────────────────────────────────
    const patch: Record<string, unknown> = {
      form_data: formData ?? {},
      program_name: programName,
      last_saved: now,
    };

    if (isSubmit) {
      patch.status = "pending";
      patch.submitted_at = now;

      const { data: existing } = await getSupabaseClient()
        .from("submissions")
        .select("version, ref_id")
        .eq("id", submissionId)
        .maybeSingle();

      patch.version = (existing?.version ?? 0) + 1;
      if (!existing?.ref_id) {
        const year = new Date().getFullYear();
        patch.ref_id = `AIRC-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      }
    } else {
      patch.status = "draft";
    }

    const { data, error } = await getSupabaseClient()
      .from("submissions")
      .update(patch)
      .eq("id", submissionId)
      .select("id, status, ref_id, version, last_saved")
      .single();

    if (error) {
      console.error("[/api/submissions/save update]", error.message);
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }
    if (isSubmit && data) {
      const fd = (formData ?? {}) as Record<string, string>;
      try {
        await sendSubmissionNotification({
          refId: (data as { ref_id?: string }).ref_id ?? "-",
          facultyName: facultyName,
          programName: programName,
          ownerName: fd.owner ?? "-",
          ownerEmail: fd.email ?? "-",
        });
      } catch (e) {
        console.error("[email] sendSubmissionNotification:", e);
      }
    }

    return NextResponse.json({ success: true, submission: data }, { status: 200 });

  } else {
    // ── Create new submission (upsert on faculty_code + program_name) ───────
    const patch: Record<string, unknown> = {
      faculty_code: facultyCode,
      faculty_name: facultyName,
      program_name: programName,
      form_data: formData ?? {},
      last_saved: now,
    };

    if (isSubmit) {
      patch.status = "pending";
      patch.submitted_at = now;
      patch.version = 1;
      const year = new Date().getFullYear();
      patch.ref_id = `AIRC-${year}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    } else {
      patch.status = "draft";
    }

    const { data, error } = await getSupabaseClient()
      .from("submissions")
      .upsert(patch, { onConflict: "faculty_code,program_name" })
      .select("id, status, ref_id, version, last_saved")
      .single();

    if (error) {
      console.error("[/api/submissions/save insert]", error.message);
      return NextResponse.json({ error: "Failed to save." }, { status: 500 });
    }
    if (isSubmit && data) {
      const fd = (formData ?? {}) as Record<string, string>;
      try {
        await sendSubmissionNotification({
          refId: (data as { ref_id?: string }).ref_id ?? "-",
          facultyName: facultyName,
          programName: programName,
          ownerName: fd.owner ?? "-",
          ownerEmail: fd.email ?? "-",
        });
      } catch (e) {
        console.error("[email] sendSubmissionNotification:", e);
      }
    }

    return NextResponse.json({ success: true, submission: data }, { status: 200 });
  }
}
