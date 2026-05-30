import type { FormData } from "./types";

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

function fmtDate(s: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

interface Props {
  data: FormData;
  goTo: (step: number) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
}

export function Step3({ data, goTo, consent, setConsent }: Props) {
  const filledComps = data.competencies.filter((c) => c.name.trim());

  return (
    <>
      <div className="card__head">
        <span className="card__step-label">ขั้นตอนที่ 3 จาก 3</span>
        <h2 className="card__title">ตรวจสอบและส่งขออนุมัติ</h2>
        <p className="card__desc">โปรดตรวจสอบข้อมูลทั้งหมดอีกครั้งก่อนส่ง — หากต้องการแก้ไข สามารถคลิก &ldquo;แก้ไข&rdquo; ในแต่ละส่วน</p>
      </div>
      <div className="card__body">
        <div className="summary">

          {/* Faculty info */}
          <div className="summary__card">
            <div className="summary__head">
              <h4>ข้อมูลคณะและหลักสูตร</h4>
              <button className="summary__edit" type="button" onClick={() => goTo(0)}>
                <PencilIcon /> &nbsp;แก้ไข
              </button>
            </div>
            <div className="summary__body">
              <dl className="kv">
                <dt>หลักสูตร</dt>          <dd>{data.program   || "—"}</dd>
                <dt>คณะ</dt>               <dd>{data.faculty ? `คณะ${data.faculty}` : "—"}</dd>
                <dt>ผู้รับผิดชอบ</dt>      <dd>{data.owner     || "—"}</dd>
                <dt>ตำแหน่ง</dt>            <dd>{data.position  || "—"}</dd>
                <dt>อีเมลรับผลอนุมัติ</dt> <dd>{data.email     || "—"}</dd>
                <dt>Industry Framework</dt> <dd>{data.framework || "—"}</dd>
                <dt>วันที่ยื่นเสนอ</dt>    <dd>{fmtDate(data.submitDate)}</dd>
                <dt>ภาคอุตสาหกรรม</dt>
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
              <h4>AI Competencies ({filledComps.length})</h4>
              <button className="summary__edit" type="button" onClick={() => goTo(1)}>
                <PencilIcon /> &nbsp;แก้ไข
              </button>
            </div>
            <div className="summary__body" style={{ padding: 0 }}>
              {filledComps.length ? (
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
                <div style={{ padding: 14, color: "var(--ink-500)" }}>ยังไม่ได้กรอก</div>
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
              <div className="banner__title">ขั้นตอนการอนุมัติหลังส่งคำขอ</div>
              <div className="banner__text" style={{ lineHeight: 1.7 }}>
                เมื่อท่านกด <b>&ldquo;ส่งขออนุมัติ&rdquo;</b> ระบบจะดำเนินการดังนี้:<br />
                <b>1.</b> ส่งสำเนาคำขอไปยังท่านและ{data.faculty ? `คณะ${data.faculty}` : "คณะที่เลือก"}<br />
                <b>2.</b> ส่งต่อไปยัง <b>คณะกรรมการ AI-Ready Curriculum</b> เพื่อพิจารณาภายใน 7 วันทำการ<br />
                <b>3.</b> ท่านจะได้รับผลการพิจารณาพร้อมข้อเสนอแนะ (อนุมัติ / ขอแก้ไข / ไม่อนุมัติ)<br />
                <b>4.</b> หากอนุมัติ จะปลดล็อก Curriculum Mapping Layer 1 และ 2
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
            <div>
              ข้าพเจ้าขอรับรองว่าข้อมูลที่ระบุข้างต้นเป็นความจริงทุกประการ
              และเป็นข้อมูลที่ผ่านความเห็นชอบจากคณะกรรมการบริหารหลักสูตรเรียบร้อยแล้ว
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
