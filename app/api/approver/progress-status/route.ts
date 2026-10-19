import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { requireSession } from "@/lib/auth";

const VALID_STATUSES = ["reviewed", "approved", "completed"] as const;
type ProgressStatus = (typeof VALID_STATUSES)[number] | null;

export async function POST(req: NextRequest) {
  const auth = await requireSession(req, ["approver"]);
  if (auth instanceof NextResponse) return auth;

  let body: { submissionId?: string; progressStatus?: ProgressStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { submissionId, progressStatus } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 422 });
  }
  if (progressStatus !== null && progressStatus !== undefined && !VALID_STATUSES.includes(progressStatus)) {
    return NextResponse.json({ error: "progressStatus must be reviewed | approved | completed | null." }, { status: 422 });
  }

  const { error } = await getSupabaseClient()
    .from("submissions")
    .update({ progress_status: progressStatus ?? null, last_saved: new Date().toISOString() })
    .eq("id", submissionId);

  if (error) {
    console.error("[/api/approver/progress-status]", error.message);
    return NextResponse.json({ error: "Failed to save progress status." }, { status: 500 });
  }

  return NextResponse.json({ success: true, progress_status: progressStatus ?? null });
}
