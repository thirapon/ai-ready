import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

interface SubmitBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, message } = body;

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "name is required." }, { status: 422 });
  }
  if (!email || typeof email !== "string" || email.trim() === "") {
    return NextResponse.json({ error: "email is required." }, { status: 422 });
  }
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "email is invalid." }, { status: 422 });
  }

  const { error } = await getSupabaseClient().from("leads").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message:
      message && typeof message === "string" && message.trim() !== ""
        ? message.trim()
        : null,
  });

  if (error) {
    console.error("[/api/submit] Supabase insert error:", error.message);
    return NextResponse.json(
      { error: "Failed to save submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
