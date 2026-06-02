"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import type { MappingRow, Layer2Row } from "@/lib/unesco";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VizData {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  programName: string;
  layer1Mapping: MappingRow[];
  layer2Mapping: Layer2Row[];
}

// Row shapes for the graph (unified)
interface GRow {
  id: string | number;
  code: string;
  course: string;
  competency: string;
  dimension?: string;   // L1
  sector?: string;      // L2
  year: string;
  aiTool: string;
  levels: { free: boolean; consulted: boolean; assisted: boolean; generated: boolean };
  embed: string;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
const DIM_META: Record<string, { name: string; color: string; bg: string; border: string }> = {
  human:      { name: "Human-centred Mindset",        color: "#1a4f8a", bg: "#eef4fb", border: "#b3d4f5" },
  ethics:     { name: "Ethics of AI",                 color: "#137a4a", bg: "#e6f4ec", border: "#94d4b5" },
  techniques: { name: "AI Techniques & Applications", color: "#b6620e", bg: "#fef3e2", border: "#f5c594" },
  design:     { name: "AI System Design",             color: "#6a3eb5", bg: "#f3ecfb", border: "#c9b0f0" },
};
const DIM_ORDER = ["human", "ethics", "techniques", "design"];

const SECTOR_META: Record<string, { name: string; color: string; bg: string; border: string }> = {
  school:   { name: "School",   color: "#6a3eb5", bg: "#f3ecfb", border: "#c9b0f0" },
  industry: { name: "Industry", color: "#b6620e", bg: "#fef3e2", border: "#f5c594" },
};

const YEAR_COL: Record<string, string> = { "1": "#677889", "2": "#1a4f8a", "3": "#b6620e", "4": "#6a3eb5" };

function peakLevel(lvl: GRow["levels"]) {
  if (lvl?.generated) return { label: "Generated", color: "#6a3eb5" };
  if (lvl?.assisted)  return { label: "Assisted",  color: "#b6620e" };
  if (lvl?.consulted) return { label: "Consulted", color: "#1a4f8a" };
  return { label: "Awareness", color: "#8b97a8" };
}
function trunc(s: string, n: number) { return s && s.length > n ? s.slice(0, n) + "…" : (s || ""); }

// ─── Convert MappingRow → GRow ────────────────────────────────────────────────
function toGRowsL1(rows: MappingRow[]): GRow[] {
  return rows.filter((r) => r.courseCode).map((r) => ({
    id: r.id, code: r.courseCode, course: r.courseName,
    competency: r.competency, dimension: r.dimension,
    year: r.year, aiTool: r.aiTool, embed: r.embedMethod,
    levels: { free: r.freeZone, consulted: r.consulted, assisted: r.assisted, generated: r.generated },
  }));
}
function toGRowsL2(rows: Layer2Row[]): GRow[] {
  return rows.filter((r) => r.courseCode || r.competency).map((r) => ({
    id: r.id, code: r.courseCode, course: r.courseName,
    competency: r.competency, sector: r.sector,
    year: r.year, aiTool: r.aiTool, embed: r.embedMethod,
    levels: { free: r.freeZone, consulted: r.consulted, assisted: r.assisted, generated: r.generated },
  }));
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const LO = { C_W: 228, C_H: 58, C_GAP: 10, COMP_W: 252, COMP_H: 58, COMP_GAP: 10, GRP_HDR_H: 28, GRP_GAP: 20, LEFT_X: 8, RIGHT_X: 860, PAD_Y: 20, SVG_W: 1120 };

function computeLayout(rows: GRow[], tab: "l1" | "l2") {
  const seenC = new Set<string>();
  const courses: GRow[] = [];
  rows.filter((r) => r.code).forEach((r) => { if (!seenC.has(r.code)) { seenC.add(r.code); courses.push(r); } });
  courses.sort((a, b) => String(a.year).localeCompare(String(b.year)));

  const gOrder = tab === "l1" ? DIM_ORDER : ["school", "industry"];
  const gMap = new Map<string, Map<string, { compKey: string; grpKey: string; firstRow: GRow; sourceRows: GRow[] }>>();
  rows.forEach((r) => {
    const gk = (tab === "l1" ? r.dimension : r.sector) ?? "";
    const ck = `${gk}||${(r.competency || "").trim()}`;
    if (!r.competency || !gk) return;
    if (!gMap.has(gk)) gMap.set(gk, new Map());
    const gInner = gMap.get(gk)!;
    if (!gInner.has(ck)) gInner.set(ck, { compKey: ck, grpKey: gk, firstRow: r, sourceRows: [] });
    gInner.get(ck)!.sourceRows.push(r);
  });
  const groups = gOrder.filter((k) => gMap.has(k)).map((k) => ({ key: k, comps: Array.from(gMap.get(k)!.values()) }));

  const compPos: Record<string, { y: number; cy: number }> = {};
  const grpPos: { key: string; y: number; h: number }[] = [];
  let cur = LO.PAD_Y;
  groups.forEach((g) => {
    grpPos.push({ key: g.key, y: cur, h: LO.GRP_HDR_H });
    cur += LO.GRP_HDR_H + 6;
    g.comps.forEach((c, i) => {
      compPos[c.compKey] = { y: cur, cy: cur + LO.COMP_H / 2 };
      cur += LO.COMP_H + (i < g.comps.length - 1 ? LO.COMP_GAP : 0);
    });
    cur += LO.GRP_GAP;
  });
  const rightH = cur;
  const leftH = courses.length * (LO.C_H + LO.C_GAP) - LO.C_GAP;
  const svgH = Math.max(rightH, leftH) + LO.PAD_Y * 2;
  const leftOff = (svgH - leftH) / 2;
  const rightOff = (svgH - rightH) / 2;
  const coursePos: Record<string, { y: number; cy: number }> = {};
  courses.forEach((c, i) => {
    const y = leftOff + i * (LO.C_H + LO.C_GAP);
    coursePos[c.code] = { y, cy: y + LO.C_H / 2 };
  });
  Object.values(compPos).forEach((p) => { p.y += rightOff; p.cy += rightOff; });
  const grpPosAdj = grpPos.map((g) => ({ ...g, y: g.y + rightOff }));

  const edgeGroups: Record<string, GRow[]> = {};
  rows.forEach((r) => {
    const gk = (tab === "l1" ? r.dimension : r.sector) ?? "";
    const ck = `${gk}||${(r.competency || "").trim()}`;
    if (!edgeGroups[ck]) edgeGroups[ck] = [];
    edgeGroups[ck].push(r);
  });

  const edges: { id: string | number; code: string; compKey: string; row: GRow; fromCY: number; toCY: number; toPortY: number; color: string; n: number }[] = [];
  rows.forEach((r) => {
    const cp = coursePos[r.code];
    const gk = (tab === "l1" ? r.dimension : r.sector) ?? "";
    const ck = `${gk}||${(r.competency || "").trim()}`;
    const rp = compPos[ck];
    if (!cp || !rp || !r.competency || !gk) return;
    const meta = tab === "l1" ? DIM_META[r.dimension ?? ""] : SECTOR_META[r.sector ?? ""];
    const siblings = edgeGroups[ck];
    const n = siblings.length;
    const idx = siblings.indexOf(r);
    const spread = Math.min(13, (LO.COMP_H - 24) / Math.max(1, n - 1));
    const toPortY = n === 1 ? rp.cy : rp.cy + (idx - (n - 1) / 2) * spread;
    edges.push({ id: r.id, code: r.code, compKey: ck, row: r, fromCY: cp.cy, toCY: rp.cy, toPortY, color: meta?.color || "#1a4f8a", n });
  });

  return { courses, groups, grpPos: grpPosAdj, compPos, coursePos, edges, svgH };
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function VizTip({ data, tab, x, y }: { data: GRow | GRow[] | null; tab: "l1" | "l2"; x: number; y: number }) {
  if (!data) return null;
  const rows = Array.isArray(data) ? data : [data];
  const r0 = rows[0];
  const meta = tab === "l1" ? DIM_META[r0.dimension ?? ""] : SECTOR_META[r0.sector ?? ""];
  const isComp = rows.length > 1;
  return (
    <div className="cviz-tip" style={{ left: x, top: y }}>
      {isComp ? (
        <>
          <div className="cviz-tip__comp-hd" style={{ color: meta?.color }}>{r0.competency}</div>
          <div className="cviz-tip__multi-lbl">{rows.length} รายวิชาเชื่อมโยงมา</div>
          <div className="cviz-tip__multi-list">
            {rows.map((r, i) => {
              const lvl = peakLevel(r.levels);
              return (
                <div key={i} className="cviz-tip__multi-row">
                  <span className="cviz-tip__code" style={{ color: YEAR_COL[r.year] || "#677889" }}>{r.code}</span>
                  <span className="cviz-tip__mname">{trunc(r.course, 18)}</span>
                  <span className="cviz-tip__mlvl" style={{ color: lvl.color }}>· {lvl.label}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="cviz-tip__head">
            <span className="cviz-tip__code" style={{ color: meta?.color }}>{r0.code}</span>
            <span className="cviz-tip__yr">ปี {r0.year}</span>
          </div>
          <div className="cviz-tip__name">{r0.course}</div>
          <div className="cviz-tip__comp" style={{ borderLeftColor: meta?.color }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: meta?.color, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
              {tab === "l1" ? meta?.name : r0.sector}
            </div>
            {r0.competency}
          </div>
          {r0.aiTool && <div className="cviz-tip__row"><span>AI Tools</span><b>{r0.aiTool}</b></div>}
          {r0.embed  && <div className="cviz-tip__row"><span>Embed</span><b>{r0.embed}</b></div>}
          <div className="cviz-tip__row">
            <span>AI Depth</span>
            <b style={{ color: peakLevel(r0.levels).color }}>{peakLevel(r0.levels).label}</b>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Bipartite Graph ──────────────────────────────────────────────────────────
function BipartiteGraph({ rows, tab }: { rows: GRow[]; tab: "l1" | "l2" }) {
  const [hov, setHov] = useState<{ type: string; id: string | number; data: GRow | GRow[]; x: number; y: number } | null>(null);
  const L = useMemo(() => computeLayout(rows, tab), [rows, tab]);
  const MX1 = LO.LEFT_X + LO.C_W + 80;
  const MX2 = LO.RIGHT_X - 80;
  const FTH = "'Sarabun','Noto Sans Thai',sans-serif";
  const FEN = "'IBM Plex Sans',sans-serif";
  const isActive = (e: typeof L.edges[0]) => hov && ((hov.type === "course" && hov.id === e.code) || (hov.type === "comp" && hov.id === e.compKey) || (hov.type === "edge" && hov.id === e.id));

  if (rows.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", color: "#677889", fontSize: 14 }}>
        ยังไม่มีข้อมูล Mapping — กรอกข้อมูลใน{tab === "l1" ? "Layer 1" : "Layer 2"} ก่อน
      </div>
    );
  }

  return (
    <div className="cviz-graph-wrap" onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${LO.SVG_W} ${L.svgH}`} style={{ width: "100%", display: "block" }}>
        {/* Edges */}
        {L.edges.map((e) => {
          const active = isActive(e);
          const faded = hov && !active;
          return (
            <path key={"e" + e.id}
              d={`M${LO.LEFT_X + LO.C_W},${e.fromCY} C${MX1},${e.fromCY} ${MX2},${e.toPortY} ${LO.RIGHT_X},${e.toPortY}`}
              fill="none" stroke={e.color}
              strokeWidth={active ? 3.8 : 1.8}
              strokeOpacity={faded ? 0.06 : active ? 0.92 : 0.28}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 0.16s, stroke-width 0.16s", cursor: "pointer" }}
              onMouseEnter={(evt) => setHov({ type: "edge", id: e.id, data: e.row, x: evt.clientX + 18, y: evt.clientY - 60 })}
            />
          );
        })}

        {/* Course nodes (left) */}
        {L.courses.map((c) => {
          const pos = L.coursePos[c.code];
          if (!pos) return null;
          const lit = hov && ((hov.type === "course" && hov.id === c.code) || (hov.type === "edge" && (hov.data as GRow)?.code === c.code));
          const yc = YEAR_COL[String(c.year)] || "#677889";
          return (
            <g key={"c" + c.code} style={{ cursor: "pointer" }}
              onMouseEnter={(evt) => setHov({ type: "course", id: c.code, data: c, x: evt.clientX + 18, y: evt.clientY - 60 })}>
              <rect x={LO.LEFT_X} y={pos.y} width={LO.C_W} height={LO.C_H} rx="10" fill="white" stroke={lit ? yc : "#dde3eb"} strokeWidth={lit ? 2 : 1} />
              <rect x={LO.LEFT_X} y={pos.y + 6} width={4} height={LO.C_H - 12} rx="2" fill={yc} />
              <text x={LO.LEFT_X + 17} y={pos.y + 22} fontSize="11" fontWeight="700" fill={yc} fontFamily={FEN}>{c.code}</text>
              <text x={LO.LEFT_X + 17} y={pos.y + 37} fontSize="11.5" fill="#2c3e50" fontFamily={FTH}>{trunc(c.course, 17)}</text>
              <text x={LO.LEFT_X + 17} y={pos.y + 51} fontSize="10" fill="#a0aab4" fontFamily={FEN}>Year {c.year}</text>
            </g>
          );
        })}

        {/* Competency groups + nodes (right) */}
        {L.grpPos.map((g) => {
          const meta = tab === "l1" ? DIM_META[g.key] : SECTOR_META[g.key];
          const grp = L.groups.find((x) => x.key === g.key);
          if (!grp) return null;
          return (
            <g key={"grp" + g.key}>
              <rect x={LO.RIGHT_X} y={g.y} width={LO.COMP_W} height={g.h} rx="7" fill={meta?.bg || "#f5f7fa"} stroke={meta?.border || "#dde3eb"} strokeWidth="1" />
              <rect x={LO.RIGHT_X} y={g.y} width={4} height={g.h} rx="2" fill={meta?.color || "#1a4f8a"} />
              <text x={LO.RIGHT_X + 14} y={g.y + 18} fontSize="10.5" fontWeight="700" fill={meta?.color || "#1a4f8a"} fontFamily={FEN}>{meta?.name || g.key}</text>
              {grp.comps.map((comp) => {
                const rp = L.compPos[comp.compKey];
                if (!rp) return null;
                const lit = hov && ((hov.type === "comp" && hov.id === comp.compKey) || (hov.type === "edge" && (hov.data as GRow)?.competency === comp.firstRow.competency));
                const lvl = peakLevel(comp.firstRow.levels);
                const multi = comp.sourceRows.length > 1;
                return (
                  <g key={"ck" + comp.compKey} style={{ cursor: "pointer" }}
                    onMouseEnter={(evt) => setHov({ type: "comp", id: comp.compKey, data: comp.sourceRows, x: evt.clientX - LO.COMP_W - 30, y: evt.clientY - 60 })}>
                    <rect x={LO.RIGHT_X} y={rp.y} width={LO.COMP_W} height={LO.COMP_H} rx="10" fill="white" stroke={lit ? meta?.color : "#dde3eb"} strokeWidth={lit ? 2 : 1} />
                    <rect x={LO.RIGHT_X + LO.COMP_W - 4} y={rp.y + 6} width={4} height={LO.COMP_H - 12} rx="2" fill={meta?.color || "#1a4f8a"} />
                    <text x={LO.RIGHT_X + 13} y={rp.y + 22} fontSize="11" fontWeight="600" fill={meta?.color || "#1a4f8a"} fontFamily={FTH}>{trunc(comp.firstRow.competency, 24)}</text>
                    <rect x={LO.RIGHT_X + 13} y={rp.y + 32} width={68} height={16} rx="5" fill={lvl.color + "22"} />
                    <text x={LO.RIGHT_X + 20} y={rp.y + 43} fontSize="9.5" fontWeight="700" fill={lvl.color} fontFamily={FEN}>{lvl.label}</text>
                    {multi && (
                      <>
                        <rect x={LO.RIGHT_X + 88} y={rp.y + 32} width={54} height={16} rx="5" fill={(meta?.color || "#1a4f8a") + "22"} />
                        <text x={LO.RIGHT_X + 95} y={rp.y + 43} fontSize="9.5" fontWeight="700" fill={meta?.color || "#1a4f8a"} fontFamily={FEN}>{comp.sourceRows.length} วิชา</text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      {hov && <VizTip data={hov.data as GRow | GRow[]} tab={tab} x={hov.x} y={hov.y} />}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function VizLegend({ tab }: { tab: "l1" | "l2" }) {
  const dimItems = tab === "l1"
    ? DIM_ORDER.map((k) => ({ label: DIM_META[k].name, color: DIM_META[k].color }))
    : Object.entries(SECTOR_META).map(([, v]) => ({ label: v.name, color: v.color }));
  return (
    <div className="cviz-legend">
      <div className="cviz-legend__grp">
        <span className="cviz-legend__hd">{tab === "l1" ? "UNESCO Dimension" : "Sector"}</span>
        {dimItems.map((i) => (
          <span key={i.label} className="cviz-legend__item">
            <span className="cviz-legend__sw" style={{ background: i.color }} />{i.label}
          </span>
        ))}
      </div>
      <div className="cviz-legend__sep" />
      <div className="cviz-legend__grp">
        <span className="cviz-legend__hd">AI Depth</span>
        {[{ label: "Awareness", color: "#8b97a8" }, { label: "Consulted", color: "#1a4f8a" }, { label: "Assisted", color: "#b6620e" }, { label: "Generated", color: "#6a3eb5" }].map((l) => (
          <span key={l.label} className="cviz-legend__item">
            <span className="cviz-legend__pill" style={{ background: l.color }} />{l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ rows, tab }: { rows: GRow[]; tab: "l1" | "l2" }) {
  const s = useMemo(() => {
    const courses = new Set(rows.map((r) => r.code)).size;
    const comps = new Set(rows.map((r) => (tab === "l1" ? r.dimension : r.sector) + "||" + r.competency)).size;
    const generated = rows.filter((r) => r.levels?.generated).length;
    const tools = new Set(rows.flatMap((r) => r.aiTool ? r.aiTool.split(/[,;]/).map((t) => t.trim()) : []).filter(Boolean)).size;
    const dims = tab === "l1" ? new Set(rows.map((r) => r.dimension).filter(Boolean)).size : null;
    return { courses, comps, generated, tools, dims };
  }, [rows, tab]);
  const items = [
    { n: s.courses, l: "รายวิชา", color: "#1a4f8a" },
    { n: s.comps, l: "สมรรถนะ", color: "#1a4f8a" },
    ...(s.dims !== null ? [{ n: `${s.dims}/4`, l: "มิติ UNESCO", color: s.dims === 4 ? "#137a4a" : "#b6620e" }] : []),
    { n: s.generated, l: "Generated", color: "#6a3eb5" },
    { n: s.tools, l: "AI Tools", color: "#b6620e" },
  ];
  return (
    <div className="cviz-stats">
      {items.map((it, i) => (
        <div key={i} className="cviz-stat">
          <span className="cviz-stat__n" style={{ color: it.color }}>{it.n}</span>
          <span className="cviz-stat__l">{it.l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Tools summary ────────────────────────────────────────────────────────────
function ToolsSummary({ rows }: { rows: GRow[] }) {
  const tools = useMemo(() => {
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.aiTool) return;
      r.aiTool.split(/[,;]/).map((t) => t.trim()).filter((t) => t.length > 1).forEach((t) => { map[t] = (map[t] || 0) + 1; });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [rows]);
  if (tools.length === 0) return null;
  return (
    <div className="cviz-tools-card">
      <div className="cviz-tools-card__head">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
        AI Tools ที่ใช้ในหลักสูตรนี้
      </div>
      <div className="cviz-tools-card__list">
        {tools.map(([t, n]) => (
          <span key={t} className="cviz-tool-chip">{t}{n > 1 && <b>{n}</b>}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Inner page (uses useSearchParams) ────────────────────────────────────────
function VizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [session, setSession] = useState<{ role: string; name: string } | null>(null);
  const [data, setData] = useState<VizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"l1" | "l2">("l1");

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "faculty" && sess.role !== "approver") { router.replace("/login"); return; }
      setSession(sess);
    } catch { router.replace("/login"); return; }

    if (!submissionId) { router.replace("/submit"); return; }

    fetch(`/api/mapping/viz?id=${encodeURIComponent(submissionId)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: VizData) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, submissionId]);

  const l1Rows = useMemo(() => data ? toGRowsL1(data.layer1Mapping) : [], [data]);
  const l2Rows = useMemo(() => data ? toGRowsL2(data.layer2Mapping) : [], [data]);
  const rows = tab === "l1" ? l1Rows : l2Rows;

  const isApprover = session?.role === "approver";
  const backHref = isApprover
    ? "/approver/mapping"
    : `/mapping/layer${tab === "l1" ? "1" : "2"}?id=${submissionId}`;

  if (loading || !session) return (
    <div style={{ minHeight: "100vh", background: "#f3f5f8", display: "grid", placeItems: "center" }}>
      <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f5f8" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready
            <span className="topbar__role-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              Curriculum Map
            </span>
          </div>
          <div className="app-topbar__sub">{data?.programName} · {data?.facultyName}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href={backHref}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1a4f8a", textDecoration: "none", padding: "6px 14px", border: "1px solid #dbe7f4", borderRadius: 8, background: "#eef4fb" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            {isApprover ? "กลับ Dashboard" : "กลับหน้า Mapping"}
          </a>
        </div>
      </header>

      <main className="cviz-main">
        <div className="cviz-shell">
          {/* Page head */}
          <div className="cviz-page-head">
            <div className="cviz-crumb">
              ระบบ AI-Ready Curriculum &nbsp;›&nbsp;
              {isApprover
                ? <a href="/approver/mapping">Mapping Dashboard</a>
                : <a href={`/submit`}>หน้าหลัก</a>}
              &nbsp;›&nbsp; <span>Curriculum Map</span>
            </div>
            <h1 className="cviz-page-head__h">แผนที่การเชื่อมโยง รายวิชา ↔ สมรรถนะ</h1>
            <p className="cviz-page-head__sub">
              แสดงว่าแต่ละรายวิชาเชื่อมโยงสู่สมรรถนะใด — หลายวิชาที่แมพ competency เดียวกันจะรวมเส้นเข้า node เดียว · ชี้เพื่อดูรายละเอียด
            </p>
          </div>

          {/* Tabs */}
          <div className="cviz-tabs">
            <button className={`cviz-tab${tab === "l1" ? " is-on" : ""}`} onClick={() => setTab("l1")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
              Layer 1 · UNESCO AI Competency
            </button>
            <button className={`cviz-tab${tab === "l2" ? " is-on" : ""}`} onClick={() => setTab("l2")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Layer 2 · School &amp; Industry
            </button>
          </div>

          <StatsBar rows={rows} tab={tab} />

          <div className="cviz-card">
            <div className="cviz-card__head">
              <div>
                <div className="cviz-card__title">
                  {tab === "l1" ? "Course → UNESCO Dimension → Competency" : "Course → School / Industry → Competency"}
                </div>
                <div className="cviz-card__sub">
                  Competency node เดียวรับหลายเส้นได้ · สีเส้นตามมิติ · badge &quot;X วิชา&quot; บน node ที่มีหลายวิชาเชื่อมโยง · ชี้ node หรือเส้นเพื่อดูรายละเอียด
                </div>
              </div>
            </div>
            <VizLegend tab={tab} />
            <BipartiteGraph rows={rows} tab={tab} key={tab} />
          </div>

          <ToolsSummary rows={rows} />
        </div>
      </main>
    </div>
  );
}

export default function VizPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f3f5f8", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    }>
      <VizPageInner />
    </Suspense>
  );
}
