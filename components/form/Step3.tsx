import type { FormData } from "./types";
import type { T } from "@/lib/i18n";

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const PencilIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function fmtDate(s: string, t: T) {
  if (!s) return t.fDateEmpty;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${d.getDate()} ${t.fMonths[d.getMonth()]} ${d.getFullYear() + t.fYearOffset}`;
}

interface Props {
  data: FormData;
  goTo: (step: number) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  t: T;
}

export function Step3({ data, goTo, consent, setConsent, t }: Props) {
  const filledComps = data.competencies.filter((c) => c.name.trim());

  return (
    <>
      <div className="card__head">
        <span className="card__step-label">{t.fS3StepLabel}</span>
        <h2 className="card__title">{t.fS3Title}</h2>
        <p className="card__desc">{t.fS3Desc}</p>
      </div>
      <div className="card__body">
        <div className="summary">

          {/* Faculty info */}
          <div className="summary__card">
            <div className="summary__head">
              <h4>{t.fSumFaculty}</h4>
              <button className="summary__edit" type="button" onClick={() => goTo(0)}>
                <PencilIcon /> &nbsp;{t.fEdit}
              </button>
            </div>
            <div className="summary__body">
              <dl className="kv">
                <dt>{t.fKvProgram}</dt>    <dd>{data.program   || "—"}</dd>
                <dt>{t.fKvFaculty}</dt>    <dd>{data.faculty ? `${t.fFacultyPrefix}${data.faculty}` : "—"}</dd>
                <dt>{t.fKvOwner}</dt>      <dd>{data.owner     || "—"}</dd>
                <dt>{t.fKvPosition}</dt>   <dd>{data.position  || "—"}</dd>
                <dt>{t.fKvEmail}</dt>      <dd>{data.email     || "—"}</dd>
                <dt>{t.fKvFramework}</dt>  <dd>{data.framework || "—"}</dd>
                <dt>{t.fKvSubmitDate}</dt> <dd>{fmtDate(data.submitDate, t)}</dd>
                <dt>{t.fKvSectors}</dt>
                <dd>
                  {data.sectors.length ? (
                    <div className="chips">
                      {data.sectors.map((s) => <span key={s} className="chip">{s}</span>)}
                    </div>
                  ) : "—"}
                </dd>
              </dl>
            </div>
          </div>

          {/* Competencies */}
          <div className="summary__card">
            <div className="summary__head">
              <h4>{t.fSumComps} ({filledComps.length})</h4>
              <button className="summary__edit" type="button" onClick={() => goTo(1)}>
                <PencilIcon /> &nbsp;{t.fEdit}
              </button>
            </div>
            <div className="summary__body" style={{ padding: 0 }}>
              {filledComps.length ? (
                <table className="minitbl">
                  <thead>
                    <tr>
                      <th className="num">#</th>
                      <th>{t.fThComp}</th>
                      <th style={{ width: 110 }}>{t.fThType}</th>
                      <th style={{ width: 120 }}>{t.fThYear}</th>
                      <th>{t.fThDesc}</th>
                      <th>{t.fThNote}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filledComps.map((c, i) => (
                      <tr key={c.id}>
                        <td className="num">{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td>
                          <span className={`chip chip--${c.source}`}>
                            {c.source === "industry" ? "Industry" : "School"}
                          </span>
                        </td>
                        <td>
                          {c.years.length ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                              {c.years.map((y) => <span key={y} className="yr-tag">{y}</span>)}
                            </div>
                          ) : <span style={{ color: "var(--ink-500)" }}>—</span>}
                        </td>
                        <td style={{ color: "var(--ink-500)" }}>{c.desc || "—"}</td>
                        <td style={{ color: "var(--ink-500)" }}>{c.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 14, color: "var(--ink-500)" }}>{t.fNotFilled}</div>
              )}
            </div>
          </div>

          {/* Workflow banner */}
          <div className="banner banner--info">
            <div className="banner__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div className="banner__title">{t.fWfTitle}</div>
              <div className="banner__text" style={{ lineHeight: 1.7 }}>
                {t.fWfIntro1} <b>&ldquo;{t.fSubmit}&rdquo;</b> {t.fWfIntro2}<br />
                <b>1.</b> {t.fWfStep1}{data.faculty ? `${t.fFacultyPrefix}${data.faculty}` : t.fWfSelectedFaculty}<br />
                <b>2.</b> {t.fWfStep2a} <b>{t.fWfCommittee}</b> {t.fWfStep2b}<br />
                <b>3.</b> {t.fWfStep3}<br />
                <b>4.</b> {t.fWfStep4}
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="consent" onClick={() => setConsent(!consent)}>
            <div className="checkbox" style={{
              background: consent ? "var(--bu-blue)" : "white",
              borderColor: consent ? "var(--bu-blue)" : "var(--ink-300)",
            }}>
              {consent && <CheckIcon />}
            </div>
            <div>{t.fConsent}</div>
          </div>

        </div>
      </div>
    </>
  );
}
