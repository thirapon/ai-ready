"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import type { MappingRow, Layer2Row } from "@/lib/unesco";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LayerStats { courses: number; mapped: number; }
interface MappingRecord {
  id: string;
  ref_id: string | null;
  faculty_name: string;
  program_name: string;
  form_data: Record<string, unknown> | null;
  layer1_mapping: MappingRow[] | null;
  layer2_mapping: Layer2Row[] | null;
  status: string;
  last_saved: string | null;
}
interface ProcessedRow {
  id: string;
  refId: string;
  faculty: string;
  program: string;
  owner: string;
  layer1: LayerStats;
  layer2: LayerStats;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function computeLayer1(mapping: MappingRow[] | null): LayerStats {
  if (!Array.isArray(mapping) || mapping.length === 0) return { courses: 0, mapped: 0 };
  const mapped = mapping.filter((r) => r.courseName?.trim()).length;
  return { courses: mapping.length, mapped };
}
function computeLayer2(mapping: Layer2Row[] | null): LayerStats {
  if (!Array.isArray(mapping) || mapping.length === 0) return { courses: 0, mapped: 0 };
  const mapped = mapping.filter((r) => r.competency?.trim() || r.courseName?.trim()).length;
  return { courses: mapping.length, mapped };
}
function isDone(layer: LayerStats) { return layer.courses > 0 && layer.mapped >= layer.courses; }

// ─── Sub-components ───────────────────────────────────────────────────────────
function MapStatusBadge({ done, empty }: { done: boolean; empty: boolean }) {
  if (empty) return (
    <span className="status" style={{ background: "#f6f8fb", color: "#8b99a8", borderColor: "#dde3eb" }}>
      <span className="status__dot" />ยังไม่เริ่ม
    </span>
  );
  if (done) return (
    <span className="status" style={{ background: "#e6f4ec", color: "#137a4a", borderColor: "#b5dbc5" }}>
      <span className="status__dot" />แมพครบแล้ว
    </span>
  );
  return (
    <span className="status" style={{ background: "#eef4fb", color: "#1a4f8a", borderColor: "#cfe0f2" }}>
      <span className="status__dot" />กำลังจัดทำ
    </span>
  );
}

function LayerCell({ layer, submissionId, layerNo }: { layer: LayerStats; submissionId: string; layerNo: 1 | 2 }) {
  const router = useRouter();
  const done = isDone(layer);
  const empty = layer.courses === 0;
  const pct = empty ? 0 : Math.round((layer.mapped / layer.courses) * 100);
  const color = done ? "#137a4a" : empty ? "#b9c3cf" : "#1a4f8a";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <MapStatusBadge done={done} empty={empty} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 8, background: "#eef1f6", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "#677889", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>
          {empty ? "0 วิชา" : `${layer.mapped}/${layer.courses}`}
        </span>
      </div>
      <button
        onClick={() => router.push(`/mapping/layer${layerNo}?id=${submissionId}`)}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#1a4f8a", background: "none", border: "1px solid #dbe7f4", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", width: "fit-content" }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        เปิดตาราง
      </button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",      label: "ทุกหลักสูตร" },
  { key: "progress", label: "กำลังจัดทำ" },
  { key: "done",     label: "แมพครบแล้ว" },
] as const;
type TabKey = typeof TABS[number]["key"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MappingDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string } | null>(null);
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState("all");

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "approver") { router.replace("/login"); return; }
      setSession(sess);
    } catch { router.replace("/login"); return; }

    fetch("/api/approver/mapping")
      .then((r) => r.ok ? r.json() : { submissions: [] })
      .then((d) => {
        const processed: ProcessedRow[] = (d.submissions ?? []).map((s: MappingRecord) => ({
          id: s.id,
          refId: s.ref_id ?? "—",
          faculty: s.faculty_name.replace(/^คณะ/, ""),
          program: s.program_name,
          owner: (s.form_data?.owner as string) ?? "—",
          layer1: computeLayer1(s.layer1_mapping),
          layer2: computeLayer2(s.layer2_mapping),
        }));
        setRows(processed);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const faculties = useMemo(() => ["all", ...Array.from(new Set(rows.map((r) => r.faculty)))], [rows]);

  const counts = useMemo(() => {
    const all = rows.length;
    const done = rows.filter((r) => isDone(r.layer1) && isDone(r.layer2)).length;
    return { all, progress: all - done, done };
  }, [rows]);

  const l1Done = useMemo(() => rows.filter((r) => isDone(r.layer1)).length, [rows]);
  const l2Done = useMemo(() => rows.filter((r) => isDone(r.layer2)).length, [rows]);
  const fullyDone = useMemo(() => rows.filter((r) => isDone(r.layer1) && isDone(r.layer2)).length, [rows]);

  const filtered = useMemo(() => {
    let list = rows.slice();
    if (tab === "done") list = list.filter((r) => isDone(r.layer1) && isDone(r.layer2));
    if (tab === "progress") list = list.filter((r) => !(isDone(r.layer1) && isDone(r.layer2)));
    if (faculty !== "all") list = list.filter((r) => r.faculty === faculty);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        r.program.toLowerCase().includes(q) ||
        r.faculty.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        r.refId.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, tab, faculty, search]);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  };

  if (!session || loading) return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
      <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <span className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</span>
            <span className="topbar__role-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              ภาพรวมหลักสูตร
            </span>
          </div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="topbar__nav">
          <a href="/approver">คำขออนุมัติ</a>
          <a href="/approver/mapping" className="is-active">Curriculum Mapping</a>
          <a href="/approver/insights">Executive Insights</a>
          <a href="/approver/faculty-readiness">Faculty Readiness</a>
        </nav>
        <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, color: "#14202e", fontSize: 14 }}>{session.name}</div>
            <div style={{ fontSize: 11.5, color: "#677889" }}>ประธานคณะกรรมการ AI-Ready</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbe7f4", color: "#1a4f8a", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12 }}>กก</div>
          <button className="logout-btn" onClick={handleLogout} title="ออกจากระบบ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 60px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page head */}
        <div className="page-head">
          <div>
            <div className="page-head__crumbs">ระบบ AI-Ready Curriculum &nbsp;›&nbsp; <span>Curriculum Mapping — ภาพรวม</span></div>
            <h1 className="page-head__title">Curriculum Mapping ของทุกหลักสูตร</h1>
            <p className="page-head__desc">ติดตามความคืบหน้าการแมพสมรรถนะ Layer 1 (UNESCO) และ Layer 2 (School &amp; Industry) ของแต่ละหลักสูตร</p>
          </div>
          <div className="page-head__meta">
            <b>แมพครบสมบูรณ์</b>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#1a4f8a", fontFamily: "'IBM Plex Sans', sans-serif", display: "block", lineHeight: 1.1, margin: "2px 0" }}>{fullyDone} / {rows.length}</span>
            ครบทั้ง 2 Layer
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats">
          {[
            { key: "progress", label: "กำลังจัดทำ", value: counts.progress, sub: "ยังแมพไม่ครบทั้ง 2 Layer", color: "#1a4f8a", bg: "#eef4fb", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> },
            { key: "l1", label: "Layer 1 · UNESCO", value: `${l1Done}/${rows.length}`, sub: "แมพครบแล้ว", color: "#1a4f8a", bg: "#eef4fb", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
            { key: "l2", label: "Layer 2 · Industry", value: `${l2Done}/${rows.length}`, sub: "แมพครบแล้ว", color: "#6a3eb5", bg: "#f3ecfb", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
            { key: "done", label: "เสร็จสมบูรณ์", value: fullyDone, sub: "ครบทั้ง 2 Layer", color: "#137a4a", bg: "#e6f4ec", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
          ].map((s) => (
            <div key={s.key}
              className={`stat-card${(s.key === tab) ? " is-on" : ""}`}
              style={{ "--stat-color": s.color, "--stat-bg": s.bg, cursor: (s.key === "progress" || s.key === "done") ? "pointer" : "default" } as React.CSSProperties}
              onClick={() => { if (s.key === "progress" || s.key === "done") setTab(s.key as TabKey); }}
            >
              <div className="stat-card__head"><span>{s.label}</span><span className="stat-card__icon">{s.icon}</span></div>
              <div className="stat-card__num">{s.value}</div>
              <div className="stat-card__sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab${tab === t.key ? " is-on" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}<span className="tab__count">{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar__left">
            <div className="search">
              <span className="search__icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input type="text" placeholder="ค้นหาหลักสูตร / คณะ / รหัส" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="filter-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <select value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                {faculties.map((f) => <option key={f} value={f}>{f === "all" ? "ทุกคณะ" : f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="req-tbl-wrap">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#14202e", marginBottom: 4 }}>ไม่พบหลักสูตรที่ตรงกับเงื่อนไข</div>
              <div>ลองปรับ filter หรือคำค้นหา</div>
            </div>
          ) : (
            <table className="req-tbl" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th>หลักสูตร / คณะ</th>
                  <th style={{ width: 220 }}>Layer 1 · UNESCO</th>
                  <th style={{ width: 220 }}>Layer 2 · School &amp; Industry</th>
                  <th style={{ width: 100 }}>ภาพรวม</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const done1 = isDone(r.layer1), done2 = isDone(r.layer2);
                  const doneCount = (done1 ? 1 : 0) + (done2 ? 1 : 0);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="req-program">{r.program}</div>
                        <div className="req-faculty">{r.faculty} · {r.owner}</div>
                        <div className="req-id" style={{ marginTop: 4, display: "inline-block" }}>{r.refId}</div>
                      </td>
                      <td><LayerCell layer={r.layer1} submissionId={r.id} layerNo={1} /></td>
                      <td><LayerCell layer={r.layer2} submissionId={r.id} layerNo={2} /></td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: done1 ? "#137a4a" : "#dde3eb", display: "inline-block" }} />
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: done2 ? "#137a4a" : "#dde3eb", display: "inline-block" }} />
                          </div>
                          <span style={{ fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 700, color: "#677889" }}>{doneCount}/2</span>
                          <a href={`/mapping/viz?id=${r.id}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#137a4a", textDecoration: "none", padding: "3px 8px", borderRadius: 6, background: "#e6f4ec", border: "1px solid #b5dbc5", whiteSpace: "nowrap" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                            แผนที่
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#8b99a8", marginTop: 8 }}>
          ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ
        </div>
      </main>
    </div>
  );
}
