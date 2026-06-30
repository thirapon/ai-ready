import { type T } from "@/lib/i18n";

export function HowItWorks({ t }: { t: T }) {
  const steps = [
    { num: 1, title: t.how1Title, desc: t.how1Desc, actor: t.how1Actor, isApprover: false },
    { num: 2, title: t.how2Title, desc: t.how2Desc, actor: t.how2Actor, isApprover: true },
    { num: 3, title: t.how3Title, desc: t.how3Desc, actor: t.how3Actor, isApprover: false },
    { num: 4, title: t.how4Title, desc: t.how4Desc, actor: t.how4Actor, isApprover: false },
  ];

  return (
    <section id="how" style={{ background: "#f6f8fb", paddingTop: 96, paddingBottom: 96 }} className="max-[980px]:py-16">
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 40px" }} className="max-[980px]:!px-6">
        {/* Eyebrow */}
        <div className="inline-flex items-center" style={{ gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a4f8a", marginBottom: 14 }}>
          <span style={{ width: 24, height: 2, background: "#c9a44c", display: "inline-block" }} />
          {t.howEyebrow}
        </div>

        <h2 style={{ fontSize: 36, fontWeight: 700, color: "#14202e", lineHeight: 1.18, margin: "0 0 14px", maxWidth: 720, letterSpacing: "-0.005em" }}>
          {t.howH2}
        </h2>
        <p style={{ fontSize: 16, color: "#677889", maxWidth: 640, lineHeight: 1.65, margin: 0 }}>
          {t.howLead}
        </p>

        {/* 4-step grid with connecting dashed line */}
        <div className="how-grid-line" style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative z-[1]"
              style={{ background: "#ffffff", border: "1px solid #dde3eb", borderRadius: 14, padding: "18px 20px 22px" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a4f8a", color: "white", display: "grid", placeItems: "center", fontFamily: "var(--font-ibm-plex), sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 14, boxShadow: "0 0 0 6px #f6f8fb" }}>
                {step.num}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#14202e", margin: "0 0 6px" }}>{step.title}</h4>
              <p style={{ fontSize: 13.5, color: "#677889", lineHeight: 1.6, margin: "0 0 14px" }}>{step.desc}</p>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: step.isApprover ? "#c9a44c" : "#1a4f8a", fontWeight: 700 }}>
                {step.actor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
