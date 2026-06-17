"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { Topbar } from "@/components/app/Topbar";

type Status = "none" | "draft" | "pending" | "changes" | "approved";

interface Submission {
  id: string;
  status: Status;
  ref_id: string | null;
  version: number;
  approver_comment: string | null;
  submitted_at: string | null;
  last_saved: string | null;
  layer1_count: number;
  layer2_count: number;
  program_name: string | null;
}

interface Session { role: string; code: string; name: string; }

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  none:     { label: "ยังไม่เริ่ม", color: "#677889", bg: "#eef1f5", border: "#dde3eb" },
  draft:    { label: "ฉบับร่าง",    color: "#677889", bg: "#eef1f5", border: "#dde3eb" },
  pending:  { label: "รออนุมัติ",   color: "#a86a14", bg: "#fcf3e1", border: "#f0dca6" },
  changes:  { label: "ต้องแก้ไข",  color: "#b53030", bg: "#fdecec", border: "#f4d0d0" },
  approved: { label: "อนุมัติแล้ว", color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
};

function StatusPill({ status }: { status: Status }) {
  const c = STATUS_CFG[status];
  return (
    <span className="hpill" style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="hpill__dot" />{c.label}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function JourneyDot({ state }: { state: "done" | "active" | "locked" }) {
  const base: React.CSSProperties = {
    width: 24, height: 24, borderRadius: "50%", display: "inline-flex",
    alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
  };
  if (state === "done")   return <span style={{ ...base, background: "#137a4a", color: "white" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>;
  if (state === "active") return <span style={{ ...base, background: "#1a4f8a", color: "white" }}>●</span>;
  return <span style={{ ...base, background: "#eef1f5", color: "#b9c3cf", border: "1.5px solid #dde3eb" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>;
}

function CurriculumCard({ sub, onAction }: { sub: Submission; onAction: (sub: Submission) => void }) {
  const st       = sub.status;
  const approved = st === "approved";
  const l1Count  = sub.layer1_count ?? 0;
  const l2Count  = sub.layer2_count ?? 0;
  const l1Has    = l1Count > 0;
  const l2Has    = l2Count > 0;

  // Journey dot states
  const approvalState: "done"|"active" = approved ? "done" : "active";
  const l1State: "done"|"active"|"locked" = !approved ? "locked" : l1Has ? "done" : "active";
  const l2State: "done"|"active"|"locked" = !approved ? "locked" : !l1Has ? "locked" : l2Has ? "done" : "active";

  const approvalBtnLabel =
    st === "changes"  ? "แก้ไขและส่งใหม่" :
    st === "pending"  ? "ดู / แก้ไขคำขอ"  :
    st === "approved" ? "ดูคำขอ"           :
    st === "draft"    ? "ทำต่อ"            : "กรอกคำขอ";

  return (
    <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 12, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Head */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eef4fb", color: "#1a4f8a", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#14202e", lineHeight: 1.3, marginBottom: 3 }}>
            {sub.program_name || "ไม่ระบุชื่อหลักสูตร"}
          </div>
          <div style={{ fontSize: 12, color: "#677889" }}>
            {sub.ref_id ? `เลขอ้างอิง: ${sub.ref_id}` : "ยังไม่ได้ส่ง"}
            {sub.version > 0 ? ` · ส่ง ${sub.version} ครั้ง` : ""}
          </div>
        </div>
        <StatusPill status={st} />
      </div>

      {/* Approver feedback */}
      {st === "changes" && sub.approver_comment && (
        <div style={{ background: "#fdecec", border: "1px solid #f4d0d0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#b53030", lineHeight: 1.5 }}>
          <b>คณะกรรมการขอแก้ไข:</b> {sub.approver_comment}
        </div>
      )}

      {/* Journey strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <JourneyDot state={approvalState} />
        <span style={{ fontSize: 11.5, color: "#677889", fontWeight: 600 }}>ขออนุมัติ</span>
        <div style={{ flex: 1, height: 1.5, background: approved ? "#137a4a" : "#dde3eb", borderRadius: 99, maxWidth: 36 }} />

        <JourneyDot state={l1State} />
        <div>
          <span style={{ fontSize: 11.5, color: "#677889", fontWeight: 600 }}>Layer 1</span>
          {l1Has && <span style={{ fontSize: 10.5, color: "#137a4a", marginLeft: 4 }}>({l1Count} รายวิชา)</span>}
        </div>
        <div style={{ flex: 1, height: 1.5, background: l1Has ? "#137a4a" : "#dde3eb", borderRadius: 99, maxWidth: 36 }} />

        <JourneyDot state={l2State} />
        <div>
          <span style={{ fontSize: 11.5, color: "#677889", fontWeight: 600 }}>Layer 2</span>
          {l2Has && <span style={{ fontSize: 10.5, color: "#137a4a", marginLeft: 4 }}>({l2Count} รายวิชา)</span>}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 2 }}>
        {/* Step 1: Approval form */}
        <button
          className={`hcard__btn${approved ? " hcard__btn--ghost" : ""}`}
          style={{ fontSize: 13 }}
          onClick={() => onAction(sub)}
        >
          {approvalBtnLabel} <ArrowIcon />
        </button>

        {/* Step 2: Layer 1 */}
        {approved && (
          <a
            href={`/mapping/layer1?id=${sub.id}`}
            className={`hcard__btn${l1Has ? " hcard__btn--ghost" : ""}`}
            style={{ fontSize: 13, textDecoration: "none" }}
          >
            {l1Has ? `แก้ไข L1 (${l1Count})` : "เริ่มแมพ L1"} <ArrowIcon />
          </a>
        )}

        {/* Step 3: Layer 2 — only unlocks when L1 has data */}
        {approved && l1Has && (
          <a
            href={`/mapping/layer2?id=${sub.id}`}
            className={`hcard__btn${l2Has ? " hcard__btn--ghost" : ""}`}
            style={{ fontSize: 13, textDecoration: "none" }}
          >
            {l2Has ? `แก้ไข L2 (${l2Count})` : "เริ่มแมพ L2"} <ArrowIcon />
          </a>
        )}
        {approved && !l1Has && (
          <span style={{ fontSize: 13, padding: "7px 14px", borderRadius: 8, background: "#f6f8fb", color: "#b9c3cf", border: "1px solid #eef1f6", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            L2 · ทำ L1 ก่อน
          </span>
        )}

        {/* Step 4: Download PDF report — once L1 has data */}
        {approved && l1Has && (
          <a
            href={`/submit/print?id=${sub.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hcard__btn hcard__btn--ghost"
            style={{ fontSize: 13, textDecoration: "none", marginLeft: "auto" }}
            title="พิมพ์หรือดาวน์โหลดรายงานหลักสูตรเป็น PDF"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ดาวน์โหลด PDF
          </a>
        )}
      </div>
    </div>
  );
}

export default function SubmitPage() {
  const router = useRouter();
  const [session, setSession]         = useState<Session | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess: Session = JSON.parse(raw);
      if (sess.role !== "faculty") { router.replace("/login"); return; }
      setSession(sess);

      fetch(`/api/submissions?facultyCode=${encodeURIComponent(sess.code)}`)
        .then((r) => r.ok ? r.json() : { submissions: [] })
        .then((d) => setSubmissions(d.submissions ?? []))
        .catch(() => setSubmissions([]))
        .finally(() => setLoading(false));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleAction = (sub: Submission) => {
    router.push(`/submit/form?id=${sub.id}`);
  };

  if (!session || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      <Topbar facultyName={session.name} />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero__greet">ยินดีต้อนรับกลับ</div>
          <h1 className="home-hero__title">{session.name}</h1>
          <p className="home-hero__sub">จัดการคำขออนุมัติ AI-Ready และการแมพสมรรถนะของทุกหลักสูตรในที่เดียว</p>
        </div>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#14202e" }}>หลักสูตรของคณะ</h2>
            <div style={{ fontSize: 13, color: "#677889", marginTop: 3 }}>
              {submissions.length > 0 ? `${submissions.length} หลักสูตร` : "ยังไม่มีหลักสูตร"}
            </div>
          </div>
          <a href="/submit/form" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <PlusIcon /> เพิ่มหลักสูตรใหม่
          </a>
        </div>

        {/* List */}
        {submissions.length === 0 ? (
          <div style={{ background: "white", border: "1px dashed #dde3eb", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#eef4fb", color: "#1a4f8a", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#14202e", marginBottom: 6 }}>ยังไม่มีหลักสูตร</div>
            <div style={{ fontSize: 13, color: "#677889", marginBottom: 18 }}>เริ่มยื่นคำขออนุมัติหลักสูตรแรกของคณะได้เลย</div>
            <a href="/submit/form" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              <PlusIcon /> เพิ่มหลักสูตรแรก
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {submissions.map((sub) => (
              <CurriculumCard key={sub.id} sub={sub} onAction={handleAction} />
            ))}
          </div>
        )}

        {/* AI Readiness card */}
        <a href="/submit/faculty-readiness" style={{ textDecoration:"none", display:"block", marginTop:28 }}>
          <div style={{ background:"linear-gradient(135deg,#eef4fb 0%,#e6f4ec 100%)", border:"1px solid #b3d4f5", borderRadius:12, padding:"18px 22px", display:"flex", alignItems:"center", gap:16, cursor:"pointer" }}>
            <div style={{ width:42, height:42, borderRadius:10, background:"#1a4f8a", display:"grid", placeItems:"center", flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#14202e" }}>AI Readiness ของคณะ</div>
              <div style={{ fontSize:12, color:"#677889", marginTop:2 }}>ดูสถานะความพร้อม AI ของอาจารย์ในคณะ Development Path และ Support needs</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#677889" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>

        <div style={{ textAlign: "center", fontSize: 12, color: "#8b99a8", marginTop: 20 }}>
          ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ
        </div>
      </main>
    </div>
  );
}
