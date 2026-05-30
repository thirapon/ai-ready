"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { Topbar } from "@/components/app/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "none" | "draft" | "pending" | "changes" | "approved";

interface Submission {
  status: Status;
  ref_id: string | null;
  version: number;
  approver_comment: string | null;
  submitted_at: string | null;
  last_saved: string | null;
}

interface Session {
  role: string;
  code: string;
  name: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  none:     { label: "ยังไม่เริ่ม", color: "#677889", bg: "#eef1f5", border: "#dde3eb" },
  draft:    { label: "ฉบับร่าง",    color: "#677889", bg: "#eef1f5", border: "#dde3eb" },
  pending:  { label: "รออนุมัติ",   color: "#a86a14", bg: "#fcf3e1", border: "#f0dca6" },
  changes:  { label: "ต้องแก้ไข",  color: "#b53030", bg: "#fdecec", border: "#f4d0d0" },
  approved: { label: "อนุมัติแล้ว", color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className="hpill" style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      <span className="hpill__dot" />
      {c.label}
    </span>
  );
}

function JourneyIcon({ state }: { state: "done" | "active" | "locked" }) {
  if (state === "done") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
  if (state === "locked") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  );
  return null;
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Read session from localStorage
  useEffect(() => {
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }

    try {
      const sess: Session = JSON.parse(raw);
      if (sess.role !== "faculty") { router.replace("/login"); return; }
      setSession(sess);

      // Fetch submission status
      fetch(`/api/submissions?facultyCode=${encodeURIComponent(sess.code)}`)
        .then((r) => r.json())
        .then((d) => setSubmission(d.submission))
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!session || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    );
  }

  const curStatus: Status = (submission?.status as Status) ?? "none";
  const approved = curStatus === "approved";

  // Journey states
  const approvalState = approved ? "done" : "active";
  const l1State = !approved ? "locked" : "active";
  const l2State = !approved ? "locked" : "locked"; // unlocks after L1 approved

  // Action label for approval card
  const approvalBtnLabel =
    curStatus === "changes"  ? "แก้ไขและส่งใหม่" :
    curStatus === "pending"  ? "ดู / แก้ไขคำขอ"  :
    curStatus === "approved" ? "ดูคำขอ"           :
                               "กรอกคำขอ";

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      <Topbar facultyName={session.name} />

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero__greet">ยินดีต้อนรับกลับ</div>
          <h1 className="home-hero__title">{session.name}</h1>
          <p className="home-hero__sub">
            ติดตามสถานะคำขออนุมัติ AI-Ready และการแมพสมรรถนะของหลักสูตรท่านได้ในที่เดียว
          </p>
        </div>

        {/* Journey strip */}
        <div className="journey">
          {[
            { state: approvalState, step: "ขั้นที่ 1", name: "ขออนุมัติ AI-Ready",   num: "1" },
            { state: l1State,       step: "ขั้นที่ 2", name: "Layer 1 · UNESCO",      num: "2" },
            { state: l2State,       step: "ขั้นที่ 3", name: "Layer 2 · Industry",    num: "3" },
          ].map((item, i) => (
            <>
              <div key={item.step} className={`jstep is-${item.state}`}>
                <div className="jstep__dot">
                  {item.state === "active" ? (
                    <b style={{ fontSize: 15 }}>{item.num}</b>
                  ) : (
                    <JourneyIcon state={item.state as "done" | "locked"} />
                  )}
                </div>
                <div>
                  <div className="jstep__label">{item.step}</div>
                  <div className="jstep__name">{item.name}</div>
                </div>
              </div>
              {i < 2 && (
                <div key={`line-${i}`} className={`jline${item.state === "done" ? " is-done" : ""}`} />
              )}
            </>
          ))}
        </div>

        {/* Cards */}
        <div className="home-cards">

          {/* ── Approval card (full width) ── */}
          <div className="hcard hcard--wide">
            <div className="hcard__ribbon" />
            <div className="hcard__head">
              <div className="hcard__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15l2 2 4-4"/>
                </svg>
              </div>
              <div className="hcard__title-row">
                <div className="hcard__eyebrow">คำขออนุมัติหลักสูตร · STEP 1</div>
                <h3 className="hcard__title">สถานะคำขอ School/Industry Framework</h3>
              </div>
              <StatusPill status={curStatus} />
            </div>

            {/* Meta */}
            <div className="hcard__meta">
              <div className="hcard__meta-item">
                เลขอ้างอิง
                <b>{submission?.ref_id ?? "ยังไม่ได้ส่ง"}</b>
              </div>
              <div className="hcard__meta-item">
                จำนวนครั้งที่ส่ง
                <b>{(submission?.version ?? 0) > 0 ? `${submission!.version} ครั้ง` : "—"}</b>
              </div>
              <div className="hcard__meta-item">
                อัปเดตล่าสุด
                <b>
                  {submission?.last_saved
                    ? new Date(submission.last_saved).toLocaleDateString("th-TH")
                    : "—"}
                </b>
              </div>
            </div>

            {/* Feedback comment */}
            {curStatus === "changes" && submission?.approver_comment && (
              <div className="hcard__note">
                <b>คณะกรรมการขอแก้ไข:</b> {submission.approver_comment}
              </div>
            )}

            {/* Approved unlock notice */}
            {approved && (
              <div className="hcard__success-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                หลักสูตรผ่านการอนุมัติแล้ว — ปลดล็อกการแมพ Layer 1 และ 2 ด้านล่าง
              </div>
            )}

            <div className="hcard__foot">
              <a
                href="/submit/form"
                className={`hcard__btn${curStatus === "approved" ? " hcard__btn--ghost" : ""}`}
              >
                {approvalBtnLabel}
                <ArrowIcon />
              </a>
            </div>
          </div>

          {/* ── Layer 1 card ── */}
          <LayerCard which={1} unlocked={approved} />

          {/* ── Layer 2 card ── */}
          <LayerCard which={2} unlocked={false} />
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#8b99a8", marginTop: 24 }}>
          ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ
        </div>
      </main>
    </div>
  );
}

