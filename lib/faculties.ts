/**
 * Static faculty registry — matches the prototype's auth.js FACULTIES array.
 * Passwords are intentionally visible here because this is a prototype/demo
 * system (the login page shows them in a DEV credentials box).
 * Replace with proper Supabase Auth or Google Workspace SSO before production.
 */
export interface Faculty {
  code: string;
  name: string;
  password: string;
}

export const FACULTIES: Faculty[] = [
  { code: "commarts", name: "คณะนิเทศศาสตร์",                          password: "comm2026"  },
  { code: "business", name: "คณะบริหารธุรกิจ",                         password: "biz2026"   },
  { code: "account",  name: "คณะการบัญชี",                             password: "acc2026"   },
  { code: "law",      name: "คณะนิติศาสตร์",                           password: "law2026"   },
  { code: "huso",     name: "คณะมนุษยศาสตร์และการจัดการการท่องเที่ยว",  password: "huso2026"  },
  { code: "econ",     name: "คณะเศรษฐศาสตร์และการลงทุน",               password: "econ2026"  },
  { code: "eng",      name: "คณะวิศวกรรมศาสตร์",                        password: "eng2026"   },
  { code: "sci",      name: "คณะวิทยาศาสตร์และเทคโนโลยี",              password: "sci2026"   },
  { code: "it",       name: "คณะเทคโนโลยีสารสนเทศและนวัตกรรม",         password: "it2026"    },
  { code: "arch",     name: "คณะสถาปัตยกรรมศาสตร์",                     password: "arch2026"  },
  { code: "fineart",  name: "คณะศิลปกรรมศาสตร์",                        password: "art2026"   },
  { code: "dmca",     name: "คณะดิจิทัลมีเดียและศิลปะภาพยนตร์",         password: "dmca2026"  },
  { code: "busem",    name: "คณะการสร้างเจ้าของธุรกิจและการบริหารกิจการ", password: "busem2026" },
];

export const APPROVER = {
  username: "approver",
  password: "approve2026",
  name: "คณะกรรมการ AI-Ready",
};

export const SESSION_KEY = "bu_air_session";
