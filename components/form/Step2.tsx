import type { FormData, Competency } from "./types";

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

interface Props {
  data: FormData;
  setRows: (rows: Competency[]) => void;
}

export function Step2({ data, setRows }: Props) {
  const update = (id: number, field: keyof Competency, value: unknown) => {
    setRows(data.competencies.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleYear = (id: number, y: number) => {
    setRows(data.competencies.map((r) => {
      if (r.id !== id) return r;
      const cur = new Set(r.years);
      if (cur.has(y)) { cur.delete(y); } else { cur.add(y); }
      return { ...r, years: Array.from(cur).sort((a, b) => a - b) };
    }));
  };

  const addRow = () => {
    setRows([...data.competencies, { id: Date.now(), name: "", source: "school", years: [], desc: "", note: "" }]);
  };

  const delRow = (id: number) => {
    if (data.competencies.length <= 1) return;
    setRows(data.competencies.filter((r) => r.id !== id));
  };

  return (
    <>
      <div className="card__head">
        <span className="card__step-label">ขั้นตอนที่ 2 จาก 3</span>
        <h2 className="card__title">สมรรถนะด้านปัญญาประดิษฐ์ (AI Competencies)</h2>
        <p className="card__desc">ระบุสมรรถนะ AI ที่ต้องการให้ผู้เรียนมีหลังจบหลักสูตร — แนะนำให้กรอกอย่างน้อย 5 สมรรถนะ</p>
      </div>
      <div className="card__body">
        <div className="comp-list">
          {data.competencies.map((row, i) => (
            <div key={row.id} className="comp-card">
              <div className="comp-card__head">
                <span className="comp-card__num">{String(i + 1).padStart(2, "0")}</span>
                <input
                  className="comp-card__name"
                  placeholder="ชื่อสมรรถนะ — เช่น Prompt Engineering"
                  value={row.name}
                  onChange={(e) => update(row.id, "name", e.target.value)}
                />
                <button className="row-del" onClick={() => delRow(row.id)} aria-label="ลบสมรรถนะนี้" type="button">
                  <TrashIcon />
                </button>
              </div>

              <div className="comp-card__meta">
                {/* Source toggle */}
                <div className="comp-meta__group">
                  <span className="comp-meta__label">ประเภท</span>
                  <div className="seg">
                    {(["school", "industry"] as const).map((src) => (
                      <button key={src} type="button"
                        className={`seg__btn${row.source === src ? " is-on" : ""}`}
                        onClick={() => update(row.id, "source", src)}>
                        {src === "school" ? "School" : "Industry"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Year toggles */}
                <div className="comp-meta__group">
                  <span className="comp-meta__label">ชั้นปีที่สอน</span>
                  <div className="yr-mini-row">
                    {[1, 2, 3, 4, 5].map((y) => (
                      <button key={y} type="button"
                        className={`yr-mini${row.years.includes(y) ? " is-on" : ""}`}
                        onClick={() => toggleYear(row.id, y)}
                        title={`ชั้นปีที่ ${y}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="comp-card__fields">
                <div className="comp-field">
                  <label className="comp-field__label">คำอธิบาย</label>
                  <textarea className="textarea" rows={3}
                    placeholder="อธิบายว่าสมรรถนะนี้ครอบคลุมอะไรบ้าง ผู้เรียนต้องทำอะไรได้หลังจบหลักสูตร..."
                    value={row.desc}
                    onChange={(e) => update(row.id, "desc", e.target.value)} />
                </div>
                <div className="comp-field">
                  <label className="comp-field__label">หมายเหตุ</label>
                  <textarea className="textarea" rows={3}
                    placeholder="รายวิชาที่เกี่ยวข้อง / แหล่งอ้างอิง / เงื่อนไขพิเศษ (ถ้ามี)"
                    value={row.note}
                    onChange={(e) => update(row.id, "note", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="tbl-add" type="button" onClick={addRow}>
          <PlusIcon /> เพิ่มสมรรถนะใหม่
        </button>

        <div className="banner banner--info" style={{ marginTop: 18 }}>
          <div className="banner__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div>
            <div className="banner__title">เคล็ดลับการกรอกข้อมูล</div>
            <div className="banner__text">เน้นสมรรถนะที่วัดและประเมินได้จริง โดยใช้ School AI Competency Framework เป็นตัวหลัก ถ้ายังไม่พอสามารถใช้ Industry AI Competency Framework เพิ่มเติม</div>
          </div>
        </div>
      </div>
    </>
  );
}