// ─── Layer card ───────────────────────────────────────────────────────────────

function LayerCard({ which, unlocked }: { which: 1 | 2; unlocked: boolean }) {
  const isL1 = which === 1;
  const title   = isL1 ? "Layer 1 · UNESCO"              : "Layer 2 · School & Industry";
  const eyebrow = isL1 ? "แมพสมรรถนะมาตรฐานสากล"        : "แมพสมรรถนะเฉพาะคณะ + อุตสาหกรรม";
  const href    = isL1 ? "/mapping/layer1"               : "/mapping/layer2";

  if (!unlocked) {
    return (
      <div className={`hcard hcard--l${which} is-locked`}>
        <div className="hcard__ribbon" style={{ background: "#b9c3cf" }} />
        <div className="hcard__head">
          <div className="hcard__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="hcard__title-row">
            <div className="hcard__eyebrow">{eyebrow}</div>
            <h3 className="hcard__title">{title}</h3>
          </div>
        </div>
        <div className="hcard__lock-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          จะปลดล็อกเมื่อหลักสูตรได้รับการอนุมัติ AI-Ready
        </div>
        <div className="hcard__foot">
          <a href={href} className="hcard__lockbtn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            ดูตัวอย่าง (เดโม)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`hcard hcard--l${which}`}>
      <div className="hcard__ribbon" />
      <div className="hcard__head">
        <div className="hcard__icon">
          {isL1 ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          )}
        </div>
        <div className="hcard__title-row">
          <div className="hcard__eyebrow">{eyebrow}</div>
          <h3 className="hcard__title">{title}</h3>
        </div>
      </div>
      <div className="hcard__foot">
        <a href={href} className="hcard__btn">
          เริ่มแมพ <ArrowIcon />
        </a>
      </div>
    </div>
  );
}
