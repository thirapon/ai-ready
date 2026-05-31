"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { UNESCO_DIMENSIONS, newRow, getDimension } from "@/lib/unesco";
import type { MappingRow } from "@/lib/unesco";

interface Submission {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  formData: { program?: string; owner?: string; submitted_at?: string };
  layer1Mapping: MappingRow[] | Record<string, unknown>;
  layer1Status: "not_started" | "in_progress" | "submitted";
}
interface Session { role: string; code: string; name: string }

// ─── Design tokens ─────────────────────────────────────────────────────────────
const GRP = {
  core:  { color: "#1a4f8a", bg: "#eef4fb",  border: "#dbe7f4", label: "Core Mapping"          },
  tool:  { color: "#a86a14", bg: "#fff8ee",  border: "#f0dca6", label: "AI Tool / Platform"     },
  level: { color: "#137a4a", bg: "#e6f4ec",  border: "#b5dbc5", label: "AI Integration Level"   },
  notes: { color: "#677889", bg: "#f6f8fb",  border: "#dde3eb", label: "Notes"                  },
};
const TYPE_CFG = {
  essential:   { label: "Essential",   color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  specialist:  { label: "Specialist",  color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  competitive: { label: "Competitive", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const SaveIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SendIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SpinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const BackIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// ─── Cell components ──────────────────────────────────────────────────────────
function CellInput({ value, onChange, placeholder, locked }: { value: string; onChange: (v: string) => void; placeholder?: string; locked: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={locked}
      style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#14202e", fontFamily: "inherit" }}
    />
  );
}

function ToggleCell({ on, onClick, locked }: { on: boolean; onClick: () => void; locked: boolean }) {
  return (
    <td
      onClick={() => !locked && onClick()}
      style={{
        textAlign: "center", padding: "0 8px", cursor: locked ? "default" : "pointer",
        background: on ? "#137a4a" : "transparent", transition: "background 0.15s",
        borderRight: "1px solid #eef1f6",
      }}
    >
      {on
        ? <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}><CheckIcon /></span>
        : <span style={{ color: "#b9c3cf", fontSize: 13 }}>—</span>
      }
    </td>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────
function Layer1MappingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [session, setSession]   = useState<Session | null>(null);
  const [sub, setSub]           = useState<Submission | null>(null);
  const [rows, setRows]         = useState<MappingRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg]   = useState("บันทึกอัตโนมัติแล้ว");
  const [submitted, setSubmitted] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // guard: don't auto-save until initial data is set
  const [showConfirm, setShowConfirm] = useState(false);

  const draftKey = submissionId ? `bu_air_layer1_draft_${submissionId}` : "bu_air_layer1_draft";

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    if (!submissionId) { router.replace("/submit"); return; }
    try {
      const sess: Session = JSON.parse(raw);
      if (sess.role !== "faculty") { router.replace("/login"); return; }
      setSession(sess);

      fetch(`/api/mapping/layer1?id=${encodeURIComponent(submissionId)}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then((d: Submission) => {
          if (d.submissionStatus !== "approved") { router.replace("/submit"); return; }
          setSub(d);
          setSubmitted(d.layer1Status === "submitted");
          const saved = Array.isArray(d.layer1Mapping) && d.layer1Mapping.length > 0
            ? d.layer1Mapping as MappingRow[]
            : null;
          if (saved) {
            setRows(saved);
          } else {
            const draft = localStorage.getItem(draftKey);
            if (draft) { try { setRows(JSON.parse(draft)); } catch { setRows([newRow()]); } }
            else setRows([newRow()]);
          }
          setDataLoaded(true);
        })
        .catch((code) => {
          if (code === 404) router.replace("/submit");
          else setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
        })
        .finally(() => setLoading(false));
    } catch { router.replace("/login"); }
  }, [router, submissionId, draftKey]);

  // Auto-save to localStorage (only after initial data is loaded)
  useEffect(() => {
    if (!session || submitted || !dataLoaded) return;
    setSaveMsg("กำลังบันทึก...");
    localStorage.setItem(draftKey, JSON.stringify(rows));
    const t = setTimeout(() => setSaveMsg("บันทึกอัตโนมัติแล้ว"), 600);
    return () => clearTimeout(t);
  }, [rows, session, submitted, draftKey, dataLoaded]);

  const updateRow = useCallback((idx: number, patch: Partial<MappingRow>) => {
    if (submitted) return;
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }, [submitted]);

  const addRow = () => { if (!submitted) setRows((p) => [...p, newRow()]); };
  const deleteRow = (idx: number) => {
    if (!submitted) setRows((p) => p.length > 1 ? p.filter((_, i) => i !== idx) : p);
  };

  const saveDraft = async () => {
    if (!session || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mapping/layer1", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, mapping: rows, action: "draft" }),
      });
      if (res.ok) setSaveMsg("บันทึกแล้ว ✓");
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mapping/layer1", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, mapping: rows, action: "submit" }),
      });
      if (res.ok) { localStorage.removeItem(draftKey); setSubmitted(true); setShowConfirm(false); }
      else alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } catch { alert("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่"); }
    finally { setSubmitting(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  };

  if (loading || !session) return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
      <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
    </div>
  );
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#b53030", fontSize: 14, marginBottom: 12 }}>{error}</div>
        <button className="btn btn--primary" onClick={() => router.push("/submit")}>กลับหน้าหลัก</button>
      </div>
    </div>
  );

  const program = sub?.formData?.program ?? sub?.facultyName ?? "—";
  const applyCount  = rows.filter((r) => r.competency.startsWith("apply_")).length;
  const createCount = rows.filter((r) => r.competency.startsWith("create_")).length;
  const courseCount = new Set(rows.map((r) => r.courseCode).filter(Boolean)).size;
  const locked = submitted;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8" }}>

      {/* ── Topbar ── */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        {!locked && <span className="savetag"><span className="dot" />{saveMsg}</span>}
        <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, color: "#14202e", fontSize: 14 }}>{session.name}</div>
            <div style={{ fontSize: 11.5, color: "#677889" }}>ผู้ยื่นคำขอ</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbe7f4", color: "#1a4f8a", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12 }}>
            {session.name.replace(/^คณะ/, "").slice(0, 2)}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="ออกจากระบบ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px 80px" }}>

        {/* ── Breadcrumb + Layer tabs ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <a href="/submit" style={{ color: "#1a4f8a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
              <BackIcon /> หน้าหลัก
            </a>
            <span style={{ color: "#b9c3cf" }}>›</span>
            <span style={{ color: "#677889" }}>{program}</span>
            <span style={{ color: "#b9c3cf" }}>›</span>
            <span style={{ color: "#677889" }}>Layer 1 Mapping</span>
          </div>
          {/* Layer tabs */}
          <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: 4 }}>
            <span style={{ padding: "6px 14px", borderRadius: 7, background: "#1a4f8a", color: "white", fontSize: 12.5, fontWeight: 700 }}>L1 · UNESCO Mapping</span>
            <a href="#" style={{ padding: "6px 14px", borderRadius: 7, color: "#677889", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>L2 · School & Industry</a>
          </div>
        </div>

        {/* ── Submitted banner ── */}
        {submitted && (
          <div style={{ background: "#e6f4ec", border: "1px solid #b5dbc5", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#137a4a", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <CheckIcon />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#137a4a", fontSize: 14 }}>ส่งการแมพ Layer 1 เรียบร้อยแล้ว</div>
              <div style={{ fontSize: 12.5, color: "#3a4859" }}>ข้อมูลการแมพถูกบันทึกและล็อกแล้ว ไม่สามารถแก้ไขได้</div>
            </div>
          </div>
        )}

        {/* ── MapHeader ── */}
        <div style={{ background: "linear-gradient(135deg, #1a4f8a 0%, #133a66 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 18, color: "white", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, position: "relative" }}>
            <div style={{ flex: 1 }}>
              <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 99, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 11.5, fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>
                UNESCO AI COMPETENCY FRAMEWORK 2023
              </span>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>การแมพหลักสูตรสู่มาตรฐาน UNESCO</h1>
              <p style={{ margin: "0 0 18px", fontSize: 13.5, opacity: 0.82, lineHeight: 1.55 }}>
                ระบุว่าแต่ละรายวิชาในหลักสูตรสอดคล้องกับมิติ UNESCO AI Framework ใด<br />เพื่อรับรองว่าหลักสูตรครอบคลุมสมรรถนะ AI ที่จำเป็น
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {[
                  { label: "หลักสูตร",     value: program },
                  { label: "คณะ",          value: sub?.facultyName ?? "—" },
                  { label: "เลขอ้างอิง",   value: sub?.refId ?? "—" },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Info note */}
          <div style={{ marginTop: 18, background: "rgba(201,164,76,0.18)", border: "1px solid rgba(201,164,76,0.4)", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#f5dea3", display: "flex", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>เพิ่มแถวสำหรับแต่ละรายวิชา เลือก UNESCO Dimension และ Competency ระบุ AI Tool ที่ใช้และระดับการ Embed AI ในรายวิชานั้น</span>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { label: "การแมพทั้งหมด", value: rows.length,  color: "#1a4f8a", bg: "#eef4fb" },
            { label: "ระดับ Apply",   value: applyCount,   color: "#137a4a", bg: "#e6f4ec" },
            { label: "ระดับ Create",  value: createCount,  color: "#6d28d9", bg: "#f5f3ff" },
            { label: "รายวิชา",      value: courseCount,  color: "#a86a14", bg: "#fcf3e1" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#677889", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "var(--font-ibm-plex), monospace", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Mapping table ── */}
        <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 12, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#14202e" }}>ตารางแมพรายวิชา</h3>
            <span style={{ fontSize: 12, color: "#677889" }}>{rows.length} แถว</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1100, borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                {/* Group row */}
                <tr>
                  <th style={{ width: 32, background: "#f6f8fb", borderBottom: "2px solid #eef1f6", borderRight: "1px solid #eef1f6" }} />
                  {/* Core Mapping */}
                  <th colSpan={6} style={{ padding: "8px 12px", textAlign: "center", background: GRP.core.bg, color: GRP.core.color, borderBottom: "2px solid #dbe7f4", borderRight: "2px solid #dbe7f4", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>
                    {GRP.core.label}
                  </th>
                  {/* AI Tool */}
                  <th colSpan={3} style={{ padding: "8px 12px", textAlign: "center", background: GRP.tool.bg, color: GRP.tool.color, borderBottom: "2px solid #f0dca6", borderRight: "2px solid #f0dca6", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>
                    {GRP.tool.label}
                  </th>
                  {/* AI Integration Level */}
                  <th colSpan={4} style={{ padding: "8px 12px", textAlign: "center", background: GRP.level.bg, color: GRP.level.color, borderBottom: "2px solid #b5dbc5", borderRight: "2px solid #b5dbc5", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>
                    {GRP.level.label}
                  </th>
                  {/* Notes */}
                  <th style={{ padding: "8px 12px", textAlign: "center", background: GRP.notes.bg, color: GRP.notes.color, borderBottom: "2px solid #dde3eb", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>
                    {GRP.notes.label}
                  </th>
                </tr>
                {/* Column names */}
                <tr style={{ background: "#f6f8fb" }}>
                  <th style={{ width: 32, borderBottom: "1px solid #eef1f6", borderRight: "1px solid #eef1f6" }} />
                  {/* Core */}
                  {["รหัสวิชา", "Course Name", "Dimension", "Competency", "ปีที่เรียน", "วิธีการ embed"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#3a4859", borderBottom: "1px solid #eef1f6", borderRight: i === 5 ? "2px solid #dbe7f4" : "1px solid #eef1f6", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                  {/* Tool */}
                  {["AI Tool / Platform", "ประเภท", "วิธีการใช้ AI Tool"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#3a4859", borderBottom: "1px solid #eef1f6", borderRight: i === 2 ? "2px solid #f0dca6" : "1px solid #eef1f6", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                  {/* Level */}
                  {["Free Zone", "Consulted", "Assisted", "Generated"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#3a4859", borderBottom: "1px solid #eef1f6", borderRight: i === 3 ? "2px solid #b5dbc5" : "1px solid #eef1f6", whiteSpace: "nowrap", minWidth: 80 }}>{h}</th>
                  ))}
                  {/* Notes */}
                  <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 11.5, fontWeight: 700, color: "#3a4859", borderBottom: "1px solid #eef1f6", minWidth: 180 }}>หมายเหตุ / เงื่อนไขการใช้ AI</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, idx) => {
                  const dim = getDimension(row.dimension);
                  const competencyOptions = dim?.competencies ?? [];
                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid #f4f6fa" }}>
                      {/* Delete */}
                      <td style={{ textAlign: "center", width: 32, borderRight: "1px solid #eef1f6", padding: "0 4px" }}>
                        {!locked && (
                          <button onClick={() => deleteRow(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b9c3cf", padding: 4, display: "inline-flex" }} title="ลบแถว">
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                      {/* รหัสวิชา */}
                      <td style={{ padding: "8px 10px", borderRight: "1px solid #eef1f6", minWidth: 90 }}>
                        <CellInput value={row.courseCode} onChange={(v) => updateRow(idx, { courseCode: v })} placeholder="IT101" locked={locked} />
                      </td>
                      {/* Course Name */}
                      <td style={{ padding: "8px 10px", borderRight: "1px solid #eef1f6", minWidth: 160 }}>
                        <CellInput value={row.courseName} onChange={(v) => updateRow(idx, { courseName: v })} placeholder="ชื่อรายวิชา" locked={locked} />
                      </td>
                      {/* Dimension */}
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #eef1f6", minWidth: 170 }}>
                        <select
                          value={row.dimension}
                          onChange={(e) => updateRow(idx, { dimension: e.target.value, competency: "" })}
                          disabled={locked}
                          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: row.dimension ? "#14202e" : "#8b99a8", fontFamily: "inherit", cursor: locked ? "default" : "pointer" }}
                        >
                          <option value="">เลือก Dimension</option>
                          {UNESCO_DIMENSIONS.map((d) => (
                            <option key={d.id} value={d.id}>{d.label}</option>
                          ))}
                        </select>
                      </td>
                      {/* Competency */}
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #eef1f6", minWidth: 200 }}>
                        <select
                          value={row.competency}
                          onChange={(e) => updateRow(idx, { competency: e.target.value })}
                          disabled={locked || !row.dimension}
                          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: row.competency ? "#14202e" : "#8b99a8", fontFamily: "inherit", cursor: (locked || !row.dimension) ? "default" : "pointer" }}
                        >
                          <option value="">เลือก Competency</option>
                          {competencyOptions.map((c) => (
                            <option key={c.id} value={c.id}>{c.labelTH}</option>
                          ))}
                        </select>
                      </td>
                      {/* Year */}
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #eef1f6", minWidth: 80 }}>
                        <select
                          value={row.year}
                          onChange={(e) => updateRow(idx, { year: e.target.value })}
                          disabled={locked}
                          style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: row.year ? "#14202e" : "#8b99a8", fontFamily: "inherit", cursor: locked ? "default" : "pointer" }}
                        >
                          <option value="">ปีที่</option>
                          {[1,2,3,4].map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </td>
                      {/* Embed method */}
                      <td style={{ padding: "8px 10px", borderRight: "2px solid #dbe7f4", minWidth: 150 }}>
                        <CellInput value={row.embedMethod} onChange={(v) => updateRow(idx, { embedMethod: v })} placeholder="บูรณาการในเนื้อหาหลัก" locked={locked} />
                      </td>
                      {/* AI Tool */}
                      <td style={{ padding: "8px 10px", borderRight: "1px solid #eef1f6", minWidth: 130 }}>
                        <CellInput value={row.aiTool} onChange={(v) => updateRow(idx, { aiTool: v })} placeholder="ChatGPT, Gemini..." locked={locked} />
                      </td>
                      {/* Type badge */}
                      <td style={{ padding: "6px 8px", borderRight: "1px solid #eef1f6", minWidth: 130 }}>
                        {row.toolType && !locked ? (
                          <span
                            onClick={() => !locked && updateRow(idx, { toolType: "" })}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: TYPE_CFG[row.toolType]?.bg, color: TYPE_CFG[row.toolType]?.color, border: `1px solid ${TYPE_CFG[row.toolType]?.border}` }}
                          >
                            {TYPE_CFG[row.toolType]?.label} <span style={{ fontSize: 10 }}>✕</span>
                          </span>
                        ) : !locked ? (
                          <select
                            value=""
                            onChange={(e) => updateRow(idx, { toolType: e.target.value as MappingRow["toolType"] })}
                            style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "#8b99a8", fontFamily: "inherit", cursor: "pointer" }}
                          >
                            <option value="">เลือกประเภท</option>
                            <option value="essential">Essential</option>
                            <option value="specialist">Specialist</option>
                            <option value="competitive">Competitive</option>
                          </select>
                        ) : row.toolType ? (
                          <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: TYPE_CFG[row.toolType]?.bg, color: TYPE_CFG[row.toolType]?.color, border: `1px solid ${TYPE_CFG[row.toolType]?.border}` }}>
                            {TYPE_CFG[row.toolType]?.label}
                          </span>
                        ) : <span style={{ color: "#b9c3cf" }}>—</span>}
                      </td>
                      {/* AI Usage */}
                      <td style={{ padding: "8px 10px", borderRight: "2px solid #f0dca6", minWidth: 150 }}>
                        <CellInput value={row.aiUsage} onChange={(v) => updateRow(idx, { aiUsage: v })} placeholder="ช่วยอธิบายแนวคิด..." locked={locked} />
                      </td>
                      {/* Integration toggles */}
                      <ToggleCell on={row.freeZone}  onClick={() => updateRow(idx, { freeZone:  !row.freeZone  })} locked={locked} />
                      <ToggleCell on={row.consulted} onClick={() => updateRow(idx, { consulted: !row.consulted })} locked={locked} />
                      <ToggleCell on={row.assisted}  onClick={() => updateRow(idx, { assisted:  !row.assisted  })} locked={locked} />
                      <td
                        onClick={() => !locked && updateRow(idx, { generated: !row.generated })}
                        style={{ textAlign: "center", padding: "0 8px", cursor: locked ? "default" : "pointer", background: row.generated ? "#137a4a" : "transparent", borderRight: "2px solid #b5dbc5", transition: "background 0.15s" }}
                      >
                        {row.generated ? <span style={{ color: "white", fontWeight: 700 }}><CheckIcon /></span> : <span style={{ color: "#b9c3cf" }}>—</span>}
                      </td>
                      {/* Notes */}
                      <td style={{ padding: "8px 10px" }}>
                        <CellInput value={row.notes} onChange={(v) => updateRow(idx, { notes: v })} placeholder="หมายเหตุ..." locked={locked} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add row */}
          {!locked && (
            <div style={{ padding: "12px 18px", borderTop: "1px solid #eef1f6" }}>
              <button onClick={addRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px dashed #dde3eb", background: "white", color: "#677889", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <PlusIcon /> เพิ่มรายวิชา
              </button>
            </div>
          )}
        </div>

        {/* Back link when submitted */}
        {submitted && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <a href="/submit" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex" }}>กลับหน้าหลัก</a>
          </div>
        )}
      </main>

      {/* ── Sticky footer action bar ── */}
      {!locked && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dde3eb", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
          <div style={{ fontSize: 13, color: "#677889" }}>
            <b style={{ color: "#14202e" }}>{rows.length}</b> รายวิชา ·{" "}
            <b style={{ color: "#137a4a" }}>{applyCount}</b> Apply ·{" "}
            <b style={{ color: "#6d28d9" }}>{createCount}</b> Create
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={saveDraft} disabled={saving}>
              {saving ? <SpinIcon /> : <SaveIcon />} บันทึกฉบับร่าง
            </button>
            <button className="btn btn--primary" disabled={rows.length === 0 || submitting} onClick={() => setShowConfirm(true)}>
              {submitting ? <SpinIcon /> : <SendIcon />} ส่งการแมพ Layer 1
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div className="modal-bg" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__icon" style={{ background: "#e6f4ec", color: "#137a4a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h3 className="modal__title">ยืนยันส่งการแมพ Layer 1?</h3>
            <p className="modal__text">แมพ <b style={{ color: "#14202e" }}>{rows.length} รายวิชา</b> ครบแล้ว หลังยืนยันจะ<b style={{ color: "#14202e" }}>ไม่สามารถแก้ไข</b>ได้</p>
            <div className="modal__foot">
              <button className="btn" onClick={() => setShowConfirm(false)}>ยกเลิก</button>
              <button className="btn btn--primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? <SpinIcon /> : <SendIcon />} ยืนยันส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Layer1MappingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    }>
      <Layer1MappingInner />
    </Suspense>
  );
}
