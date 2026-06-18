"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { getDimension, getCompetency } from "@/lib/unesco";
import type { MappingRow, Layer2Row } from "@/lib/unesco";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Competency { number?: number; name?: string; years?: number[]; sector?: string; }
interface FormData {
  program?: string; faculty?: string; email?: string;
  owner?: string; position?: string;
  sectors?: string[]; framework?: string;
  competencies?: Competency[];
}
interface PrintData {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  programName: string | null;
  formData: FormData;
  layer1Mapping: MappingRow[] | Record<string, unknown>;
  layer2Mapping: Layer2Row[] | Record<string, unknown>;
  approvedAt: string | null;
  approverComment: string | null;
  version: number;
}
interface Session { role: string; code: string; name: string; }

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  essential:   { label: "Essential",   color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  specialist:  { label: "Specialist",  color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  competitive: { label: "Competitive", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  } catch { return "—"; }
}

function levelChips(r: { freeZone?: boolean; consulted?: boolean; assisted?: boolean; generated?: boolean }) {
  const levels = [
    { on: r.freeZone,  label: "FZ" },
    { on: r.consulted, label: "C" },
    { on: r.assisted,  label: "A" },
    { on: r.generated, label: "G" },
  ];
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {levels.map((l, i) => (
        <span key={i} style={{
          width: 19, height: 19, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700,
          background: l.on ? "#137a4a" : "#f0f3f8",
          color: l.on ? "white" : "#b9c3cf",
          border: `1px solid ${l.on ? "#b5dbc5" : "#eef1f6"}`,
        }}>{l.label}</span>
      ))}
    </div>
  );
}

function ToolTag({ name, type }: { name: string; type: string }) {
  const cfg = TYPE_CFG[type] ?? { color: "#677889", bg: "#f6f8fb", border: "#dde3eb" };
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, marginRight: 5, marginBottom: 5 }}>
      {name}
    </span>
  );
}

function SectionTitle({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 4 }}>
      <span style={{ width: 24, height: 24, borderRadius: 6, background: "#1a4f8a", color: "white", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, fontFamily: "var(--font-ibm-plex), monospace", flexShrink: 0 }}>{no}</span>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#14202e" }}>{children}</h2>
    </div>
  );
}

// ─── Course ↔ Competency map (static bipartite diagram for print) ─────────────
const truncTH = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function buildCourseMap(rows: MappingRow[]) {
  const PAD_TOP = 40, C_H = 42, C_GAP = 11, R_H = 46, R_GAP = 13;

  const courseOrder: string[] = [];
  const courseMeta = new Map<string, { code: string; name: string; year: string }>();
  const compOrder: string[] = [];
  const compMeta = new Map<string, { dim: string; comp: string }>();
  const edges: { ckey: string; pkey: string; color: string }[] = [];

  rows.forEach((r) => {
    const ckey = (r.courseCode || r.courseName || "").trim();
    if (!ckey || !r.competency) return;
    const pkey = `${r.dimension}||${r.competency}`;
    if (!courseMeta.has(ckey)) { courseMeta.set(ckey, { code: r.courseCode, name: r.courseName, year: r.year }); courseOrder.push(ckey); }
    if (!compMeta.has(pkey)) { compMeta.set(pkey, { dim: r.dimension, comp: r.competency }); compOrder.push(pkey); }
    const color = getDimension(r.dimension)?.color ?? "#8b99a8";
    if (!edges.some((e) => e.ckey === ckey && e.pkey === pkey)) edges.push({ ckey, pkey, color });
  });

  const coursePos = new Map<string, { y: number; cy: number }>();
  courseOrder.forEach((k, i) => { const y = PAD_TOP + i * (C_H + C_GAP); coursePos.set(k, { y, cy: y + C_H / 2 }); });
  const leftBottom = courseOrder.length ? PAD_TOP + courseOrder.length * (C_H + C_GAP) - C_GAP : PAD_TOP;

  // Position each competency near the average y of the courses it links to,
  // then push down to resolve overlaps (top-down).
  const centroid = (pkey: string, fallbackIdx: number) => {
    const ys = edges.filter((e) => e.pkey === pkey).map((e) => coursePos.get(e.ckey)!.cy);
    return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : PAD_TOP + fallbackIdx * (R_H + R_GAP) + R_H / 2;
  };
  const sorted = compOrder.map((pkey, i) => ({ pkey, c: centroid(pkey, i) })).sort((a, b) => a.c - b.c);
  const compPos = new Map<string, { y: number; cy: number }>();
  let prevBottom = PAD_TOP - R_GAP;
  sorted.forEach(({ pkey, c }) => {
    const top = Math.max(c - R_H / 2, prevBottom + R_GAP, PAD_TOP);
    compPos.set(pkey, { y: top, cy: top + R_H / 2 });
    prevBottom = top + R_H;
  });
  const rightBottom = compOrder.length ? prevBottom : PAD_TOP;

  const H = Math.max(leftBottom, rightBottom) + 22;
  return { courseOrder, courseMeta, coursePos, compOrder, compMeta, compPos, edges, H, C_H, R_H };
}

