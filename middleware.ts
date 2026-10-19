import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// API routes reachable without a session. Everything else under /api is
// default-deny, so new routes are protected automatically.
const PUBLIC_API = new Set(["/api/auth/login", "/api/auth/logout", "/api/submit"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (isApi && PUBLIC_API.has(pathname)) return NextResponse.next();

  const session = await getSession(req);
  const approverArea = pathname.startsWith("/approver") || pathname.startsWith("/api/approver/");
  const allowed = session && (!approverArea || session.role !== "faculty");
  if (allowed) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: session ? "Forbidden" : "Unauthorized" }, { status: session ? 403 : 401 });
  }
  const login = new URL("/login", req.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/api/:path*", "/approver/:path*", "/submit/:path*", "/mapping/:path*"],
};
