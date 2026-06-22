/**
 * Public faculty registry — names and codes only.
 * Safe to import in client components.
 *
 * Passwords live in environment variables (never in source code):
 *   FACULTY_<CODE>_PASSWORD  e.g. FACULTY_IT_PASSWORD
 *   APPROVER_PASSWORD
 */
export interface Faculty {
  code: string;
  name: string;
}

export const FACULTIES: Faculty[] = [
  { code: "commarts", name: "คณะนิเทศศาสตร์" },
  { code: "business", name: "คณะบริหารธุรกิจ" },
  { code: "account",  name: "คณะบัญชี" },
  { code: "law",      name: "คณะนิติศาสตร์" },
  { code: "huso",     name: "คณะมนุษยศาสตร์และการจัดการการท่องเที่ยว" },
  { code: "econ",     name: "คณะเศรษฐศาสตร์และการลงทุน" },
  { code: "eng",      name: "คณะวิศวกรรมศาสตร์" },
  { code: "it",       name: "คณะเทคโนโลยีสารสนเทศและนวัตกรรม" },
  { code: "arch",     name: "คณะสถาปัตยกรรมศาสตร์" },
  { code: "fineart",  name: "คณะศิลปกรรมศาสตร์" },
  { code: "dmca",     name: "คณะดิจิทัลมีเดียและศิลปะภาพยนตร์" },
  { code: "busem",    name: "คณะการสร้างเจ้าของธุรกิจและการบริหารกิจการ" },
  { code: "intl",     name: "วิทยาลัยนานาชาติ" },
  { code: "intlcn",   name: "วิทยาลัยนานาชาติจีน" },
];

export const APPROVER = {
  username: "approver",
  name: "คณะกรรมการ AI-Ready",
};

/**
 * Scoped viewers — read-only approver accounts limited to specific faculties.
 * They see Curriculum Mapping / Executive Insights / Faculty Readiness for their
 * scope only, and cannot access the approval queue. Password lives in env
 * (envKey). Scoping is enforced at the UI level (see CLAUDE notes / login route).
 */
export interface ScopedViewer {
  username: string;
  name: string;
  scope: string[];   // faculty codes this viewer may see
  envKey: string;
}
export const SCOPED_VIEWERS: ScopedViewer[] = [
  {
    username: "buiadmin",
    name: "ผู้ดูแลข้อมูลวิทยาลัยนานาชาติ",
    scope: ["intl", "intlcn"],
    envKey: "VIEWER_BUIADMIN_PASSWORD",
  },
];
export const findScopedViewer = (username: string) =>
  SCOPED_VIEWERS.find((v) => v.username === username);

/** Returns the env var name for a given faculty code */
export const facultyEnvKey = (code: string) =>
  `FACULTY_${code.toUpperCase()}_PASSWORD`;

export const SESSION_KEY = "bu_air_session";