function CourseCompetencyMap({ rows }: { rows: MappingRow[] }) {
  const m = buildCourseMap(rows);
  if (m.courseOrder.length === 0 || m.compOrder.length === 0) {
    return <div style={{ fontSize: 12.5, color: "#b9c3cf", padding: "8px 0" }}>— ยังไม่มีข้อมูลเพียงพอสำหรับสร้างแผนที่ —</div>;
  }
  const W = 700, LX = 4, LW = 300, RX = 400, RW = 296;
  return (
    <svg viewBox={`0 0 ${W} ${m.H}`} style={{ width: "100%", display: "block" }} role="img">
      <text x={LX + LW / 2} y={28} textAnchor="middle" fontSize={11} fontWeight={700} fill="#8b99a8" letterSpacing="1">รายวิชา</text>
      <text x={RX + RW / 2} y={28} textAnchor="middle" fontSize={11} fontWeight={700} fill="#8b99a8" letterSpacing="1">COMPETENCY (UNESCO)</text>

      {/* edges */}
      {m.edges.map((e, i) => {
        const cp = m.coursePos.get(e.ckey)!;
        const pp = m.compPos.get(e.pkey)!;
        return <path key={i} d={`M ${LX + LW} ${cp.cy} C ${LX + LW + 44} ${cp.cy}, ${RX - 44} ${pp.cy}, ${RX} ${pp.cy}`} fill="none" stroke={e.color} strokeWidth={1.6} opacity={0.55} />;
      })}

      {/* course nodes (left) */}
      {m.courseOrder.map((k) => {
        const c = m.courseMeta.get(k)!;
        const p = m.coursePos.get(k)!;
        return (
          <g key={k}>
            <rect x={LX} y={p.y} width={LW} height={m.C_H} rx={8} fill="#f6f8fb" stroke="#dde3eb" />
            <text x={LX + 13} y={p.y + 18} fontSize={11.5} fontWeight={700} fill="#14202e">{truncTH(c.code || "—", 14)}{c.year ? ` · ปีที่ ${c.year}` : ""}</text>
            <text x={LX + 13} y={p.y + 33} fontSize={11} fill="#677889">{truncTH(c.name || "ยังไม่ระบุ", 38)}</text>
          </g>
        );
      })}

      {/* competency nodes (right) */}
      {m.compOrder.map((k) => {
        const meta = m.compMeta.get(k)!;
        const p = m.compPos.get(k)!;
        const dim = getDimension(meta.dim);
        const comp = getCompetency(meta.comp);
        const color = dim?.color ?? "#677889";
        const bg = dim?.bg ?? "#f6f8fb";
        const border = dim?.border ?? "#dde3eb";
        return (
          <g key={k}>
            <rect x={RX} y={p.y} width={RW} height={m.R_H} rx={8} fill={bg} stroke={border} />
            <text x={RX + 13} y={p.y + 19} fontSize={11.5} fontWeight={700} fill={color}>{truncTH(dim?.label ?? "—", 34)}</text>
            <text x={RX + 13} y={p.y + 34} fontSize={10.5} fill={color} opacity={0.78}>{comp ? `${comp.level === "apply" ? "Apply" : "Create"}: ${truncTH(comp.label, 30)}` : ""}</text>
          </g>
        );
      })}
    </svg>
  );
}

