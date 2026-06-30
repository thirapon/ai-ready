import { type T } from "@/lib/i18n";

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function RolesSection({ t }: { t: T }) {
  const roles = [
    {
      name: t.role1Name,
      desc: t.role1Desc,
      iconBg: "#eef4fb", iconColor: "#1a4f8a",
      linkLabel: t.role1Link,
      linkHref: "/login" as string | null,
      linkColor: "#1a4f8a",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: t.role2Name,
      desc: t.role2Desc,
      iconBg: "#fdf3e3", iconColor: "#a16216",
      linkLabel: t.role2Link,
      linkHref: "/login" as string | null,
      linkColor: "#1a4f8a",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.55 0 3 .39 4.27 1.08" />
          <path d="M21 5l-9 9-3-3" />
        </svg>
      ),
    },
    {
      name: t.role3Name,
      desc: t.role3Desc,
      iconBg: "#eef1f6", iconColor: "#3a4859",
      linkLabel: t.role3Link,
      linkHref: null as string | null,
      linkColor: "#8b99a8",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const resources = [
    {
      label: t.resEmail,
      href: "#",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: "Empty / Error states",
      href: "#",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      label: t.resGuide,
      href: "#",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="roles" style={{ maxWidth: 1180, margin: "0 auto", padding: "96px 40px" }} className="max-[980px]:!px-6 max-[980px]:!py-16">
      {/* Eyebrow */}
      <div className="inline-flex items-center" style={{ gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a4f8a", marginBottom: 14 }}>
        <span style={{ width: 24, height: 2, background: "#c9a44c", display: "inline-block" }} />
        {t.rolesEyebrow}
      </div>

      <h2 style={{ fontSize: 36, fontWeight: 700, color: "#14202e", lineHeight: 1.18, margin: "0 0 14px", maxWidth: 720, letterSpacing: "-0.005em" }}>
        {t.rolesH2}
      </h2>
      <p style={{ fontSize: 16, color: "#677889", maxWidth: 640, lineHeight: 1.65, margin: 0 }}>
        {t.rolesLead}
      </p>

      {/* Role cards */}
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="max-[980px]:!grid-cols-1">
        {roles.map((role) => (
          <div
            key={role.name}
            style={{ border: "1px solid #dde3eb", borderRadius: 14, padding: "24px 22px", background: "#ffffff", display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: role.iconBg, color: role.iconColor, display: "grid", placeItems: "center" }}>
              {role.icon}
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#14202e", margin: 0 }}>{role.name}</h4>
            <p style={{ fontSize: 13.5, color: "#677889", lineHeight: 1.6, margin: 0 }}>{role.desc}</p>
            {role.linkHref ? (
              <a href={role.linkHref} className="inline-flex items-center gap-1.5 transition-[gap] hover:gap-2 mt-auto" style={{ fontSize: 13, fontWeight: 600, color: role.linkColor, textDecoration: "none", marginTop: "auto" }}>
                {role.linkLabel}
                <ArrowIcon />
              </a>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: role.linkColor, marginTop: "auto" }}>{role.linkLabel}</span>
            )}
          </div>
        ))}
      </div>

      {/* Resources strip */}
      <div className="flex flex-wrap items-center" style={{ marginTop: 32, background: "#eef4fb", border: "1px solid #dbe7f4", borderRadius: 14, padding: "22px 26px", gap: 28 }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#14202e", margin: "0 0 4px" }}>{t.resHeading}</h4>
          <p style={{ fontSize: 13, color: "#3a4859", margin: 0 }}>{t.resDesc}</p>
        </div>
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          {resources.map((res) => (
            <a
              key={res.label}
              href={res.href}
              className="inline-flex items-center gap-[7px] transition-all hover:bg-white hover:border-bu-blue"
              style={{ background: "#ffffff", border: "1px solid #dbe7f4", padding: "9px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#1a4f8a", textDecoration: "none" }}
            >
              {res.icon}
              {res.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
