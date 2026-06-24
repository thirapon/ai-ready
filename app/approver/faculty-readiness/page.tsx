"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY, FACULTIES } from "@/lib/faculties";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FRRow {
  id: string;
  f: string;
  name: string;
  dept: string;
  d1: number; d2: number; d3: number; d4: number;
  score: number;
  q14: number;
  path: "AI Aware" | "AI Integrator" | "AI Champion";
  sup: boolean;
  qb: string;
  qc: string;
}
interface DimAvgs { d1: number; d2: number; d3: number; d4: number; }
interface Stats {
  total: number; champion: number; integrator: number; aware: number; support: number;
  avgScore: number; dimAvgs: DimAvgs;
}
interface FacultyStats extends Stats { faculty: string; short: string; rows: FRRow[]; }
interface PathMeta { emoji: string; label: string; color: string; bg: string; border: string; lvl: string; }
interface DimMeta  { key: keyof DimAvgs; label: string; short: string; weight: number; color: string; }
type TooltipState = { id: string; row: FRRow; mx: number; my: number } | null;


const PATH_META: Record<string, PathMeta> = {
  "AI Aware":      { emoji:"🌱", label:"AI Aware",      color:"#a86a14", bg:"#fcf3e1", border:"#f0dca6", lvl:"< 2.5 · พัฒนาพื้นฐาน" },
  "AI Integrator": { emoji:"📈", label:"AI Integrator", color:"#1a4f8a", bg:"#eef4fb", border:"#b3d4f5", lvl:"2.5–3.9 · สอน Level 2" },
  "AI Champion":   { emoji:"🏆", label:"AI Champion",   color:"#137a4a", bg:"#e6f4ec", border:"#94d4b5", lvl:"≥ 4.0 · Peer Mentor" },
};

const DIM_META: DimMeta[] = [
  { key:"d1", label:"Knowledge",          short:"Knowledge",  weight:20, color:"#6a3eb5" },
  { key:"d2", label:"Experience",         short:"Experience", weight:25, color:"#1a4f8a" },
  { key:"d3", label:"Teaching Readiness", short:"Teaching",   weight:35, color:"#137a4a" },
  { key:"d4", label:"Attitude",           short:"Attitude",   weight:20, color:"#b6620e" },
];

const FACULTY_SHORT: Record<string, string> = {
  "คณะบัญชี": "บัญชี",
  "คณะบริหารธุรกิจ": "บริหารธุรกิจ",
  "คณะนิเทศศาสตร์": "นิเทศศาสตร์",
  "คณะนิติศาสตร์": "นิติศาสตร์",
  "คณะมนุษยศาสตร์และการจัดการการท่องเที่ยว": "มนุษยศาสตร์ฯ",
  "คณะเศรษฐศาสตร์และการลงทุน": "เศรษฐศาสตร์ฯ",
  "คณะเทคโนโลยีสารสนเทศและนวัตกรรม": "เทคโนโลยีฯ",
  "คณะศิลปกรรมศาสตร์": "ศิลปกรรมศาสตร์",
  "คณะวิศวกรรมศาสตร์": "วิศวกรรมศาสตร์",
  "คณะสถาปัตยกรรมศาสตร์": "สถาปัตยกรรมศาสตร์",
  "คณะการสร้างเจ้าของธุรกิจและการบริหารกิจการ": "สร้างเจ้าของธุรกิจฯ",
  "คณะดิจิทัลมีเดียและศิลปะภาพยนตร์": "ดิจิทัลมีเดียฯ",
  "วิทยาลัยนานาชาติ": "วิทยาลัยนานาชาติ",
  "วิทยาลัยนานาชาติจีน": "วิทยาลัยนานาชาติจีน",
};


// ─── Helpers ──────────────────────────────────────────────────────────────────
function frStats(rows: FRRow[]): Stats {
  if (!rows.length) return { total:0, champion:0, integrator:0, aware:0, support:0, avgScore:0, dimAvgs:{d1:0,d2:0,d3:0,d4:0} };
  const total = rows.length;
  const champion   = rows.filter(r => r.path === "AI Champion").length;
  const integrator = rows.filter(r => r.path === "AI Integrator").length;
  const aware      = rows.filter(r => r.path === "AI Aware").length;
  const support    = rows.filter(r => r.sup).length;
  const avgScore   = rows.reduce((s,r) => s + r.score, 0) / total;
  const dimAvgs: DimAvgs = { d1:0, d2:0, d3:0, d4:0 };
  DIM_META.forEach(d => { dimAvgs[d.key] = rows.reduce((s,r) => s + r[d.key], 0) / total; });
  return { total, champion, integrator, aware, support, avgScore, dimAvgs };
}

function frByFaculty(rows: FRRow[]): FacultyStats[] {
  const map: Record<string, FRRow[]> = {};
  rows.forEach(r => { if (!map[r.f]) map[r.f] = []; map[r.f].push(r); });
  return Object.entries(map).map(([f, rs]) => ({
    faculty: f, short: FACULTY_SHORT[f] || f, rows: rs, ...frStats(rs)
  })).sort((a,b) => b.avgScore - a.avgScore);
}

