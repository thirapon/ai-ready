/**
 * Route-handler auth helpers (Node runtime). middleware.ts already rejects
 * requests without a valid session; these add role and per-faculty checks.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession, type AuthRole, type AuthSession } from "@/lib/session";
import { getSupabaseClient } from "@/lib/supabase";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Returns the session if its role is in `roles`, otherwise a 401/403
 * response to return directly:
 *   const auth = await requireSession(req, ["approver"]);
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireSession(
  req: NextRequest,
  roles: AuthRole[]
): Promise<AuthSession | NextResponse> {
  const s = await getSession(req);
  if (!s) return unauthorized();
  if (!roles.includes(s.role)) return forbidden();
  return s;
}

/** faculty_code of a submission, or null if it doesn't exist. */
export async function submissionFacultyCode(id: string): Promise<string | null> {
  const { data } = await getSupabaseClient()
    .from("submissions")
    .select("faculty_code")
    .eq("id", id)
    .maybeSingle();
  return (data?.faculty_code as string | undefined) ?? null;
}
