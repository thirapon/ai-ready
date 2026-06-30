"use client";

import { SESSION_KEY } from "@/lib/faculties";
import { useLang, type T, type Lang } from "@/lib/i18n";

interface TopbarProps {
  facultyName: string;
  t?: T;
  lang?: Lang;
  setLang?: (l: Lang) => void;
}

export function Topbar({ facultyName, t: tProp, lang: langProp, setLang: setLangProp }: TopbarProps) {
  const fallback = useLang();
  const t       = tProp       ?? fallback.t;
  const lang    = langProp    ?? fallback.lang;
  const setLang = setLangProp ?? fallback.setLang;

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  };

  const avatar = facultyName.replace(/^คณะ/, "").slice(0, 2) || "คณ";

  return (
    <header className="app-topbar">
      {/* Brand */}
      <div className="app-topbar__logo">BU</div>
      <div>
        <div className="app-topbar__title">{t.sysTitle}</div>
        <div className="app-topbar__sub">{t.sysSub}</div>
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

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right", lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, color: "#14202e", fontSize: 14 }}>{facultyName}</div>
          <div style={{ fontSize: 11.5, color: "#677889" }}>{t.roleFaculty}</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbe7f4", color: "#1a4f8a", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12 }}>
          {avatar}
        </div>
        <button className="logout-btn" title={t.logout} onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