const TH = ({ children, w, center }: { children?: React.ReactNode; w?: number; center?: boolean }) => (
  <th style={{ padding: "7px 9px", textAlign: center ? "center" : "left", fontWeight: 700, color: "#3a4859", fontSize: 11, borderBottom: "1.5px solid #dde3eb", background: "#f6f8fb", width: w }}>{children}</th>
);
const TD = ({ children, center, top }: { children?: React.ReactNode; center?: boolean; top?: boolean }) => (
  <td style={{ padding: "7px 9px", textAlign: center ? "center" : "left", fontSize: 11.5, color: "#14202e", borderBottom: "1px solid #eef1f6", verticalAlign: top ? "top" : "middle" }}>{children}</td>
);

// ─── Inner page ───────────────────────────────────────────────────────────────
function PrintInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    if (!submissionId) { router.replace("/submit"); return; }
    let sess: Session;
    try {
      sess = JSON.parse(raw);
      if (sess.role !== "faculty" && sess.role !== "approver") { router.replace("/login"); return; }
    } catch { router.replace("/login"); return; }
    setSession(sess);

    fetch(`/api/mapping/print?id=${encodeURIComponent(submissionId)}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: PrintData) => { setData(d); })
      .catch((code) => { setError(code === 404 ? "ไม่พบหลักสูตรนี้" : "ไม่สามารถโหลดข้อมูลได้"); })
      .finally(() => setLoading(false));
  }, [router, submissionId]);

  const l1: MappingRow[] = useMemo(
    () => (Array.isArray(data?.layer1Mapping) ? (data!.layer1Mapping as MappingRow[]) : []),
    [data]
  );
  const l2: Layer2Row[] = useMemo(
    () => (Array.isArray(data?.layer2Mapping) ? (data!.layer2Mapping as Layer2Row[]) : []),
    [data]
  );

  // Aggregate unique AI tools across L1 + L2, grouped by toolType.
  const toolGroups = useMemo(() => {
    const seen = new Map<string, string>(); // toolName(lower) → toolType
    const display = new Map<string, string>(); // toolName(lower) → original
    const collect = (rows: { aiTool?: string; toolType?: string }[]) => {
      rows.forEach((r) => {
        if (!r.aiTool) return;
        r.aiTool.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => {
          const key = t.toLowerCase();
          if (!seen.has(key)) { seen.set(key, r.toolType || ""); display.set(key, t); }
          else if (!seen.get(key) && r.toolType) { seen.set(key, r.toolType); }
        });
      });
    };
    collect(l1); collect(l2);
    const groups: Record<string, string[]> = { essential: [], specialist: [], competitive: [], "": [] };
    seen.forEach((type, key) => { (groups[type] ?? groups[""]).push(display.get(key)!); });
    Object.values(groups).forEach((arr) => arr.sort((a, b) => a.localeCompare(b)));
    return groups;
  }, [l1, l2]);

  const totalTools = useMemo(
    () => Object.values(toolGroups).reduce((n, arr) => n + arr.length, 0),
    [toolGroups]
  );

  // Auto-open the print dialog once data has painted.
  useEffect(() => {
    if (!loading && data && !error) {
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
  }, [loading, data, error]);

  if (loading || !session) return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
      <div style={{ color: "#677889", fontSize: 14 }}>กำลังเตรียมเอกสาร…</div>
    </div>
  );
  if (error || !data) return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#b53030", fontSize: 14, marginBottom: 12 }}>{error ?? "ไม่พบข้อมูล"}</div>
        <button className="btn btn--primary" onClick={() => router.back()}>ย้อนกลับ</button>
      </div>
    </div>
  );

  const fd = data.formData ?? {};
  const program = data.programName || fd.program || "—";
  // Sort competencies by year (earliest year first); ties keep original order.
  const minYear = (c: Competency) =>
    Array.isArray(c.years) && c.years.length > 0 ? Math.min(...c.years) : 99;
  const comps = (Array.isArray(fd.competencies) ? fd.competencies : [])
    .map((c, i) => ({ c, i }))
    .sort((a, b) => minYear(a.c) - minYear(b.c) || a.i - b.i)
    .map((x) => x.c);
  const sectors = Array.isArray(fd.sectors) ? fd.sectors : [];

  return (
    <div className="print-root">
      <style>{`
        .print-root { background: #e7ebf2; min-height: 100vh; padding: 24px 16px 64px; }
        .print-toolbar {
          max-width: 800px; margin: 0 auto 16px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        .print-sheet {
          max-width: 800px; margin: 0 auto; background: white; color: #14202e;
          padding: 40px 44px; border-radius: 4px; box-shadow: 0 4px 24px rgba(20,32,46,0.12);
        }
        .print-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px 28px;
        }
        .print-meta-grid .lbl { font-size: 10.5px; color: #8b99a8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
        .print-meta-grid .val { font-size: 13px; color: #14202e; font-weight: 600; }
        .print-section { margin-top: 26px; }
        .print-table { width: 100%; border-collapse: collapse; }
        @media print {
          .print-root { background: white; padding: 0; }
          .print-toolbar { display: none !important; }
          .print-sheet { max-width: none; margin: 0; padding: 0; box-shadow: none; border-radius: 0; }
          /* Sections may span pages — only keep individual rows/cards intact.
             (break-inside:avoid on a section taller than one page makes some
             print engines push it to a new page and clip it, hiding content.) */
          .print-table tr { break-inside: avoid; }
          .print-comp-card { break-inside: avoid; }
          .print-section > svg { break-inside: avoid; }
          h2 { break-after: avoid; }
        }
        @page { size: A4; margin: 14mm 12mm; }
      `}</style>

      {/* Floating toolbar — hidden when printing */}
      <div className="print-toolbar">
        <button
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#3a4859", background: "white", border: "1px solid #dde3eb", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          ย้อนกลับ
        </button>
        <button
          onClick={() => window.print()}
          className="btn btn--primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          พิมพ์ / ดาวน์โหลด PDF
        </button>
      </div>

      {/* The printable sheet */}
      <div className="print-sheet">

        {/* ── Document header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 18, borderBottom: "2px solid #1a4f8a" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1a4f8a", color: "white", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>BU</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#677889", fontWeight: 600, letterSpacing: "0.03em" }}>มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
            <h1 style={{ margin: "3px 0 0", fontSize: 19, fontWeight: 800, color: "#14202e", lineHeight: 1.3 }}>รายงานการแมพหลักสูตรสู่ความพร้อมด้าน AI</h1>
            <div style={{ fontSize: 12.5, color: "#677889", marginTop: 2 }}>AI-Ready Curriculum Mapping Report</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {data.submissionStatus === "approved" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: "#e6f4ec", color: "#137a4a", border: "1px solid #b5dbc5" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                อนุมัติแล้ว
              </span>
            )}
            <div style={{ fontSize: 11, color: "#8b99a8", marginTop: 6 }}>เลขอ้างอิง</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a4f8a", fontFamily: "var(--font-ibm-plex), monospace" }}>{data.refId ?? "—"}</div>
          </div>
        </div>

        {/* Program title block */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, color: "#8b99a8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>ชื่อหลักสูตร</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#14202e", lineHeight: 1.35, marginTop: 2 }}>{program}</div>
          <div style={{ fontSize: 13.5, color: "#1a4f8a", fontWeight: 600, marginTop: 3 }}>{data.facultyName}</div>
        </div>

        {/* ── Section 1: Program info ── */}
        <div className="print-section">
          <SectionTitle no={1}>ข้อมูลหลักสูตร</SectionTitle>
          <div className="print-meta-grid">
            <div><div className="lbl">ผู้รับผิดชอบหลักสูตร</div><div className="val">{fd.owner || "—"}</div></div>
            <div><div className="lbl">ตำแหน่ง</div><div className="val">{fd.position || "—"}</div></div>
            <div><div className="lbl">อีเมลติดต่อ</div><div className="val">{fd.email || "—"}</div></div>
            <div><div className="lbl">กรอบมาตรฐานอ้างอิง</div><div className="val">{fd.framework || "UNESCO AI Competency Framework"}</div></div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="lbl">กลุ่มอุตสาหกรรม / ภาคส่วนที่เกี่ยวข้อง</div>
              <div style={{ marginTop: 3 }}>
                {sectors.length > 0 ? sectors.map((s, i) => (
                  <span key={i} style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: "#eef4fb", color: "#1a4f8a", border: "1px solid #dbe7f4", marginRight: 6, marginBottom: 4 }}>{s}</span>
                )) : <span className="val">—</span>}
              </div>
            </div>
            {data.approvedAt && (
              <div><div className="lbl">วันที่อนุมัติ</div><div className="val">{fmtDate(data.approvedAt)}</div></div>
            )}
          </div>
          {data.approverComment && (
            <div style={{ marginTop: 12, background: "#e6f4ec", border: "1px solid #b5dbc5", borderRadius: 8, padding: "10px 13px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#137a4a", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>ความเห็นคณะกรรมการ</div>
              <div style={{ fontSize: 12.5, color: "#14202e", lineHeight: 1.55 }}>{data.approverComment}</div>
            </div>
          )}
        </div>

        {/* ── Section 2: Competencies ── */}
        <div className="print-section">
          <SectionTitle no={2}>สมรรถนะหลักของหลักสูตร <span style={{ fontWeight: 600, color: "#677889", fontSize: 13 }}>({comps.length} สมรรถนะ)</span></SectionTitle>
          {comps.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#b9c3cf", padding: "8px 0" }}>— ยังไม่ได้ระบุสมรรถนะ —</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {comps.map((c, i) => (
                <div key={i} className="print-comp-card" style={{ display: "flex", gap: 11, padding: "10px 13px", background: "#f6f8fb", border: "1px solid #eef1f6", borderRadius: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#1a4f8a", color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-ibm-plex), monospace" }}>{c.number ?? i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#14202e", lineHeight: 1.4 }}>{c.name || "—"}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                      {Array.isArray(c.years) && c.years.length > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#a86a14", background: "#fcf3e1", border: "1px solid #f0dca6", borderRadius: 99, padding: "1px 9px" }}>
                          ปีที่ {c.years.join(", ")}
                        </span>
                      )}
                      {c.sector && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.sector === "industry" ? "#6d28d9" : "#1a4f8a", background: c.sector === "industry" ? "#f5f3ff" : "#eef4fb", border: `1px solid ${c.sector === "industry" ? "#ddd6fe" : "#dbe7f4"}`, borderRadius: 99, padding: "1px 9px" }}>
                          {c.sector === "industry" ? "Industry" : "School"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: Course ↔ Competency map ── */}
        <div className="print-section">
          <SectionTitle no={3}>แผนที่เชื่อมโยงรายวิชา ↔ Competency</SectionTitle>
          <div style={{ fontSize: 11.5, color: "#677889", marginTop: -6, marginBottom: 12, lineHeight: 1.5 }}>
            เส้นเชื่อมแสดงว่าแต่ละรายวิชาพัฒนา competency ตามกรอบ UNESCO ด้านใด (สีของเส้นตามมิติ)
          </div>
          <CourseCompetencyMap rows={l1} />
        </div>

        {/* ── Section 4: Layer 1 — UNESCO mapping ── */}
        <div className="print-section">
          <SectionTitle no={4}>Layer 1 · การแมพสู่มาตรฐาน UNESCO <span style={{ fontWeight: 600, color: "#677889", fontSize: 13 }}>({l1.length} รายวิชา)</span></SectionTitle>
          {l1.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#b9c3cf", padding: "8px 0" }}>— ยังไม่ได้แมพ Layer 1 —</div>
          ) : (
            <table className="print-table">
              <thead>
                <tr>
                  <TH w={26} center>#</TH>
                  <TH>รายวิชา</TH>
                  <TH>UNESCO Dimension</TH>
                  <TH>AI Tool</TH>
                  <TH w={92} center>Integration</TH>
                </tr>
              </thead>
              <tbody>
                {l1.map((r, i) => {
                  const dim = getDimension(r.dimension);
                  const comp = getCompetency(r.competency);
                  return (
                    <tr key={r.id ?? i}>
                      <TD center top><span style={{ color: "#8b99a8", fontWeight: 700, fontFamily: "var(--font-ibm-plex), monospace", fontSize: 10.5 }}>{String(i + 1).padStart(2, "0")}</span></TD>
                      <TD top>
                        <div style={{ fontWeight: 600 }}>{r.courseName || <span style={{ color: "#b9c3cf" }}>ยังไม่ระบุ</span>}</div>
                        {r.courseCode && <div style={{ fontSize: 10.5, color: "#677889", marginTop: 1 }}>{r.courseCode}{r.year ? ` · ปีที่ ${r.year}` : ""}</div>}
                        {r.embedMethod && <div style={{ fontSize: 10.5, color: "#8b99a8", marginTop: 2, lineHeight: 1.4 }}>{r.embedMethod}</div>}
                      </TD>
                      <TD top>
                        {dim ? (
                          <>
                            <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 99, fontSize: 10.5, fontWeight: 700, background: dim.bg, color: dim.color, border: `1px solid ${dim.border}` }}>{dim.label}</span>
                            {comp && <div style={{ fontSize: 10.5, color: "#677889", marginTop: 2 }}>{comp.level === "apply" ? "Apply" : "Create"}: {comp.label}</div>}
                          </>
                        ) : <span style={{ color: "#b9c3cf" }}>—</span>}
                      </TD>
                      <TD top>
                        {r.aiTool ? (
                          <>
                            <div style={{ fontWeight: 500 }}>{r.aiTool}</div>
                            {r.toolType && <span style={{ display: "inline-block", marginTop: 2, padding: "0 7px", borderRadius: 99, fontSize: 9.5, fontWeight: 700, background: TYPE_CFG[r.toolType]?.bg, color: TYPE_CFG[r.toolType]?.color, border: `1px solid ${TYPE_CFG[r.toolType]?.border}` }}>{TYPE_CFG[r.toolType]?.label}</span>}
                            {r.aiUsage && <div style={{ fontSize: 10.5, color: "#8b99a8", marginTop: 2, lineHeight: 1.4 }}>{r.aiUsage}</div>}
                          </>
                        ) : <span style={{ color: "#b9c3cf" }}>—</span>}
                      </TD>
                      <TD center top>{levelChips(r)}</TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Section 5: Layer 2 — School & Industry ── */}
        <div className="print-section">
          <SectionTitle no={5}>Layer 2 · School &amp; Industry Mapping <span style={{ fontWeight: 600, color: "#677889", fontSize: 13 }}>({l2.length} รายวิชา)</span></SectionTitle>
          {l2.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#b9c3cf", padding: "8px 0" }}>— ยังไม่ได้แมพ Layer 2 —</div>
          ) : (
            <table className="print-table">
              <thead>
                <tr>
                  <TH w={26} center>#</TH>
                  <TH>สมรรถนะ / รายวิชา</TH>
                  <TH w={74} center>ภาคส่วน</TH>
                  <TH>AI Tool</TH>
                  <TH w={92} center>Integration</TH>
                </tr>
              </thead>
              <tbody>
                {l2.map((r, i) => (
                  <tr key={r.id ?? i}>
                    <TD center top><span style={{ color: "#8b99a8", fontWeight: 700, fontFamily: "var(--font-ibm-plex), monospace", fontSize: 10.5 }}>{String(i + 1).padStart(2, "0")}</span></TD>
                    <TD top>
                      <div style={{ fontWeight: 600 }}>{r.competency || <span style={{ color: "#b9c3cf" }}>—</span>}</div>
                      {(r.courseName || r.courseCode) && <div style={{ fontSize: 10.5, color: "#677889", marginTop: 1 }}>{r.courseCode}{r.courseCode && r.courseName ? " · " : ""}{r.courseName}{r.year ? ` · ปีที่ ${r.year}` : ""}</div>}
                      {r.embedMethod && <div style={{ fontSize: 10.5, color: "#8b99a8", marginTop: 2, lineHeight: 1.4 }}>{r.embedMethod}</div>}
                    </TD>
                    <TD center top>
                      {r.sector ? (
                        <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: r.sector === "industry" ? "#f5f3ff" : "#eef4fb", color: r.sector === "industry" ? "#6d28d9" : "#1a4f8a", border: `1px solid ${r.sector === "industry" ? "#ddd6fe" : "#dbe7f4"}` }}>{r.sector === "industry" ? "Industry" : "School"}</span>
                      ) : <span style={{ color: "#b9c3cf" }}>—</span>}
                    </TD>
                    <TD top>
                      {r.aiTool ? (
                        <>
                          <div style={{ fontWeight: 500 }}>{r.aiTool}</div>
                          {r.toolType && <span style={{ display: "inline-block", marginTop: 2, padding: "0 7px", borderRadius: 99, fontSize: 9.5, fontWeight: 700, background: TYPE_CFG[r.toolType]?.bg, color: TYPE_CFG[r.toolType]?.color, border: `1px solid ${TYPE_CFG[r.toolType]?.border}` }}>{TYPE_CFG[r.toolType]?.label}</span>}
                          {r.aiUsage && <div style={{ fontSize: 10.5, color: "#8b99a8", marginTop: 2, lineHeight: 1.4 }}>{r.aiUsage}</div>}
                        </>
                      ) : <span style={{ color: "#b9c3cf" }}>—</span>}
                    </TD>
                    <TD center top>{levelChips(r)}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Section 5: Recommended AI tools ── */}
        <div className="print-section">
          <SectionTitle no={6}>AI Tools ที่ใช้ในหลักสูตร <span style={{ fontWeight: 600, color: "#677889", fontSize: 13 }}>({totalTools} เครื่องมือ)</span></SectionTitle>
          {totalTools === 0 ? (
            <div style={{ fontSize: 12.5, color: "#b9c3cf", padding: "8px 0" }}>— ยังไม่ได้ระบุ AI Tool —</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(["essential", "specialist", "competitive"] as const).map((type) => {
                const tools = toolGroups[type];
                if (!tools || tools.length === 0) return null;
                const cfg = TYPE_CFG[type];
                return (
                  <div key={type} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <div style={{ width: 96, flexShrink: 0 }}>
                      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                    </div>
                    <div style={{ flex: 1 }}>{tools.map((t, i) => <ToolTag key={i} name={t} type={type} />)}</div>
                  </div>
                );
              })}
              {toolGroups[""] && toolGroups[""].length > 0 && (
                <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#f6f8fb", color: "#677889", border: "1px solid #dde3eb" }}>อื่น ๆ</span>
                  </div>
                  <div style={{ flex: 1 }}>{toolGroups[""].map((t, i) => <ToolTag key={i} name={t} type="" />)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 30, paddingTop: 14, borderTop: "1px solid #eef1f6", display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#8b99a8" }}>
          <span>ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ</span>
          <span>พิมพ์เมื่อ {fmtDate(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f0f3f8", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังเตรียมเอกสาร…</div>
      </div>
    }>
      <PrintInner />
    </Suspense>
  );
}
