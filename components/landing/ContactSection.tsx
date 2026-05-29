"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface Fields {
  name: string;
  email: string;
  message: string;
}

interface FieldErrors {
  name: string;
  email: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function ContactSection() {
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: "",
    email: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    // Clear field error on change
    if (key === "name" || key === "email") {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: FieldErrors = { name: "", email: "" };
    let ok = true;

    if (!fields.name.trim()) {
      errors.name = "กรุณากรอกชื่อ-นามสกุล";
      ok = false;
    }
    if (!fields.email.trim()) {
      errors.email = "กรุณากรอกอีเมล";
      ok = false;
    } else if (!EMAIL_RE.test(fields.email.trim())) {
      errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      ok = false;
    }

    setFieldErrors(errors);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setServerError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setServerError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");
      setStatus("error");
    }
  };

  return (
    <section
      style={{
        background: "#f6f8fb",
        paddingTop: 96,
        paddingBottom: 96,
      }}
      className="max-[980px]:py-16"
    >
      <div
        style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}
        className="max-[980px]:!px-6"
      >
        {/* Heading */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
          className="max-[980px]:!grid-cols-1 max-[980px]:!gap-10"
        >
          {/* Left — info */}
          <div>
            <div
              className="inline-flex items-center"
              style={{
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#1a4f8a",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 2,
                  background: "#c9a44c",
                  display: "inline-block",
                }}
              />
              Contact · ติดต่อเรา
            </div>

            <h2
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#14202e",
                lineHeight: 1.18,
                margin: "0 0 16px",
                letterSpacing: "-0.005em",
              }}
              className="max-[980px]:!text-[28px]"
            >
              สอบถามข้อมูลเพิ่มเติม
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#677889",
                lineHeight: 1.65,
                margin: "0 0 32px",
                maxWidth: 440,
              }}
            >
              มีข้อสงสัยเกี่ยวกับระบบ AI-Ready Curriculum หรือต้องการให้ทีมงานติดต่อกลับ
              กรอกข้อมูลด้านขวาได้เลย — ทีมสำนักวิชาการจะตอบกลับภายใน 1–2 วันทำการ
            </p>

            {/* Contact details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "academic@bu.ac.th",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.49 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
                    </svg>
                  ),
                  label: "0-2350-3500 ต่อ 0123",
                },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center"
                  style={{ gap: 12, fontSize: 14, color: "#3a4859" }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: "#eef4fb",
                      color: "#1a4f8a",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — form card */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dde3eb",
              borderRadius: 18,
              padding: "32px 30px 30px",
              boxShadow: "0 4px 14px rgba(20,32,46,0.07)",
            }}
          >
            {status === "success" ? (
              /* ── Success state ── */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "32px 16px",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#e6f4ec",
                    color: "#137a4a",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#14202e",
                    margin: 0,
                  }}
                >
                  ส่งข้อความเรียบร้อยแล้ว
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#677889",
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: 320,
                  }}
                >
                  ทีมงานสำนักวิชาการได้รับข้อความของท่านแล้ว
                  จะติดต่อกลับทางอีเมลภายใน 1–2 วันทำการ
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setFields({ name: "", email: "", message: "" });
                    setServerError("");
                  }}
                  className="btn"
                  style={{ marginTop: 8 }}
                >
                  ส่งข้อความอีกครั้ง
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#14202e",
                    margin: "0 0 22px",
                  }}
                >
                  ส่งข้อความถึงเรา
                </h3>

                {/* Server error banner */}
                {status === "error" && serverError && (
                  <div className="form-banner form-banner--error" style={{ marginBottom: 20 }}>
                    <AlertIcon />
                    <span>{serverError}</span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Name */}
                  <div className="field">
                    <label className="field__label" htmlFor="contact-name">
                      ชื่อ-นามสกุล <span className="req">*</span>
                    </label>
                    <input
                      id="contact-name"
                      className={`input${fieldErrors.name ? " is-invalid" : ""}`}
                      type="text"
                      placeholder="เช่น สมชาย ใจดี"
                      value={fields.name}
                      onChange={set("name")}
                      disabled={status === "loading"}
                      autoComplete="name"
                    />
                    {fieldErrors.name && (
                      <span className="field__error">{fieldErrors.name}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="field">
                    <label className="field__label" htmlFor="contact-email">
                      อีเมล <span className="req">*</span>
                    </label>
                    <input
                      id="contact-email"
                      className={`input${fieldErrors.email ? " is-invalid" : ""}`}
                      type="email"
                      placeholder="example@bu.ac.th"
                      value={fields.email}
                      onChange={set("email")}
                      disabled={status === "loading"}
                      autoComplete="email"
                    />
                    {fieldErrors.email && (
                      <span className="field__error">{fieldErrors.email}</span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="field">
                    <label className="field__label" htmlFor="contact-message">
                      ข้อความ / คำถาม
                    </label>
                    <textarea
                      id="contact-message"
                      className="textarea"
                      placeholder="ระบุหลักสูตร คณะ หรือคำถามที่ต้องการสอบถาม..."
                      value={fields.message}
                      onChange={set("message")}
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn--primary btn--lg"
                    disabled={status === "loading"}
                    style={{ width: "100%", marginTop: 4 }}
                  >
                    {status === "loading" ? (
                      <>
                        <SpinnerIcon />
                        กำลังส่ง…
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        ส่งข้อความ
                      </>
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#8b99a8",
                      textAlign: "center",
                      margin: 0,
                    }}
                  >
                    ข้อมูลของท่านจะถูกเก็บเป็นความลับตามนโยบายความเป็นส่วนตัว
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
