"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { Topbar } from "@/components/app/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FRRow {
  id: string; f: string; name: string; dept: string;
  d1: number; d2: number; d3: number; d4: number;
  score: number; q14: number;
  path: "AI Aware" | "AI Integrator" | "AI Champion";
  sup: boolean; qb: string;
}
interface DimAvgs { d1: number; d2: number; d3: number; d4: number; }
interface Stats {
  total: number; champion: number; integrator: number; aware: number; support: number;
  avgScore: number; dimAvgs: DimAvgs;
}
interface PathMeta { emoji: string; label: string; color: string; bg: string; border: string; lvl: string; }
interface DimMeta  { key: keyof DimAvgs; label: string; short: string; weight: number; color: string; }
type TooltipState = { id: string; row: FRRow; mx: number; my: number } | null;

// ─── Constants ────────────────────────────────────────────────────────────────
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

const NEED_PATTERNS = [
  { key:"lesson",   label:"Lesson Plan & Rubric",       keywords:["lesson plan","rubric"] },
  { key:"workshop", label:"Workshop / Hands-on Tools",  keywords:["workshop","hands-on"] },
  { key:"ethics",   label:"ความรู้พื้นฐาน AI Ethics",    keywords:["ai ethics","ethics ก่อน"] },
  { key:"peer",     label:"เพื่อน / ทีม AI",             keywords:["เพื่อนร่วมทีม"] },
  { key:"example",  label:"ตัวอย่างสอน AI Non-CS",       keywords:["ตัวอย่างการสอน","ไม่ใช่ cs"] },
  { key:"time",     label:"ต้องการเวลาเพิ่ม",             keywords:["เวลาเพิ่ม"] },
  { key:"ready",    label:"พร้อมเริ่มได้ทันที",           keywords:["materials พร้อม","เริ่มได้ทันที"] },
];
const NEED_COLORS = ["#1a4f8a","#2d6cb0","#4880c0","#6a3eb5","#137a4a","#b6620e","#677889"];

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

// ─── Atoms ────────────────────────────────────────────────────────────────────
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

function FRStatCard({ label, value, sub, color, bg, icon }: { label:string; value:number; sub:string; color:string; bg:string; icon:React.ReactNode }) {
  return (
    <div className="fr-stat-card" style={{ background:bg, borderColor:`${color}33` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div style={{ fontSize:12, color:"var(--ink-500)", fontWeight:500 }}>{label}</div>
        <div style={{ width:28, height:28, borderRadius:8, background:`${color}22`, display:"grid", placeItems:"center", color }}>{icon}</div>
      </div>
      <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:30, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11.5, color:"var(--ink-500)", marginTop:4 }}>{sub}</div>
    </div>
  );
}

// ─── Chart: Donut / Bubbles ───────────────────────────────────────────────────
function DonutChart({ champion, integrator, aware, total }: { champion:number; integrator:number; aware:number; total:number }) {
  const segs = [
    { key:"integrator", val:integrator, meta:PATH_META["AI Integrator"] },
    { key:"champion",   val:champion,   meta:PATH_META["AI Champion"] },
    { key:"aware",      val:aware,      meta:PATH_META["AI Aware"] },
  ];
  const maxVal = Math.max(...segs.map(s => s.val), 1);
  const MAX_R = 66;
  const items = segs.map(s => ({ ...s, r: Math.max(20, Math.round(MAX_R * Math.sqrt(s.val / maxVal))) })).sort((a,b) => b.r - a.r);
  const GAP = 18;
  let cx0 = items[0].r + 12;
  const positions = [cx0];
  for (let i = 1; i < items.length; i++) { cx0 += items[i-1].r + GAP + items[i].r; positions.push(cx0); }
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

// ─── Chart: Dim Bars ──────────────────────────────────────────────────────────
function DimBars({ dimAvgs, compareAvgs }: { dimAvgs: DimAvgs; compareAvgs: DimAvgs | null }) {
  const MAX = 5;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, padding:"4px 0" }}>
      {DIM_META.map(d => {
        const val = dimAvgs[d.key];
        const cmp = compareAvgs?.[d.key] ?? null;
        const pct = (val / MAX) * 100;
        const cmpPct = cmp !== null ? (cmp / MAX) * 100 : null;
        return (
          <div key={d.key}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:"var(--ink-700)", fontWeight:500 }}>{d.short} <span style={{ fontSize:10, color:"var(--ink-400)" }}>({d.weight}%)</span></span>
              <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, fontWeight:700, color:d.color }}>{val.toFixed(2)}</span>
            </div>
            <div style={{ position:"relative", height:10, background:"#eef1f6", borderRadius:5, overflow:"visible" }}>
              <div style={{ width:`${pct}%`, height:"100%", background:d.color, borderRadius:5, opacity:0.85 }} />
              {cmpPct !== null && (
                <div style={{ position:"absolute", left:`${cmpPct}%`, top:-3, width:2, height:16, background:"#8b99a8", borderRadius:1 }} title={`ค่าเฉลี่ยมหาวิทยาลัย: ${cmp?.toFixed(2)}`} />
              )}
              <div style={{ position:"absolute", left:"60%", top:-3, width:1.5, height:16, background:"#dde3eb", borderRadius:1 }} />
            </div>
          </div>
        );
      })}
      {compareAvgs && <div style={{ fontSize:11, color:"var(--ink-400)", marginTop:4 }}>เส้นเทา = ค่าเฉลี่ยมหาวิทยาลัย · เส้น 60% = อ้างอิง 3.0</div>}
    </div>
  );
}

