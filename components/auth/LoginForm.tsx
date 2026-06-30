"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FACULTIES, SESSION_KEY } from "@/lib/faculties";
import type { T, Lang } from "@/lib/i18n";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// ─── Password input ───────────────────────────────────────────────────────────

function PasswordInput({
  id, value, onChange, placeholder, disabled, showLabel, hideLabel,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
  showLabel: string; hideLabel: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id} type={show ? "text" : "password"} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled} required style={INPUT_STYLE}
        onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; e.target.style.boxShadow = "0 0 0 3px #dbe7f4"; }}
        onBlur={(e)  => { e.target.style.borderColor = "#b9c3cf"; e.target.style.boxShadow = "none"; }}
      />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? hideLabel : showLabel}
        style={{ position: "absolute", right: 6, bottom: 5, width: 34, height: 34, border: "none", background: "transparent", color: "#677889", cursor: "pointer", borderRadius: 7, display: "grid", placeItems: "center" }}>
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  border: "1px solid #b9c3cf", borderRadius: 9, padding: "12px 14px",
  fontSize: 14.5, fontFamily: "inherit", color: "#14202e", background: "white",
  outline: "none", width: "100%", transition: "border-color 0.15s, box-shadow 0.15s",
};

const LABEL_STYLE: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#14202e" };

// ─── Lang toggle ──────────────────────────────────────────────────────────────

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: "flex", border: "1px solid #dde3eb", borderRadius: 99, overflow: "hidden", alignSelf: "flex-end", marginBottom: 24 }}>
      {(["th", "en"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} type="button"
          style={{ padding: "5px 13px", background: lang === l ? "#1a4f8a" : "white", color: lang === l ? "white" : "#677889", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}>
          {l === "th" ? "ไทย" : "EN"}
        </button>
      ))}
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

type Role = "faculty" | "approver";

interface LoginFormProps {
  t: T;
  lang: Lang;
  setLang: (l: Lang) => void;
}

