import { SESSION_KEY } from "@/lib/faculties";

/** Logs out: drops the UI session and asks the server to clear the auth cookie. */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(() => {});
}
