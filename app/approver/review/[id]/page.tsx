"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = "pending" | "approved" | "changes" | "rejected";
type Action   = "approve" | "changes" | "reject";

interface Submission {
  id: string;
  faculty_code: string;
  faculty_name: string;
  status: Status;
  ref_id: string | null;
  version: number;
  approver_comment: string | null;
  submitted_at: string | null;
  form_data: Record<string, unknown> | null;
}

const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "รออนุมัติ",   color: "#a86a14", bg: "#fcf3e1", border: "#f0dca6" },
  approved: { label: "อนุมัติแล้ว", color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  changes:  { label: "ขอแก้ไข",    color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  rejected: { label: "ไม่อนุมัติ",  color: "#b53030", bg: "#fdecec", border: "#f4d0d0" },
};

const ACTION_CFG: Record<Action, { label: string; submitLabel: string; color: string; bg: string; border: string; placeholder: string }> = {
  approve: { label: "อนุมัติหลักสูตร",   submitLabel: "ยืนยันการอนุมัติ",      color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5", placeholder: "หลักสูตรครอบคลุมสมรรถนะที่จำเป็น..." },
  changes: { label: "ขอให้แก้ไข",         submitLabel: "ส่งคำขอแก้ไข",          color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4", placeholder: "ระบุข้อที่ต้องปรับปรุง เช่น: เพิ่มสมรรถนะ AI Ethics..." },
  reject:  { label: "ไม่อนุมัติ",          submitLabel: "ยืนยันการไม่อนุมัติ",   color: "#b53030", bg: "#fdecec", border: "#f4d0d0", placeholder: "อธิบายเหตุผลที่ไม่อนุมัติ..." },
};

function fmtDateLong(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const m = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const EditIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const XIcon        = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const MailIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SpinIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const BackIcon     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;

function ActionIcon({ action }: { action: Action }) {
  if (action === "approve") return <CheckIcon />;
  if (action === "changes") return <EditIcon />;
  return <XIcon />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [sub, setSub]           = useState<Submission | null>(null);
  const [loading, setLoading]   = useState(true);
  const [action, setAction]     = useState<Action | null>(null);
  const [comment, setComment]   = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [done, setDone]         = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "approver") { router.replace("/login"); return; }
    } catch { router.replace("/login"); return; }

    fetch(`/api/approver/submissions`)
      .then((r) => r.ok ? r.json() : { submissions: [] })
      .then((d) => {
        const found = (d.submissions as Submission[]).find((s) => s.id === id);
        setSub(found ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router, id]);

  const handleDecide = async () => {
    if (!sub || !action) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/approver/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: sub.id, action, comment }),
      });
      if (res.ok) {
        setShowConfirm(false);
        setDone(true);
        setSub((prev) => prev ? {
          ...prev,
          status: (action === "approve" ? "approved" : action === "changes" ? "changes" : "rejected") as Status,
          approver_comment: comment || null,
        } : prev);
      } else {
        const d = await res.json();
        alert(d.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch { alert("ไม่สามารถเชื่อมต่อได้"); }
    finally { setSubmitting(false); }
  };

  if (loading || !sub) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>{loading ? "กำลังโหลด…" : "ไม่พบคำขอนี้"}</div>
      </div>
    );
  }

  const fd = sub.form_data as Record<string, unknown> | null;
  const comps = Array.isArray(fd?.competencies)
    ? (fd!.competencies as { id?: number; name?: string; source?: string; years?: number[]; desc?: string; note?: string }[]).filter((c) => c.name?.trim())
    : [];
  const sectors: string[] = Array.isArray(fd?.sectors) ? fd!.sectors as string[] : [];
  const isDecided = sub.status !== "pending";
  const actionCfg = action ? ACTION_CFG[action] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</span>
            <span className="topbar__role-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              คณะกรรมการ AI-Ready
            </span>
          </div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        <a href="/approver" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#1a4f8a", textDecoration: "none" }}>
          <BackIcon /> กลับไปรายการคำขอ
        </a>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 22 }}>
          <a href="/approver" style={{ color: "#1a4f8a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <BackIcon /> กลับไปรายการคำขอ
          </a>
          <span style={{ color: "#b9c3cf" }}>›</span>
          <span style={{ color: "#677889" }}>คำขอ {sub.ref_id ?? "—"}</span>
        </div>

        <div className="review-grid">

          {/* ── Main column ── */}
          <div className="review-main">

            {/* Hero */}
            <div className="req-hero">
              <div className="req-hero__top">
                <div>
                  <span className="req-hero__id">{sub.ref_id ?? "DRAFT"}</span>
                  <h1 className="req-hero__title">{(fd?.program as string) || sub.faculty_name}</h1>
                  <div className="req-hero__faculty">{sub.faculty_name}</div>
                </div>
                <span className="status" style={{ background: STATUS_META[sub.status].bg, color: STATUS_META[sub.status].color, borderColor: STATUS_META[sub.status].border }}>
                  <span className="status__dot" />
                  {STATUS_META[sub.status].label}
                </span>
              </div>
              <div className="req-hero__meta">
                <div className="req-hero__meta-item">วันที่ยื่นเสนอ<b>{fmtDateLong(sub.submitted_at)}</b></div>
                <div className="req-hero__meta-item">จำนวนสมรรถนะ<b>{comps.length} รายการ</b></div>
                {!!fd?.framework && <div className="req-hero__meta-item">Industry Framework<b style={{ fontWeight: 500, fontSize: 13 }}>{String(fd.framework)}</b></div>}
              </div>
            </div>

            {/* Previous decision banner */}
            {isDecided && sub.approver_comment && (
              <div className="decision-banner" style={{ background: STATUS_META[sub.status].bg, borderColor: STATUS_META[sub.status].border }}>
                <div className="decision-banner__icon" style={{ background: STATUS_META[sub.status].color, color: "white" }}>
                  {sub.status === "approved" && <CheckIcon />}
                  {sub.status === "changes"  && <EditIcon />}
                  {sub.status === "rejected" && <XIcon />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="decision-banner__head" style={{ color: STATUS_META[sub.status].color }}>
                    คำขอนี้ {STATUS_META[sub.status].label} แล้ว
                  </div>
                  <div className="decision-banner__comment">{sub.approver_comment}</div>
                </div>
              </div>
            )}

            {/* Faculty info */}
            <div>
              <h3 className="sec-head">ข้อมูลคณะและหลักสูตร</h3>
              <div className="summary__card" style={{ marginBottom: 0 }}>
                <div className="summary__body">
                  <dl className="kv">
                    <dt>หลักสูตร</dt>          <dd>{(fd?.program as string) || "—"}</dd>
                    <dt>คณะ</dt>               <dd>{sub.faculty_name}</dd>
                    <dt>ผู้รับผิดชอบ</dt>      <dd>{(fd?.owner as string) || "—"}</dd>
                    <dt>ตำแหน่ง</dt>            <dd>{(fd?.position as string) || "—"}</dd>
                    <dt>อีเมลรับผลอนุมัติ</dt> <dd>{(fd?.email as string) || "—"}</dd>
                    <dt>Industry Framework</dt> <dd>{(fd?.framework as string) || "—"}</dd>
                    <dt>ภาคอุตสาหกรรม</dt>
                    <dd>
                      {sectors.length ? (
                        <div className="chips">{sectors.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                      ) : "—"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Competencies */}
            <div>
              <h3 className="sec-head">
                สมรรถนะด้าน AI
                <span className="sec-head__count">{comps.length} รายการ</span>
              </h3>
              <div className="summary__card" style={{ marginBottom: 0 }}>
                <div className="summary__body" style={{ padding: 0 }}>
                  {comps.length ? (
                    <table className="minitbl">
                      <thead>
                        <tr>
                          <th className="num">#</th>
                          <th>AI Competency</th>
                          <th style={{ width: 110 }}>ประเภท</th>
                          <th style={{ width: 120 }}>ชั้นปี</th>
                          <th>คำอธิบาย</th>
                          <th>หมายเหตุ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comps.map((c, i) => (
                          <tr key={c.id ?? i}>
                            <td className="num">{String(i + 1).padStart(2, "0")}</td>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td>
                              <span className={`chip chip--${c.source ?? "school"}`}>
                                {c.source === "industry" ? "Industry" : "School"}
                              </span>
                            </td>
                            <td>
                              {(c.years ?? []).length ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                  {(c.years ?? []).map((y) => <span key={y} className="yr-tag">{y}</span>)}
                                </div>
                              ) : <span style={{ color: "#677889" }}>—</span>}
                            </td>
                            <td style={{ color: "#677889" }}>{c.desc || "—"}</td>
                            <td style={{ color: "#677889" }}>{c.note || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: 14, color: "#677889" }}>ไม่มีข้อมูล</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="review-side">

            {/* Owner card */}
            <div className="owner-card">
              <div className="owner-card__head">ผู้รับผิดชอบหลักสูตร</div>
              <div className="owner-card__name">{(fd?.owner as string) || "—"}</div>
              <div className="owner-card__pos">{(fd?.position as string) || "—"}</div>
              <div className="owner-card__pos" style={{ marginTop: 2 }}>{sub.faculty_name}</div>
              {!!fd?.email && (
                <div className="owner-card__email"><MailIcon />{String(fd.email)}</div>
              )}
            </div>

            {/* Action panel */}
            {!done ? (
              <div className="act-panel">
                {!isDecided ? (
                  <>
                    <div className="act-panel__head">
                      <h3 className="act-panel__title">ตัดสินใจคำขอนี้</h3>
                      <div className="act-panel__sub">เลือกการตัดสินใจและระบุความเห็นก่อนยืนยัน</div>
                    </div>
                    <div className="act-panel__body">
                      <div className="act-options">
                        {(["approve", "changes", "reject"] as Action[]).map((a) => {
                          const cfg = ACTION_CFG[a];
                          return (
                            <div key={a}
                              className={`act-radio${action === a ? ` is-on--${a}` : ""}`}
                              onClick={() => setAction(a)}
                            >
                              <div className="act-radio__bullet" />
                              <div style={{ flex: 1 }}>
                                <div className="act-radio__title">
                                  {a === "approve" && <CheckIcon />}
                                  {a === "changes" && <EditIcon />}
                                  {a === "reject"  && <XIcon />}
                                  {cfg.label}
                                </div>
                                <div className="act-radio__sub">
                                  {a === "approve" ? "หลักสูตรครบถ้วนตามเกณฑ์ AI-Ready" : a === "changes" ? "ส่งกลับให้ปรับปรุงและยื่นใหม่" : "ปฏิเสธคำขอ ไม่สามารถยื่นซ้ำในวาระนี้"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#14202e", marginBottom: 6 }}>
                          ความเห็น / ข้อเสนอแนะ
                          {(action === "changes" || action === "reject") && <span style={{ color: "#b53030" }}> *</span>}
                        </label>
                        <textarea className="act-textarea" rows={4}
                          placeholder={actionCfg?.placeholder ?? "ระบุความเห็นเกี่ยวกับคำขอนี้..."}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)} />
                        <div style={{ fontSize: 11.5, color: "#677889", marginTop: 4 }}>ความเห็นจะถูกส่งไปยังผู้ยื่น</div>
                      </div>

                      <button
                        className={`act-submit${action ? ` btn--${action}` : " btn--primary"}`}
                        disabled={!action || ((action === "changes" || action === "reject") && !comment.trim())}
                        onClick={() => setShowConfirm(true)}
                      >
                        {action && <ActionIcon action={action} />}
                        {actionCfg?.submitLabel ?? "เลือกการตัดสินใจ"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="act-panel__body" style={{ textAlign: "center", padding: "24px 20px" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: STATUS_META[sub.status].bg, color: STATUS_META[sub.status].color, display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                      {sub.status === "approved" && <CheckIcon />}
                      {sub.status === "changes"  && <EditIcon />}
                      {sub.status === "rejected" && <XIcon />}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#14202e", marginBottom: 6 }}>
                      คำขอนี้ {STATUS_META[sub.status].label} แล้ว
                    </div>
                    {sub.approver_comment && (
                      <div style={{ fontSize: 13, color: "#677889", marginBottom: 14, lineHeight: 1.55 }}>{sub.approver_comment}</div>
                    )}
                    <a href="/approver" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex", justifyContent: "center" }}>
                      กลับไปรายการคำขอ
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="act-panel">
                <div className="act-panel__body" style={{ textAlign: "center", padding: "24px 20px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: actionCfg?.bg, color: actionCfg?.color, display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                    {action && <ActionIcon action={action} />}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#14202e", marginBottom: 4 }}>บันทึกการตัดสินใจแล้ว</div>
                  <div style={{ fontSize: 13, color: "#677889", lineHeight: 1.55, marginBottom: 14 }}>
                    ระบบกำลังส่งอีเมลแจ้งผลไปยัง<br /><b style={{ color: "#14202e" }}>{(fd?.email as string) || "ผู้ยื่น"}</b>
                  </div>
                  <a href="/approver" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex", justifyContent: "center" }}>
                    กลับไปรายการคำขอ
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Confirm modal */}
      {showConfirm && action && actionCfg && (
        <div className="modal-bg" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__icon" style={{ background: actionCfg.bg, color: actionCfg.color }}>
              <ActionIcon action={action} />
            </div>
            <h3 className="modal__title">ยืนยัน{actionCfg.label}?</h3>
            <p className="modal__text">
              ผู้ยื่น <b style={{ color: "#14202e" }}>{(fd?.owner as string) || "—"}</b> จะได้รับอีเมลแจ้งผลทันทีหลังกดยืนยัน
            </p>
            <div className="modal__foot">
              <button className="btn" onClick={() => setShowConfirm(false)}>ยกเลิก</button>
              <button
                className={`act-submit btn--${action}`}
                style={{ flex: "none", padding: "10px 20px" }}
                disabled={submitting}
                onClick={handleDecide}
              >
                {submitting ? <SpinIcon /> : <ActionIcon action={action} />}
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
