"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import type { MappingRow, Layer2Row } from "@/lib/unesco";
import { FACULTY_PROGRAMS } from "@/components/form/types";
import {
  INSIGHTS_GENERATED_AT,
  INSIGHTS_FACULTY_TOTAL,
  INSIGHTS_PROGRAMS_TOTAL,
  executiveSummary,
  developmentThemes,
  supportNeeds,
  competencyPatterns,
  unescoGapAnalysis,
  curriculumCharacter,
  toolsGap,
} from "@/lib/insights-static";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Submission {
  id: string;
  ref_id: string | null;
  faculty_name: string;
  program_name: string;
  status: string;
  form_data: Record<string, unknown> | null;
  layer1_mapping: MappingRow[] | null;
  layer2_mapping: Layer2Row[] | null;
}

// ─── Tool categorization ─────────────────────────────────────────────────────
const TOOL_KEYWORDS: Record<string, string[]> = {
  llm:    ["chatgpt", "claude", "gemini", "gpt", "perplexity", "copilot", "llm", "bard", "mistral", "llama"],
  media:  ["midjourney", "runway", "elevenlabs", "suno", "stable diffusion", "firefly", "dall", "figma ai", "image ai", "kling", "pika", "leonardo"],
  auto:   ["n8n", "zapier", "make.com", "langchain", "api", "cursor", "github copilot", "automation", "agent", "workflow", "flowise"],
  data:   ["code interpreter", "excel", "power bi", "julius", "tableau", "data", "analytics", "pandas", "superset"],
};
const CAT_META: Record<string, { label: string; color: string }> = {
  llm:    { label: "LLM / Chat",              color: "#1a4f8a" },
  media:  { label: "Gen-media",               color: "#6a3eb5" },
  auto:   { label: "Automation & Agents",     color: "#0f7b6c" },
  data:   { label: "Data & Analytics",        color: "#b6620e" },
  domain: { label: "Domain-specific",         color: "#4b5868" },
};

function categorizeTool(name: string): string {
  const n = name.toLowerCase();
  for (const [cat, kws] of Object.entries(TOOL_KEYWORDS)) {
    if (kws.some((k) => n.includes(k))) return cat;
  }
  return "domain";
}

const DIM_NAMES: Record<string, string> = {
  human:      "Human-centred Mindset",
  ethics:     "Ethics of AI",
  techniques: "AI Techniques & Applications",
  design:     "AI System Design",
};
const DIM_KEYS = ["human", "ethics", "techniques", "design"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isDone(mapping: MappingRow[] | Layer2Row[] | null, layer: 1 | 2) {
  if (!Array.isArray(mapping) || mapping.length === 0) return false;
  if (layer === 1) return (mapping as MappingRow[]).every((r) => r.courseName?.trim());
  return (mapping as Layer2Row[]).every((r) => r.competency?.trim() || r.courseName?.trim());
}

function scoreColor(s: number) {
  if (s >= 80) return "#137a4a";
  if (s >= 60) return "#1a4f8a";
  if (s >= 40) return "#a86a14";
  return "#b53030";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg }: { icon: React.ReactNode; label: string; value: string | number; sub: string; color: string; bg: string }) {
  return (
    <div className="stat-card" style={{ "--stat-color": color, "--stat-bg": bg } as React.CSSProperties}>
      <div className="stat-card__head"><span>{label}</span><span className="stat-card__icon">{icon}</span></div>
      <div className="stat-card__num">{value}</div>
      <div className="stat-card__sub">{sub}</div>
    </div>
  );
}

