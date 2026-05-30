import { NextRequest, NextResponse } from "next/server";
import { FACULTIES, APPROVER, facultyEnvKey } from "@/lib/faculties";
import { getSupabaseClient } from "@/lib/supabase";

interface LoginBody {
  role?: unknown;
  facultyCode?: unknown;
  username?: unknown;
  password?: unknown;
  remember?: unknown;
}

export async function POST(req: NextRequest) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { role, facultyCode, username, password, remember } = body;

  if (role !== "faculty" && role !== "approver") {
    return NextResponse.json({ error: "Invalid role." }, { status: 422 });
  }
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required." }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
  const ua = req.headers.get("user-agent") ?? null;
  const rememberMe = remember === true;

  // ── Faculty login ──────────────────────────────────────────────────────────
  if (role === "faculty") {
    if (!facultyCode || typeof facultyCode !== "string") {
      return NextResponse.json({ error: "กรุณาเลือกคณะของท่าน" }, { status: 422 });
    }

    const faculty = FACULTIES.find((f) => f.code === facultyCode);
    if (!faculty) {
      return NextResponse.json({ error: "ไม่พบข้อมูลคณะ" }, { status: 422 });
    }

    // Read password from env var — never from source code
    const expectedPw = process.env[facultyEnvKey(faculty.code)];
    if (!expectedPw) {
      console.error(`[auth/login] Missing env var: ${facultyEnvKey(faculty.code)}`);
      return NextResponse.json(
        { error: "ระบบยังไม่ได้ตั้งค่ารหัสผ่านสำหรับคณะนี้ กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 503 }
      );
    }
    if (password !== expectedPw) {
      return NextResponse.json({ error: "รหัสผ่านของคณะไม่ถูกต้อง" }, { status: 401 });
    }

    try {
      await getSupabaseClient().from("login_sessions").insert({
        role: "faculty",
        faculty_code: faculty.code,
        faculty_name: faculty.name,
        remember_me: rememberMe,
        ip_address: ip,
        user_agent: ua,
      });
    } catch (err) {
      console.error("[auth/login] session log failed:", err);
    }

    return NextResponse.json({
      success: true,
      role: "faculty",
      code: faculty.code,
      name: faculty.name,
      redirect: "/submit",
    });
  }

  // ── Approver login ─────────────────────────────────────────────────────────
  if (role === "approver") {
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้" }, { status: 422 });
    }

    const expectedPw = process.env.APPROVER_PASSWORD;
    if (!expectedPw) {
      console.error("[auth/login] Missing env var: APPROVER_PASSWORD");
      return NextResponse.json(
        { error: "ระบบยังไม่ได้ตั้งค่ารหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 503 }
      );
    }
    if (username.trim() !== APPROVER.username || password !== expectedPw) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านผู้อนุมัติไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    try {
      await getSupabaseClient().from("login_sessions").insert({
        role: "approver",
        username: username.trim(),
        remember_me: rememberMe,
        ip_address: ip,
        user_agent: ua,
      });
    } catch (err) {
      console.error("[auth/login] session log failed:", err);
    }

    return NextResponse.json({
      success: true,
      role: "approver",
      name: APPROVER.name,
      redirect: "/approver",
    });
  }
}
