import { type T } from "@/lib/i18n";

type TrackStep = { label: string; meta: string };

type TrackProps = {
  variant: "approval" | "mapping";
  trackNum: string;
  name: string;
  lead: string;
  steps: TrackStep[];
  footLeft: React.ReactNode;
  ctaLabel: string;
  icon: React.ReactNode;
  ribbonGradient: string;
  iconBg: string;
  iconColor: string;
  stepNumBg: string;
  stepNumColor: string;
  ctaColor: string;
  href: string;
};

function TrackCard({
  trackNum, name, lead, steps, footLeft, ctaLabel, icon,
  ribbonGradient, iconBg, iconColor, stepNumBg, stepNumColor, ctaColor, href,
}: TrackProps) {
  return (
    <a
      href={href}
      className="group relative flex flex-col overflow-hidden transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,32,46,0.10)]
        hover:border-bu-blue"
      style={{ background: "#ffffff", border: "1px solid #dde3eb", borderRadius: 18, padding: "32px 30px 26px", textDecoration: "none", color: "inherit" }}
    >
      {/* Colored ribbon */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: ribbonGradient }} />

      {/* Head */}
      <div className="flex items-center" style={{ gap: 16, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: iconBg, color: iconColor, display: "grid", placeItems: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-ibm-plex), sans-serif", fontSize: 11.5, fontWeight: 700, color: "#677889", letterSpacing: "0.12em" }}>
            {trackNum}
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: "#14202e", lineHeight: 1.2, margin: "2px 0 0" }}>{name}</h3>
        </div>
      </div>

      {/* Lead */}
      <p style={{ fontSize: 14.5, color: "#677889", lineHeight: 1.65, margin: "0 0 22px" }}>{lead}</p>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, margin: "0 0 24px", padding: "18px 0", borderTop: "1px dashed #dde3eb", borderBottom: "1px dashed #dde3eb" }}>
        {steps.map((step, i) => (
          <div key={i} className="flex items-center" style={{ gap: 14, padding: "7px 0", fontSize: 13.5 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: stepNumBg, color: stepNumColor, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, fontFamily: "var(--font-ibm-plex), sans-serif", flexShrink: 0 }}>
              {i + 1}
            </div>
            <span style={{ color: "#3a4859", flex: 1 }}>{step.label}</span>
            <span style={{ color: "#8b99a8", fontSize: 12, fontFamily: "var(--font-ibm-plex), sans-serif" }}>{step.meta}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto" style={{ gap: 12 }}>
        <div style={{ fontSize: 12.5, color: "#677889" }}>{footLeft}</div>
        <span
          className="inline-flex items-center group-hover:[&_svg]:translate-x-[3px]"
          style={{ gap: 6, fontSize: 13.5, fontWeight: 700, color: ctaColor, textDecoration: "none" }}
        >
          {ctaLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </a>
  );
}

export function TracksSection({ t }: { t: T }) {
  return (
    <section style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 40px" }} className="max-[980px]:!px-6 max-[980px]:!py-16" id="tracks">
      {/* Eyebrow */}
      <div className="inline-flex items-center" style={{ gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a4f8a", marginBottom: 14 }}>
        <span style={{ width: 24, height: 2, background: "#c9a44c", display: "inline-block" }} />
        {t.tracksEyebrow}
      </div>

      <h2 style={{ fontSize: 36, fontWeight: 700, color: "#14202e", lineHeight: 1.18, margin: "0 0 14px", maxWidth: 720, letterSpacing: "-0.005em" }}>
        {t.tracksH2}
      </h2>
      <p style={{ fontSize: 16, color: "#677889", maxWidth: 640, lineHeight: 1.65, margin: 0 }}>
        {t.tracksLead}
      </p>

      {/* Two track cards */}
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="max-[980px]:!grid-cols-1">
        {/* Track 1 — Approval */}
        <TrackCard
          variant="approval"
          href="/login"
          trackNum="TRACK 01"
          name={t.track1Name}
          lead={t.track1Lead}
          ribbonGradient="linear-gradient(90deg, #1a4f8a 0%, #2d6cb0 100%)"
          iconBg="#eef4fb" iconColor="#1a4f8a"
          stepNumBg="#eef4fb" stepNumColor="#1a4f8a"
          ctaColor="#1a4f8a"
          ctaLabel={t.track1Cta}
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <polyline points="9 15 11 17 15 13" />
            </svg>
          }
          steps={[
            { label: t.track1Step1, meta: t.track1Step1Meta },
            { label: t.track1Step2, meta: t.track1Step2Meta },
            { label: t.track1Step3, meta: t.track1Step3Meta },
          ]}
          footLeft={
            <>{t.track1FootPre}{" "}<b style={{ color: "#14202e", fontWeight: 700 }}>{t.track1FootBold}</b></>
          }
        />

        {/* Track 2 — Mapping */}
        <TrackCard
          variant="mapping"
          href="/login"
          trackNum="TRACK 02"
          name={t.track2Name}
          lead={t.track2Lead}
          ribbonGradient="linear-gradient(90deg, #c9a44c 0%, #e0bf6f 100%)"
          iconBg="#fdf3e3" iconColor="#a16216"
          stepNumBg="#fdf3e3" stepNumColor="#a16216"
          ctaColor="#a16216"
          ctaLabel={t.track2Cta}
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          steps={[
            { label: t.track2Step1, meta: t.track2Step1Meta },
            { label: t.track2Step2, meta: t.track2Step2Meta },
            { label: t.track2Step3, meta: t.track2Step3Meta },
          ]}
          footLeft={
            <span className="inline-flex items-center" style={{ gap: 6, fontSize: 11.5, color: "#a86a14", background: "#fcf3e1", padding: "3px 9px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.02em" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {t.track2FootLock}
            </span>
          }
        />
      </div>
    </section>
  );
}
