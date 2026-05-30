"use client";

import { SESSION_KEY } from "@/lib/faculties";

interface TopbarProps {
  facultyName: string;
}

export function Topbar({ facultyName }: TopbarProps) {
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  };

  // Avatar: first 2 Thai chars
  const avatar = facultyName.replace(/^คณะ/, "").slice(0, 2) || "คณ";

  return (
    <header className="app-topbar">
      {/* Brand */}
      <div className="app-topbar__logo">BU</div>
      <div>
        <div className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</div>
        <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ textAlign: "right", lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, color: "#14202e", fontSize: 14 }}>{facultyName}</div>
          <div style={{ fontSize: 11.5, color: "#677889" }}>ผู้ยื่นคำขอ</div>
        </div>
        <div
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#dbe7f4", color: "#1a4f8a",
            display: "grid", placeItems: "center",
            fontWeight: 600, fontSize: 12,
          }}
        >
          {avatar}
        </div>
        <button className="logout-btn" title="ออกจากระบบ" onClick={handleLogout}>
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
