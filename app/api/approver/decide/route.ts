import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { sendDecisionNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: {
    submissionId?: string;
    action?: "approve" | "changes" | "reject";
    comment?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { submissionId, action, comment } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 422 });
  }
  if (!action || !["approve", "changes", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be approve | changes | reject." }, { status: 422 });
  }
  if ((action === "changes" || action === "reject") && !comment?.trim()) {
    return NextResponse.json({ error: "comment is required for changes/reject." }, { status: 422 });
  }

  const statusMap = { approve: "approved", changes: "changes", reject: "rejected" } as const;
  const newStatus = statusMap[action];

  const { data: existing, error: fetchError } = await getSupabaseClient()
    .from("submissions")
    .select("ref_id, faculty_name, program_name, form_data")
    .eq("id", submissionId)
    .maybeSingle();

  console.log("[decide] existing:", JSON.stringify(existing));
  console.log("[decide] fetchError:", fetchError?.message);
  if (existing) {
    const fd = (existing.form_data ?? {}) as Record<string, string>;
    console.log("[decide] fd.email:", fd.email);
  }

  const { error } = await getSupabaseClient()
    .from("submissions")
    .update({
      status: newStatus,
      approver_comment: comment?.trim() ?? null,
      approved_at: action === "approve" ? new Date().toISOString() : null,
      last_saved: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) {
    console.error("[/api/approver/decide]", error.message);
    return NextResponse.json({ error: "Failed to save decision." }, { status: 500 });
  }

  if (existing) {
    const fd = (existing.form_data ?? {}) as Record<string, string>;
    if (fd.email) {
      sendDecisionNotification({
        refId: existing.ref_id ?? "-",
        facultyName: existing.faculty_name ?? "-",
        programName: existing.program_name ?? "-",
        action,
        comment: comment?.trim(),
        recipientEmail: fd.email,
        recipientName: fd.owner ?? fd.email,
      }).catch((e) => console.error("[email] sendDecisionNotification:", e));
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}
