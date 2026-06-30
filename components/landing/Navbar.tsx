import { type T, type Lang } from "@/lib/i18n";

interface NavbarProps {
  t: T;
  lang: Lang;
  setLang: (l: Lang) => void;
}

export function Navbar({ t, lang, setLang }: NavbarProps) {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-ink-200"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "saturate(140%) blur(8px)",
        WebkitBackdropFilter: "saturate(140%) blur(8px)",
        padding: "14px 40px",
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#1a4f8a",
            color: "white",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.5px",
            flexShrink: 0,
          }}
        >
          BU
        </div>
        <div>
          <b style={{ display: "block", fontSize: 14.5, color: "#14202e", fontWeight: 700 }}>
            AI-Ready Curriculum
          </b>
          <small style={{ display: "block", fontSize: 11.5, color: "#677889", letterSpacing: "0.02em" }}>
            Bangkok University · Academic Affairs
          </small>
        </div>
      </div>

      {/* Nav links — hidden below 980px */}
      <div className="hidden nav:flex items-center" style={{ gap: 6, marginLeft: 24 }}>
        {[
          { href: "#how",    label: t.landingNavHow },
          { href: "#tracks", label: t.landingNavTracks },
          { href: "#roles",  label: t.landingNavRoles },
          { href: "#",       label: t.landingNavDocs },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="transition-colors rounded-md hover:bg-ink-50 hover:text-bu-blue"
            style={{ fontSize: 13.5, color: "#3a4859", textDecoration: "none", padding: "8px 12px", fontWeight: 500 }}
          >
            {label}
          </a>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Language toggle */}
      <div style={{ display: "flex", border: "1px solid #dde3eb", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
        {(["th", "en"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)}
            style={{ padding: "4px 11px", background: lang === l ? "#1a4f8a" : "white", color: lang === l ? "white" : "#677889", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}>
            {l === "th" ? "ไทย" : "EN"}
          </button>
        ))}
      </div>

      {/* Login */}
      <a
        href="/login"
        className="transition-colors hover:text-bu-blue"
        style={{ fontSize: 13.5, color: "#3a4859", textDecoration: "none", fontWeight: 600 }}
      >
        {t.landingNavLogin}
      </a>

      {/* CTA */}
      <a
        href="/login"
        className="inline-flex items-center gap-2 transition-colors hover:bg-bu-blue-dark"
        style={{ background: "#1a4f8a", color: "white", padding: "9px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13.5, textDecoration: "none" }}
      >
        {t.landingNavCta}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </nav>
  );
}
