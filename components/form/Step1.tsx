import type { FormData } from "./types";
import { FACULTY_PROGRAMS, SECTORS } from "./types";

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Props {
  data: FormData;
  set: (key: keyof FormData, value: unknown) => void;
}

export function Step1({ data, set }: Props) {
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
        <span className="card__step-label">ขั้นตอนที่ 1 จาก 3</span>
        <h2 className="card__title">ข้อมูลคณะและหลักสูตร</h2>
        <p className="card__desc">กรอกข้อมูลพื้นฐานของหลักสูตรที่ขอประเมินความพร้อมด้าน AI พร้อมระบุผู้รับผิดชอบและกรอบมาตรฐานที่ใช้อ้างอิง</p>
      </div>
      <div className="card__body">
        <div className="field-grid">

          {/* คณะ */}
          <div className="field">
            <label className="field__label">คณะ <span className="req">*</span></label>
            <select className="select" value={data.faculty} onChange={(e) => onFacultyChange(e.target.value)}>
              <option value="">— เลือกคณะ —</option>
              {facultyList.map((f) => (
                <option key={f} value={f}>คณะ{f}</option>
              ))}
            </select>
          </div>

          {/* หลักสูตร */}
          <div className="field">
            <label className="field__label">หลักสูตร <span className="req">*</span></label>
            {!data.faculty && (
              <p className="field__hint" style={{ color: "var(--ink-400)" }}>เลือกคณะก่อนเพื่อแสดงรายชื่อหลักสูตร</p>
            )}
            <select
              className="select"
              value={data.program}
              onChange={(e) => set("program", e.target.value)}
              disabled={!data.faculty}
            >
              <option value="">{data.faculty ? "— เลือกหลักสูตร —" : "— กรุณาเลือกคณะก่อน —"}</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* ชื่อผู้รับผิดชอบ */}
          <div className="field">
            <label className="field__label">ชื่อผู้รับผิดชอบหลักสูตร <span className="req">*</span></label>
            <input className="input" type="text" placeholder="เช่น ผศ.ดร. สมชาย ใจดี"
              value={data.owner} onChange={(e) => set("owner", e.target.value)} />
          </div>

          {/* ตำแหน่ง */}
          <div className="field">
            <label className="field__label">ตำแหน่ง <span className="req">*</span></label>
            <input className="input" type="text" placeholder="เช่น ประธานหลักสูตร / หัวหน้าภาควิชา"
              value={data.position} onChange={(e) => set("position", e.target.value)} />
          </div>

          {/* อีเมล */}
          <div className="field field--full">
            <label className="field__label">อีเมลสำหรับรับผลอนุมัติ <span className="req">*</span></label>
            <p className="field__hint">ระบบจะส่งผลการพิจารณา (อนุมัติ / ขอแก้ไข / ไม่อนุมัติ) ไปยังอีเมลนี้</p>
            <input className="input" type="email" placeholder="เช่น name@bu.ac.th"
              value={data.email} onChange={(e) => set("email", e.target.value)} />
          </div>

          {/* Framework */}
          <div className="field">
            <label className="field__label">Industry Framework ที่อ้างอิง <span className="req">*</span></label>
            <p className="field__hint">ระบุชื่อกรอบมาตรฐาน / แหล่งอ้างอิง</p>
            <input className="input" type="text"
              placeholder="เช่น UNESCO AI Competency Framework for Students (2024)"
              value={data.framework} onChange={(e) => set("framework", e.target.value)} />
          </div>

          {/* วันที่ยื่น */}
          <div className="field">
            <label className="field__label">วันที่ยื่นเสนอ <span className="req">*</span></label>
            <p className="field__hint">วันที่ต้องการให้คณะกรรมการพิจารณา</p>
            <input className="input" type="date"
              value={data.submitDate} onChange={(e) => set("submitDate", e.target.value)} />
          </div>

          {/* ภาคอุตสาหกรรม */}
          <div className="field field--full">
            <label className="field__label">ภาคอุตสาหกรรมที่เกี่ยวข้อง <span className="req">*</span></label>
            <p className="field__hint">เลือกได้มากกว่าหนึ่งภาคส่วน — ระบุกลุ่มอาชีพปลายทางที่หลักสูตรนี้เตรียมบัณฑิต</p>
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
