import type { FormData } from "./types";
import { FACULTY_PROGRAMS, SECTORS } from "./types";
import type { T } from "@/lib/i18n";

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Props {
  data: FormData;
  set: (key: keyof FormData, value: unknown) => void;
  lockedFaculty?: string; // pre-filled from session — user cannot change
  t: T;
}

export function Step1({ data, set, lockedFaculty, t }: Props) {
  const isLocked = !!lockedFaculty;
  const facultyList = Object.keys(FACULTY_PROGRAMS);
  const programs = data.faculty ? (FACULTY_PROGRAMS[data.faculty] ?? []) : [];

  const onFacultyChange = (v: string) => {
    set("faculty", v);
    if (data.program && !(FACULTY_PROGRAMS[v] ?? []).includes(data.program)) {
      set("program", ""); // reset program when faculty changes
    }
  };

  const toggleSector = (s: string) => {
    const next = new Set(data.sectors);
    if (next.has(s)) { next.delete(s); } else { next.add(s); }
    set("sectors", Array.from(next));
  };

  return (
    <>
      <div className="card__head">
        <span className="card__step-label">{t.fS1StepLabel}</span>
        <h2 className="card__title">{t.fS1Title}</h2>
        <p className="card__desc">{t.fS1Desc}</p>
      </div>
      <div className="card__body">
        <div className="field-grid">

          {/* คณะ — locked to session when logged in as faculty */}
          <div className="field">
            <label className="field__label">{t.fLblFaculty} <span className="req">*</span></label>
            {isLocked ? (
              <div style={{
                border: "1px solid var(--ink-200)", borderRadius: 6, padding: "10px 12px",
                fontSize: 14, color: "var(--ink-900)", background: "var(--ink-50)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span>{t.fFacultyPrefix}{data.faculty}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)", letterSpacing: "0.04em", background: "var(--ink-100)", padding: "2px 8px", borderRadius: 4 }}>
                  {t.fFromLogin}
                </span>
              </div>
            ) : (
              <select className="select" value={data.faculty} onChange={(e) => onFacultyChange(e.target.value)}>
                <option value="">{t.fSelectFaculty}</option>
                {facultyList.map((f) => (
                  <option key={f} value={f}>{t.fFacultyPrefix}{f}</option>
                ))}
              </select>
            )}
          </div>

          {/* หลักสูตร */}
          <div className="field">
            <label className="field__label">{t.fLblProgram} <span className="req">*</span></label>
            {!data.faculty && (
              <p className="field__hint" style={{ color: "var(--ink-400)" }}>{t.fHintProgramFirst}</p>
            )}
            <select
              className="select"
              value={data.program}
              onChange={(e) => set("program", e.target.value)}
              disabled={!data.faculty}
            >
              <option value="">{data.faculty ? t.fSelectProgram : t.fSelectFacultyFirst}</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* ชื่อผู้รับผิดชอบ */}
          <div className="field">
            <label className="field__label">{t.fLblOwner} <span className="req">*</span></label>
            <input className="input" type="text" placeholder={t.fPhOwner}
              value={data.owner} onChange={(e) => set("owner", e.target.value)} />
          </div>

          {/* ตำแหน่ง */}
          <div className="field">
            <label className="field__label">{t.fLblPosition} <span className="req">*</span></label>
            <input className="input" type="text" placeholder={t.fPhPosition}
              value={data.position} onChange={(e) => set("position", e.target.value)} />
          </div>

          {/* อีเมล */}
          <div className="field field--full">
            <label className="field__label">{t.fLblEmail} <span className="req">*</span></label>
            <p className="field__hint">{t.fHintEmail}</p>
            <input className="input" type="email" placeholder={t.fPhEmail}
              value={data.email} onChange={(e) => set("email", e.target.value)} />
          </div>

          {/* Framework */}
          <div className="field">
            <label className="field__label">{t.fLblFramework} <span className="req">*</span></label>
            <p className="field__hint">{t.fHintFramework}</p>
            <input className="input" type="text"
              placeholder={t.fPhFramework}
              value={data.framework} onChange={(e) => set("framework", e.target.value)} />
          </div>

          {/* วันที่ยื่น */}
          <div className="field">
            <label className="field__label">{t.fLblSubmitDate} <span className="req">*</span></label>
            <p className="field__hint">{t.fHintSubmitDate}</p>
            <input className="input" type="date"
              value={data.submitDate} onChange={(e) => set("submitDate", e.target.value)} />
          </div>

          {/* ภาคอุตสาหกรรม */}
          <div className="field field--full">
            <label className="field__label">{t.fLblSectors} <span className="req">*</span></label>
            <p className="field__hint">{t.fHintSectors}</p>
            <div className="checkgrid">
              {SECTORS.map((s) => {
                const on = data.sectors.includes(s);
                return (
                  <div key={s} className={`checkcard${on ? " is-on" : ""}`}
                    onClick={() => toggleSector(s)} role="checkbox" aria-checked={on}>
                    <div className="checkbox">{on && <CheckIcon />}</div>
                    <div className="checkcard__label">{s}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
