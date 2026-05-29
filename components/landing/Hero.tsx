function FlowViz() {
  const steps = [
    {
      num: "01",
      title: "ยื่นคำขอ School/Industry Framework",
      sub: "กรอกข้อมูลหลักสูตร 3 ขั้นตอน",
      chip: "ฉบับร่าง",
      chipBg: "rgba(255,255,255,0.10)",
      chipColor: "rgba(255,255,255,0.75)",
      active: true,
    },
    {
      num: "02",
      title: "คณะกรรมการพิจารณา",
      sub: "ตรวจสอบและให้ข้อเสนอแนะ",
      chip: "รอพิจารณา",
      chipBg: "rgba(201,164,76,0.18)",
      chipColor: "#c9a44c",
      active: false,
    },
    {
      num: "03",
      title: "Curriculum Mapping",
      sub: "แมพรายวิชาตาม UNESCO + Industry",
      chip: "ปลดล็อก",
      chipBg: "rgba(82,200,142,0.16)",
      chipColor: "#6fdba5",
      active: false,
    },
  ];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: 26,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
      }}
    >
      {/* Head */}
      <div
        className="flex items-center gap-2"
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#c9a44c",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        เส้นทางคำขอของท่าน
      </div>

      {/* Steps with connectors */}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <div key={step.num}>
            <div
              className="flex items-center"
              style={{
                gap: 14,
                background: step.active
                  ? "rgba(201,164,76,0.14)"
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${
                  step.active
                    ? "rgba(201,164,76,0.4)"
                    : "rgba(255,255,255,0.10)"
                }`,
                padding: "13px 16px",
                borderRadius: 10,
              }}
            >
              {/* Number */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: step.active
                    ? "#c9a44c"
                    : "rgba(255,255,255,0.10)",
                  color: step.active ? "#2a1c00" : "rgba(255,255,255,0.78)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 12.5,
                  flexShrink: 0,
                  fontFamily: "var(--font-ibm-plex), sans-serif",
                }}
              >
                {step.num}
              </div>
              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  {step.sub}
                </div>
              </div>
              {/* Chip */}
              <div
                style={{
                  background: step.chipBg,
                  color: step.chipColor,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 5,
                  flexShrink: 0,
                }}
              >
                {step.chip}
              </div>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 2,
                  height: 8,
                  background: "rgba(255,255,255,0.14)",
                  marginLeft: 30,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <header
      className="hero-overlay relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 1200px 600px at 80% -10%, rgba(201,164,76,0.18), transparent 60%),
          radial-gradient(ellipse 900px 500px at 0% 100%, rgba(45,108,176,0.14), transparent 55%),
          linear-gradient(180deg, #0e2a4c 0%, #133a66 60%, #1a4f8a 100%)
        `,
        color: "white",
        padding: "80px 40px 100px",
      }}
    >
      {/* Inner grid */}
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 72,
          alignItems: "center",
        }}
        className="max-[980px]:!grid-cols-1 max-[980px]:!gap-12"
      >
        {/* ── Left column ── */}
        <div>
          {/* Eyebrow */}
          <span
            className="inline-flex items-center"
            style={{
              gap: 8,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.92)",
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#c9a44c",
                boxShadow: "0 0 0 4px rgba(201,164,76,0.18)",
                flexShrink: 0,
              }}
            />
            AI-Ready Curriculum Framework · 2026
          </span>

          {/* H1 */}
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.08,
              margin: "0 0 22px",
              letterSpacing: "-0.01em",
            }}
            className="max-[980px]:!text-[36px]"
          >
            เตรียมหลักสูตรของท่าน
            <br />
            สู่{" "}
            <em style={{ color: "#c9a44c", fontStyle: "normal" }}>
              ยุคปัญญาประดิษฐ์
            </em>
          </h1>

          {/* Lead */}
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 540,
              margin: "0 0 32px",
            }}
          >
            แพลตฟอร์มเดียวที่ช่วยให้คณะและผู้ดูแลหลักสูตร
            ยื่นขออนุมัติสมรรถนะ AI-Ready และ จัดทำ Curriculum Mapping
            ตามกรอบ UNESCO และ School/Industry AI Competency Frameworks
            — ตั้งแต่กรอกคำขอ ติดตามสถานะ จนถึงรายงานผล
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap" style={{ gap: 12 }}>
            <a
              href="#"
              className="inline-flex items-center transition-all hover:-translate-y-px"
              style={{
                gap: 10,
                padding: "14px 22px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 600,
                textDecoration: "none",
                background: "white",
                color: "#133a66",
                boxShadow: "0 6px 22px rgba(0,0,0,0.22)",
              }}
            >
              เริ่มยื่นคำขอ School/Industry Framework
            </a>
            <a
              href="#how"
              className="inline-flex items-center transition-all"
              style={{
                gap: 10,
                padding: "14px 22px",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 600,
                textDecoration: "none",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.24)",
              }}
            >
              ดูขั้นตอนทั้งหมด
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 44,
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 40,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.14)",
              maxWidth: 540,
            }}
          >
            {[
              { value: "2", label: "เส้นทางหลัก" },
              { value: "~15 นาที", label: "เวลายื่นคำขอ" },
              { value: "3 ชั้น", label: "UNESCO · School · Industry" },
            ].map(({ value, label }) => (
              <div key={label}>
                <b
                  style={{
                    display: "block",
                    fontFamily: "var(--font-ibm-plex), sans-serif",
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#c9a44c",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {value}
                </b>
                <span
                  style={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.65)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column — FlowViz ── */}
        <FlowViz />
      </div>
    </header>
  );
}