function InsCard({ children, title, icon, sub }: { children: React.ReactNode; title: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="ins-card">
      <div className="ins-card__head">
        <h2 className="ins-card__title">{icon}{title}</h2>
        {sub && <div className="ins-card__sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExecutiveInsights() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
      .then((d) => setSubmissions(d.submissions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const insights = useMemo(() => {
    if (submissions.length === 0) return null;

    const allL1: MappingRow[] = submissions.flatMap((s) => Array.isArray(s.layer1_mapping) ? s.layer1_mapping : []);
    const allL2: Layer2Row[] = submissions.flatMap((s) => Array.isArray(s.layer2_mapping) ? s.layer2_mapping : []);
    const allRows = [...allL1, ...allL2];

    // Tools — split by comma to handle "ChatGPT, Claude, Gemini" as separate tools
    const splitTools = (raw: string): string[] =>
      raw.split(/[,،、;／/]/).map((t) => t.trim()).filter(Boolean);

    const toolCount: Record<string, number> = {};
    const catCount: Record<string, number> = {};
    allRows.forEach((r) => {
      const raw = (r.aiTool ?? "").trim();
      if (!raw) return;
      splitTools(raw).forEach((tool) => {
        toolCount[tool] = (toolCount[tool] || 0) + 1;
        const cat = categorizeTool(tool);
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
    });
    const topTools = Object.entries(toolCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, count]) => ({ name, count, cat: categorizeTool(name) }));
    const toolsUnique = Object.keys(toolCount).length;
    const catTotal = Math.max(1, Object.values(catCount).reduce((a, b) => a + b, 0));
    const cats = Object.keys(CAT_META).map((k) => ({
      key: k, ...CAT_META[k], count: catCount[k] || 0,
      pct: Math.round((catCount[k] || 0) / catTotal * 100),
    })).sort((a, b) => b.count - a.count);

    // Dimensions (Layer 1)
    const dimCount: Record<string, number> = {};
    const dimPrograms: Record<string, Set<string>> = {};
    allL1.forEach((r, i) => {
      if (!r.dimension) return;
      dimCount[r.dimension] = (dimCount[r.dimension] || 0) + 1;
      if (!dimPrograms[r.dimension]) dimPrograms[r.dimension] = new Set();
      const subIdx = Math.floor(i / Math.max(1, allL1.length / submissions.length));
      dimPrograms[r.dimension].add(String(subIdx));
    });
    const dimMax = Math.max(1, ...DIM_KEYS.map((k) => dimCount[k] || 0));
    const dims = DIM_KEYS.map((k) => ({
      key: k, name: DIM_NAMES[k] || k,
      count: dimCount[k] || 0,
      pct: Math.round((dimCount[k] || 0) / dimMax * 100),
      programs: dimPrograms[k]?.size || 0,
    }));

    // Heatmap (autonomy × year)
    const levelKeys = [
      { key: "freeZone",  label: "AI Free Zone" },
      { key: "consulted", label: "AI Consulted" },
      { key: "assisted",  label: "AI Assisted" },
      { key: "generated", label: "AI Generated" },
    ];
    const heat: Record<string, Record<number, number>> = {};
    let heatMax = 1;
    levelKeys.forEach(({ key }) => { heat[key] = { 1: 0, 2: 0, 3: 0, 4: 0 }; });
    allRows.forEach((r) => {
      const yr = parseInt(String((r as MappingRow).year || 0));
      if (![1, 2, 3, 4].includes(yr)) return;
      levelKeys.forEach(({ key }) => {
        if ((r as unknown as Record<string, unknown>)[key]) {
          heat[key][yr]++;
          heatMax = Math.max(heatMax, heat[key][yr]);
        }
      });
    });

    // Composition
    const apply = allL1.filter((r) => r.competency?.toLowerCase().includes("apply")).length;
    const create = allL1.filter((r) => r.competency?.toLowerCase().includes("create")).length;
    const school = allL2.filter((r) => r.sector === "school").length;
    const industry = allL2.filter((r) => r.sector === "industry").length;

    // Ranking
    const ranking = submissions.map((s) => {
      const l1 = Array.isArray(s.layer1_mapping) ? s.layer1_mapping : [];
      const l2 = Array.isArray(s.layer2_mapping) ? s.layer2_mapping : [];
      const all = [...l1, ...l2];
      const l1Done = isDone(s.layer1_mapping, 1);
      const l2Done = isDone(s.layer2_mapping, 2);
      const completeness = ((l1.length > 0 ? (l1.filter(r => r.courseName?.trim()).length / l1.length) : 0) +
                            (l2.length > 0 ? (l2.filter(r => r.competency?.trim() || r.courseName?.trim()).length / l2.length) : 0)) / 2;
      const dims = new Set(l1.map((r) => r.dimension).filter(Boolean));
      const dimCov = dims.size / 4;
      const depthVals = all.map((r) => {
        const rv = r as unknown as Record<string, unknown>;
        if (rv.generated) return 1.0;
        if (rv.assisted) return 0.8;
        if (rv.consulted) return 0.5;
        if (rv.freeZone) return 0.25;
        return 0.25;
      });
      const depth = depthVals.length ? depthVals.reduce((a, b) => a + b, 0) / depthVals.length : 0;
      const allToolNames = all.flatMap((r) => splitTools((r as MappingRow).aiTool || ""));
      const toolCats = new Set(allToolNames.map((t) => categorizeTool(t)).filter(Boolean));
      const toolDiv = Math.min(1, toolCats.size / 5);
      const ind = l2.length ? l2.filter((r) => r.sector === "industry").length / l2.length : 0;
      const score = Math.round((completeness * 0.4 + dimCov * 0.2 + depth * 0.2 + toolDiv * 0.1 + ind * 0.1) * 100);
      const topCatCounts: Record<string, number> = {};
      allToolNames.forEach((t) => { const c = categorizeTool(t); topCatCounts[c] = (topCatCounts[c] || 0) + 1; });
      const topCat = Object.entries(topCatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "llm";
      const flags: string[] = [];
      if (!dims.has("ethics")) flags.push("no-ethics");
      if (!all.some((r) => (r as unknown as Record<string, unknown>).generated)) flags.push("shallow");
      if (!l1Done || !l2Done) flags.push("incomplete");
      return {
        id: s.id, refId: s.ref_id ?? "—",
        program: s.program_name,
        faculty: s.faculty_name.replace(/^คณะ/, ""),
        score, topCat,
        toolsU: new Set(allToolNames).size,
        flags,
        factors: { completeness, dimCoverage: dimCov, depth, toolDiv, industry: ind },
      };
    }).sort((a, b) => b.score - a.score);

    // Gap flags
    const flagDefs: Record<string, { kind: string; label: string }> = {
      "no-ethics":  { kind: "warn", label: "ยังไม่ได้แมพมิติจริยธรรม (Ethics of AI)" },
      "shallow":    { kind: "info", label: "ยังไม่มีการใช้ AI ระดับ Generated — ความลึกยังจำกัด" },
      "incomplete": { kind: "info", label: "แมพยังไม่ครบทุกรายวิชา" },
    };
    const flags: { kind: string; label: string; program: string; faculty: string }[] = [];
    ranking.forEach((p) => p.flags.forEach((fk) => flags.push({ kind: flagDefs[fk]?.kind || "info", label: flagDefs[fk]?.label || fk, program: p.program, faculty: p.faculty })));
    flags.sort((a, b) => (a.kind === "warn" ? -1 : 1) - (b.kind === "warn" ? -1 : 1));

    // Score methodology
    const FACTOR_DEFS = [
      { key: "completeness", label: "ความครบของการแมพ",       weight: 40, desc: "รายวิชาที่แมพแล้ว เทียบกับรายวิชาทั้งหมด" },
      { key: "dimCoverage",  label: "ความครอบคลุมมิติ",         weight: 20, desc: "แมพครบทั้ง 4 มิติ UNESCO หรือไม่" },
      { key: "depth",        label: "ความลึกของการใช้ AI",      weight: 20, desc: "ระดับ Consulted → Assisted → Generated" },
      { key: "toolDiv",      label: "ความหลากหลายของเครื่องมือ", weight: 10, desc: "จำนวนกลุ่มเครื่องมือ AI ที่ใช้ (จาก 5 กลุ่ม)" },
      { key: "industry",     label: "การเชื่อมโยงอุตสาหกรรม",  weight: 10, desc: "สัดส่วนสมรรถนะจาก Industry ใน Layer 2" },
    ];
    const scoreFactors = FACTOR_DEFS.map((d) => ({
      ...d,
      avg: ranking.length ? Math.round(ranking.reduce((s, p) => s + (p.factors[d.key as keyof typeof p.factors] || 0), 0) / ranking.length * 100) : 0,
    }));

    const readinessPct = ranking.length ? Math.round(ranking.reduce((s, p) => s + p.score, 0) / ranking.length) : 0;
    const fullyMapped = submissions.filter((s) => isDone(s.layer1_mapping, 1) && isDone(s.layer2_mapping, 2)).length;
    const embedCount = allL1.length + allL2.length;
    const faculties = new Set(submissions.map((s) => s.faculty_name)).size;

    // ── University coverage ──────────────────────────────────────────────────
    const totalPrograms = Object.values(FACULTY_PROGRAMS).reduce((s, v) => s + v.length, 0);
    const coveragePct = Math.round(submissions.length / totalPrograms * 100);

    // ── Faculty-level summary ────────────────────────────────────────────────
    const facultyMap: Record<string, {
      name: string; key: string; submitted: number; total: number;
      approved: number; pending: number; changes: number;
      l1Done: number; l2Done: number; scoreSum: number;
    }> = {};
    submissions.forEach((s) => {
      const key = s.faculty_name.replace(/^คณะ/, "");
      if (!facultyMap[key]) {
        facultyMap[key] = {
          name: s.faculty_name, key,
          submitted: 0, total: FACULTY_PROGRAMS[key]?.length ?? 0,
          approved: 0, pending: 0, changes: 0,
          l1Done: 0, l2Done: 0, scoreSum: 0,
        };
      }
      const f = facultyMap[key];
      f.submitted++;
      if (s.status === "approved") f.approved++;
      else if (s.status === "pending") f.pending++;
      else if (s.status === "changes") f.changes++;
      if (isDone(s.layer1_mapping, 1)) f.l1Done++;
      if (isDone(s.layer2_mapping, 2)) f.l2Done++;
    });
    ranking.forEach((p) => {
      const key = p.faculty;
      if (facultyMap[key]) facultyMap[key].scoreSum += p.score;
    });
    const facultySummary = Object.values(facultyMap).map((f) => ({
      ...f,
      avgScore: f.submitted > 0 ? Math.round(f.scoreSum / f.submitted) : 0,
      coverPct: f.total > 0 ? Math.round(f.submitted / f.total * 100) : 0,
    })).sort((a, b) => b.avgScore - a.avgScore);

    return { topTools, cats, dims, heat: { levels: levelKeys, years: [1, 2, 3, 4], data: heat, max: heatMax }, composition: { apply, create, school, industry }, ranking, flags, scoreFactors, facultySummary, coverage: { submitted: submissions.length, total: totalPrograms, pct: coveragePct }, headline: { curricula: submissions.length, fullyMapped, embedCount, toolsUnique, faculties, readinessPct } };
  }, [submissions]);

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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
              Executive Insights
            </span>
          </div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="topbar__nav">
          <a href="/approver">คำขออนุมัติ</a>
          <a href="/approver/mapping">Curriculum Mapping</a>
          <a href="/approver/insights" className="is-active">Executive Insights</a>
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 60px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Page head */}
        <div className="page-head">
          <div>
            <div className="page-head__crumbs">ระบบ AI-Ready Curriculum &nbsp;›&nbsp; <span>Executive Insights</span></div>
            <h1 className="page-head__title">ภาพรวมความพร้อม AI-Ready ของหลักสูตร</h1>
            <p className="page-head__desc">สรุป insight จากการแมพ Layer 1 (UNESCO) และ Layer 2 (School &amp; Industry) ของทุกหลักสูตร — เครื่องมือ AI ที่ใช้ ความลึกของสมรรถนะ และช่องว่างที่ควรติดตาม</p>
          </div>
          <div className="page-head__meta">
            <b>AI-Ready Score เฉลี่ย</b>
            <span style={{ fontSize: 30, fontWeight: 700, color: "#1a4f8a", fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1.1, display: "block", margin: "2px 0" }}>
              {insights?.headline.readinessPct ?? 0}%
            </span>
            ความสมบูรณ์ของการแมพทั้ง 2 Layer
          </div>
        </div>

        {/* No data state */}
        {!insights ? (
          <div className="empty" style={{ padding: 60 }}>
            <div className="empty__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#14202e", marginBottom: 4 }}>ยังไม่มีข้อมูลการ Mapping</div>
            <div>เมื่อหลักสูตรเริ่มกรอกข้อมูล Layer 1 และ Layer 2 insights จะปรากฏที่นี่</div>
          </div>
        ) : (
          <>
            {/* Headline stats */}
            <div className="stats">
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, label: "หลักสูตร AI-Ready", value: `${insights.headline.fullyMapped}/${insights.headline.curricula}`, sub: "แมพครบทั้ง 2 Layer", color: "#137a4a", bg: "#e6f4ec" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>, label: "จุดฝัง AI ในรายวิชา", value: insights.headline.embedCount, sub: "course × competency mappings", color: "#1a4f8a", bg: "#eef4fb" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, label: "เครื่องมือ AI ที่ใช้", value: insights.headline.toolsUnique, sub: "unique tools ทั้งระบบ", color: "#6a3eb5", bg: "#f3ecfb" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>, label: "คณะที่เข้าร่วม", value: insights.headline.faculties, sub: `${insights.headline.curricula} หลักสูตร`, color: "#b6620e", bg: "#fcf3e1" },
              ].map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            {/* University Coverage */}
            <div className="ins-card" style={{ flexDirection: "row", alignItems: "center", gap: 32, padding: "18px 24px" }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>ความครอบคลุมหลักสูตรระดับมหาวิทยาลัย</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#1a4f8a", fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1 }}>{insights.coverage.submitted}</span>
                  <span style={{ fontSize: 16, color: "#677889" }}>/ {insights.coverage.total} หลักสูตร</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: insights.coverage.pct >= 80 ? "#137a4a" : insights.coverage.pct >= 50 ? "#a86a14" : "#1a4f8a", fontFamily: "'IBM Plex Sans', sans-serif" }}>({insights.coverage.pct}%)</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#8b99a8", marginTop: 4 }}>ส่งข้อมูลเข้าระบบแล้ว จากทั้งหมด {insights.coverage.total} หลักสูตรในมหาวิทยาลัย</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 14, background: "#eef1f6", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: insights.coverage.pct + "%", background: insights.coverage.pct >= 80 ? "#137a4a" : insights.coverage.pct >= 50 ? "#a86a14" : "#1a4f8a", borderRadius: 8, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11.5, color: "#8b99a8" }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Faculty Summary */}
            <InsCard
              title="สรุปภาพรวมรายคณะ"
              icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/><path d="M9 9v.01M15 9v.01"/></svg>}
              sub="ความครอบคลุม AI-Ready ของแต่ละคณะ — เรียงตาม AI-Ready Score เฉลี่ย"
            >
              <table className="rank-tbl">
                <thead>
                  <tr>
                    <th>คณะ</th>
                    <th style={{ width: 160 }}>ความครอบคลุม</th>
                    <th style={{ width: 80, textAlign: "center" }}>Layer 1</th>
                    <th style={{ width: 80, textAlign: "center" }}>Layer 2</th>
                    <th style={{ width: 80, textAlign: "center" }}>อนุมัติ</th>
                    <th style={{ width: 170 }}>AI-Ready Score เฉลี่ย</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.facultySummary.map((f) => (
                    <tr key={f.key}>
                      <td>
                        <div className="rank__prog" style={{ fontSize: 13.5 }}>{f.name}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 7, background: "#eef1f6", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: f.coverPct + "%", background: f.coverPct >= 80 ? "#137a4a" : f.coverPct >= 50 ? "#a86a14" : "#1a4f8a", borderRadius: 4 }} />
                          </div>
                          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#3a4859", whiteSpace: "nowrap" }}>{f.submitted}/{f.total} ({f.coverPct}%)</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 700, color: f.l1Done === f.submitted ? "#137a4a" : "#a86a14" }}>{f.l1Done}/{f.submitted}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 700, color: f.l2Done === f.submitted ? "#137a4a" : "#a86a14" }}>{f.l2Done}/{f.submitted}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 700, color: f.approved === f.submitted ? "#137a4a" : "#677889" }}>{f.approved}/{f.submitted}</span>
                      </td>
                      <td>
                        <div className="rank__score">
                          <span className="rank__score-track"><span className="rank__score-fill" style={{ width: f.avgScore + "%", background: scoreColor(f.avgScore) }} /></span>
                          <span className="rank__score-val" style={{ color: scoreColor(f.avgScore) }}>{f.avgScore}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InsCard>

            {/* Tools + Donut */}
            <div className="ins-grid">
              {/* Top Tools */}
              <InsCard
                title="เครื่องมือ AI ที่ใช้มากที่สุด"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
                sub={`รวมจากทุกหลักสูตร · เครื่องมือทั้งหมด ${insights.headline.toolsUnique} ตัว`}
              >
                {insights.topTools.length === 0 ? (
                  <div style={{ color: "#8b99a8", fontSize: 13 }}>ยังไม่มีข้อมูลเครื่องมือ</div>
                ) : (
                  <div className="lead">
                    {insights.topTools.map((t) => {
                      const max = insights.topTools[0]?.count || 1;
                      return (
                        <div className="lead__row" key={t.name}>
                          <span className="lead__name">
                            <span className="lead__dot" style={{ background: CAT_META[t.cat]?.color || "#4b5868" }} />
                            {t.name}
                          </span>
                          <span className="lead__track"><span className="lead__fill" style={{ width: (t.count / max * 100) + "%", background: CAT_META[t.cat]?.color || "#4b5868" }} /></span>
                          <span className="lead__val">{t.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </InsCard>

              {/* Donut */}
              <InsCard
                title="สัดส่วนตามประเภทเครื่องมือ"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>}
                sub="หลักสูตรพึ่งพาเครื่องมือกลุ่มใดมากที่สุด"
              >
                {insights.cats.every((c) => c.count === 0) ? (
                  <div style={{ color: "#8b99a8", fontSize: 13 }}>ยังไม่มีข้อมูล</div>
                ) : (() => {
                  const total = Math.max(1, insights.cats.reduce((s, c) => s + c.count, 0));
                  let acc = 0;
                  const stops = insights.cats.filter((c) => c.count > 0).map((c) => {
                    const start = acc / total * 360;
                    acc += c.count;
                    return `${c.color} ${start}deg ${acc / total * 360}deg`;
                  }).join(", ");
                  const top = insights.cats[0];
                  return (
                    <div className="donut-wrap">
                      <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
                        <div className="donut__center">
                          <div>
                            <div className="donut__num">{top.pct}%</div>
                            <div className="donut__lbl">{top.label}</div>
                          </div>
                        </div>
                      </div>
                      <div className="donut-legend">
                        {insights.cats.map((c) => (
                          <div className="donut-legend__row" key={c.key}>
                            <span className="donut-legend__sw" style={{ background: c.color }} />
                            <span className="donut-legend__name">{c.label}</span>
                            <span className="donut-legend__val">{c.count}<span className="donut-legend__pct">({c.pct}%)</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </InsCard>
            </div>

            {/* Dimension + Heatmap */}
            <div className="ins-grid">
              {/* Dimension */}
              <InsCard
                title="ความครอบคลุมมิติสมรรถนะ (UNESCO Layer 1)"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>}
                sub="จำนวนการแมพในแต่ละมิติ และจำนวนหลักสูตรที่ครอบคลุม"
              >
                <div className="dim">
                  {insights.dims.map((d) => (
                    <div className={`dim__row${d.count === 0 ? " is-zero" : ""}`} key={d.key}>
                      <div className="dim__top">
                        <span className="dim__name">{d.name}</span>
                        <span className="dim__meta"><b>{d.count}</b> mappings · <b>{d.programs}</b>/{insights.headline.curricula} หลักสูตร</span>
                      </div>
                      <span className="dim__track"><span className="dim__fill" style={{ width: Math.max(d.pct, d.count === 0 ? 0 : 4) + "%" }} /></span>
                    </div>
                  ))}
                </div>
              </InsCard>

              {/* Heatmap */}
              <InsCard
                title="ระดับการใช้ AI ตามชั้นปี"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
                sub="ดูว่าระดับการใช้ AI ของนักศึกษาไล่ลึกขึ้นตามชั้นปีหรือไม่"
              >
                <div className="heat__colhead">
                  <span>ระดับการใช้ AI</span>
                  {insights.heat.years.map((y) => <span key={y}>ปี {y}</span>)}
                </div>
                <div className="heat">
                  {insights.heat.levels.map(({ key, label }) => (
                    <div className="heat__row" key={key}>
                      <span className="heat__rowlabel">{label}</span>
                      {insights.heat.years.map((y) => {
                        const n = insights.heat.data[key]?.[y] || 0;
                        const a = n === 0 ? 0 : 0.12 + (n / insights.heat.max) * 0.78;
                        return (
                          <span key={y} className="heat__cell" style={{ background: n === 0 ? "var(--ink-50)" : `rgba(26,79,138,${a.toFixed(2)})`, color: n / insights.heat.max > 0.5 ? "#fff" : "var(--ink-700)", borderColor: n === 0 ? "var(--ink-100)" : "transparent" }}>
                            {n || ""}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="heat__legend">
                  น้อย
                  <span className="heat__scale">
                    {[0.12, 0.35, 0.58, 0.8, 0.95].map((a, i) => <span key={i} className="heat__swatch" style={{ background: `rgba(26,79,138,${a})` }} />)}
                  </span>
                  มาก
                </div>
              </InsCard>
            </div>

            {/* Composition + Flags */}
            <div className="ins-grid">
              {/* Composition */}
              <InsCard
                title="โครงสร้างสมรรถนะ"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"/></svg>}
                sub="ระดับ Apply / Create และที่มา School / Industry"
              >
                {(() => {
                  const { apply, create, school, industry } = insights.composition;
                  const t1 = Math.max(1, apply + create), t2 = Math.max(1, school + industry);
                  return (
                    <div className="comp">
                      <div className="comp__block">
                        <span className="comp__label">ระดับสมรรถนะ (UNESCO Layer 1)</span>
                        <div className="comp__bar">
                          <span className="comp__seg" style={{ width: (apply / t1 * 100) + "%", background: "#137a4a" }}>Apply<b>{Math.round(apply / t1 * 100)}%</b></span>
                          <span className="comp__seg" style={{ width: (create / t1 * 100) + "%", background: "#6a3eb5" }}>Create<b>{Math.round(create / t1 * 100)}%</b></span>
                        </div>
                      </div>
                      <div className="comp__block">
                        <span className="comp__label">ที่มาของสมรรถนะ (Layer 2)</span>
                        <div className="comp__bar">
                          <span className="comp__seg" style={{ width: (school / t2 * 100) + "%", background: "#1a4f8a" }}>School<b>{Math.round(school / t2 * 100)}%</b></span>
                          <span className="comp__seg" style={{ width: (industry / t2 * 100) + "%", background: "#b6620e" }}>Industry<b>{Math.round(industry / t2 * 100)}%</b></span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </InsCard>

              {/* Gap Flags */}
              <InsCard
                title="ประเด็นที่ควรพิจารณา"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                sub={`${insights.flags.length} รายการ — ช่องว่างเชิงคุณภาพที่ควรติดตาม`}
              >
                {insights.flags.length === 0 ? (
                  <div style={{ color: "#137a4a", fontSize: 13, fontWeight: 600 }}>✓ ไม่พบประเด็นที่ต้องติดตาม</div>
                ) : (
                  <div className="flags">
                    {insights.flags.map((f, i) => (
                      <div className={`flag flag--${f.kind}`} key={i}>
                        <span className="flag__icon">
                          {f.kind === "warn"
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
                        </span>
                        <div className="flag__body">
                          <div className="flag__txt">{f.label}</div>
                          <div className="flag__prog">{f.program} · {f.faculty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </InsCard>
            </div>

            {/* Score Methodology */}
            <div className="ins-grid ins-grid--ranking">
              <InsCard
                title="AI-Ready Score คำนวณอย่างไร"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
              >
                <div className="method__intro">
                  <b>AI-Ready Score</b> เป็นคะแนนผสม (composite) 0–100 ที่รวม <b>คุณภาพและความลึก</b> ของการออกแบบหลักสูตร
                  <span className="method__formula">Score = (ความครบ × 40%) + (ครอบคลุมมิติ × 20%) + (ความลึก × 20%) + (หลากหลายเครื่องมือ × 10%) + (เชื่อมอุตสาหกรรม × 10%)</span>
                </div>
                <div className="method-grid">
                  {insights.scoreFactors.map((f) => (
                    <div className="method-f" key={f.key}>
                      <span className="method-f__w">{f.weight}%</span>
                      <div className="method-f__name">{f.label}</div>
                      <div className="method-f__desc">{f.desc}</div>
                      <div className="method-f__avg">
                        <div className="method-f__avg-top">ค่าเฉลี่ยรวม<b>{f.avg}%</b></div>
                        <span className="method-f__track"><span className="method-f__fill" style={{ width: f.avg + "%" }} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </InsCard>
            </div>

            {/* Ranking */}
            <div className="ins-grid ins-grid--ranking">
              <InsCard
                title="ความพร้อม AI-Ready รายหลักสูตร"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>}
                sub="คะแนนความสมบูรณ์ของการแมพ · เครื่องมือที่ใช้ · ประเด็นที่พบ"
              >
                <table className="rank-tbl">
                  <thead>
                    <tr>
                      <th>หลักสูตร / คณะ</th>
                      <th style={{ width: 150 }}>กลุ่มเครื่องมือหลัก</th>
                      <th style={{ width: 90 }}>เครื่องมือ</th>
                      <th style={{ width: 180 }}>AI-Ready Score</th>
                      <th style={{ width: 90 }}>ประเด็น</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.ranking.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="rank__prog">{p.program}</div>
                          <div className="rank__fac">{p.faculty}</div>
                        </td>
                        <td>
                          <span className="rank__cat">
                            <span className="lead__dot" style={{ background: CAT_META[p.topCat]?.color || "#4b5868" }} />
                            {CAT_META[p.topCat]?.label || "—"}
                          </span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, color: "#3a4859" }}>{p.toolsU} ตัว</td>
                        <td>
                          <div className="rank__score">
                            <span className="rank__score-track"><span className="rank__score-fill" style={{ width: p.score + "%", background: scoreColor(p.score) }} /></span>
                            <span className="rank__score-val" style={{ color: scoreColor(p.score) }}>{p.score}%</span>
                          </div>
                        </td>
                        <td>
                          {p.flags.length === 0
                            ? <div className="rank__flags"><span className="rank__flag-ok">✓</span></div>
                            : <div className="rank__flags">{p.flags.map((fk, i) => <span key={i} className={`rank__flag-dot ${fk === "no-ethics" ? "is-warn" : "is-info"}`} title={fk} />)}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InsCard>
            </div>
          </>
        )}

        {/* ── Claude AI Insights divider ───────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0 4px" }}>
          <div style={{ flex: 1, height: 1, background: "#dde3eb" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "#f3ecfb", border: "1px solid #d8c8f4", borderRadius: 20, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a3eb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="6" r="3" fill="#6a3eb5" stroke="none"/></svg>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6a3eb5" }}>Claude AI Insights</span>
            <span style={{ fontSize: 11, color: "#9b7ed4", borderLeft: "1px solid #d8c8f4", paddingLeft: 8 }}>
              จากข้อมูล {INSIGHTS_FACULTY_TOTAL} คน · {INSIGHTS_PROGRAMS_TOTAL} หลักสูตร · อัปเดต {INSIGHTS_GENERATED_AT}
            </span>
          </div>
          <div style={{ flex: 1, height: 1, background: "#dde3eb" }} />
        </div>

        {/* Executive Summary */}
        <div className="ins-card" style={{ borderLeft: "3px solid #6a3eb5" }}>
          <div className="ins-card__head">
            <h2 className="ins-card__title" style={{ color: "#6a3eb5" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Executive Summary
            </h2>
            <div className="ins-card__sub">สรุปภาพรวมความพร้อม AI ของมหาวิทยาลัย — ประมวลผลโดย Claude AI</div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.85, color: "#3a4859", whiteSpace: "pre-line" }}>{executiveSummary}</div>
        </div>

        {/* Development Themes + Support Needs */}
        <div className="ins-grid">
          {/* Development Themes */}
          <InsCard
            title="ธีมที่อาจารย์อยากพัฒนา"
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
            sub={`วิเคราะห์จากคำตอบ qb ของอาจารย์ ${INSIGHTS_FACULTY_TOTAL} คน`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {developmentThemes.map((t) => (
                <div key={t.theme}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#14202e" }}>{t.theme}</span>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 700, color: t.color }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: "#eef1f6", borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ height: "100%", width: t.pct + "%", background: t.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#677889", lineHeight: 1.5 }}>{t.description}</div>
                </div>
              ))}
            </div>
          </InsCard>

          {/* Support Needs */}
          <InsCard
            title="สิ่งที่อาจารย์ต้องการจากมหาวิทยาลัย"
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}
            sub="วิเคราะห์จากคำตอบ qc — เรียงตาม priority"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {supportNeeds.map((s) => (
                <div key={s.need} style={{ padding: "10px 12px", borderRadius: 8, background: s.priority === "urgent" ? "#fff5f5" : "#f6f8fb", border: `1px solid ${s.priority === "urgent" ? "#f0c0c0" : "#dde3eb"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: s.priority === "urgent" ? "#b53030" : "#677889", color: "#fff" }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#14202e" }}>{s.need}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#677889", lineHeight: 1.5, marginBottom: 6 }}>{s.description}</div>
                  <div style={{ fontSize: 11.5, color: "#8b99a8", fontStyle: "italic", borderLeft: "2px solid #dde3eb", paddingLeft: 8 }}>
                    &ldquo;{s.quote}&rdquo; — {s.quoteFrom}
                  </div>
                </div>
              ))}
            </div>
          </InsCard>
        </div>

        {/* Competency Patterns + UNESCO Gap */}
        <div className="ins-grid">
          {/* Competency Patterns */}
          <InsCard
            title="Pattern สมรรถนะ AI ในหลักสูตร"
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-6"/></svg>}
            sub={`วิเคราะห์จาก ${INSIGHTS_PROGRAMS_TOTAL} หลักสูตร — จัดกลุ่มสมรรถนะที่คล้ายกัน`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {competencyPatterns.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#14202e" }}>{p.name}</span>
                      <span style={{ fontSize: 11.5, color: "#8b99a8", marginLeft: 8 }}>{p.years}</span>
                    </div>
                    <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, fontWeight: 700, color: p.color, whiteSpace: "nowrap" }}>{p.count}/{p.total}</span>
                  </div>
                  <div style={{ height: 7, background: "#eef1f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: p.pct + "%", background: p.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </InsCard>

          {/* UNESCO Gap Analysis */}
          <InsCard
            title="ช่องว่าง UNESCO 4 มิติ"
            icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            sub="ความครอบคลุมมิติ UNESCO ในเนื้อหาสมรรถนะ"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {unescoGapAnalysis.dimensions.map((d) => (
                <div key={d.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#14202e" }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: d.status === "weak" ? "#fff0f0" : d.status === "good" ? "#eef4fb" : "#e6f4ec", color: d.color }}>{d.label}</span>
                  </div>
                  <div style={{ height: 8, background: "#eef1f6", borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", width: d.strength + "%", background: d.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#677889" }}>{d.note}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 12px", background: "#fff8e6", border: "1px solid #f0d080", borderRadius: 8, fontSize: 12.5, color: "#8a5800", lineHeight: 1.6 }}>
              💡 {unescoGapAnalysis.recommendation}
            </div>
          </InsCard>
        </div>

        {/* Curriculum Character */}
        <InsCard
          title="ลักษณะหลักสูตรรายคณะ"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>}
          sub="สรุปแนวทาง AI ของแต่ละคณะ — ประมวลผลจากชื่อและรายละเอียดสมรรถนะ"
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {curriculumCharacter.map((f) => (
              <div key={f.faculty} style={{ border: `1px solid ${f.color}30`, borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${f.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#14202e" }}>{f.faculty}</div>
                    <div style={{ fontSize: 11.5, color: f.color, fontWeight: 600, marginTop: 1 }}>{f.character} · {f.programs} หลักสูตร</div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: "#3a4859", lineHeight: 1.6, marginBottom: 10 }}>{f.description}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {f.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: f.color + "15", color: f.color, fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InsCard>

        {/* Tools Gap */}
        <InsCard
          title="ช่องว่าง AI Tools — สอนอยู่ vs อยากได้"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
          sub="เปรียบเทียบ tools ในหลักสูตร กับ tools ที่อาจารย์ต้องการจากมหาวิทยาลัย"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Tools ในหลักสูตรปัจจุบัน</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {toolsGap.inCurriculum.map((t) => (
                  <div key={t.name} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5 }}>
                    <span style={{ color: "#1a4f8a", flexShrink: 0, marginTop: 2 }}>•</span>
                    <div>
                      <span style={{ fontWeight: 600, color: "#14202e" }}>{t.name}</span>
                      <span style={{ color: "#8b99a8", marginLeft: 6 }}>{t.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#677889", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Tools ที่อาจารย์ต้องการ</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {toolsGap.wantedByFaculty.map((t) => (
                  <div key={t.name} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5 }}>
                    <span style={{ color: t.urgent ? "#b53030" : "#677889", flexShrink: 0, marginTop: 2 }}>{t.urgent ? "▲" : "•"}</span>
                    <div>
                      <span style={{ fontWeight: 600, color: t.urgent ? "#b53030" : "#14202e" }}>{t.name}</span>
                      <span style={{ color: "#8b99a8", marginLeft: 6 }}>{t.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", background: "#eef4fb", border: "1px solid #c5d9f0", borderRadius: 8, fontSize: 13, color: "#1a4f8a", lineHeight: 1.6 }}>
            🔍 {toolsGap.keyGap}
          </div>
        </InsCard>

        <div style={{ textAlign: "center", fontSize: 12, color: "#8b99a8", marginTop: 8 }}>
          ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ
        </div>
      </main>
    </div>
  );
}
