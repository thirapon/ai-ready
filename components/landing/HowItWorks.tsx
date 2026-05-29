const HOW_STEPS = [
  {
    num: 1,
    title: "ยื่นคำขอ",
    desc: "ผู้ยื่นกรอกข้อมูลหลักสูตร สมรรถนะ และผลลัพธ์การเรียนรู้ผ่านฟอร์ม 3 ขั้นตอน ระบบบันทึกฉบับร่างให้อัตโนมัติ",
    actor: "ผู้ยื่น (Submitter)",
    isApprover: false,
  },
  {
    num: 2,
    title: "คณะกรรมการพิจารณา",
    desc: "คณะกรรมการได้รับอีเมลแจ้งเตือนทันที เปิด Dashboard ดูคำขอที่รอ และให้ข้อเสนอแนะหรืออนุมัติ",
    actor: "คณะกรรมการ (Approver)",
    isApprover: true,
  },
  {
    num: 3,
    title: "แก้ไข (ถ้ามี)",
    desc: "หากต้องแก้ไข ผู้ยื่นจะได้รับอีเมลพร้อมข้อเสนอแนะ แก้ไขแล้วส่งกลับเพื่อพิจารณาใหม่",
    actor: "ผู้ยื่น (Submitter)",
    isApprover: false,
  },
  {
    num: 4,
    title: "Mapping ปลดล็อก",
    desc: "เมื่อได้รับอนุมัติ ระบบเปิด Curriculum Mapping ทั้ง 2 Layer ให้กรอกและส่งออกรายงาน",
    actor: "ผู้ยื่น (Submitter)",
    isApprover: false,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      style={{ background: "#f6f8fb", paddingTop: 96, paddingBottom: 96 }}
      className="max-[980px]:py-16"
    >
      <div
        style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }}
        className="max-[980px]:!px-6"
      >
        {/* Eyebrow */}
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
            style={{ width: 24, height: 2, background: "#c9a44c", display: "inline-block" }}
          />
          How it works · ขั้นตอนทั้งระบบ
        </div>

        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: "#14202e",
            lineHeight: 1.18,
            margin: "0 0 14px",
            maxWidth: 720,
            letterSpacing: "-0.005em",
          }}
        >
          จากคำขอแรกถึงรายงานการแมพ ใน 4 ขั้นตอน
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#677889",
            maxWidth: 640,
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          ระบบประสานงาน 2 บทบาทอัตโนมัติผ่านอีเมล —
          ผู้ยื่นไม่ต้องตามคณะกรรมการ คณะกรรมการไม่ต้องเปิดอีเมลค้น
        </p>

        {/* 4-step grid with connecting dashed line */}
        <div
          className="how-grid-line"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 28,
          }}
        >
          {HOW_STEPS.map((step) => (
            <div
              key={step.num}
              className="relative z-[1]"
              style={{
                background: "#ffffff",
                border: "1px solid #dde3eb",
                borderRadius: 14,
                padding: "18px 20px 22px",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#1a4f8a",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-ibm-plex), sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 14,
                  boxShadow: "0 0 0 6px #f6f8fb",
                }}
              >
                {step.num}
              </div>
              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#14202e",
                  margin: "0 0 6px",
                }}
              >
                {step.title}
              </h4>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#677889",
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                }}
              >
                {step.desc}
              </p>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: step.isApprover ? "#c9a44c" : "#1a4f8a",
                  fontWeight: 700,
                }}
              >
                {step.actor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
