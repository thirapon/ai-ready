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
  { code: "account",  name: "คณะการบัญชี" },
  { code: "law",      name: "คณะนิติศาสตร์" },
  { code: "huso",     name: "คณะมนุษยศาสตร์และการจัดการการท่องเที่ยว" },
  { code: "econ",     name: "คณะเศรษฐศาสตร์และการลงทุน" },
  { code: "eng",      name: "คณะวิศวกรรมศาสตร์" },
  { code: "sci",      name: "คณะวิทยาศาสตร์และเทคโนโลยี" },
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

/** Returns the env var name for a given faculty code */
export const facultyEnvKey = (code: string) =>
  `FACULTY_${code.toUpperCase()}_PASSWORD`;

export const SESSION_KEY = "bu_air_session";
