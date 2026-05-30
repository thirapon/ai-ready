"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { UNESCO_DOMAINS } from "@/lib/unesco";
import type { Layer1Mapping } from "@/lib/unesco";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Competency {
  id?: number;
  name?: string;
  source?: string;
  years?: number[];
  desc?: string;
  note?: string;
}

interface PageData {
  submissionStatus: string;
  refId: string | null;
  facultyName: string;
  formData: { program?: string; competencies?: Competency[] };
  layer1Mapping: Layer1Mapping;
  layer1Status: "not_started" | "in_progress" | "submitted";
}

interface Session { role: string; code: string; name: string }

const DRAFT_KEY = "bu_air_layer1_draft";

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const SpinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mappedCount(mapping: Layer1Mapping, totalComps: number): number {
  return Array.from({ length: totalComps }, (_, i) => (mapping[String(i)] ?? []).length > 0).filter(Boolean).length;
}

// ─── Inner (uses useSearchParams) ────────────────────────────────────────────
function Layer1MappingInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");

  const [session, setSession]     = useState<Session | null>(null);
  const [pageData, setPageData]   = useState<PageData | null>(null);
  const [mapping, setMapping]     = useState<Layer1Mapping>({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg]     = useState("บันทึกอัตโนมัติแล้ว");
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auth guard + fetch data
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
        .then((d: PageData) => {
          if (d.submissionStatus !== "approved") {
            router.replace("/submit");
            return;
          }
          setPageData(d);
          setSubmitted(d.layer1Status === "submitted");

          // Restore: prefer server mapping, fall back to local draft
          if (Object.keys(d.layer1Mapping).length > 0) {
            setMapping(d.layer1Mapping);
          } else {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
              try { setMapping(JSON.parse(draft)); } catch { /* ignore */ }
            }
          }
        })
        .catch((code) => {
          if (code === 404) router.replace("/submit");
          else setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่");
        })
        .finally(() => setLoading(false));
    } catch {
      router.replace("/login");
    }
  }, [router, submissionId]);

  // Auto-save draft to localStorage when mapping changes
  useEffect(() => {
    if (!session || submitted) return;
    setSaveMsg("กำลังบันทึก...");
    localStorage.setItem(DRAFT_KEY, JSON.stringify(mapping));
    const t = setTimeout(() => setSaveMsg("บันทึกอัตโนมัติแล้ว"), 600);
    return () => clearTimeout(t);
  }, [mapping, session, submitted]);

  const toggleDomain = useCallback((compIdx: number, domainId: string) => {
    if (submitted) return;
    setMapping((prev) => {
      const key = String(compIdx);
      const current = prev[key] ?? [];
      const updated = current.includes(domainId)
        ? current.filter((d) => d !== domainId)
        : [...current, domainId];
      return { ...prev, [key]: updated };
    });
  }, [submitted]);

  const saveDraft = async () => {
    if (!session || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/mapping/layer1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, mapping, action: "draft" }),
      });
      if (res.ok) setSaveMsg("บันทึกแล้ว ✓");
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/mapping/layer1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId, mapping, action: "submit" }),
      });
      if (res.ok) {
        localStorage.removeItem(DRAFT_KEY);
        setSubmitted(true);
        setShowConfirm(false);
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch {
      alert("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่");
    } finally {
      setSubmitting(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  };

  if (loading || !session) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#b53030", fontSize: 14, marginBottom: 12 }}>{error}</div>
          <button className="btn btn--primary" onClick={() => router.push("/submit")}>กลับหน้าหลัก</button>
        </div>
      </div>
    );
  }

  const comps: Competency[] = (pageData?.formData?.competencies ?? []).filter((c) => c.name?.trim());
  const program = pageData?.formData?.program ?? pageData?.facultyName ?? "—";
  const total = comps.length;
  const done = mappedCount(mapping, total);
  const allMapped = done === total && total > 0;
  const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        {!submitted && (
          <span className="savetag"><span className="dot" />{saveMsg}</span>
        )}
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 72px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 20 }}>
          <a href="/submit" style={{ color: "#1a4f8a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
            <BackIcon /> หน้าหลัก
          </a>
          <span style={{ color: "#b9c3cf" }}>›</span>
          <span style={{ color: "#677889" }}>Layer 1 · UNESCO AI Competency Mapping</span>
        </div>

        {/* Page head */}
        <div className="page-head" style={{ marginBottom: 20 }}>
          <div>
            <div className="page-head__crumbs">ระบบ AI-Ready Curriculum &nbsp;›&nbsp; <span>Layer 1 Mapping</span></div>
            <h1 className="page-head__title">การแมพสมรรถนะสู่มาตรฐาน UNESCO</h1>
            <p className="page-head__desc">ระบุว่าสมรรถนะ AI แต่ละรายการของหลักสูตรครอบคลุมโดเมนใดบ้างของ UNESCO AI Competency Framework (2023)</p>
          </div>
          <div className="page-head__meta">
            <b>เลขอ้างอิง</b>
            {pageData?.refId ?? "—"}<br />
            {program}
          </div>
        </div>

        {/* Submitted banner */}
        {submitted && (
          <div style={{ background: "#e6f4ec", border: "1px solid #b5dbc5", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#137a4a", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <CheckIcon />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#137a4a", fontSize: 14 }}>ส่งการแมพ Layer 1 แล้ว</div>
              <div style={{ fontSize: 13, color: "#3a4859", marginTop: 2 }}>การแมพสมรรถนะสู่มาตรฐาน UNESCO เสร็จสมบูรณ์แล้ว</div>
            </div>
          </div>
        )}

        {/* Progress card */}
        <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#14202e" }}>ความคืบหน้าการแมพ</div>
              <div style={{ fontSize: 13, color: "#677889" }}>
                <b style={{ color: "#14202e" }}>{done}</b> / {total} สมรรถนะ
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: "#eef1f6", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 99, background: allMapped ? "#137a4a" : "#1a4f8a", transition: "width 0.3s ease" }} />
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: allMapped ? "#137a4a" : "#1a4f8a", fontFamily: "var(--font-ibm-plex), monospace", minWidth: 52, textAlign: "right" }}>
            {progressPct}%
          </div>
        </div>

        {/* UNESCO domain legend */}
        <div style={{ background: "white", border: "1px solid #dde3eb", borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#677889", letterSpacing: "0.06em", marginBottom: 10 }}>UNESCO AI COMPETENCY FRAMEWORK · 6 DOMAINS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {UNESCO_DOMAINS.map((d) => (
              <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 99, background: d.bg, border: `1px solid ${d.border}` }}>
                <span style={{ fontWeight: 800, fontSize: 11, color: d.color, fontFamily: "var(--font-ibm-plex), monospace", letterSpacing: "0.04em" }}>{d.code}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.labelTH}</span>
                <span style={{ fontSize: 11, color: d.color, opacity: 0.75 }}>— {d.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mapping matrix */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef1f6", display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#14202e" }}>ตารางแมพสมรรถนะ</h3>
            <span style={{ fontSize: 12, color: "#677889", fontWeight: 400 }}>คลิกช่องเพื่อทำเครื่องหมาย</span>
          </div>

          {total === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#677889", fontSize: 14 }}>
              ไม่พบข้อมูลสมรรถนะในคำขออนุมัติ
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="map-tbl">
                <thead>
                  <tr>
                    <th className="map-tbl__comp-th"># สมรรถนะ AI</th>
                    {UNESCO_DOMAINS.map((d) => (
                      <th key={d.id} className="map-tbl__domain-th">
                        <span className="map-domain-badge" style={{ "--dc": d.color, "--db": d.bg, "--dbo": d.border } as React.CSSProperties}>
                          {d.code}
                        </span>
                        <span className="map-domain-label">{d.labelTH}</span>
                      </th>
                    ))}
                    <th className="map-tbl__sum-th">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((comp, i) => {
                    const checked = mapping[String(i)] ?? [];
                    const rowDone = checked.length > 0;
                    return (
                      <tr key={i} className={`map-tbl__row${rowDone ? " is-done" : ""}`}>
                        <td className="map-tbl__comp-td">
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <span style={{ fontFamily: "var(--font-ibm-plex), monospace", fontSize: 11, fontWeight: 700, color: "#8b99a8", marginTop: 2, flexShrink: 0 }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <div style={{ fontWeight: 600, color: "#14202e", fontSize: 13.5, lineHeight: 1.35 }}>{comp.name}</div>
                              {comp.desc && (
                                <div style={{ fontSize: 11.5, color: "#677889", marginTop: 3, lineHeight: 1.45 }}>{comp.desc}</div>
                              )}
                              {comp.source && (
                                <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 99, background: comp.source === "industry" ? "#fcf3e1" : "#eef4fb", color: comp.source === "industry" ? "#a86a14" : "#1a4f8a" }}>
                                  {comp.source === "industry" ? "Industry" : "School"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {UNESCO_DOMAINS.map((d) => {
                          const isOn = checked.includes(d.id);
                          return (
                            <td key={d.id} className="map-tbl__cell-td" onClick={() => toggleDomain(i, d.id)}>
                              <button
                                className={`map-checkbox${isOn ? " is-on" : ""}`}
                                style={{ "--dc": d.color, "--db": d.bg, "--dbo": d.border } as React.CSSProperties}
                                disabled={submitted}
                                tabIndex={-1}
                                aria-label={`${comp.name} — ${d.labelTH}`}
                                aria-checked={isOn}
                              >
                                {isOn && <CheckIcon />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="map-tbl__sum-td">
                          <span style={{ fontWeight: 700, fontSize: 14, color: rowDone ? "#137a4a" : "#b9c3cf" }}>
                            {checked.length}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Instruction note */}
        {!submitted && (
          <div style={{ marginTop: 14, fontSize: 12.5, color: "#677889", lineHeight: 1.6 }}>
            <b style={{ color: "#3a4859" }}>วิธีใช้:</b> คลิกช่องในตารางเพื่อระบุว่าสมรรถนะนั้นครอบคลุมโดเมน UNESCO ใดบ้าง (เลือกได้มากกว่า 1 โดเมน)
            {!allMapped && total > 0 && (
              <> &nbsp;·&nbsp; ต้องแมพสมรรถนะทุกรายการก่อนจึงจะส่งได้ (<b style={{ color: "#b53030" }}>{total - done} รายการ</b>ที่เหลือ)</>
            )}
          </div>
        )}

        {/* Footer action bar */}
        {!submitted && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #dde3eb", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#677889" }}>
              <span style={{ fontWeight: 700, color: allMapped ? "#137a4a" : "#14202e" }}>{done}/{total}</span>
              สมรรถนะที่แมพแล้ว
              {allMapped && (
                <span style={{ color: "#137a4a", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CheckIcon /> ครบถ้วนแล้ว
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={saveDraft} disabled={saving}>
                {saving ? <SpinIcon /> : <SaveIcon />} บันทึกฉบับร่าง
              </button>
              <button
                className="btn btn--primary"
                disabled={!allMapped || submitting}
                onClick={() => setShowConfirm(true)}
              >
                {submitting ? <SpinIcon /> : <SendIcon />} ส่งการแมพ Layer 1
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <a href="/submit" className="btn btn--primary" style={{ textDecoration: "none", display: "inline-flex" }}>
              กลับหน้าหลัก
            </a>
          </div>
        )}

      </main>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal-bg" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__icon" style={{ background: "#e6f4ec", color: "#137a4a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h3 className="modal__title">ยืนยันส่งการแมพ Layer 1?</h3>
            <p className="modal__text">
              แมพสมรรถนะทั้ง <b style={{ color: "#14202e" }}>{total} รายการ</b> ครบแล้ว
              การแมพจะถูกบันทึกและ<b style={{ color: "#14202e" }}>ไม่สามารถแก้ไขได้</b>หลังจากนี้
            </p>
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

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────
export default function Layer1MappingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    }>
      <Layer1MappingInner />
    </Suspense>
  );
}