export function LoginForm({ t, lang, setLang }: LoginFormProps) {
  const router = useRouter();
  const [role, setRole]           = useState<Role>("faculty");
  const [error, setError]         = useState("");
  const [shaking, setShaking]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [facultyCode, setFacultyCode]         = useState("");
  const [facultyPw, setFacultyPw]             = useState("");
  const [facultyRemember, setFacultyRemember] = useState(true);

  const [approverUser, setApproverUser]           = useState("");
  const [approverPw, setApproverPw]               = useState("");
  const [approverRemember, setApproverRemember]   = useState(true);

  const showError = useCallback((msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 350);
  }, []);

  const clearError = () => setError("");
  const switchRole = (r: Role) => { setRole(r); clearError(); };

  const saveSession = (session: Record<string, unknown>, remember: boolean) => {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(SESSION_KEY, JSON.stringify({ ...session, ts: Date.now() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (role === "faculty" && !facultyCode) { showError(t.errSelectFaculty); return; }

    setIsLoading(true);
    try {
      const body = role === "faculty"
        ? { role, facultyCode, password: facultyPw, remember: facultyRemember }
        : { role, username: approverUser, password: approverPw, remember: approverRemember };

      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) { showError(data.error ?? t.errorGeneral); return; }

      saveSession({ role: data.role, code: data.code, name: data.name, scope: data.scope }, role === "faculty" ? facultyRemember : approverRemember);
      router.push(data.redirect);
    } catch {
      showError(t.errorConnect);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column" }}>

      <LangToggle lang={lang} setLang={setLang} />

      <h2 style={{ fontSize: 28, fontWeight: 700, color: "#14202e", margin: "0 0 6px" }}>{t.loginTitle}</h2>
      <p style={{ fontSize: 14, color: "#677889", margin: "0 0 28px", lineHeight: 1.6 }}>
        {t.loginSubtitle}
      </p>

      {/* Role tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "#eef1f6", borderRadius: 11, padding: 5, marginBottom: 26 }}>
        {([
          { key: "faculty"  as Role, label: t.tabFaculty,  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
          { key: "approver" as Role, label: t.tabApprover, icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg> },
        ] as { key: Role; label: string; icon: React.ReactNode }[]).map((tab) => (
          <button key={tab.key} type="button" onClick={() => switchRole(tab.key)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "11px 14px", border: "none", background: role === tab.key ? "white" : "transparent", borderRadius: 8, fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: role === tab.key ? "#1a4f8a" : "#677889", cursor: "pointer", transition: "all 0.16s", boxShadow: role === tab.key ? "0 1px 4px rgba(20,32,46,0.10)" : "none" }}
          >{tab.icon}{tab.label}</button>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className={shaking ? "auth-shake" : ""}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#fdecec", border: "1px solid #f4d0d0", borderRadius: 9, color: "#b53030", fontSize: 13, fontWeight: 500, marginBottom: 16 }}
        >
          <IconAlert /><span>{error}</span>
        </div>
      )}

      {/* Faculty form */}
      {role === "faculty" && (
        <form className="fade-pane" onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
            <label htmlFor="faculty-select" style={LABEL_STYLE}>{t.labelFaculty}</label>
            <select id="faculty-select" value={facultyCode} onChange={(e) => { setFacultyCode(e.target.value); clearError(); }} disabled={isLoading} required
              style={{ ...INPUT_STYLE, appearance: "none", cursor: "pointer", paddingRight: 40, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; e.target.style.boxShadow = "0 0 0 3px #dbe7f4"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#b9c3cf"; e.target.style.boxShadow = "none"; }}
            >
              <option value="" disabled>{t.selectFaculty}</option>
              {FACULTIES.map((f) => <option key={f.code} value={f.code}>{f.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 4 }}>
            <label htmlFor="faculty-pw" style={LABEL_STYLE}>{t.labelPassword}</label>
            <PasswordInput id="faculty-pw" value={facultyPw} onChange={(v) => { setFacultyPw(v); clearError(); }} placeholder={t.phFacultyPw} disabled={isLoading} showLabel={t.showPw} hideLabel={t.hidePw} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 22px", fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#3a4859", cursor: "pointer" }}>
              <input type="checkbox" checked={facultyRemember} onChange={(e) => setFacultyRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1a4f8a" }} />
              {t.rememberMe}
            </label>
            <a href="#" style={{ color: "#1a4f8a", textDecoration: "none", fontWeight: 600 }}>{t.forgotPw}</a>
          </div>
          <button type="submit" disabled={isLoading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 18px", border: "none", borderRadius: 10, background: isLoading ? "#4a7abd" : "#1a4f8a", color: "white", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", transition: "background 0.16s" }}
          >
            {isLoading && <IconSpinner />}
            {t.btnLoginFaculty}
            {!isLoading && <IconArrow />}
          </button>
        </form>
      )}

      {/* Approver form */}
      {role === "approver" && (
        <form className="fade-pane" onSubmit={handleSubmit} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
            <label htmlFor="approver-user" style={LABEL_STYLE}>{t.labelUsername}</label>
            <input id="approver-user" type="text" value={approverUser} onChange={(e) => { setApproverUser(e.target.value); clearError(); }} placeholder={t.phApproverUser} disabled={isLoading} required style={INPUT_STYLE}
              onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; e.target.style.boxShadow = "0 0 0 3px #dbe7f4"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#b9c3cf"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 4 }}>
            <label htmlFor="approver-pw" style={LABEL_STYLE}>{t.labelPassword}</label>
            <PasswordInput id="approver-pw" value={approverPw} onChange={(v) => { setApproverPw(v); clearError(); }} placeholder={t.phApproverPw} disabled={isLoading} showLabel={t.showPw} hideLabel={t.hidePw} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "4px 0 22px", fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#3a4859", cursor: "pointer" }}>
              <input type="checkbox" checked={approverRemember} onChange={(e) => setApproverRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1a4f8a" }} />
              {t.rememberMe}
            </label>
            <a href="#" style={{ color: "#1a4f8a", textDecoration: "none", fontWeight: 600 }}>{t.forgotPw}</a>
          </div>
          <button type="submit" disabled={isLoading}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 18px", border: "none", borderRadius: 10, background: isLoading ? "#b87a2e" : "#a16216", color: "white", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", transition: "background 0.16s" }}
          >
            {isLoading && <IconSpinner />}
            {t.btnLoginApprover}
            {!isLoading && <IconArrow />}
          </button>
        </form>
      )}

    </div>
  );
}
