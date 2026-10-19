/**
 * Server-side session cookie — HMAC-signed, httpOnly.
 *
 * The localStorage session (SESSION_KEY) is only a UI hint; this cookie is
 * what API routes and middleware trust. Uses Web Crypto only, so it runs in
 * both the Edge middleware and Node route handlers.
 *
 * Signing key: SESSION_SECRET, falling back to APPROVER_PASSWORD so existing
 * deployments keep working. Changing either one logs everyone out.
 */
import type { NextRequest } from "next/server";

export type AuthSession =
  | { role: "faculty"; code: string; exp: number }
  | { role: "approver"; exp: number }
  | { role: "viewer"; username: string; scope: string[]; exp: number };

export type AuthRole = AuthSession["role"];

export const AUTH_COOKIE = "bu_air_auth";
export const REMEMBER_TTL_S = 60 * 60 * 24 * 30; // 30 days
export const SESSION_TTL_S = 60 * 60 * 24;       // 1 day (no "remember me")

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey | null> {
  const secret = process.env.SESSION_SECRET || process.env.APPROVER_PASSWORD;
  if (!secret) return null;
  return crypto.subtle.importKey(
    "raw",
    enc.encode(`bu-air-session-v1:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Distributive Omit so each union member keeps its own fields. */
type SessionInput = AuthSession extends infer S ? (S extends AuthSession ? Omit<S, "exp"> : never) : never;

export async function signSession(session: SessionInput, ttlSeconds: number): Promise<string> {
  const key = await hmacKey();
  if (!key) throw new Error("Missing SESSION_SECRET / APPROVER_PASSWORD — cannot sign session.");
  const payload = b64url(enc.encode(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + ttlSeconds })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined): Promise<AuthSession | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const key = await hmacKey();
  if (!key) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const s = JSON.parse(dec.decode(fromB64url(payload))) as AuthSession;
    if (typeof s.exp !== "number" || s.exp < Date.now() / 1000) return null;
    if (s.role !== "faculty" && s.role !== "approver" && s.role !== "viewer") return null;
    return s;
  } catch {
    return null;
  }
}

export function getSession(req: NextRequest): Promise<AuthSession | null> {
  return verifySession(req.cookies.get(AUTH_COOKIE)?.value);
}

/** Whether this session may see / act on data belonging to `facultyCode`. */
export function canAccessFaculty(s: AuthSession, facultyCode: string | null | undefined): boolean {
  if (s.role === "approver") return true;
  if (!facultyCode) return false;
  if (s.role === "faculty") return s.code === facultyCode;
  return s.scope.includes(facultyCode);
}
