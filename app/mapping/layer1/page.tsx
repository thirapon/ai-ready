"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { UNESCO_DIMENSIONS, newRow, getDimension, getCompetency } from "@/lib/unesco";
import type { MappingRow } from "@/lib/unesco";

interface Submission {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  formData: { program?: string; owner?: string };
  layer1Mapping: MappingRow[] | Record<string, unknown>;
  layer1Status: "not_started" | "in_progress" | "submitted";
}
interface Session { role: string; code: string; name: string }

const TYPE_CFG = {
  essential:   { label: "Essential",   color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  specialist:  { label: "Specialist",  color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  competitive: { label: "Competitive", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SaveIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SendIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SpinIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const BackIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Form field helpers ───────────────────────────────────────────────────────
function FieldLabel({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#3a4859" }}>{children}</label>
      {sub && <span style={{ fontSize: 11.5, color: "#8b99a8", marginLeft: 6 }}>{sub}</span>}
    </div>
  );
}
function FieldInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: "#14202e", outline: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box" }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#dde3eb"; }}
    />
  );
}
function FieldSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: value ? "#14202e" : "#8b99a8", outline: "none", fontFamily: "inherit", background: "white", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23677889' stroke-width='2.4'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 32 }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#dde3eb"; }}
    >
      {children}
    </select>
  );
}
function FieldTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: "#14202e", outline: "none", fontFamily: "inherit", background: "white", resize: "vertical", boxSizing: "border-box" }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }}
      onBlur={(e)  => { e.target.style.borderColor = "#dde3eb"; }}
    />
  );
}

// ─── Integration toggle button ────────────────────────────────────────────────
function IntegrationToggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
        border: `2px solid ${on ? "#137a4a" : "#dde3eb"}`,
        background: on ? "#e6f4ec" : "white",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: on ? "#137a4a" : "#eef1f6",
        color: on ? "white" : "#b9c3cf",
        display: "grid", placeItems: "center",
        transition: "background 0.15s, color 0.15s",
      }}>
        {on ? <CheckIcon /> : <span style={{ fontSize: 11, fontWeight: 700 }}>—</span>}
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: on ? "#137a4a" : "#14202e" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#677889", marginTop: 1 }}>{desc}</div>
      </div>
    </button>
  );
}

