"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { newLayer2Row } from "@/lib/unesco";
import type { Layer2Row } from "@/lib/unesco";
import ToolChipInput from "@/components/form/ToolChipInput";

interface FormCompetency {
  id: number;
  name: string;
  source: "school" | "industry";
  years: number[];
  desc: string;
  note: string;
}
interface Submission {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  formData: { program?: string; owner?: string; competencies?: FormCompetency[] };
  layer2Mapping: Layer2Row[] | unknown;
  layer2Status: "not_started" | "in_progress" | "submitted";
}
interface Session { role: string; code: string; name: string }

const TYPE_CFG = {
  essential:   { label: "Essential",   color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  specialist:  { label: "Specialist",  color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  competitive: { label: "Competitive", color: "#6a3eb5", bg: "#f3ecfb", border: "#d4bff0" },
};
const SECTOR_CFG = {
  school:   { label: "School",   color: "#6a3eb5", bg: "#f3ecfb", border: "#d4bff0" },
  industry: { label: "Industry", color: "#b6620e", bg: "#fff3e6", border: "#f0d0a0" },
};

// Layer 2 competency is free text; we link it to a Step-2 competency by name
// (no DB foreign key). normalizeComp lets us compare leniently — ignoring case,
// surrounding/extra whitespace — so "Prompt  Engineering " matches "prompt engineering".
const normalizeComp = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
// A competency is an "orphan" when text is filled but matches no Step-2 name.
function isOrphanComp(text: string, compNames: Set<string>): boolean {
  const t = normalizeComp(text);
  return t !== "" && !compNames.has(t);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SaveIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SpinIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const PlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const BackIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ─── Form helpers ─────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 6, fontSize: 12.5, fontWeight: 700, color: "#3a4859" }}>{children}</div>;
}
function FieldInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: "#14202e", outline: "none", fontFamily: "inherit", background: "white", boxSizing: "border-box" }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }} onBlur={(e) => { e.target.style.borderColor = "#dde3eb"; }}
    />
  );
}
function FieldSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: value ? "#14202e" : "#8b99a8", outline: "none", fontFamily: "inherit", background: "white", cursor: "pointer", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23677889' stroke-width='2.4'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 32 }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }} onBlur={(e) => { e.target.style.borderColor = "#dde3eb"; }}
    >
      {children}
    </select>
  );
}
function FieldTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #dde3eb", borderRadius: 8, fontSize: 13.5, color: "#14202e", outline: "none", fontFamily: "inherit", background: "white", resize: "vertical", boxSizing: "border-box" }}
      onFocus={(e) => { e.target.style.borderColor = "#1a4f8a"; }} onBlur={(e) => { e.target.style.borderColor = "#dde3eb"; }}
    />
  );
}
function IntegrationToggle({ label, desc, on, onClick }: { label: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `2px solid ${on ? "#137a4a" : "#dde3eb"}`, background: on ? "#e6f4ec" : "white", transition: "border-color 0.15s, background 0.15s" }}
    >
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: on ? "#137a4a" : "#eef1f6", color: on ? "white" : "#b9c3cf", display: "grid", placeItems: "center", transition: "background 0.15s" }}>
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
function RowPanel({ open, row, isNew, onClose, onSave, suggestedCompetencies = [], toolSuggestions = [] }: {
  open: boolean; row: Layer2Row; isNew: boolean;
  onClose: () => void; onSave: (r: Layer2Row) => void;
  suggestedCompetencies?: FormCompetency[];
  toolSuggestions?: string[];
}) {
  const [draft, setDraft] = useState<Layer2Row>(row);
  useEffect(() => { setDraft(row); }, [row]);
  const set = (patch: Partial<Layer2Row>) => setDraft((p) => ({ ...p, ...patch }));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,32,46,0.35)", zIndex: 50, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.25s" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 440, background: "white", zIndex: 51, display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(20,32,46,0.12)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#14202e" }}>{isNew ? "เพิ่มรายวิชาใหม่" : "แก้ไขรายวิชา"}</div>
            {!isNew && draft.courseCode && <div style={{ fontSize: 12, color: "#677889", marginTop: 2 }}>{draft.courseCode} · {draft.courseName || "ยังไม่ระบุชื่อ"}</div>}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f6f8fb", cursor: "pointer", display: "grid", placeItems: "center", color: "#677889" }}><XIcon /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

          {/* CORE MAPPING */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#1a4f8a" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1a4f8a", letterSpacing: "0.06em" }}>CORE MAPPING</span>
            </div>

            {/* Sector toggle */}
            <FieldLabel>School / Industry</FieldLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(["school", "industry"] as const).map((s) => {
                const cfg = SECTOR_CFG[s];
                const on = draft.sector === s;
                return (
                  <button key={s} type="button" onClick={() => set({ sector: on ? "" : s })}
                    style={{ flex: 1, padding: "10px 8px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 13.5, border: `2px solid ${on ? cfg.color : "#dde3eb"}`, background: on ? cfg.bg : "white", color: on ? cfg.color : "#677889", transition: "all 0.15s" }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Competency — with suggestions from submission form */}
            <FieldLabel>Competency</FieldLabel>
            {(() => {
              const filtered = suggestedCompetencies.filter(
                (c) => !draft.sector || c.source === draft.sector
              );
              if (filtered.length === 0) return null;
              return (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11.5, color: "#677889", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    เลือกจากสมรรถนะในแบบฟอร์ม:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {filtered.map((c) => {
                      const isSelected = draft.competency === c.name;
                      const color = c.source === "school" ? "#6a3eb5" : "#b6620e";
                      const bg    = c.source === "school" ? "#f3ecfb"  : "#fcf3e1";
                      return (
                        <button key={c.id} type="button"
                          onClick={() => set({ competency: isSelected ? "" : c.name })}
                          style={{ padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: `1.5px solid ${isSelected ? color : "#dde3eb"}`, background: isSelected ? bg : "white", color: isSelected ? color : "#677889", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {(() => {
              const orphan = draft.competency.trim() !== "" && isOrphanComp(draft.competency, new Set(suggestedCompetencies.map((c) => normalizeComp(c.name))));
              return (
                <>
                  <div style={{ marginBottom: orphan ? 6 : 12 }}>
                    <FieldTextarea value={draft.competency} onChange={(v) => set({ competency: v })} placeholder="เลือกจากชิพด้านบน หรือพิมพ์สมรรถนะเอง..." rows={2} />
                  </div>
                  {orphan && (
                    <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 11px", borderRadius: 8, background: "#fcf3e1", border: "1px solid #f0dca6", fontSize: 12, color: "#a86a14", lineHeight: 1.5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <span>สมรรถนะนี้ไม่ตรงกับที่ระบุไว้ใน Step 2 — ตรวจสอบว่าตั้งใจเพิ่มเอง หรือสะกดไม่ตรง</span>
                    </div>
                  )}
                </>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
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

            <FieldLabel>ชื่อรายวิชา</FieldLabel>
            <div style={{ marginBottom: 12 }}>
              <FieldInput value={draft.courseName} onChange={(v) => set({ courseName: v })} placeholder="ชื่อวิชาภาษาไทยหรืออังกฤษ" />
            </div>

            <FieldLabel>วิธีการ embed AI ในรายวิชา</FieldLabel>
            <FieldInput value={draft.embedMethod} onChange={(v) => set({ embedMethod: v })} placeholder="เช่น บูรณาการในเนื้อหาหลัก, โปรเจกต์ปลายภาค" />
          </div>

          {/* AI TOOL */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#a86a14" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#a86a14", letterSpacing: "0.06em" }}>AI TOOL / PLATFORM</span>
            </div>
            <FieldLabel>ชื่อ AI Tool หรือ Platform</FieldLabel>
            <div style={{ marginBottom: 4 }}>
              <ToolChipInput value={draft.aiTool} onChange={(v) => set({ aiTool: v })} suggestions={toolSuggestions} />
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: "#8b99a8", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              พิมพ์ชื่อ tool แล้วกด Enter เพื่อเพิ่มทีละตัว (เลือกจากรายการแนะนำได้)
            </div>
            <FieldLabel>ประเภท</FieldLabel>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(["essential","specialist","competitive"] as const).map((t) => {
                const cfg = TYPE_CFG[t];
                const on = draft.toolType === t;
                return (
                  <button key={t} type="button" onClick={() => set({ toolType: on ? "" : t })}
                    style={{ flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, border: `2px solid ${on ? cfg.color : "#dde3eb"}`, background: on ? cfg.bg : "white", color: on ? cfg.color : "#677889", transition: "all 0.15s" }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <FieldLabel>วิธีการใช้ AI Tool ในรายวิชา</FieldLabel>
            <FieldTextarea value={draft.aiUsage} onChange={(v) => set({ aiUsage: v })} placeholder="อธิบายว่านักศึกษาใช้ AI tool นี้อย่างไร..." rows={3} />
          </div>

          {/* AI INTEGRATION LEVEL */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#137a4a" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#137a4a", letterSpacing: "0.06em" }}>AI INTEGRATION LEVEL</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <IntegrationToggle label="AI Free Zone"  desc="ไม่ใช้ AI ในทุกขั้นตอน — เป็นผลงานของนักศึกษาทั้งหมด"      on={draft.freeZone}  onClick={() => set({ freeZone:  !draft.freeZone  })} />
              <IntegrationToggle label="AI Consulted"  desc="ใช้ AI เพื่อช่วยคิดเท่านั้น (ไอเดีย คำอธิบาย คำแนะนำ) แต่นักศึกษาผลิตผลงานทั้งหมดเอง"  on={draft.consulted} onClick={() => set({ consulted: !draft.consulted })} />
              <IntegrationToggle label="AI Assisted"   desc="AI และนักศึกษาร่วมกันผลิต โดยนักศึกษากำกับ แก้ไข และเป็นเจ้าของผลงานสุดท้าย"  on={draft.assisted}  onClick={() => set({ assisted:  !draft.assisted  })} />
              <IntegrationToggle label="AI Generated"  desc="AI ผลิตผลงานเกือบทั้งหมดหรือทั้งหมด นักศึกษาเป็นผู้กำกับและตรวจทาน"  on={draft.generated} onClick={() => set({ generated: !draft.generated })} />
            </div>
          </div>

          {/* NOTES */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 4, height: 16, borderRadius: 99, background: "#677889" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#677889", letterSpacing: "0.06em" }}>NOTES</span>
            </div>
            <FieldTextarea value={draft.notes} onChange={(v) => set({ notes: v })} placeholder="หมายเหตุหรือเงื่อนไขการใช้ AI ในรายวิชานี้..." rows={3} />
          </div>
        </div>

        {/* Footer */}
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

// ─── Page inner ───────────────────────────────────────────────────────────────
function Layer2MappingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [session, setSession]   = useState<Session | null>(null);
  const [sub, setSub]           = useState<Submission | null>(null);
  const [rows, setRows]         = useState<Layer2Row[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("บันทึกอัตโนมัติแล้ว");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editIdx, setEditIdx]   = useState<number | null>(null);
  const [panelRow, setPanelRow] = useState<Layer2Row>(newLayer2Row());
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  const draftKey = submissionId ? `bu_air_layer2_draft_${submissionId}` : "bu_air_layer2_draft";

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    if (!submissionId) { router.replace("/submit"); return; }
    try {
      const sess: Session = JSON.parse(raw);
      if (sess.role !== "faculty" && sess.role !== "approver") { router.replace("/login"); return; }
      setSession(sess);
      fetch(`/api/mapping/layer2?id=${encodeURIComponent(submissionId)}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then((d: Submission) => {
          if (sess.role === "faculty" && d.submissionStatus !== "approved") { router.replace("/submit"); return; }
          setSub(d);
          const saved = Array.isArray(d.layer2Mapping) && (d.layer2Mapping as Layer2Row[]).length > 0
            ? d.layer2Mapping as Layer2Row[] : null;
          if (saved) { setRows(saved); }
          else {
            const draft = localStorage.getItem(draftKey);
            if (draft) { try { const p = JSON.parse(draft); setRows(Array.isArray(p) ? p : []); } catch { setRows([]); } }
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

  const isReadOnly = session?.role === "approver";

  useEffect(() => {
    if (!session || !dataLoaded || isReadOnly) return;
    setSaveMsg("กำลังบันทึก...");
    localStorage.setItem(draftKey, JSON.stringify(rows));
    const t = setTimeout(() => setSaveMsg("บันทึกอัตโนมัติแล้ว"), 600);
    return () => clearTimeout(t);
  }, [rows, session, draftKey, dataLoaded, isReadOnly]);

  const openNew  = () => { if (isReadOnly) return; setPanelRow(newLayer2Row()); setEditIdx(null); setPanelOpen(true); };
  const openEdit = (idx: number) => { if (isReadOnly) return; setPanelRow({ ...rows[idx] }); setEditIdx(idx); setPanelOpen(true); };
  const closePanel = () => setPanelOpen(false);
  const savePanel  = (r: Layer2Row) => {
    if (editIdx !== null) setRows((p) => p.map((row, i) => i === editIdx ? r : row));
    else setRows((p) => [...p, r]);
    setPanelOpen(false);
  };
  const deleteRow = (idx: number) => setRows((p) => p.filter((_, i) => i !== idx));

  const saveMapping = async () => {
    if (!session || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mapping/layer2", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: submissionId, mapping: rows, action: "draft" }) });
      if (res.ok) setSaveMsg("บันทึกแล้ว ✓");
      else alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } catch { alert("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่"); } finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); router.push("/login"); };

  if (loading || !session) return <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}><div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div></div>;
  if (error) return <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}><div style={{ textAlign: "center" }}><div style={{ color: "#b53030", fontSize: 14, marginBottom: 12 }}>{error}</div><button className="btn btn--primary" onClick={() => router.push("/submit")}>กลับหน้าหลัก</button></div></div>;

  const program      = sub?.formData?.program ?? sub?.facultyName ?? "—";
  const schoolCount  = rows.filter((r) => r.sector === "school").length;
  const industryCount= rows.filter((r) => r.sector === "industry").length;
  const courseCount  = new Set(rows.map((r) => r.courseCode).filter(Boolean)).size;
  // Set of Step-2 competency names (normalized) — to flag Layer 2 rows whose
  // competency no longer matches any declared competency in the form.
  const compNames    = new Set((sub?.formData?.competencies ?? []).map((c) => normalizeComp(c.name)).filter(Boolean));
  const orphanCount  = rows.filter((r) => isOrphanComp(r.competency, compNames)).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8" }}>

      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        <span className="savetag"><span className="dot" />{saveMsg}</span>
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

        {/* Read-only banner for approver */}
        {isReadOnly && (
          <div style={{ background: "#eef4fb", border: "1px solid #dbe7f4", borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a4f8a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ color: "#1a4f8a", fontWeight: 600 }}>โหมดดูข้อมูล (Approver)</span>
            <span style={{ color: "#677889" }}>— ไม่สามารถแก้ไขข้อมูลได้</span>
            <button onClick={() => router.push("/approver/mapping")} style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#1a4f8a", background: "none", border: "1px solid #dbe7f4", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>
              ← กลับ Mapping Dashboard
            </button>
          </div>
        )}

        {/* Breadcrumb + Layer tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <a href={isReadOnly ? "/approver/mapping" : "/submit"} style={{ color: "#1a4f8a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}><BackIcon /> {isReadOnly ? "Mapping Dashboard" : "หน้าหลัก"}</a>
            <span style={{ color: "#b9c3cf" }}>›</span>
            <span style={{ color: "#677889" }}>{program}</span>
            <span style={{ color: "#b9c3cf" }}>›</span>
            <span style={{ color: "#677889" }}>Layer 2 Mapping</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: 4 }}>
            <a href={`/mapping/layer1?id=${submissionId}`} style={{ padding: "6px 14px", borderRadius: 7, color: "#677889", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>L1 · UNESCO Mapping</a>
            <span style={{ padding: "6px 14px", borderRadius: 7, background: "#1a4f8a", color: "white", fontSize: 12.5, fontWeight: 700 }}>L2 · School & Industry</span>
            <a href={`/mapping/viz?id=${submissionId}`} style={{ padding: "6px 12px", borderRadius: 7, color: "#137a4a", fontSize: 12.5, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, background: "#e6f4ec", border: "1px solid #b5dbc5" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              แผนที่หลักสูตร
            </a>
          </div>
        </div>

{/* MapHeader — purple gradient for L2 */}
        <div style={{ background: "linear-gradient(135deg, #4a1d8a 0%, #2d0f5e 100%)", borderRadius: 14, padding: "26px 30px", marginBottom: 18, color: "white", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em" }}>
              SCHOOL & INDUSTRY AI COMPETENCY FRAMEWORK
            </span>
            <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>การแมพสมรรถนะ School & Industry</h1>
            <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.8, lineHeight: 1.55 }}>
              ระบุสมรรถนะ AI เฉพาะของคณะ (School) หรืออุตสาหกรรม (Industry) ที่แต่ละรายวิชาสอดคล้อง
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
            <span>เลือก <b>School</b> หรือ <b>Industry</b> — แล้วพิมพ์สมรรถนะได้อย่างอิสระ — 1 แถว = 1 รายวิชา × 1 สมรรถนะ</span>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { label: "รายวิชาทั้งหมด", value: rows.length,   color: "#4a1d8a" },
            { label: "School",         value: schoolCount,   color: "#6a3eb5" },
            { label: "Industry",       value: industryCount, color: "#b6620e" },
            { label: "รหัสวิชาไม่ซ้ำ", value: courseCount,   color: "#1a4f8a" },
          ].map((s) => (
            <div key={s.label} style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#677889", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: "var(--font-ibm-plex), monospace", lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Orphan competency notice */}
        {orphanCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", marginBottom: 14, borderRadius: 10, background: "#fcf3e1", border: "1px solid #f0dca6", fontSize: 12.5, color: "#a86a14" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span><b>{orphanCount}</b> รายวิชามีสมรรถนะที่ไม่ตรงกับที่ระบุไว้ใน Step 2 ของแบบฟอร์ม — อาจมาจากการแก้ไข/ลบสมรรถนะในแบบฟอร์มภายหลัง หรือสะกดไม่ตรง</span>
          </div>
        )}

        {/* Summary table */}
        <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#14202e" }}>รายการแมพ</h3>
              <span style={{ fontSize: 12, color: "#677889" }}>{rows.length} รายวิชา</span>
            </div>
            <button onClick={openNew} className="btn btn--primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <PlusIcon /> เพิ่มรายวิชา
            </button>
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f3ecfb", color: "#6a3eb5", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#14202e", marginBottom: 6 }}>ยังไม่มีรายวิชา</div>
              <div style={{ fontSize: 13, color: "#677889", marginBottom: 16 }}>กดปุ่มด้านบนเพื่อเพิ่มรายวิชาแรก</div>
              <button onClick={openNew} className="btn btn--primary" style={{ display: "inline-flex", gap: 6 }}>
                <PlusIcon /> เพิ่มรายวิชาแรก
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f6f8fb" }}>
                  {["#", "รายวิชา", "School / Industry + Competency", "AI Tool", "Integration Level", ...(isReadOnly ? [] : ["Actions"])].map((h, i) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: i >= 3 ? "center" : "left", fontWeight: 700, color: "#3a4859", fontSize: 12, borderBottom: "1px solid #eef1f6", width: i === 0 ? 40 : i === 4 ? 140 : i === 5 ? 80 : "auto" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const sCfg = row.sector ? SECTOR_CFG[row.sector as keyof typeof SECTOR_CFG] : null;
                  const levels = [row.freeZone, row.consulted, row.assisted, row.generated];
                  const levelLabels = ["FZ","C","A","G"];
                  const isExpanded = expandedSet.has(idx);
                  const hasDetail = !!(row.aiUsage || row.embedMethod || row.notes);
                  return (
                    <React.Fragment key={row.id}>
                    <tr
                      style={{ borderBottom: isExpanded ? "none" : "1px solid #f4f6fa", cursor: "pointer", transition: "background 0.1s", background: isExpanded ? "#f6f8fb" : "transparent" }}
                      onMouseEnter={(e) => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.background = "#fafbfd"; }}
                      onMouseLeave={(e) => { if (!isExpanded) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                      onClick={() => setExpandedSet(prev => { const s = new Set(prev); if (isExpanded) { s.delete(idx); } else { s.add(idx); } return s; })}
                    >
                      <td style={{ padding: "12px 12px", color: "#8b99a8", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-ibm-plex), monospace" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span>{String(idx + 1).padStart(2, "0")}</span>
                          {hasDetail && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isExpanded ? "#1a4f8a" : "#b9c3cf"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#14202e" }}>{row.courseName || <span style={{ color: "#b9c3cf" }}>ยังไม่ระบุ</span>}</div>
                        {row.courseCode && <div style={{ fontSize: 12, color: "#677889", marginTop: 2 }}>{row.courseCode}{row.year ? ` · ปีที่ ${row.year}` : ""}</div>}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {sCfg && (
                            <span style={{ display: "inline-block", width: "fit-content", padding: "2px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}` }}>
                              {sCfg.label}
                            </span>
                          )}
                          {row.competency
                            ? <div style={{ fontSize: 12.5, color: "#3a4859", lineHeight: 1.4 }}>{row.competency}</div>
                            : <span style={{ color: "#b9c3cf", fontSize: 12 }}>—</span>
                          }
                          {isOrphanComp(row.competency, compNames) && (
                            <span title="สมรรถนะนี้ไม่ตรงกับที่ระบุไว้ใน Step 2 ของแบบฟอร์ม" style={{ display: "inline-flex", alignItems: "center", gap: 4, width: "fit-content", padding: "1px 8px", borderRadius: 99, fontSize: 10.5, fontWeight: 700, background: "#fcf3e1", color: "#a86a14", border: "1px solid #f0dca6" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                              ไม่พบใน Step 2
                            </span>
                          )}
                        </div>
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
                            <span key={i} style={{ width: 24, height: 24, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: on ? "#137a4a" : "#f0f3f8", color: on ? "white" : "#b9c3cf", border: `1px solid ${on ? "#b5dbc5" : "#eef1f6"}` }}>
                              {levelLabels[i]}
                            </span>
                          ))}
                        </div>
                      </td>
                      {!isReadOnly && (
                        <td style={{ padding: "12px 12px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button onClick={() => openEdit(idx)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #dde3eb", background: "white", cursor: "pointer", display: "grid", placeItems: "center", color: "#677889" }}><EditIcon /></button>
                            <button onClick={() => deleteRow(idx)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #f4d0d0", background: "#fdecec", cursor: "pointer", display: "grid", placeItems: "center", color: "#b53030" }}><TrashIcon /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderBottom: "1px solid #eef1f6" }}>
                        <td colSpan={isReadOnly ? 5 : 6} style={{ padding: 0 }}>
                          <div style={{ background: "#f6f8fb", borderTop: "1px solid #eef1f6", padding: "14px 16px 16px 48px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>วิธีการ embed AI ในรายวิชา</div>
                                <div style={{ fontSize: 13, color: "#14202e", lineHeight: 1.6 }}>{row.embedMethod || <span style={{ color: "#b9c3cf" }}>—</span>}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>วิธีการใช้ AI Tool ในรายวิชา</div>
                                <div style={{ fontSize: 13, color: "#14202e", lineHeight: 1.6 }}>{row.aiUsage || <span style={{ color: "#b9c3cf" }}>—</span>}</div>
                              </div>
                              {row.notes && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>หมายเหตุ</div>
                                  <div style={{ fontSize: 13, color: "#14202e", lineHeight: 1.6 }}>{row.notes}</div>
                                </div>
                              )}
                              {row.freeZone && (
                                <div>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#6d28d9", background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 99, padding: "2px 10px" }}>
                                    AI Free Zone
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>

      {/* Sticky footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dde3eb", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
        <div style={{ fontSize: 13, color: "#677889" }}>
          <b style={{ color: "#14202e" }}>{rows.length}</b> รายวิชา · <b style={{ color: "#6a3eb5" }}>{schoolCount}</b> School · <b style={{ color: "#b6620e" }}>{industryCount}</b> Industry
        </div>
        {!isReadOnly && (
          <button className="btn btn--primary" onClick={saveMapping} disabled={saving}>
            {saving ? <SpinIcon /> : <SaveIcon />} บันทึกการแมพ
          </button>
        )}
      </div>

      {/* Slide-over panel */}
      <RowPanel open={panelOpen} row={panelRow} isNew={editIdx === null} onClose={closePanel} onSave={savePanel}
        suggestedCompetencies={(sub?.formData?.competencies ?? []) as FormCompetency[]}
        toolSuggestions={Array.from(new Set(rows.flatMap((r) => r.aiTool.split(",").map((t) => t.trim()).filter(Boolean))))} />
    </div>
  );
}

export default function Layer2MappingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}><div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div></div>}>
      <Layer2MappingInner />
    </Suspense>
  );
}
