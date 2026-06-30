import { type T } from "@/lib/i18n";

export function Footer({ t }: { t: T }) {
  const cols = [
    {
      heading: t.footerCol1,
      links: [
        { label: t.footerL1a, href: "#" },
        { label: "Curriculum Mapping", href: "#" },
        { label: "Approver Dashboard", href: "#" },
        { label: t.footerL1d, href: "#" },
      ],
    },
    {
      heading: t.footerCol2,
      links: [
        { label: t.footerL2a, href: "#" },
        { label: "Empty / Error states", href: "#" },
        { label: t.footerL2c, href: "#" },
        { label: "UNESCO Framework", href: "#" },
      ],
    },
    {
      heading: t.footerCol3,
      links: [
        { label: t.footerL3a, href: "#" },
        { label: t.footerL3b, href: "#" },
        { label: t.footerL3c, href: "#" },
        { label: t.footerL3d, href: "#" },
      ],
    },
  ];

  return (
    <footer style={{ background: "#0e2a4c", color: "rgba(255,255,255,0.7)", padding: "56px 40px 28px" }}>
      {/* Inner grid */}
      <div
        style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 48 }}
        className="max-[980px]:!grid-cols-2 max-[980px]:!gap-7"
      >
        {/* Brand col */}
        <div>
          <b style={{ display: "block", color: "white", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            AI-Ready Curriculum
          </b>
          <p style={{ fontSize: 13, lineHeight: 1.65, margin: "8px 0 14px", color: "rgba(255,255,255,0.6)" }}>
            {t.footerDesc}
          </p>
          <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            {t.footerAddress}
            <br />
            <a href="mailto:academic@bu.ac.th" style={{ color: "#c9a44c", textDecoration: "none" }}>
              academic@bu.ac.th
            </a>{" "}
            · 0-2350-3500 ต่อ 0123
          </div>
        </div>

        {/* Link cols */}
        {cols.map((col) => (
          <div key={col.heading}>
            <h5 style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {col.heading}
            </h5>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block transition-colors hover:text-white"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none", padding: "5px 0" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Base bar */}
      <div
        style={{ maxWidth: 1180, margin: "40px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.10)", display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.45)" }}
        className="flex-wrap"
      >
        <div>© 2026 Bangkok University · Office of Academic Affairs · All rights reserved.</div>
        <div>v1.0.0 · Updated May 2026</div>
      </div>
    </footer>
  );
}
