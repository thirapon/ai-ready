import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const TAB_NAME       = process.env.GOOGLE_SHEETS_TAB ?? "Raw Data";

// Column indices (0-based) matching the CSV structure:
// 0:ปีการศึกษา 1:คณะ 2:Timestamp 3:ชื่อ-นามสกุล 4:รหัสบุคลากร 5:อีเมล BU
// 6:หลักสูตร 7:รายวิชาหลัก 8:K 9:E 10:T 11:A 12:score 13:q14
// 14:Development Path 15:Support Flag 16:qa 17:qb 18:qc 19:Synced At

function getAuth() {
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function parseFloat2(v: unknown): number {
  const n = parseFloat(String(v ?? "0").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function parseInt2(v: unknown): number {
  const n = parseInt(String(v ?? "0"), 10);
  return isNaN(n) ? 0 : n;
}

function parsePath(v: unknown): "AI Aware" | "AI Integrator" | "AI Champion" {
  const s = String(v ?? "").trim();
  if (s.includes("Champion"))   return "AI Champion";
  if (s.includes("Integrator")) return "AI Integrator";
  return "AI Aware";
}

export interface FRRow {
  id: string;
  f: string;
  name: string;
  dept: string;
  d1: number; d2: number; d3: number; d4: number;
  score: number;
  q14: number;
  path: "AI Aware" | "AI Integrator" | "AI Champion";
  sup: boolean;
  qb: string;
  qc: string;
}

export async function fetchFacultyReadiness(): Promise<FRRow[]> {
  const auth  = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB_NAME}!A2:T`,
  });

  const rows = res.data.values ?? [];

  return rows
    .filter(r => r[4])
    .map(r => ({
      id:    String(r[4] ?? "").trim(),
      f:     String(r[1] ?? "").trim(),
      name:  String(r[3] ?? "").trim(),
      dept:  String(r[6] ?? "").trim(),
      d1:    parseFloat2(r[8]),
      d2:    parseFloat2(r[9]),
      d3:    parseFloat2(r[10]),
      d4:    parseFloat2(r[11]),
      score: parseFloat2(r[12]),
      q14:   parseInt2(r[13]),
      path:  parsePath(r[14]),
      sup:   String(r[15] ?? "").includes("support"),
      qb:    String(r[17] ?? "").trim(),
      qc:    String(r[18] ?? "").trim(),
    }));
}
