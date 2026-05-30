"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "@/lib/faculties";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "pending" | "approved" | "changes" | "rejected";
interface Submission {
  id: string;
  faculty_code: string;
  faculty_name: string;
  status: Status;
  ref_id: string | null;
  version: number;
  submitted_at: string | null;
  form_data: Record<string, unknown> | null;
}
type TabKey = "all" | Status;

const STATUS_META: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "รออนุมัติ",   color: "#a86a14", bg: "#fcf3e1", border: "#f0dca6" },
  approved: { label: "อนุมัติแล้ว", color: "#137a4a", bg: "#e6f4ec", border: "#b5dbc5" },
  changes:  { label: "ขอแก้ไข",    color: "#1a4f8a", bg: "#eef4fb", border: "#dbe7f4" },
  rejected: { label: "ไม่อนุมัติ",  color: "#b53030", bg: "#fdecec", border: "#f4d0d0" },
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",      label: "ทั้งหมด"     },
  { key: "pending",  label: "รออนุมัติ"   },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "changes",  label: "ขอแก้ไข"    },
  { key: "rejected", label: "ไม่อนุมัติ"  },
];

function fmtDateThai(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const m = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${m[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(-2)}`;
}

function daysAgo(s: string | null) {
  if (!s) return 0;
  return Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className="status" style={{ background: m.bg, color: m.color, borderColor: m.border }}>
      <span className="status__dot" />
      {m.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApproverDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<{ name: string } | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("pending");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"date_desc" | "date_asc">("date_desc");
  const [pendingDelete, setPendingDelete] = useState<Submission | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) { router.replace("/login"); return; }
    try {
      const sess = JSON.parse(raw);
      if (sess.role !== "approver") { router.replace("/login"); return; }
      setSession(sess);
    } catch {
      router.replace("/login"); return;
    }

    fetch("/api/approver/submissions")
      .then((r) => r.ok ? r.json() : { submissions: [] })
      .then((d) => setSubmissions(d.submissions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const visible = useMemo(
    () => submissions.filter((s) => !deletedIds.has(s.id)),
    [submissions, deletedIds]
  );

  const counts = useMemo(() => {
    const c = { all: visible.length, pending: 0, approved: 0, changes: 0, rejected: 0 };
    visible.forEach((s) => { if (s.status in c) c[s.status as Status]++; });
    return c;
  }, [visible]);

  const filtered = useMemo(() => {
    let list = visible.slice();
    if (tab !== "all") list = list.filter((s) => s.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        s.faculty_name.toLowerCase().includes(q) ||
        (s.ref_id ?? "").toLowerCase().includes(q) ||
        JSON.stringify(s.form_data ?? {}).toLowerCase().includes(q)
      );
    }
    if (sortOrder === "date_desc") list.sort((a, b) => (b.submitted_at ?? "").localeCompare(a.submitted_at ?? ""));
    if (sortOrder === "date_asc")  list.sort((a, b) => (a.submitted_at ?? "").localeCompare(b.submitted_at ?? ""));
    return list;
  }, [visible, tab, search, sortOrder]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setDeletedIds((p) => { const n = new Set(p); n.add(pendingDelete.id); return n; });
    setToast({ id: pendingDelete.id, name: pendingDelete.faculty_name });
    setPendingDelete(null);
    setTimeout(() => setToast(null), 4500);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    router.push("/login");
  };

  if (!session || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f6f8fb", display: "grid", placeItems: "center" }}>
        <div style={{ color: "#677889", fontSize: 14 }}>กำลังโหลด…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb" }}>
      {/* Topbar */}
      <header className="app-topbar">
        <div className="app-topbar__logo">BU</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <span className="app-topbar__title">ระบบบริหารหลักสูตร AI-Ready</span>
            <span className="topbar__role-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              คณะกรรมการ AI-Ready
            </span>
          </div>
          <div className="app-topbar__sub">มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs</div>
        </div>
        <div style={{ flex: 1 }} />
        <nav className="topbar__nav">
          <a href="/approver" className="is-active">คำขออนุมัติ</a>
        </nav>
        <div style={{ width: 1, height: 28, background: "#dde3eb", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600, color: "#14202e", fontSize: 14 }}>{session.name}</div>
            <div style={{ fontSize: 11.5, color: "#677889" }}>ประธานคณะกรรมการ AI-Ready</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#dbe7f4", color: "#1a4f8a", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 12 }}>
            กก
          </div>
          <button className="logout-btn" onClick={handleLogout} title="ออกจากระบบ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 60px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Page head */}
        <div className="page-head">
          <div>
            <div className="page-head__crumbs">ระบบ AI-Ready Curriculum &nbsp;›&nbsp; <span>คำขออนุมัติหลักสูตร</span></div>
            <h1 className="page-head__title">คำขออนุมัติหลักสูตร AI-Ready</h1>
            <p className="page-head__desc">รายการคำขอจากคณะต่างๆ ที่รอการพิจารณาโดยคณะกรรมการ AI-Ready Curriculum</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          {([
            { key: "pending",  label: "รออนุมัติ",   color: "#a86a14", bg: "#fcf3e1", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, sub: "รวมในวาระประชุม" },
            { key: "approved", label: "อนุมัติแล้ว", color: "#137a4a", bg: "#e6f4ec", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, sub: "ทั้งหมด" },
            { key: "changes",  label: "ขอแก้ไข",    color: "#1a4f8a", bg: "#eef4fb", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, sub: "รอการแก้ไขจากผู้ยื่น" },
            { key: "rejected", label: "ไม่อนุมัติ",  color: "#b53030", bg: "#fdecec", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>, sub: "ทั้งหมด" },
          ] as { key: TabKey; label: string; color: string; bg: string; icon: React.ReactNode; sub: string }[]).map((s) => (
            <div key={s.key}
              className={`stat-card${tab === s.key ? " is-on" : ""}`}
              style={{ "--stat-color": s.color, "--stat-bg": s.bg } as React.CSSProperties}
              onClick={() => setTab(s.key as TabKey)}
            >
              <div className="stat-card__head">
                <span>{s.label}</span>
                <span className="stat-card__icon">{s.icon}</span>
              </div>
              <div className="stat-card__num">{counts[s.key as Status]}</div>
              <div className="stat-card__sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs + table */}
        <div>
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={`tab${tab === t.key ? " is-on" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
                <span className="tab__count">{counts[t.key as TabKey] ?? counts.all}</span>
              </button>
            ))}
          </div>

          <div className="toolbar">
            <div className="toolbar__left">
              <div className="search">
                <span className="search__icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input type="text" placeholder="ค้นหาด้วยชื่อคณะ / รหัสคำขอ" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="filter-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "date_desc" | "date_asc")}>
                  <option value="date_desc">ล่าสุดก่อน</option>
                  <option value="date_asc">เก่าสุดก่อน</option>
                </select>
              </div>
            </div>
          </div>

          <div className="req-tbl-wrap">
            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#14202e", marginBottom: 4 }}>ไม่พบคำขอที่ตรงกับเงื่อนไข</div>
                <div>ลองปรับเงื่อนไขการค้นหาหรือ filter</div>
              </div>
            ) : (
              <>
                <table className="req-tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>รหัสคำขอ</th>
                      <th>คณะ / ผู้รับผิดชอบ</th>
                      <th style={{ width: 90 }}>วันที่ยื่น</th>
                      <th style={{ width: 90 }}>สมรรถนะ</th>
                      <th style={{ width: 120 }}>สถานะ</th>
                      <th style={{ width: 70 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const fd = s.form_data as Record<string, unknown> | null;
                      const comps = Array.isArray(fd?.competencies) ? (fd!.competencies as { name?: string }[]).filter((c) => c.name?.trim()) : [];
                      return (
                        <tr key={s.id} onClick={() => router.push(`/approver/review/${s.id}`)}>
                          <td>
                            <span className="req-id">{s.ref_id ?? "—"}</span>
                          </td>
                          <td>
                            <div className="req-program">{fd?.program as string || "—"}</div>
                            <div className="req-faculty">{s.faculty_name}</div>
                          </td>
                          <td style={{ fontSize: 13, color: "#3a4859" }}>
                            {fmtDateThai(s.submitted_at)}
                            <div style={{ fontSize: 11, color: "#677889", marginTop: 2 }}>{daysAgo(s.submitted_at)} วันที่แล้ว</div>
                          </td>
                          <td style={{ fontWeight: 600, color: "#3a4859" }}>{comps.length}</td>
                          <td><StatusBadge status={s.status} /></td>
                          <td>
                            <div className="row-actions">
                              <button className="row-act row-act--danger" title="ลบคำขอ"
                                onClick={(e) => { e.stopPropagation(); setPendingDelete(s); }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
                                  <path d="M10 11v6"/><path d="M14 11v6"/>
                                </svg>
                              </button>
                              <span className="row-chev">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="pagination">
                  <div>แสดง <b style={{ color: "#14202e" }}>{filtered.length}</b> จาก {visible.length} คำขอ</div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Delete modal */}
      {pendingDelete && (
        <div className="modal-bg" onClick={() => setPendingDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__icon" style={{ background: "#fdecec", color: "#b53030" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className="modal__title">ลบคำขอ {pendingDelete.ref_id}?</h3>
            <p className="modal__text">
              คำขอของ <b style={{ color: "#14202e" }}>{pendingDelete.faculty_name}</b> จะถูกซ่อนออกจากรายการ — กู้คืนได้ทันทีจาก notification
            </p>
            <div className="modal__foot">
              <button className="btn" onClick={() => setPendingDelete(null)}>ยกเลิก</button>
              <button className="btn btn--danger" onClick={confirmDelete}>ลบคำขอ</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <div className="toast__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="toast__text">
            <b>ซ่อนคำขอแล้ว</b>
            <span>{toast.name}</span>
          </div>
          <button className="toast__undo" onClick={() => { setDeletedIds((p) => { const n = new Set(p); n.delete(toast.id); return n; }); setToast(null); }}>กู้คืน</button>
          <button className="toast__close" onClick={() => setToast(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
