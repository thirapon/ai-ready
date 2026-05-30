// Server Component — reads passwords from env vars at request time.
// Passwords are passed as props to LoginForm (Client Component).
// They are NOT bundled into the client JS bundle.

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "เข้าสู่ระบบ · AI-Ready Curriculum · BU",
};

export default function LoginPage() {

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
              เตรียมหลักสูตร<br />
              ของท่านสู่ <em style={{ color: "#c9a44c", fontStyle: "normal" }}>โลก AI</em>
            </h1>

            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.65, maxWidth: 440, margin: 0 }}>
              ระบบบริหารหลักสูตรที่ช่วยให้ผู้ดูแลหลักสูตรยื่นขออนุมัติสมรรถนะด้านปัญญาประดิษฐ์
              ติดตามสถานะ และจัดทำ Curriculum Mapping ครบในที่เดียว
            </p>

            {/* Features */}
            <div className="login-brand-feats" style={{ display: "grid", gap: 14, marginTop: 36, maxWidth: 480 }}>
              {[
                { text: "ยื่นขออนุมัติหลักสูตร AI-Ready แบบ 3 ขั้นตอน", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
                { text: "แมพรายวิชาเข้ากับสมรรถนะตามกรอบ UNESCO และ Industry", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
                { text: "ติดตามสถานะคำขอ + แจ้งเตือนภายในระบบ", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
              ].map(({ text, icon }) => (
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
            <a href="/" style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>หน้าแรก</a>
            <a href="#" style={{ color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>ช่วยเหลือ</a>
          </div>
        </div>
      </aside>

      {/* ── RIGHT: Form panel — Client Component ──────────────────── */}
      <main className="login-form-panel">
        <LoginForm />
      </main>
    </div>
  );
}