// ─── Slide-over panel ─────────────────────────────────────────────────────────
function RowPanel({
  open, row, isNew, onClose, onSave,
}: {
  open: boolean;
  row: MappingRow;
  isNew: boolean;
  onClose: () => void;
  onSave: (r: MappingRow) => void;
}) {
  const [draft, setDraft] = useState<MappingRow>(row);
  useEffect(() => { setDraft(row); }, [row]);

  const set = (patch: Partial<MappingRow>) => setDraft((p) => ({ ...p, ...patch }));
  const dim = getDimension(draft.dimension);
  const compOptions = dim?.competencies ?? [];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(20,32,46,0.35)", zIndex: 50,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 440,
        background: "white", zIndex: 51, display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 32px rgba(20,32,46,0.12)",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Panel header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#14202e" }}>
              {isNew ? "เพิ่มรายวิชาใหม่" : "แก้ไขรายวิชา"}
            </div>
            {!isNew && draft.courseCode && (
              <div style={{ fontSize: 12, color: "#677889", marginTop: 2 }}>{draft.courseCode} · {draft.courseName || "ยังไม่ระบุชื่อ"}</div>
            )}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f6f8fb", cursor: "pointer", display: "grid", placeItems: "center", color: "#677889" }}>
            <XIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* ── Section: Core Mapping ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#1a4f8a" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1a4f8a", letterSpacing: "0.06em" }}>CORE MAPPING</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <FieldLabel>รหัสวิชา</FieldLabel>
                <FieldInput value={draft.courseCode} onChange={(v) => set({ courseCode: v })} placeholder="เช่น IT101" />
              </div>
              <div>
                <FieldLabel>ปีที่เรียน</FieldLabel>
                <FieldSelect value={draft.year} onChange={(v) => set({ year: v })}>
                  <option value="">เลือกปี</option>
                  {[1,2,3,4].map((y) => <option key={y} value={y}>ปีที่ {y}</option>)}
                </FieldSelect>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <FieldLabel>ชื่อรายวิชา</FieldLabel>
              <FieldInput value={draft.courseName} onChange={(v) => set({ courseName: v })} placeholder="ชื่อวิชาภาษาไทยหรืออังกฤษ" />
            </div>
            <div style={{ marginTop: 12 }}>
              <FieldLabel>UNESCO Dimension</FieldLabel>
              <FieldSelect value={draft.dimension} onChange={(v) => set({ dimension: v, competency: "" })}>
                <option value="">เลือก Dimension</option>
                {UNESCO_DIMENSIONS.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </FieldSelect>
            </div>
            {draft.dimension && (
              <div style={{ marginTop: 12 }}>
                <FieldLabel>Competency <span style={{ fontWeight: 400, color: "#677889" }}>(cascading)</span></FieldLabel>
                <FieldSelect value={draft.competency} onChange={(v) => set({ competency: v })}>
                  <option value="">เลือก Competency</option>
                  {compOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.labelTH}</option>
                  ))}
                </FieldSelect>
              </div>
            )}
            {/* Dimension pill preview */}
            {draft.dimension && (
              <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                {dim && (
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, background: dim.bg, color: dim.color, border: `1px solid ${dim.border}` }}>
                    {dim.label}
                  </span>
                )}
                {draft.competency && (() => {
                  const c = getCompetency(draft.competency);
                  return c ? (
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#f6f8fb", color: "#677889", border: "1px solid #dde3eb" }}>
                      {c.level === "apply" ? "Apply" : "Create"}: {c.label}
                    </span>
                  ) : null;
                })()}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <FieldLabel>วิธีการ embed AI ในรายวิชา</FieldLabel>
              <FieldInput value={draft.embedMethod} onChange={(v) => set({ embedMethod: v })} placeholder="เช่น บูรณาการในเนื้อหาหลัก, โปรเจกต์ปลายภาค" />
            </div>
          </div>

          {/* ── Section: AI Tool ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#a86a14" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#a86a14", letterSpacing: "0.06em" }}>AI TOOL / PLATFORM</span>
            </div>
            <FieldLabel>ชื่อ AI Tool หรือ Platform</FieldLabel>
            <FieldInput value={draft.aiTool} onChange={(v) => set({ aiTool: v })} placeholder="เช่น ChatGPT, Gemini, Copilot" />
            <div style={{ marginTop: 12 }}>
              <FieldLabel>ประเภท</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                {(["essential","specialist","competitive"] as const).map((t) => {
                  const cfg = TYPE_CFG[t];
                  const on = draft.toolType === t;
                  return (
                    <button key={t} type="button" onClick={() => set({ toolType: on ? "" : t })}
                      style={{ flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12,
                        border: `2px solid ${on ? cfg.color : "#dde3eb"}`,
                        background: on ? cfg.bg : "white", color: on ? cfg.color : "#677889",
                        transition: "all 0.15s" }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <FieldLabel>วิธีการใช้ AI Tool ในรายวิชา</FieldLabel>
              <FieldTextarea value={draft.aiUsage} onChange={(v) => set({ aiUsage: v })} placeholder="อธิบายว่านักศึกษาใช้ AI tool นี้อย่างไรในรายวิชา..." rows={3} />
            </div>
          </div>

          {/* ── Section: AI Integration Level ── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#137a4a" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#137a4a", letterSpacing: "0.06em" }}>AI INTEGRATION LEVEL</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <IntegrationToggle label="Free Zone" desc="นักศึกษาสามารถใช้ AI ได้อย่างอิสระ ไม่มีข้อจำกัด" on={draft.freeZone}  onClick={() => set({ freeZone:  !draft.freeZone  })} />
              <IntegrationToggle label="Consulted"  desc="ใช้ AI เพื่อปรึกษา ค้นหา หรือรับคำแนะนำ"            on={draft.consulted} onClick={() => set({ consulted: !draft.consulted })} />
              <IntegrationToggle label="Assisted"   desc="AI ช่วยสร้างเนื้อหาบางส่วนภายใต้การควบคุม"          on={draft.assisted}  onClick={() => set({ assisted:  !draft.assisted  })} />
              <IntegrationToggle label="Generated"  desc="AI สร้างผลลัพธ์ส่วนใหญ่ นักศึกษาตรวจสอบ/แก้ไข"    on={draft.generated} onClick={() => set({ generated: !draft.generated })} />
            </div>
          </div>

          {/* ── Section: Notes ── */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#677889" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#677889", letterSpacing: "0.06em" }}>NOTES</span>
            </div>
            <FieldTextarea value={draft.notes} onChange={(v) => set({ notes: v })} placeholder="หมายเหตุหรือเงื่อนไขการใช้ AI ในรายวิชานี้..." rows={3} />
          </div>
        </div>

        {/* Panel footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #eef1f6", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} className="btn" style={{ flex: 1 }}>ยกเลิก</button>
          <button onClick={() => onSave(draft)} className="btn btn--primary" style={{ flex: 2 }}>
            <SaveIcon /> บันทึกรายวิชา
          </button>
        </div>
      </div>
    </>
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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Panel state
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editIdx, setEditIdx]       = useState<number | null>(null);
  const [panelRow, setPanelRow]     = useState<MappingRow>(newRow());

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
            ? d.layer1Mapping as MappingRow[] : null;
          if (saved) { setRows(saved); }
          else {
            const draft = localStorage.getItem(draftKey);
            if (draft) { try { const p = JSON.parse(draft); setRows(Array.isArray(p) && p.length > 0 ? p : []); } catch { setRows([]); } }
          }
          setDataLoaded(true);
        })
        .catch((code) => {
          if (code === 404) router.replace("/submit");
          else setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
          setLoading(false);
        })
        .finally(() => setLoading(false));
    } catch { router.replace("/login"); }
  }, [router, submissionId, draftKey]);

  useEffect(() => {
    if (!session || submitted || !dataLoaded) return;
    setSaveMsg("กำลังบันทึก...");
    localStorage.setItem(draftKey, JSON.stringify(rows));
    const t = setTimeout(() => setSaveMsg("บันทึกอัตโนมัติแล้ว"), 600);
    return () => clearTimeout(t);
  }, [rows, session, submitted, draftKey, dataLoaded]);

  const openNew = () => {
    if (submitted) return;
    setPanelRow(newRow());
    setEditIdx(null);
    setPanelOpen(true);
  };
  const openEdit = (idx: number) => {
    setPanelRow({ ...rows[idx] });
    setEditIdx(idx);
    setPanelOpen(true);
  };
  const closePanel = () => setPanelOpen(false);
  const savePanel = (r: MappingRow) => {
    if (editIdx !== null) {
      setRows((p) => p.map((row, i) => i === editIdx ? r : row));
    } else {
      setRows((p) => [...p, r]);
    }
    setPanelOpen(false);
  };
  const deleteRow = (idx: number) => {
    setRows((p) => p.filter((_, i) => i !== idx));
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

  const program     = sub?.formData?.program ?? sub?.facultyName ?? "—";
  const applyCount  = rows.filter((r) => r.competency.startsWith("apply_")).length;
  const createCount = rows.filter((r) => r.competency.startsWith("create_")).length;
  const courseCount = new Set(rows.map((r) => r.courseCode).filter(Boolean)).size;

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
        {!submitted && <span className="savetag"><span className="dot" />{saveMsg}</span>}
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

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 80px" }}>

        {/* Breadcrumb + Layer tabs */}
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
          <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: 4 }}>
            <span style={{ padding: "6px 14px", borderRadius: 7, background: "#1a4f8a", color: "white", fontSize: 12.5, fontWeight: 700 }}>L1 · UNESCO Mapping</span>
            <a href="#" style={{ padding: "6px 14px", borderRadius: 7, color: "#677889", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>L2 · School & Industry</a>
          </div>
        </div>

        {/* Submitted banner */}
        {submitted && (
          <div style={{ background: "#e6f4ec", border: "1px solid #b5dbc5", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#137a4a", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}><CheckIcon /></div>
            <div>
              <div style={{ fontWeight: 700, color: "#137a4a", fontSize: 14 }}>ส่งการแมพ Layer 1 เรียบร้อยแล้ว</div>
              <div style={{ fontSize: 12.5, color: "#3a4859" }}>ข้อมูลถูกบันทึกและล็อกแล้ว ไม่สามารถแก้ไขได้</div>
            </div>
          </div>
        )}

        {/* MapHeader */}
        <div style={{ background: "linear-gradient(135deg, #1a4f8a 0%, #133a66 100%)", borderRadius: 14, padding: "26px 30px", marginBottom: 18, color: "white", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>
              UNESCO AI COMPETENCY FRAMEWORK 2023
            </span>
            <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>การแมพหลักสูตรสู่มาตรฐาน UNESCO</h1>
            <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.8, lineHeight: 1.55 }}>
              ระบุว่าแต่ละรายวิชาสอดคล้องกับมิติ UNESCO AI Framework ใด และใช้ AI Tool ในระดับใด
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {[{ label: "หลักสูตร", value: program }, { label: "คณะ", value: sub?.facultyName ?? "—" }, { label: "เลขอ้างอิง", value: sub?.refId ?? "—" }].map((m) => (
                <div key={m.label}>
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, background: "rgba(201,164,76,0.18)", border: "1px solid rgba(201,164,76,0.4)", borderRadius: 8, padding: "9px 14px", fontSize: 12.5, color: "#f5dea3", display: "flex", gap: 8, position: "relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>กดปุ่ม <b>&quot;+ เพิ่มรายวิชา&quot;</b> เพื่อเพิ่มแต่ละรายวิชา — ระบบจะเปิด panel ทางขวาสำหรับกรอกข้อมูล</span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { label: "รายวิชาทั้งหมด", value: rows.length,  color: "#1a4f8a" },
            { label: "ระดับ Apply",    value: applyCount,   color: "#137a4a" },
            { label: "ระดับ Create",   value: createCount,  color: "#6d28d9" },
            { label: "รหัสวิชาไม่ซ้ำ", value: courseCount,  color: "#a86a14" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#677889", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "var(--font-ibm-plex), monospace", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Summary table */}
        <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#14202e" }}>รายการแมพ</h3>
              <span style={{ fontSize: 12, color: "#677889" }}>{rows.length} รายวิชา</span>
            </div>
            {!submitted && (
              <button onClick={openNew} className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <PlusIcon /> เพิ่มรายวิชา
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#eef4fb", color: "#1a4f8a", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#14202e", marginBottom: 6 }}>ยังไม่มีรายวิชา</div>
              <div style={{ fontSize: 13, color: "#677889", marginBottom: 16 }}>กดปุ่มด้านบนเพื่อเพิ่มรายวิชาแรก</div>
              {!submitted && (
                <button onClick={openNew} className="btn btn--primary" style={{ display: "inline-flex", gap: 6 }}>
                  <PlusIcon /> เพิ่มรายวิชาแรก
                </button>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f6f8fb" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6", width: 40 }}>#</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6" }}>รายวิชา</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6" }}>UNESCO Dimension</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6" }}>AI Tool</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6", width: 140 }}>Integration Level</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6", width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const dim = getDimension(row.dimension);
                  const comp = getCompetency(row.competency);
                  const levels = [row.freeZone, row.consulted, row.assisted, row.generated];
                  const levelLabels = ["FZ","C","A","G"];
                  return (
                    <tr
                      key={row.id}
                      style={{ borderBottom: "1px solid #f4f6fa", cursor: submitted ? "default" : "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => { if (!submitted) (e.currentTarget as HTMLTableRowElement).style.background = "#fafbfd"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      onClick={() => !submitted && openEdit(idx)}
                    >
                      <td style={{ padding: "12px 12px", color: "#8b99a8", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-ibm-plex), monospace" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#14202e" }}>{row.courseName || <span style={{ color: "#b9c3cf" }}>ยังไม่ระบุ</span>}</div>
                        {row.courseCode && <div style={{ fontSize: 12, color: "#677889", marginTop: 2 }}>{row.courseCode} {row.year ? `· ปีที่ ${row.year}` : ""}</div>}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        {dim ? (
                          <div>
                            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: dim.bg, color: dim.color, border: `1px solid ${dim.border}` }}>
                              {dim.label}
                            </span>
                            {comp && <div style={{ fontSize: 11.5, color: "#677889", marginTop: 3 }}>{comp.level === "apply" ? "Apply" : "Create"}: {comp.label}</div>}
                          </div>
                        ) : <span style={{ color: "#b9c3cf", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        {row.aiTool ? (
                          <div>
                            <div style={{ fontWeight: 500, color: "#14202e" }}>{row.aiTool}</div>
                            {row.toolType && (
                              <span style={{ display: "inline-block", marginTop: 2, padding: "1px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: TYPE_CFG[row.toolType]?.bg, color: TYPE_CFG[row.toolType]?.color, border: `1px solid ${TYPE_CFG[row.toolType]?.border}` }}>
                                {TYPE_CFG[row.toolType]?.label}
                              </span>
                            )}
                          </div>
                        ) : <span style={{ color: "#b9c3cf", fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          {levels.map((on, i) => (
                            <span key={i} title={levelLabels[i]} style={{
                              width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700,
                              background: on ? "#137a4a" : "#f0f3f8",
                              color: on ? "white" : "#b9c3cf",
                              border: `1px solid ${on ? "#b5dbc5" : "#eef1f6"}`,
                            }}>
                              {levelLabels[i]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          {!submitted && (
                            <>
                              <button onClick={() => openEdit(idx)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #dde3eb", background: "white", cursor: "pointer", display: "grid", placeItems: "center", color: "#677889" }} title="แก้ไข">
                                <EditIcon />
                              </button>
                              <button onClick={() => deleteRow(idx)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #f4d0d0", background: "#fdecec", cursor: "pointer", display: "grid", placeItems: "center", color: "#b53030" }} title="ลบ">
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {submitted && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <a href="/submit" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex" }}>กลับหน้าหลัก</a>
          </div>
        )}
      </main>

      {/* ── Sticky footer ── */}
      {!submitted && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dde3eb", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
          <div style={{ fontSize: 13, color: "#677889" }}>
            <b style={{ color: "#14202e" }}>{rows.length}</b> รายวิชา · <b style={{ color: "#137a4a" }}>{applyCount}</b> Apply · <b style={{ color: "#6d28d9" }}>{createCount}</b> Create
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

      {/* ── Slide-over panel ── */}
      <RowPanel
        open={panelOpen}
        row={panelRow}
        isNew={editIdx === null}
        onClose={closePanel}
        onSave={savePanel}
      />

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
