"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";
import { FormStepper } from "@/components/form/FormStepper";
import { Step1 } from "@/components/form/Step1";
import { Step2 } from "@/components/form/Step2";
import { Step3 } from "@/components/form/Step3";
import { INITIAL_DATA } from "@/components/form/types";
import type { FormData, Competency } from "@/components/form/types";

// ─── Icons ────────────────────────────────────────────────────────────────────
const ChevLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const SendIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SaveIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const SpinIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;

interface Session { role: string; code: string; name: string; }

function isStepValid(step: number, data: FormData, consent: boolean) {
  if (step === 0) {
    return !!(data.program && data.faculty && data.owner && data.position &&
              data.email && data.framework && data.submitDate && data.sectors.length > 0);
  }
  if (step === 1) return data.competencies.filter((c) => c.name.trim()).length >= 1;
  if (step === 2) return consent;
  return true;
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────
function FormPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id"); // null = new submission

  const [session, setSession]   = useState<Session | null>(null);
  const [data, setData]         = useState<FormData>(INITIAL_DATA);
  const [step, setStep]         = useState(0);
  const [consent, setConsent]   = useState(false);
  const [saveMsg, setSaveMsg]   = useState("บันทึกอัตโนมัติแล้ว");
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [version, setVersion]   = useState(0);
  const [refId, setRefId]       = useState<string | null>(null);

  const draftKey = submissionId ? `bu_air_form_draft_${submissionId}` : "bu_air_form_draft_new";

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess: Session = JSON.parse(raw);
      if (sess.role !== "faculty") { router.replace("/login"); return; }
      setSession(sess);

      const facultyKey = sess.name.replace(/^คณะ/, "").trim();

      if (submissionId) {
        // Edit mode — load from Supabase by id
        fetch(`/api/submissions?id=${encodeURIComponent(submissionId)}`)
          .then((r) => r.ok ? r.json() : { submission: null })
          .then((d) => {
            if (d.submission?.form_data) {
              setData({ ...(d.submission.form_data as FormData), faculty: facultyKey });
            } else {
              setData((prev) => ({ ...prev, faculty: facultyKey }));
            }
            setVersion(d.submission?.version ?? 0);
            setRefId(d.submission?.ref_id ?? null);
          })
          .catch(() => setData((prev) => ({ ...prev, faculty: facultyKey })));
      } else {
        // New — restore local draft if any
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          try { setData({ ...JSON.parse(draft), faculty: facultyKey }); }
          catch { setData((prev) => ({ ...prev, faculty: facultyKey })); }
        } else {
          setData((prev) => ({ ...prev, faculty: facultyKey }));
        }
      }
    } catch {
      router.replace("/login");
    }
  }, [router, submissionId, draftKey]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!session) return;
    setSaveMsg("กำลังบันทึก...");
    localStorage.setItem(draftKey, JSON.stringify(data));
    const t = setTimeout(() => setSaveMsg("บันทึกอัตโนมัติแล้ว"), 600);
    return () => clearTimeout(t);
  }, [data, session, draftKey]);

  const setField = (key: keyof FormData, value: unknown) =>
    setData((prev) => ({ ...prev, [key]: value }));
  const setComps = (rows: Competency[]) =>
    setData((prev) => ({ ...prev, competencies: rows }));

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const onNext = () => { setStep((s) => Math.min(s + 1, 2)); scrollTop(); };
  const onBack = () => { setStep((s) => Math.max(s - 1, 0)); scrollTop(); };
  const goTo   = (s: number) => { setStep(s); scrollTop(); };

  const saveDraft = useCallback(async () => {
    if (!session || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/submissions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId ?? undefined,
          facultyCode: session.code,
          facultyName: session.name,
          formData: data,
          action: "draft",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        // Save returned id for new submissions so subsequent saves update same record
        if (!submissionId && result.submission?.id) {
          router.replace(`/submit/form?id=${result.submission.id}`, { scroll: false });
        }
        setSaveMsg("บันทึกแล้ว ✓");
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }, [session, data, saving, submissionId, router]);

  const onSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submissionId ?? undefined,
          facultyCode: session.code,
          facultyName: session.name,
          formData: data,
          action: "submit",
        }),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.removeItem(draftKey);
        router.push("/submit");
      } else {
        alert(result.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch {
      alert("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    );
  }

  const valid = isStepValid(step, data, consent);
  const isNew = !submissionId;
  const crumb = isNew ? "สร้างคำขออนุมัติใหม่" : "แก้ไขคำขออนุมัติ";

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
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
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="page-head">
          <div>
            <div className="page-head__crumbs">ระบบ AI-Ready Curriculum &nbsp;›&nbsp; <span>{crumb}</span></div>
            <h1 className="page-head__title">ขออนุมัติ School/Industry AI Competency Framework</h1>
            <p className="page-head__desc">กรอกข้อมูลหลักสูตรและสมรรถนะ AI ให้ครบถ้วนก่อนส่งขออนุมัติ</p>
          </div>
          <div className="page-head__meta">
            <b>{refId ? "เลขอ้างอิงคำขอ" : "เอกสารร่าง"}</b>
            {refId ?? (isNew ? "หลักสูตรใหม่" : "DRAFT")}<br />
            {version > 0 ? `ส่งแล้ว ${version} ครั้ง` : "ยังไม่ได้ส่ง"}
          </div>
        </div>

        <FormStepper current={step} />

        <div className="card">
          {step === 0 && <Step1 data={data} set={setField} lockedFaculty={session?.name.replace(/^คณะ/, "").trim()} />}
          {step === 1 && <Step2 data={data} setRows={setComps} />}
          {step === 2 && <Step3 data={data} goTo={goTo} consent={consent} setConsent={setConsent} />}

          <div className="card__foot">
            <div>
              {step > 0 ? (
                <button className="btn" type="button" onClick={onBack}>
                  <ChevLeft /> ย้อนกลับ
                </button>
              ) : (
                <button className="btn" type="button" onClick={() => router.push("/submit")}>
                  ยกเลิก
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
                ขั้นตอนที่ <b style={{ color: "var(--bu-blue)" }}>{step + 1}</b> จาก 3
              </span>
              <button className="btn" type="button" onClick={saveDraft} disabled={saving}>
                {saving ? <SpinIcon /> : <SaveIcon />} บันทึกฉบับร่าง
              </button>
              {step < 2 ? (
                <button className="btn btn--primary" type="button" onClick={onNext} disabled={!valid}>
                  ถัดไป <ChevRight />
                </button>
              ) : (
                <button className="btn btn--primary btn--lg" type="button" onClick={onSubmit} disabled={!valid || submitting}>
                  {submitting ? <SpinIcon /> : <SendIcon />}
                  {version > 0 ? "ส่งขออนุมัติอีกครั้ง" : "ส่งขออนุมัติ"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#8b99a8" }}>
          ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ
        </div>
      </main>
    </div>
  );
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────
export default function FormPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    }>
      <FormPageInner />
    </Suspense>
  );
}