// ─── Small UI Atoms ───────────────────────────────────────────────────────────
function PathBadge({ path }: { path: string }) {
  const m = PATH_META[path];
  if (!m) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:999, fontSize:11.5, fontWeight:600, background:m.bg, color:m.color, border:`1px solid ${m.border}`, whiteSpace:"nowrap" }}>
      {m.emoji} {m.label}
    </span>
  );
}

function SupportBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:999, fontSize:11, fontWeight:600, background:"#fdecec", color:"#b53030", border:"1px solid #f4d0d0" }}>
      ⚠️ support
    </span>
  );
}

function ScoreMiniBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 4 ? "#137a4a" : score >= 2.5 ? "#1a4f8a" : "#a86a14";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#eef1f6", borderRadius:3, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:3 }} />
      </div>
      <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:700, color, minWidth:32, textAlign:"right" }}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Chart: Bubble / Donut ────────────────────────────────────────────────────
function DonutChart({ champion, integrator, aware, total }: { champion:number; integrator:number; aware:number; total:number }) {
  const segs = [
    { key:"integrator", val:integrator, meta:PATH_META["AI Integrator"] },
    { key:"champion",   val:champion,   meta:PATH_META["AI Champion"] },
    { key:"aware",      val:aware,      meta:PATH_META["AI Aware"] },
  ];
  const maxVal = Math.max(...segs.map(s => s.val), 1);
  const MAX_R = 66;
  const items = segs
    .map(s => ({ ...s, r: Math.max(20, Math.round(MAX_R * Math.sqrt(s.val / maxVal))) }))
    .sort((a,b) => b.r - a.r);

  const GAP = 18;
  let cx0 = items[0].r + 12;
  const positions = [cx0];
  for (let i = 1; i < items.length; i++) {
    cx0 += items[i-1].r + GAP + items[i].r;
    positions.push(cx0);
  }
  const W = cx0 + items[items.length-1].r + 12;
  const CY_BASE = MAX_R + 24;
  const H = CY_BASE * 2 + 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
      {items.map((s, i) => {
        const cx = positions[i], cy = CY_BASE, r = s.r;
        const pct = total ? Math.round(s.val / total * 100) : 0;
        return (
          <g key={s.key}>
            <circle cx={cx} cy={cy} r={r} fill={s.meta.color} opacity="0.88" />
            {r >= 28 ? (
              <>
                <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle" fontSize={r >= 50 ? 25 : r >= 36 ? 19 : 14} fontWeight="700" fill="white" fontFamily="'IBM Plex Sans',sans-serif">{s.val}</text>
                <text x={cx} y={cy + (r >= 50 ? 15 : 12)} textAnchor="middle" fontSize={r >= 50 ? 11 : 10} fill="rgba(255,255,255,0.8)">{pct}%</text>
              </>
            ) : (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="white" fontFamily="'IBM Plex Sans',sans-serif">{s.val}</text>
            )}
            <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="11" fontWeight="600" fill={s.meta.color} fontFamily="'Sarabun',sans-serif">{s.meta.emoji} {s.meta.label.replace("AI ","")}</text>
            <text x={cx} y={cy + r + 27} textAnchor="middle" fontSize="10" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{pct}%</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Chart: Faculty Stacked Bar ───────────────────────────────────────────────
function FacultyStackBar({ faculties, onSelect, selectedFaculty }: { faculties: FacultyStats[]; onSelect: (f: string) => void; selectedFaculty: string }) {
  const ROW = 30, PAD_L = 130, PAD_R = 68, PAD_Y = 8;
  const BAR_W = 300;
  const H = faculties.length * ROW + PAD_Y * 2;
  const W = PAD_L + BAR_W + PAD_R;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1={PAD_L + BAR_W * t} y1={PAD_Y} x2={PAD_L + BAR_W * t} y2={H - PAD_Y} stroke="#dde3eb" strokeWidth="1" strokeDasharray={t < 1 ? "3 3" : "0"} />
      ))}
      {faculties.map((fac, i) => {
        const y = PAD_Y + i * ROW;
        const BY = y + 7, BH = ROW - 12;
        const isOn = selectedFaculty === fac.faculty;
        const total = fac.total || 1;
        const hasSel = !!selectedFaculty && selectedFaculty !== "all";
        const faded  = hasSel && !isOn;
        let x = PAD_L;
        const barSegs = [
          { key:"champion",   val:fac.champion,   meta:PATH_META["AI Champion"] },
          { key:"integrator", val:fac.integrator, meta:PATH_META["AI Integrator"] },
          { key:"aware",      val:fac.aware,       meta:PATH_META["AI Aware"] },
        ].map(s => { const w = (s.val / total) * BAR_W; const seg = { ...s, x, w }; x += w; return seg; });

        return (
          <g key={fac.faculty} style={{ cursor:"pointer", opacity:faded ? 0.28 : 1, transition:"opacity 0.2s" }} onClick={() => onSelect(fac.faculty)}>
            {isOn && <rect x={0} y={y + 1} width={W} height={ROW - 2} rx="7" fill="#eef4fb" stroke="#b3d4f5" strokeWidth="1.2" />}
            <text x={PAD_L - 8} y={BY + BH / 2 + 1} textAnchor="end" dominantBaseline="middle" fontSize={isOn ? "12.5" : "11.5"} fontFamily="'Sarabun',sans-serif" fill={isOn ? "#1a4f8a" : "#3a4859"} fontWeight={isOn ? "700" : "400"}>
              {fac.short}
            </text>
            <rect x={PAD_L} y={BY} width={BAR_W} height={isOn ? BH + 2 : BH} rx="4" fill="#eef1f6" />
            {barSegs.filter(s => s.w > 0).map(s => (
              <rect key={s.key} x={s.x} y={isOn ? BY - 1 : BY} width={s.w} height={isOn ? BH + 2 : BH} fill={s.meta.color} opacity={isOn ? 1 : 0.82} />
            ))}
            <text x={PAD_L + BAR_W + 8} y={BY + BH / 2 + 1} dominantBaseline="middle" fontSize={isOn ? "12.5" : "11.5"} fontWeight="700" fontFamily="'IBM Plex Sans',sans-serif" fill={fac.avgScore >= 4 ? "#137a4a" : fac.avgScore >= 2.5 ? "#1a4f8a" : "#a86a14"}>
              {fac.avgScore.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Chart: Dimension Bars ────────────────────────────────────────────────────
function DimBars({ dimAvgs, compareAvgs }: { dimAvgs: DimAvgs; compareAvgs: DimAvgs | null }) {
  const W = 420, ROW = 46, PAD_L = 120, PAD_R = 50, PAD_Y = 8;
  const MAX = 5;
  const BAR_W = W - PAD_L - PAD_R;
  const H = DIM_META.length * ROW + PAD_Y * 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
      <line x1={PAD_L + BAR_W * 3/5} y1={PAD_Y} x2={PAD_L + BAR_W * 3/5} y2={H - PAD_Y} stroke="#dde3eb" strokeWidth="1" strokeDasharray="3 3" />
      {DIM_META.map((d, i) => {
        const y = PAD_Y + i * ROW;
        const val = dimAvgs?.[d.key] || 0;
        const cval = compareAvgs?.[d.key];
        const barW = (val / MAX) * BAR_W;
        const BY = y + 12, BH = 14;
        return (
          <g key={d.key}>
            <text x={PAD_L - 8} y={y + 18} textAnchor="end" fontSize="12" fill="#3a4859" fontFamily="'Sarabun',sans-serif" dominantBaseline="middle">{d.short}</text>
            <text x={PAD_L - 8} y={y + 34} textAnchor="end" fontSize="9.5" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{d.weight}% weight</text>
            <rect x={PAD_L} y={BY} width={BAR_W} height={BH} rx="4" fill="#eef1f6" />
            <rect x={PAD_L} y={BY} width={barW} height={BH} rx="4" fill={d.color} opacity="0.85" />
            {cval !== undefined && cval !== null && cval !== val && (
              <line x1={PAD_L + (cval / MAX) * BAR_W} y1={BY - 3} x2={PAD_L + (cval / MAX) * BAR_W} y2={BY + BH + 3} stroke="#b9c3cf" strokeWidth="2" strokeLinecap="round" />
            )}
            <text x={PAD_L + barW + 6} y={BY + BH / 2} dominantBaseline="middle" fontSize="12" fontWeight="700" fill={d.color} fontFamily="'IBM Plex Sans',sans-serif">{val.toFixed(2)}</text>
          </g>
        );
      })}
      <text x={PAD_L + BAR_W * 3/5} y={H - 1} textAnchor="middle" fontSize="9" fill="#b9c3cf" fontFamily="'IBM Plex Sans',sans-serif">3.0</text>
    </svg>
  );
}

// ─── Chart: K vs T Scatter ────────────────────────────────────────────────────
function KTScatter({ rows }: { rows: FRRow[] }) {
  const [hov, setHov] = useState<TooltipState>(null);
  const W=400, H=300, PL=50, PB=38, PT=20, PR=20;
  const PW=W-PL-PR, PH=H-PT-PB;
  const xS = (v: number) => PL + ((v-1)/4)*PW;
  const yS = (v: number) => H-PB - ((v-1)/4)*PH;
  const tks = [1,2,3,4,5];
  const gap = rows.filter(r => r.d1 - r.d3 > 0.8).length;

  return (
    <div style={{ position:"relative" }} onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
        {tks.map(t => (
          <g key={t}>
            <line x1={xS(t)} y1={PT} x2={xS(t)} y2={H-PB} stroke="#eef1f6" strokeWidth="1"/>
            <line x1={PL} y1={yS(t)} x2={W-PR} y2={yS(t)} stroke="#eef1f6" strokeWidth="1"/>
            <text x={xS(t)} y={H-PB+13} textAnchor="middle" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
            <text x={PL-6} y={yS(t)+3} textAnchor="end" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
          </g>
        ))}
        <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <line x1={xS(1)} y1={yS(1)} x2={xS(5)} y2={yS(5)} stroke="#b9c3cf" strokeWidth="1.5" strokeDasharray="4 3"/>
        <text x={xS(4.6)} y={yS(4.9)} textAnchor="middle" fontSize="9" fill="#137a4a" fontFamily="'Sarabun',sans-serif">สอนเก่งกว่าที่รู้</text>
        <text x={xS(4.6)} y={yS(1.6)} textAnchor="middle" fontSize="9" fill="#b53030" fontFamily="'Sarabun',sans-serif">รู้แต่ยังสอนไม่ได้</text>
        <text x={PL+PW/2} y={H-2} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif">Knowledge (K)</text>
        <text x={10} y={PT+PH/2+4} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif" transform={`rotate(-90,10,${PT+PH/2})`}>Teaching (T)</text>
        {rows.map(r => {
          const isH = hov?.id === r.id;
          const m = PATH_META[r.path];
          const below = r.d1 - r.d3 > 0.5;
          return (
            <circle key={r.id} cx={xS(r.d1)} cy={yS(r.d3)} r={isH ? 7 : 5}
              fill={m?.color || "#677889"} opacity={hov && !isH ? 0.15 : 0.85}
              stroke={below ? "#b53030" : isH ? "white" : "none"} strokeWidth={1.5}
              style={{ cursor:"pointer", transition:"r 0.1s,opacity 0.15s" }}
              onMouseEnter={e => setHov({ id:r.id, row:r, mx:e.clientX, my:e.clientY })}
              onMouseMove={e => setHov(h => h ? { ...h, mx:e.clientX, my:e.clientY } : null)}
            />
          );
        })}
      </svg>
      <div style={{ position:"absolute", bottom:40, right:20, fontSize:11, color:"#b53030", background:"#fdecec", border:"1px solid #f4d0d0", borderRadius:6, padding:"3px 8px" }}>
        {gap} คน K–T &gt; 0.5
      </div>
      {hov && (
        <div style={{ position:"fixed", left:hov.mx+14, top:hov.my-56, zIndex:999, background:"white", border:"1px solid var(--ink-200)", borderRadius:10, padding:"10px 14px", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", pointerEvents:"none", minWidth:190 }}>
          <div style={{ fontWeight:700, fontSize:12.5, color:"var(--ink-900)", marginBottom:3 }}>{hov.row.name}</div>
          <div style={{ fontSize:11, color:"var(--ink-500)", marginBottom:6 }}>{FACULTY_SHORT[hov.row.f] || hov.row.f}</div>
          <div style={{ display:"flex", gap:14, fontSize:12, marginBottom:6 }}>
            <span style={{ color:"#6a3eb5" }}>K: <b>{hov.row.d1.toFixed(1)}</b></span>
            <span style={{ color:"#137a4a" }}>T: <b>{hov.row.d3.toFixed(1)}</b></span>
            <span style={{ color:hov.row.d3>=hov.row.d1?"#137a4a":"#b53030" }}>Δ: <b>{(hov.row.d3-hov.row.d1).toFixed(1)}</b></span>
          </div>
          <PathBadge path={hov.row.path} />
        </div>
      )}
    </div>
  );
}

// ─── Chart: Urgency Matrix ────────────────────────────────────────────────────
function UrgencyMatrix({ rows }: { rows: FRRow[] }) {
  const [hov, setHov] = useState<TooltipState>(null);
  const W=400, H=300, PL=50, PB=38, PT=20, PR=20;
  const PW=W-PL-PR, PH=H-PT-PB;
  const xS = (v: number) => PL + ((v-1)/4)*PW;
  const yS = (v: number) => H-PB - ((v-1)/5)*PH;
  const qx = xS(3.0), qy = yS(4);
  const QUADS = [
    { label:"🔴 เร่งด่วน", x:PL+4, y:PT+4, anchor:"start" as const, color:"#b53030" },
    { label:"🟡 Champion ที่กังวล", x:W-PR-4, y:PT+4, anchor:"end" as const, color:"#a86a14" },
    { label:"🔵 ต้องพัฒนา", x:PL+4, y:H-PB-8, anchor:"start" as const, color:"#1a4f8a" },
    { label:"🟢 พร้อมแล้ว", x:W-PR-4, y:H-PB-8, anchor:"end" as const, color:"#137a4a" },
  ];

  return (
    <div style={{ position:"relative" }} onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
        <rect x={PL} y={PT} width={qx-PL} height={qy-PT} fill="#fdecec" opacity="0.4" rx="4"/>
        <rect x={qx} y={PT} width={W-PR-qx} height={qy-PT} fill="#fcf3e1" opacity="0.4" rx="4"/>
        <rect x={PL} y={qy} width={qx-PL} height={H-PB-qy} fill="#eef4fb" opacity="0.4" rx="4"/>
        <rect x={qx} y={qy} width={W-PR-qx} height={H-PB-qy} fill="#e6f4ec" opacity="0.4" rx="4"/>
        {[1,2,3,4,5].map(t => (
          <g key={t}>
            <line x1={xS(t)} y1={PT} x2={xS(t)} y2={H-PB} stroke="#dde3eb" strokeWidth="1"/>
            <text x={xS(t)} y={H-PB+13} textAnchor="middle" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
          </g>
        ))}
        {[1,2,3,4,5].map(t => (
          <g key={t}>
            <line x1={PL} y1={yS(t)} x2={W-PR} y2={yS(t)} stroke="#dde3eb" strokeWidth="1"/>
            <text x={PL-6} y={yS(t)+3} textAnchor="end" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
          </g>
        ))}
        <line x1={qx} y1={PT} x2={qx} y2={H-PB} stroke="#b9c3cf" strokeWidth="1.5" strokeDasharray="4 3"/>
        <line x1={PL} y1={qy} x2={W-PR} y2={qy} stroke="#b9c3cf" strokeWidth="1.5" strokeDasharray="4 3"/>
        <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <text x={PL+PW/2} y={H-2} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif">คะแนนรวม (weighted)</text>
        <text x={10} y={PT+PH/2+4} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif" transform={`rotate(-90,10,${PT+PH/2})`}>Q14 ความกังวล</text>
        {QUADS.map(q => (
          <text key={q.label} x={q.x} y={q.y+10} textAnchor={q.anchor} fontSize="9" fontWeight="600" fill={q.color} fontFamily="'Sarabun',sans-serif">{q.label}</text>
        ))}
        {rows.map(r => {
          const isH = hov?.id === r.id;
          const m = PATH_META[r.path];
          return (
            <circle key={r.id} cx={xS(r.score)} cy={yS(r.q14)} r={isH ? 7 : 5}
              fill={m?.color || "#677889"} opacity={hov && !isH ? 0.15 : 0.85}
              stroke={r.sup ? "#b53030" : "none"} strokeWidth="1.5"
              style={{ cursor:"pointer", transition:"r 0.1s,opacity 0.15s" }}
              onMouseEnter={e => setHov({ id:r.id, row:r, mx:e.clientX, my:e.clientY })}
              onMouseMove={e => setHov(h => h ? { ...h, mx:e.clientX, my:e.clientY } : null)}
            />
          );
        })}
      </svg>
      {hov && (
        <div style={{ position:"fixed", left:hov.mx+14, top:hov.my-56, zIndex:999, background:"white", border:"1px solid var(--ink-200)", borderRadius:10, padding:"10px 14px", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", pointerEvents:"none", minWidth:190 }}>
          <div style={{ fontWeight:700, fontSize:12.5, color:"var(--ink-900)", marginBottom:3 }}>{hov.row.name}</div>
          <div style={{ fontSize:11, color:"var(--ink-500)", marginBottom:6 }}>{FACULTY_SHORT[hov.row.f] || hov.row.f}</div>
          <div style={{ display:"flex", gap:14, fontSize:12, marginBottom:6 }}>
            <span style={{ color:"var(--bu-blue)" }}>Score: <b>{hov.row.score.toFixed(2)}</b></span>
            <span style={{ color:hov.row.q14>=4?"#b53030":"#677889" }}>Q14: <b>{hov.row.q14}/5</b></span>
          </div>
          <PathBadge path={hov.row.path} />
          {hov.row.sup && <div style={{ marginTop:4 }}><SupportBadge /></div>}
        </div>
      )}
    </div>
  );
}

// ─── Expand Detail ────────────────────────────────────────────────────────────
function ExpandDetail({ r, colSpan }: { r: FRRow; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: "1px solid #eef1f6" }}>
        <div style={{ background: "#f6f8fb", borderTop: "1px solid #eef1f6", padding: "14px 16px 16px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#677889", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>ข. สิ่งที่ต้องการก่อนเริ่มสอน AI</div>
              <div style={{ fontSize: 13, color: "#14202e", lineHeight: 1.6 }}>{r.qb || <span style={{ color: "#b9c3cf" }}>—</span>}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#677889", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>ค. ข้อกังวล / ข้อเสนอแนะ</div>
              <div style={{ fontSize: 13, color: "#14202e", lineHeight: 1.6 }}>{r.qc || <span style={{ color: "#b9c3cf" }}>—</span>}</div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Support Table ────────────────────────────────────────────────────────────
function FRSupportTable({ rows }: { rows: FRRow[] }) {
  const sup = rows.filter(r => r.sup).sort((a,b) => b.q14 - a.q14);
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  if (!sup.length) return <div className="fr-empty">ไม่มีอาจารย์ที่ต้องการ support พิเศษในกลุ่มที่เลือก</div>;
  return (
    <div className="fr-tbl-wrap">
      <table className="fr-tbl">
        <thead>
          <tr>
            <th>ชื่อ-สกุล</th>
            <th>คณะ / ภาควิชา</th>
            <th>Path</th>
            <th style={{ width:120 }}>คะแนนรวม</th>
            <th style={{ width:90 }}>Q14</th>
          </tr>
        </thead>
        <tbody>
          {sup.map(r => {
            const isExp = expandedSet.has(r.id);
            return (
              <React.Fragment key={r.id}>
                <tr
                  className={r.q14 >= 5 ? "fr-row--high" : ""}
                  style={{ cursor: "pointer", background: isExp ? "#f6f8fb" : undefined }}
                  onClick={() => setExpandedSet(prev => { const s = new Set(prev); if (isExp) { s.delete(r.id); } else { s.add(r.id); } return s; })}
                >
                  <td>
                    <div style={{ fontWeight:600, color:"var(--ink-900)" }}>{r.name}</div>
                    <div style={{ fontSize:11, color:"var(--ink-400)" }}>{r.id}</div>
                  </td>
                  <td>
                    <div style={{ fontSize:12 }}>{FACULTY_SHORT[r.f] || r.f}</div>
                    <div style={{ fontSize:11, color:"var(--ink-500)" }}>{r.dept}</div>
                  </td>
                  <td><PathBadge path={r.path} /></td>
                  <td><ScoreMiniBar score={r.score} /></td>
                  <td>
                    <div className={`fr-q14 fr-q14--${Math.min(r.q14, 5)}`}>
                      {"●".repeat(r.q14)}{"○".repeat(5 - r.q14)}<span>{r.q14}/5</span>
                    </div>
                  </td>
                </tr>
                {isExp && <ExpandDetail r={r} colSpan={5} />}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Roster Table ─────────────────────────────────────────────────────────────
function FRRosterTable({ rows }: { rows: FRRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof FRRow>("score");
  const [sortDir, setSortDir] = useState(-1);
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = q ? rows.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q) || r.f.toLowerCase().includes(q)) : [...rows];
    out.sort((a,b) => sortDir * (a[sortKey]! > b[sortKey]! ? 1 : -1));
    return out;
  }, [rows, search, sortKey, sortDir]);

  function SortTh({ k, label, w }: { k: keyof FRRow; label: string; w?: number }) {
    const active = sortKey === k;
    return (
      <th style={w ? { width:w } : {}} className="fr-th--sort" onClick={() => active ? setSortDir(d => -d) : (setSortKey(k), setSortDir(-1))}>
        {label}&nbsp;{active ? (sortDir < 0 ? "↓" : "↑") : <span style={{ opacity:0.3 }}>↕</span>}
      </th>
    );
  }

  return (
    <>
      <div className="fr-roster-toolbar">
        <div className="search">
          <span className="search__icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" placeholder="ค้นหาชื่อ / รหัส / คณะ / หลักสูตร" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize:12, color:"var(--ink-500)" }}>{sorted.length} รายการ</span>
      </div>
      <div className="fr-tbl-wrap">
        <table className="fr-tbl">
          <thead>
            <tr>
              <SortTh k="name" label="ชื่อ-สกุล" />
              <SortTh k="f" label="คณะ" />
              <SortTh k="dept" label="หลักสูตร" />
              <SortTh k="path" label="Path" w={130} />
              <SortTh k="score" label="คะแนนรวม" w={140} />
              <SortTh k="d1" label="K" w={54} />
              <SortTh k="d2" label="E" w={54} />
              <SortTh k="d3" label="T" w={54} />
              <SortTh k="d4" label="A" w={54} />
              <th style={{ width:80 }}>Support</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => {
              const isExp = expandedSet.has(r.id);
              return (
                <React.Fragment key={r.id}>
                  <tr
                    style={{ cursor: "pointer", background: isExp ? "#f6f8fb" : undefined }}
                    onClick={() => setExpandedSet(prev => { const s = new Set(prev); if (isExp) { s.delete(r.id); } else { s.add(r.id); } return s; })}
                  >
                    <td>
                      <div style={{ fontWeight:600, color:"var(--ink-900)" }}>{r.name}</div>
                      <div style={{ fontSize:11, color:"var(--ink-400)" }}>{r.id}</div>
                    </td>
                    <td style={{ fontSize:12 }}>{FACULTY_SHORT[r.f] || r.f}</td>
                    <td style={{ fontSize:12 }}>{r.dept}</td>
                    <td><PathBadge path={r.path} /></td>
                    <td><ScoreMiniBar score={r.score} /></td>
                    {(["d1","d2","d3","d4"] as (keyof DimAvgs)[]).map(d => {
                      const m = DIM_META.find(x => x.key === d)!;
                      return <td key={d} style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, color:m.color, fontWeight:600 }}>{(r[d] as number).toFixed(1)}</td>;
                    })}
                    <td>{r.sup ? <SupportBadge /> : <span style={{ color:"var(--ink-300)", fontSize:12 }}>—</span>}</td>
                  </tr>
                  {isExp && <ExpandDetail r={r} colSpan={10} />}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function FRStatCard({ label, value, sub, color, bg, icon }: { label:string; value:number; sub?:string; color:string; bg:string; icon:React.ReactNode }) {
  return (
    <div className="fr-stat">
      <div className="fr-stat__head">
        <span className="fr-stat__label">{label}</span>
        <span className="fr-stat__icon" style={{ background:bg, color }}>{icon}</span>
      </div>
      <div className="fr-stat__value" style={{ color }}>{value}</div>
      {sub && <div className="fr-stat__sub">{sub}</div>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function FacultyReadinessDashboard({ data }: { data: FRRow[] }) {
  const [selFaculty, setSelFaculty] = useState("all");
  const [pathFilter, setPathFilter] = useState("all");

  const uniStats    = useMemo(() => frStats(data), [data]);
  const allFaculties = useMemo(() => frByFaculty(data), [data]);
  const facultyNames = useMemo(() => Array.from(new Set(data.map(r => r.f))).sort(), [data]);

  const filteredRows = useMemo(() => {
    let out = data;
    if (selFaculty !== "all") out = out.filter(r => r.f === selFaculty);
    if (pathFilter !== "all") out = out.filter(r => r.path === pathFilter);
    return out;
  }, [data, selFaculty, pathFilter]);

  const filteredStats = useMemo(() => frStats(filteredRows), [filteredRows]);
  const stats = selFaculty === "all" && pathFilter === "all" ? uniStats : filteredStats;

  return (
    <div className="fr-main">
      <div className="fr-shell">

        {/* Filter bar */}
        <div className="fr-filter-bar">
          <div className="fr-filter-bar__left">
            <div className="filter-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <select value={selFaculty} onChange={e => setSelFaculty(e.target.value)}>
                <option value="all">ทุกคณะ (มหาวิทยาลัย)</option>
                {facultyNames.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="fr-path-pills">
              {(["all","AI Champion","AI Integrator","AI Aware"] as const).map(p => (
                <button key={p}
                  className={`fr-pill${pathFilter===p?" is-on":""}`}
                  style={pathFilter===p && p!=="all" ? { background:PATH_META[p]?.color, color:"white", borderColor:PATH_META[p]?.color } : {}}
                  onClick={() => setPathFilter(p)}>
                  {p === "all" ? "ทุก Path" : `${PATH_META[p]?.emoji} ${p.replace("AI ","")}`}
                </button>
              ))}
            </div>
          </div>
          {selFaculty !== "all" && (
            <button className="fr-clear-btn" onClick={() => setSelFaculty("all")}>← ดูทั้งมหาวิทยาลัย</button>
          )}
        </div>

        {/* Stat cards */}
        <div className="fr-stats">
          <FRStatCard label="อาจารย์" value={stats.total}
            sub={selFaculty === "all" ? "14 คณะ" : FACULTY_SHORT[selFaculty]||selFaculty}
            color="var(--bu-blue)" bg="var(--bu-blue-50)"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
          <FRStatCard label="🏆 AI Champion" value={stats.champion}
            sub={`${stats.total?Math.round(stats.champion/stats.total*100):0}% · สอน Level 3`}
            color="#137a4a" bg="#e6f4ec"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} />
          <FRStatCard label="📈 AI Integrator" value={stats.integrator}
            sub={`${stats.total?Math.round(stats.integrator/stats.total*100):0}% · สอน Level 2`}
            color="#1a4f8a" bg="#eef4fb"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
          <FRStatCard label="🌱 AI Aware" value={stats.aware}
            sub={`${stats.total?Math.round(stats.aware/stats.total*100):0}% · พัฒนาพื้นฐาน`}
            color="#a86a14" bg="#fcf3e1"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
          <FRStatCard label="⚠️ ต้องการ Support" value={stats.support}
            sub="Q14 ≥ 4 · ดูแลพิเศษ"
            color="#b53030" bg="#fdecec"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
        </div>

        {/* Charts 2-column */}
        <div className="fr-charts-2col">
          <div className="fr-charts-left">
            <div className="fr-card">
              <div className="fr-card__head">
                <div className="fr-card__title">Development Path</div>
                <div className="fr-card__sub">{selFaculty === "all" ? "ทั้งมหาวิทยาลัย" : FACULTY_SHORT[selFaculty]||selFaculty}</div>
              </div>
              <div style={{ padding:"12px 16px 16px" }}>
                <DonutChart champion={stats.champion} integrator={stats.integrator} aware={stats.aware} total={stats.total} />
              </div>
            </div>
            <div className="fr-card">
              <div className="fr-card__head">
                <div className="fr-card__title">{selFaculty === "all" ? "คะแนนเฉลี่ยรายมิติ" : `รายมิติ — ${FACULTY_SHORT[selFaculty]||selFaculty}`}</div>
                <div className="fr-card__sub">{selFaculty !== "all" ? "เส้นสีเทา = ค่าเฉลี่ยมหาวิทยาลัย" : "K·20% E·25% T·35% A·20% · เส้นอ้างอิง 3.0"}</div>
              </div>
              <div style={{ padding:"8px 16px 16px" }}>
                <DimBars dimAvgs={selFaculty !== "all" ? stats.dimAvgs : uniStats.dimAvgs} compareAvgs={selFaculty !== "all" ? uniStats.dimAvgs : null} />
              </div>
            </div>
          </div>
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">การกระจาย Path รายคณะ</div>
              <div className="fr-card__sub">
                <span style={{ color:"#137a4a" }}>■ Champion</span> ·
                <span style={{ color:"#1a4f8a" }}> ■ Integrator</span> ·
                <span style={{ color:"#a86a14" }}> ■ Aware</span>
                &nbsp;· ตัวเลขขวา = คะแนนเฉลี่ย · คลิกเพื่อกรอง
              </div>
            </div>
            <div style={{ padding:"8px 16px 16px" }}>
              <FacultyStackBar faculties={allFaculties} onSelect={f => setSelFaculty(f === selFaculty ? "all" : f)} selectedFaculty={selFaculty} />
            </div>
          </div>
        </div>

        {/* Deep insights */}
        <div className="fr-insight-head">
          <div className="fr-insight-title">🔍 วิเคราะห์เชิงลึก</div>
          <div className="fr-insight-sub">Insight จากข้อมูล {filteredRows.length} คน · คลิกจุดเพื่อดูรายละเอียด</div>
        </div>
        <div className="fr-insight-grid">
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">Knowledge vs Teaching Gap</div>
              <div className="fr-card__sub">จุดใต้เส้นทแยง = รู้ AI แต่ยังสอนไม่ได้ · วงแดง = gap &gt; 0.5 · ชี้จุดเพื่อดูชื่อ</div>
            </div>
            <div style={{ padding:"8px 12px 12px" }}>
              <KTScatter rows={filteredRows} />
            </div>
          </div>
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">Support Urgency Matrix</div>
              <div className="fr-card__sub">X = คะแนนรวม · Y = Q14 ความกังวล · วงแดงรอบ = มี support flag · 🔴 มุมซ้ายบน = เร่งด่วนสุด</div>
            </div>
            <div style={{ padding:"8px 12px 12px" }}>
              <UrgencyMatrix rows={filteredRows} />
            </div>
          </div>
        </div>

        {/* Support table */}
        <div className="fr-card">
          <div className="fr-card__head">
            <div className="fr-card__title">⚠️ อาจารย์ที่ต้องการ Support พิเศษ</div>
            <div className="fr-card__sub">Q14 ≥ 4 · เรียงตามระดับความกังวลสูงสุด · แถวสีแดง = 5/5</div>
          </div>
          <FRSupportTable rows={filteredRows} />
        </div>

        {/* Roster */}
        <div className="fr-card">
          <div className="fr-card__head">
            <div className="fr-card__title">รายชื่ออาจารย์ทั้งหมด</div>
            <div className="fr-card__sub">K=Knowledge(20%) · E=Experience(25%) · T=Teaching(35%) · A=Attitude(20%) · คลิกหัวตารางเพื่อเรียง</div>
          </div>
          <div style={{ paddingBottom:8 }}>
            <FRRosterTable rows={filteredRows} />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FacultyReadinessPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string; scope?: string[] } | null>(null);
  const [liveData, setLiveData] = useState<FRRow[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "approver") { router.replace("/login"); return; }
      setSession(sess);
    } catch {
      router.replace("/login"); return;
    }

    fetch("/api/faculty-readiness/refresh")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setLiveData(d.rows ?? []); setFetchedAt(d.fetchedAt ?? null); })
      .catch(() => setFetchError(true));
  }, [router]);

  const handleRefresh = () => {
    setRefreshing(true);
    setFetchError(false);
    fetch("/api/faculty-readiness/refresh")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setLiveData(d.rows ?? []); setFetchedAt(d.fetchedAt ?? null); })
      .catch(() => setFetchError(true))
      .finally(() => setRefreshing(false));
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  };

  // Scoped viewers only see their faculties. FR data is keyed by faculty *name*,
  // so map scope codes → names via FACULTIES.
  const scopeNames = Array.isArray(session?.scope) && session!.scope!.length > 0
    ? new Set(FACULTIES.filter((f) => session!.scope!.includes(f.code)).map((f) => f.name))
    : null;
  const data: FRRow[] = (liveData ?? []).filter((r) => !scopeNames || scopeNames.has(r.f));
  const isLive = liveData !== null && !fetchError;
  const isLoading = liveData === null && !fetchError;

  if (!session || isLoading) {
    return <div style={{ minHeight:"100vh", background:"#f6f8fb", display:"grid", placeItems:"center" }}><div style={{ color:"#677889", fontSize:14 }}>กำลังดึงข้อมูลจาก Google Sheets…</div></div>;
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            <span className="app-topbar__title">AI Faculty Readiness Dashboard</span>
            <span className="topbar__role-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ปีการศึกษา 2568
            </span>
          </div>
          <div className="app-topbar__sub" style={{ display:"flex", alignItems:"center", gap:0, flexWrap:"wrap" }}>
            <span>มหาวิทยาลัยกรุงเทพ · สายวิชาการ AI-Ready · {data.length} อาจารย์</span>
            {fetchError && <span style={{ color:"#b53030", marginLeft:8 }}>⚠️ ใช้ข้อมูล mock</span>}
            {isLive && fetchedAt && (
              <span style={{ color:"#137a4a", marginLeft:8 }}>
                ● Live · อัปเดต {new Date(fetchedAt).toLocaleTimeString("th-TH", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
              </span>
            )}
            {!isLive && !fetchError && <span style={{ color:"#677889", marginLeft:8 }}>กำลังโหลด…</span>}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="ดึงข้อมูลใหม่จาก Google Sheets"
              style={{
                marginLeft:10, display:"inline-flex", alignItems:"center", gap:5,
                padding:"3px 10px", borderRadius:6, fontSize:11.5, fontWeight:600,
                border:"1px solid #b3d4f5", background: refreshing ? "#dbe7f4" : "#eef4fb",
                color:"#1a4f8a", cursor: refreshing ? "not-allowed" : "pointer",
                lineHeight:1, transition:"background 0.15s",
              }}
            >
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink:0, animation: refreshing ? "fr-spin 0.8s linear infinite" : "none" }}
              >
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {refreshing ? "กำลังดึงข้อมูล…" : "Refresh จาก Sheets"}
            </button>
          </div>
        </div>
        <div style={{ flex:1 }} />
        <nav className="topbar__nav">
          {!session.scope && <a href="/approver">คำขออนุมัติ</a>}
          <a href="/approver/mapping">Curriculum Mapping</a>
          {!session.scope && <a href="/approver/insights">Executive Insights</a>}
          <a href="/approver/faculty-readiness" className="is-active">Faculty Readiness</a>
        </nav>
        <div style={{ width:1, height:28, background:"#dde3eb", flexShrink:0 }} />
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right", lineHeight:1.2 }}>
            <div style={{ fontWeight:600, color:"#14202e", fontSize:14 }}>{session.name}</div>
            <div style={{ fontSize:11.5, color:"#677889" }}>ประธานคณะกรรมการ AI-Ready</div>
          </div>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"#dbe7f4", color:"#1a4f8a", display:"grid", placeItems:"center", fontWeight:600, fontSize:12 }}>กก</div>
          <button className="logout-btn" onClick={handleLogout} title="ออกจากระบบ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <FacultyReadinessDashboard data={data} />
    </div>
  );
}