// ─── Chart: KT Scatter ───────────────────────────────────────────────────────
function KTScatter({ rows }: { rows: FRRow[] }) {
  const [hov, setHov] = useState<TooltipState>(null);
  const W=380, H=280, PL=38, PB=36, PT=16, PR=16;
  const PW=W-PL-PR, PH=H-PT-PB;
  const xS = (v: number) => PL + ((v-1)/4)*PW;
  const yS = (v: number) => H-PB - ((v-1)/4)*PH;
  const gap = rows.filter(r => r.d1 - r.d3 > 0.5).length;
  return (
    <div style={{ position:"relative" }} onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
        {[1,2,3,4,5].map(t => (
          <g key={t}>
            <line x1={xS(t)} y1={PT} x2={xS(t)} y2={H-PB} stroke="#dde3eb" strokeWidth="1"/>
            <text x={xS(t)} y={H-PB+12} textAnchor="middle" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
            <line x1={PL} y1={yS(t)} x2={W-PR} y2={yS(t)} stroke="#dde3eb" strokeWidth="1"/>
            <text x={PL-5} y={yS(t)+3} textAnchor="end" fontSize="9" fill="#8b99a8" fontFamily="'IBM Plex Sans',sans-serif">{t}</text>
          </g>
        ))}
        <line x1={PL} y1={H-PB} x2={W-PR} y2={PT} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3"/>
        <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
        <text x={PL+PW/2} y={H-2} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif">Knowledge (d1)</text>
        <text x={10} y={PT+PH/2+4} textAnchor="middle" fontSize="10" fill="#677889" fontFamily="'Sarabun',sans-serif" transform={`rotate(-90,10,${PT+PH/2})`}>Teaching (d3)</text>
        {rows.map(r => {
          const isH = hov?.id === r.id;
          const below = r.d1 - r.d3 > 0.5;
          const m = PATH_META[r.path];
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
      <div style={{ position:"absolute", bottom:40, right:16, fontSize:11, color:"#b53030", background:"#fdecec", border:"1px solid #f4d0d0", borderRadius:6, padding:"3px 8px" }}>
        {gap} คน K–T &gt; 0.5
      </div>
      {hov && (
        <div style={{ position:"fixed", left:hov.mx+14, top:hov.my-56, zIndex:999, background:"white", border:"1px solid var(--ink-200)", borderRadius:10, padding:"10px 14px", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", pointerEvents:"none", minWidth:190 }}>
          <div style={{ fontWeight:700, fontSize:12.5, color:"var(--ink-900)", marginBottom:3 }}>{hov.row.name}</div>
          <div style={{ fontSize:11, color:"var(--ink-500)", marginBottom:6 }}>{hov.row.dept}</div>
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
    { label:"🔴 เร่งด่วน",         x:PL+4,    y:PT+4,    anchor:"start" as const, color:"#b53030" },
    { label:"🟡 Champion ที่กังวล", x:W-PR-4,  y:PT+4,    anchor:"end"   as const, color:"#a86a14" },
    { label:"🔵 ต้องพัฒนา",        x:PL+4,    y:H-PB-8,  anchor:"start" as const, color:"#1a4f8a" },
    { label:"🟢 พร้อมแล้ว",        x:W-PR-4,  y:H-PB-8,  anchor:"end"   as const, color:"#137a4a" },
  ];
  return (
    <div style={{ position:"relative" }} onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
        <rect x={PL} y={PT} width={qx-PL}    height={qy-PT}    fill="#fdecec" opacity="0.4" rx="4"/>
        <rect x={qx} y={PT} width={W-PR-qx}  height={qy-PT}    fill="#fcf3e1" opacity="0.4" rx="4"/>
        <rect x={PL} y={qy} width={qx-PL}    height={H-PB-qy}  fill="#eef4fb" opacity="0.4" rx="4"/>
        <rect x={qx} y={qy} width={W-PR-qx}  height={H-PB-qy}  fill="#e6f4ec" opacity="0.4" rx="4"/>
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
        <line x1={PL} y1={PT}   x2={PL}   y2={H-PB} stroke="#dde3eb" strokeWidth="1.5"/>
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
          <div style={{ fontSize:11, color:"var(--ink-500)", marginBottom:6 }}>{hov.row.dept}</div>
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

// ─── Top Needs ────────────────────────────────────────────────────────────────
function TopNeeds({ rows }: { rows: FRRow[] }) {
  const items = useMemo(() => {
    return NEED_PATTERNS.map(p => {
      const count = rows.filter(r => {
        const t = (r.qb || "").toLowerCase();
        return p.keywords.some(k => t.includes(k.toLowerCase()));
      }).length;
      return { ...p, count, pct: rows.length ? Math.round(count/rows.length*100) : 0 };
    }).sort((a,b) => b.count - a.count).filter(n => n.count > 0);
  }, [rows]);
  const maxCount = items[0]?.count || 1;
  return (
    <div style={{ padding:"14px 22px 18px", display:"flex", flexDirection:"column", gap:13 }}>
      {items.map((n, i) => (
        <div key={n.key}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:11, fontWeight:700, color:"white", background:NEED_COLORS[i]||"#677889", borderRadius:4, padding:"2px 7px", minWidth:18, textAlign:"center" }}>{i+1}</span>
              <span style={{ fontSize:13, color:"var(--ink-900)", fontWeight:i<3?"600":"400" }}>{n.label}</span>
            </div>
            <span style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12.5, fontWeight:700, color:NEED_COLORS[i]||"#677889", whiteSpace:"nowrap" }}>{n.count}/{rows.length} คน</span>
          </div>
          <div style={{ height:9, background:"var(--ink-100)", borderRadius:5, overflow:"hidden" }}>
            <div style={{ width:`${(n.count/maxCount*100)}%`, height:"100%", background:NEED_COLORS[i]||"#677889", borderRadius:5, opacity:i===0?1:0.75 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Support Table ────────────────────────────────────────────────────────────
function FRSupportTable({ rows }: { rows: FRRow[] }) {
  const sup = useMemo(() => rows.filter(r => r.sup || r.q14 >= 4).sort((a,b) => b.q14 - a.q14), [rows]);
  if (!sup.length) return <div style={{ padding:"24px", textAlign:"center", color:"var(--ink-400)", fontSize:13 }}>ไม่มีอาจารย์ที่ต้องการ support พิเศษ</div>;
  return (
    <div className="fr-tbl-wrap">
      <table className="fr-tbl">
        <thead>
          <tr>
            <th>ชื่อ-สกุล / รหัส</th>
            <th>หลักสูตร</th>
            <th>Path</th>
            <th style={{ width:120 }}>คะแนนรวม</th>
            <th style={{ width:90 }}>Q14</th>
            <th>ความต้องการ Support</th>
          </tr>
        </thead>
        <tbody>
          {sup.map(r => (
            <tr key={r.id} className={r.q14 >= 5 ? "fr-row--high" : ""}>
              <td>
                <div style={{ fontWeight:600, color:"var(--ink-900)" }}>{r.name}</div>
                <div style={{ fontSize:11, color:"var(--ink-400)" }}>{r.id}</div>
              </td>
              <td><div style={{ fontSize:12 }}>{r.dept}</div></td>
              <td><PathBadge path={r.path} /></td>
              <td><ScoreMiniBar score={r.score} /></td>
              <td>
                <div className={`fr-q14 fr-q14--${Math.min(r.q14, 5)}`}>
                  {"●".repeat(r.q14)}{"○".repeat(5 - r.q14)}<span>{r.q14}/5</span>
                </div>
              </td>
              <td style={{ fontSize:12, color:"var(--ink-700)", maxWidth:240 }}>{r.qb}</td>
            </tr>
          ))}
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

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = q ? rows.filter(r => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q)) : [...rows];
    out.sort((a,b) => sortDir * (a[sortKey]! > b[sortKey]! ? 1 : -1));
    return out;
  }, [rows, search, sortKey, sortDir]);

  function SortTh({ k, label, w }: { k: keyof FRRow; label: string; w?: number }) {
    const active = sortKey === k;
    return (
      <th style={w ? { width:w } : {}} className="fr-th--sort" onClick={() => { if (active) setSortDir(d => -d); else { setSortKey(k); setSortDir(-1); } }}>
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
          <input type="text" placeholder="ค้นหาชื่อ / รหัส / หลักสูตร" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize:12, color:"var(--ink-500)" }}>{sorted.length} รายการ</span>
      </div>
      <div className="fr-tbl-wrap">
        <table className="fr-tbl">
          <thead>
            <tr>
              <SortTh k="name" label="ชื่อ-สกุล" />
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
            {sorted.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight:600, color:"var(--ink-900)", fontSize:13 }}>{r.name}</div>
                  <div style={{ fontSize:11, color:"var(--ink-400)" }}>{r.id}</div>
                </td>
                <td style={{ fontSize:12 }}>{r.dept}</td>
                <td><PathBadge path={r.path} /></td>
                <td><ScoreMiniBar score={r.score} /></td>
                {(["d1","d2","d3","d4"] as const).map(k => (
                  <td key={k} style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:12, textAlign:"center", color:r[k]>=4?"#137a4a":r[k]>=2.5?"#1a4f8a":"#a86a14", fontWeight:600 }}>
                    {r[k].toFixed(1)}
                  </td>
                ))}
                <td>{r.sup && <SupportBadge />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Dashboard (Faculty-scoped) ───────────────────────────────────────────────
function FacultyOwnDashboard({ rows, allRows, facultyName }: { rows: FRRow[]; allRows: FRRow[]; facultyName: string }) {
  const [pathFilter, setPathFilter] = useState("all");

  const stats    = useMemo(() => frStats(rows), [rows]);
  const uniStats = useMemo(() => frStats(allRows), [allRows]);

  const filteredRows = useMemo(() => {
    if (pathFilter === "all") return rows;
    return rows.filter(r => r.path === pathFilter);
  }, [rows, pathFilter]);

  const filteredStats = useMemo(() => frStats(filteredRows), [filteredRows]);
  const displayStats  = pathFilter === "all" ? stats : filteredStats;

  return (
    <div className="fr-main">
      <div className="fr-shell">

        {/* Filter bar — path only */}
        <div className="fr-filter-bar">
          <div className="fr-filter-bar__left">
            <div style={{ fontSize:13, fontWeight:600, color:"var(--ink-700)", display:"flex", alignItems:"center", gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              {facultyName}
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
        </div>

        {/* Stat cards */}
        <div className="fr-stats">
          <FRStatCard label="อาจารย์ในคณะ" value={displayStats.total}
            sub={`คะแนนเฉลี่ย ${displayStats.avgScore.toFixed(2)}`}
            color="var(--bu-blue)" bg="var(--bu-blue-50)"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
          <FRStatCard label="🏆 AI Champion" value={displayStats.champion}
            sub={`${displayStats.total?Math.round(displayStats.champion/displayStats.total*100):0}% · สอน Level 3`}
            color="#137a4a" bg="#e6f4ec"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} />
          <FRStatCard label="📈 AI Integrator" value={displayStats.integrator}
            sub={`${displayStats.total?Math.round(displayStats.integrator/displayStats.total*100):0}% · สอน Level 2`}
            color="#1a4f8a" bg="#eef4fb"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
          <FRStatCard label="🌱 AI Aware" value={displayStats.aware}
            sub={`${displayStats.total?Math.round(displayStats.aware/displayStats.total*100):0}% · พัฒนาพื้นฐาน`}
            color="#a86a14" bg="#fcf3e1"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
          <FRStatCard label="⚠️ ต้องการ Support" value={displayStats.support}
            sub="Q14 ≥ 4 · ดูแลพิเศษ"
            color="#b53030" bg="#fdecec"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
        </div>

        {/* Charts 2-col */}
        <div className="fr-charts-2col">
          <div className="fr-charts-left">
            <div className="fr-card">
              <div className="fr-card__head">
                <div className="fr-card__title">Development Path</div>
                <div className="fr-card__sub">อาจารย์ในคณะ</div>
              </div>
              <div style={{ padding:"12px 16px 16px" }}>
                <DonutChart champion={displayStats.champion} integrator={displayStats.integrator} aware={displayStats.aware} total={displayStats.total} />
              </div>
            </div>
            <div className="fr-card">
              <div className="fr-card__head">
                <div className="fr-card__title">คะแนนรายมิติ</div>
                <div className="fr-card__sub">เส้นเทา = ค่าเฉลี่ยมหาวิทยาลัย · K·20% E·25% T·35% A·20%</div>
              </div>
              <div style={{ padding:"8px 16px 16px" }}>
                <DimBars dimAvgs={displayStats.dimAvgs} compareAvgs={uniStats.dimAvgs} />
              </div>
            </div>
          </div>
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">Top Needs — สิ่งที่อาจารย์ต้องการ</div>
              <div className="fr-card__sub">วิเคราะห์จากคำตอบเปิด · {filteredRows.length} คน</div>
            </div>
            <TopNeeds rows={filteredRows} />
          </div>
        </div>

        {/* Deep insights */}
        <div className="fr-insight-head">
          <div className="fr-insight-title">🔍 วิเคราะห์เชิงลึก</div>
          <div className="fr-insight-sub">คลิกจุดเพื่อดูรายละเอียด · {filteredRows.length} คน</div>
        </div>
        <div className="fr-insight-grid">
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">Knowledge vs Teaching Gap</div>
              <div className="fr-card__sub">จุดใต้เส้นทแยง = รู้ AI แต่ยังสอนไม่ได้ · วงแดง = gap &gt; 0.5</div>
            </div>
            <div style={{ padding:"8px 12px 12px" }}>
              <KTScatter rows={filteredRows} />
            </div>
          </div>
          <div className="fr-card">
            <div className="fr-card__head">
              <div className="fr-card__title">Support Urgency Matrix</div>
              <div className="fr-card__sub">X = คะแนนรวม · Y = Q14 ความกังวล · 🔴 มุมซ้ายบน = เร่งด่วนสุด</div>
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
            <div className="fr-card__title">รายชื่ออาจารย์ทั้งหมดในคณะ</div>
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
  const [session, setSession] = useState<{ role: string; code: string; name: string } | null>(null);
  const [allData, setAllData]   = useState<FRRow[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [fetchedAt, setFetchedAt]   = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "faculty") { router.replace("/login"); return; }
      setSession(sess);
    } catch {
      router.replace("/login"); return;
    }

    fetch("/api/faculty-readiness")
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setAllData(d.rows ?? []); setFetchedAt(d.fetchedAt ?? null); })
      .catch(() => setFetchError(true));
  }, [router]);

  if (!session) {
    return <div style={{ minHeight:"100vh", background:"#f6f8fb", display:"grid", placeItems:"center" }}><div style={{ color:"#677889", fontSize:14 }}>กำลังโหลด…</div></div>;
  }

  const facultyRows = (allData ?? []).filter(r => r.f === session.name);
  const isLive = allData !== null && !fetchError;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg, #f6f8fb)" }}>
      <Topbar facultyName={session.name} />

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 60px" }}>
        {/* Page head */}
        <div className="page-head" style={{ marginBottom:24 }}>
          <div>
            <div className="page-head__crumbs">
              <a href="/submit" style={{ color:"var(--bu-blue)", textDecoration:"none" }}>หน้าหลักคณะ</a>
              &nbsp;›&nbsp;<span>AI Readiness ของคณะ</span>
            </div>
            <h1 className="page-head__title" style={{ fontSize:22 }}>AI Faculty Readiness — {session.name}</h1>
            <p className="page-head__desc">
              ข้อมูลความพร้อมด้าน AI ของอาจารย์ในคณะ · ปีการศึกษา 2568
              {isLive && fetchedAt && <span style={{ color:"#137a4a", marginLeft:10, fontSize:12 }}>● Live</span>}
              {!isLive && !fetchError && <span style={{ color:"#677889", marginLeft:10, fontSize:12 }}>กำลังโหลด…</span>}
              {fetchError && <span style={{ color:"#b53030", marginLeft:10, fontSize:12 }}>⚠️ ข้อมูล offline</span>}
            </p>
          </div>
        </div>

        {facultyRows.length === 0 && isLive ? (
          <div style={{ background:"white", borderRadius:14, border:"1px solid var(--ink-200)", padding:"48px 24px", textAlign:"center", color:"var(--ink-400)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
            <div style={{ fontSize:15, fontWeight:600, color:"var(--ink-700)", marginBottom:6 }}>ยังไม่มีข้อมูลของคณะนี้</div>
            <div style={{ fontSize:13 }}>อาจารย์ในคณะยังไม่ได้ทำแบบประเมิน AI Readiness</div>
          </div>
        ) : (
          <FacultyOwnDashboard
            rows={facultyRows}
            allRows={allData ?? []}
            facultyName={session.name}
          />
        )}
      </main>
    </div>
  );
}
