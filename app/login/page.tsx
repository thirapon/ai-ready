"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useLang } from "@/lib/i18n";

export default function LoginPage() {
  const { lang, setLang, t } = useLang();

  const feats = [
    { text: t.loginFeat1, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { text: t.loginFeat2, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { text: t.loginFeat3, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  ];

  return (
    <div className="login-shell">
      {/* ── LEFT: Brand panel ─────────────────────────────────────── */}
      <aside className="login-brand">
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 64 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "white", color: "#1a4f8a", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 20, letterSpacing: "0.5px", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}>
              BU
            </div>
            <div>
              <div style={{ fontSize: 13, letterSpacing: "0.04em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>มหาวิทยาลัยกรุงเทพ</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Bangkok University</div>
            </div>
          </div>

          {/* Hero text */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <span style={{ gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "white", marginBottom: 24, display: "inline-flex", alignItems: "center" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a44c", flexShrink: 0 }} />
              AI-Ready Curriculum Framework
            </span>

            <h1 style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.15, margin: "0 0 16px", color: "white" }}>
              {t.loginHeroLine1}<br />
              {t.loginHeroLine2} <em style={{ color: "#c9a44c", fontStyle: "normal" }}>{t.loginHeroGold}</em>
            </h1>

            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.65, maxWidth: 440, margin: 0 }}>
              {t.loginHeroDesc}
            </p>

            {/* Features */}
            <div className="login-brand-feats" style={{ display: "grid", gap: 14, marginTop: 36, maxWidth: 480 }}>
              {feats.map(({ text, icon }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.88)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", display: "grid", placeItems: "center", flexShrink: 0, color: "#c9a44c" }}>{icon}</div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>© 2026 Bangkok University · Office of Academic Affairs</div>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t.loginHomeLink}</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t.loginHelpLink}</a>
          </div>
        </div>
      </aside>

      {/* ── RIGHT: Form panel ─────────────────────────────────────── */}
      <main className="login-form-panel">
        <LoginForm t={t} lang={lang} setLang={setLang} />
      </main>
    </div>
  );
}
