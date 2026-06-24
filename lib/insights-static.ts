// ─── Static AI-generated insights ────────────────────────────────────────────
// Generated: 2026-06-24
// Source: 77 Faculty Readiness responses (Google Sheets) + 12 curriculum submissions (Supabase)
// To update: pull fresh data → analyze in Claude conversation → overwrite this file

export const INSIGHTS_GENERATED_AT = "2026-06-24";
export const INSIGHTS_FACULTY_TOTAL = 77;
export const INSIGHTS_PROGRAMS_TOTAL = 12;

// ─── Executive Summary ────────────────────────────────────────────────────────
export const executiveSummary = `มหาวิทยาลัยกรุงเทพมีคณาจารย์กว่า 70% อยู่ในระดับ AI Integrator–Champion ซึ่งถือว่าสูงกว่าค่าเฉลี่ยสถาบันการศึกษาทั่วไป แต่ความพร้อมนี้ยังถูกขัดขวางโดยอุปสรรค 3 ประการหลัก ได้แก่ การขาด institutional AI license สำหรับใช้ในการสอน การไม่มีสื่อการสอนสำเร็จรูปที่พร้อมใช้ทันที และภาระงานสอนที่ไม่เปิดพื้นที่ให้อาจารย์พัฒนาตนเองด้าน AI ได้อย่างจริงจัง

ด้านหลักสูตร มี 12 โปรแกรมส่งแผน AI Competency แล้ว ครอบคลุม 5 คณะ ทุกหลักสูตรมี pattern ร่วมกันคือเริ่มต้นด้วย AI Literacy ในปีที่ 1 และปิดท้ายด้วย Responsible AI หรือ Professional Practice ในปีที่ 4 สอดคล้องกับ UNESCO AI Competency Framework เป็นอย่างดี อย่างไรก็ตาม มิติ Human-centred ยังเป็นจุดอ่อนที่พบในเกือบทุกหลักสูตร

ข้อเสนอเร่งด่วนสำหรับผู้บริหาร: จัดหา institutional AI license ระดับ Pro ให้บุคลากร และออกแนวนโยบาย academic integrity ด้าน AI พร้อม student AI usage guideline ก่อนเปิดภาคการศึกษา 2/2568`;

// ─── Faculty Development Themes (from qb) ────────────────────────────────────
export const developmentThemes = [
  {
    theme: "ความรู้และทักษะ AI",
    pct: 65,
    description: "ต้องการความรู้เชิงลึกพอที่จะสอนได้จริง ไม่ใช่แค่รู้จักเครื่องมือ",
    examples: ["ความรู้เชิงลึกเพื่อสอนได้จริง", "เทคนิคและชุดคำสั่ง", "update ทุกค่ายที่ทันสมัย"],
    color: "#1a4f8a",
  },
  {
    theme: "สื่อการสอนสำเร็จรูป",
    pct: 55,
    description: "ต้องการ materials, use case, rubric ที่พร้อมใช้งานได้ทันทีโดยไม่ต้องสร้างเอง",
    examples: ["ตัวอย่าง prompt เฉพาะสาขา", "กิจกรรมในชั้นเรียน", "เกณฑ์ประเมินผล (rubric)"],
    color: "#0f7b6c",
  },
  {
    theme: "เวลาในการเตรียมการ",
    pct: 40,
    description: "ภาระงานสอนสูง ทำให้ไม่มีเวลาพัฒนาบทเรียน AI แบบจริงจัง",
    examples: ["เวลาเตรียมบทเรียน AI", "เวลาทดลองใช้กับรายวิชา", "พื้นที่ dedicated สำหรับ AI"],
    color: "#a86a14",
  },
  {
    theme: "Access / License AI Tools",
    pct: 25,
    description: "ต้องการสิทธิ์ใช้งาน AI ระดับ Pro ที่มหาวิทยาลัยสนับสนุนให้",
    examples: ["License Pro สำหรับบุคลากร", "Token/API/GPU credit", "Python in Excel"],
    color: "#6a3eb5",
  },
  {
    theme: "การทดลองปฏิบัติจริง",
    pct: 15,
    description: "ต้องการ hands-on experience กับ use case จริงในบริบทของรายวิชา",
    examples: ["ทดลองใช้ใน context วิชาจริง", "use case จากอุตสาหกรรม", "Peer learning"],
    color: "#677889",
  },
];

// ─── University Support Needs (from qc) ──────────────────────────────────────
export const supportNeeds = [
  {
    need: "Institutional AI License",
    priority: "urgent" as const,
    label: "เร่งด่วน",
    description: "หลายคณะขอตรงๆ ให้มหาวิทยาลัยซื้อ Claude/ChatGPT Pro ให้บุคลากรใช้ในการสอน",
    quote: "ขอให้มหาวิทยาลัยซื้อ License สำหรับ AI ที่ใช้งานบ่อย ๆ เช่น Claude",
    quoteFrom: "คณะเศรษฐศาสตร์",
  },
  {
    need: "AI Policy & Academic Integrity",
    priority: "urgent" as const,
    label: "เร่งด่วน",
    description: "อาจารย์สับสนเรื่องขอบเขต วิธีอ้างอิง AI และเกณฑ์ประเมินผลนักศึกษาที่ใช้ AI",
    quote: "ขอให้สายวิชาการกำหนดแนวปฏิบัติด้าน academic integrity ในบริบทการใช้ AI ที่ชัดเจนเป็นรูปธรรม",
    quoteFrom: "คณะเศรษฐศาสตร์",
  },
  {
    need: "Student AI Usage Policy",
    priority: "urgent" as const,
    label: "เร่งด่วน",
    description: "นักศึกษาใช้ AI โดยไม่คิดวิเคราะห์ผล ต้องการนโยบายระดับมหาวิทยาลัยที่ชัดเจน",
    quote: "นักศึกษานำคำตอบของ AI มาใช้โดยตรงโดยไม่มีการอ่านหรือตรวจทางคำตอบก่อน",
    quoteFrom: "คณะเศรษฐศาสตร์และการลงทุน",
  },
  {
    need: "อบรมเชิงปฏิบัติสม่ำเสมอ",
    priority: "medium" as const,
    label: "ระยะกลาง",
    description: "ต้องการอบรมจากผู้เชี่ยวชาญจริง update ทุกไตรมาส ไม่ใช่อบรมครั้งเดียวจบ",
    quote: "จัดอบรมสม่ำเสมอ — Version ใหม่ ๆ ของ AI",
    quoteFrom: "คณะนิติศาสตร์",
  },
  {
    need: "Infrastructure (GPU/Server/API)",
    priority: "medium" as const,
    label: "ระยะกลาง",
    description: "เฉพาะคณะ CS/AI/Engineering ต้องการ GPU, Server, API credit เพื่อ run AI model จริง",
    quote: "อยากได้ GPU หรือ Server เพื่อนำมาทำระบบนำร่อง และให้นักศึกษาได้เรียนรู้การวางระบบ AI",
    quoteFrom: "คณะวิศวกรรมศาสตร์",
  },
];

// ─── Competency Patterns ──────────────────────────────────────────────────────
export const competencyPatterns = [
  { name: "AI Literacy & Fundamentals",    count: 12, total: 12, years: "ปี 1",     pct: 100, color: "#1a4f8a" },
  { name: "AI in Professional Practice",   count: 11, total: 12, years: "ปี 3–4",   pct: 92,  color: "#0f7b6c" },
  { name: "Responsible AI & Ethics",       count: 10, total: 12, years: "ปี 2–4",   pct: 83,  color: "#b53030" },
  { name: "Generative AI / Creative AI",   count: 7,  total: 12, years: "ปี 2–3",   pct: 58,  color: "#6a3eb5" },
  { name: "Data Analytics & ML",           count: 7,  total: 12, years: "ปี 2–4",   pct: 58,  color: "#b6620e" },
  { name: "AI System Design",              count: 5,  total: 12, years: "ปี 3–4",   pct: 42,  color: "#677889" },
  { name: "Deployment & Governance",       count: 4,  total: 12, years: "ปี 4",     pct: 33,  color: "#3a4859" },
];

// ─── UNESCO Gap Analysis (from real L1 mapping data) ─────────────────────────
export const unescoGapAnalysis = {
  dimensions: [
    {
      key: "human",
      name: "Human-centred Mindset",
      required: true,
      strength: 67,
      progCount: 6,
      progTotal: 9,
      status: "good" as const,
      label: "ดี",
      note: "6/9 หลักสูตรครอบคลุม — ส่วนใหญ่มีเพียง 1 entry",
      color: "#1a4f8a",
    },
    {
      key: "ethics",
      name: "Ethics of AI",
      required: true,
      strength: 67,
      progCount: 6,
      progTotal: 9,
      status: "good" as const,
      label: "ดี",
      note: "6/9 หลักสูตร — วิศวกรรมคอมพิวเตอร์ฯ map ethics 7 entries แต่ขาดมิติอื่น",
      color: "#a86a14",
    },
    {
      key: "techniques",
      name: "AI Techniques & Applications",
      required: false,
      strength: 33,
      progCount: 3,
      progTotal: 9,
      status: "weak" as const,
      label: "ไม่บังคับ — ใช้ L2 ทดแทนได้",
      note: "เฉพาะ AI/Data, บัญชี, สถาปัตยกรรม — หลักสูตรสายสังคมศาสตร์ใช้ L2 competency แทน",
      color: "#677889",
    },
    {
      key: "design",
      name: "AI System Design",
      required: false,
      strength: 33,
      progCount: 3,
      progTotal: 9,
      status: "weak" as const,
      label: "ไม่บังคับ — ใช้ L2 ทดแทนได้",
      note: "เฉพาะ เกมฯ, AI/Data, สถาปัตยกรรม — หลักสูตรที่ไม่เน้น technical ใช้ L2 ทดแทน",
      color: "#677889",
    },
  ],
  recommendation:
    "มิติบังคับ (Human + Ethics) ครอบคลุม 6/9 หลักสูตร — ยังขาดอีก 3 หลักสูตรที่ต้องติดตาม ส่วน Techniques และ Design ไม่บังคับ สามารถใช้ L2 competency ทดแทนได้ตามบริบทของแต่ละสาขา",
};

// ─── UNESCO L1 Heatmap (real mapping data per program) ────────────────────────
export const unescoHeatmap = [
  { prog: "วิศวกรรม AI/Data",    shortProg: "AI/Data",       fac: "วิศวกรรมศาสตร์",          human: 0, ethics: 1, techniques: 4, design: 1, mapped: true },
  { prog: "สถาปัตยกรรม",         shortProg: "สถาปัตยกรรม",   fac: "สถาปัตยกรรมศาสตร์",        human: 4, ethics: 0, techniques: 8, design: 4, mapped: true },
  { prog: "เกมและสื่อเชิงโต้ตอบ", shortProg: "เกมฯ",          fac: "เทคโนโลยีสารสนเทศฯ",       human: 1, ethics: 0, techniques: 0, design: 1, mapped: true },
  { prog: "วิทยาการคอมพิวเตอร์",  shortProg: "CS",            fac: "เทคโนโลยีสารสนเทศฯ",       human: 1, ethics: 1, techniques: 0, design: 0, mapped: true },
  { prog: "เศรษฐศาสตร์",          shortProg: "เศรษฐศาสตร์",   fac: "เศรษฐศาสตร์ฯ",             human: 1, ethics: 1, techniques: 0, design: 0, mapped: true },
  { prog: "การวางแผนการเงินฯ",    shortProg: "การเงินฯ",      fac: "เศรษฐศาสตร์ฯ",             human: 1, ethics: 1, techniques: 0, design: 0, mapped: true },
  { prog: "เทคโนโลยีสารสนเทศ",    shortProg: "IT",            fac: "เทคโนโลยีสารสนเทศฯ",       human: 1, ethics: 1, techniques: 0, design: 0, mapped: true },
  { prog: "การบัญชี",             shortProg: "บัญชี",         fac: "บัญชี",                    human: 0, ethics: 0, techniques: 2, design: 0, mapped: true },
  { prog: "วิศวกรรมคอมพิวเตอร์ฯ", shortProg: "CE/Robot",      fac: "วิศวกรรมศาสตร์",           human: 0, ethics: 7, techniques: 0, design: 0, mapped: true },
  { prog: "วิศวกรรมมัลติมีเดียฯ", shortProg: "Multimedia",    fac: "วิศวกรรมศาสตร์",           human: 0, ethics: 0, techniques: 0, design: 0, mapped: false },
  { prog: "วิศวกรรมไฟฟ้า",        shortProg: "ไฟฟ้า",         fac: "วิศวกรรมศาสตร์",           human: 0, ethics: 0, techniques: 0, design: 0, mapped: false },
  { prog: "สถาปัตยกรรมภายใน",     shortProg: "สถาปัตย์ภายใน", fac: "สถาปัตยกรรมศาสตร์",        human: 0, ethics: 0, techniques: 0, design: 0, mapped: false },
];

// ─── L2 AI Embed & Tool Assessment ───────────────────────────────────────────
export const l2Assessment = [
  {
    prog: "วิศวกรรมปัญญาประดิษฐ์และวิทยาการข้อมูล",
    shortProg: "AI/Data",
    entries: 20,
    fit: "strong" as const,
    embedDepth: "deep" as const,
    topTools: ["LLM Chatbot", "Python Notebooks", "Coding Assistant", "ML Libraries"],
    specialistPct: 60,
    assistedPct: 85,
    generatedPct: 0,
    consultedPct: 40,
    strength: "Tool set ครบถ้วนสอดคล้องกับสมรรถนะ Data/ML โดยตรง — specialist mode สูงสุด (60%)",
    gap: "ไม่มี generation mode เลย",
    flag: null as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "สถาปัตยกรรม",
    shortProg: "สถาปัตยกรรม",
    entries: 16,
    fit: "strong" as const,
    embedDepth: "medium" as const,
    topTools: ["BIM AI", "DALL·E", "D5 AI", "Claude", "Prome AI"],
    specialistPct: 69,
    assistedPct: 88,
    generatedPct: 25,
    consultedPct: 38,
    strength: "Domain-specific tools สูงสุดในทุกหลักสูตร — BIM AI, D5 AI, Prome AI ตรงวิชาชีพสถาปนิก",
    gap: "Embed method ระบุไม่ครบทุก entry",
    flag: null as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "เกมและสื่อเชิงโต้ตอบ",
    shortProg: "เกมฯ",
    entries: 17,
    fit: "strong" as const,
    embedDepth: "medium" as const,
    topTools: ["ChatGPT", "Gemini", "Unity AI", "GitHub Copilot", "AI Assets"],
    specialistPct: 35,
    assistedPct: 76,
    generatedPct: 18,
    consultedPct: 35,
    strength: "Tools ตรงสมรรถนะ creative design — Unity AI, Suno AI สำหรับ game production",
    gap: "Generation mode ต่ำ (18%) — ส่วนใหญ่ consult AI ไม่ได้ create จริงจัง",
    flag: null as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "วิทยาการคอมพิวเตอร์",
    shortProg: "CS",
    entries: 24,
    fit: "good" as const,
    embedDepth: "medium" as const,
    topTools: ["ChatGPT", "Gemini", "GitHub Copilot", "HuggingFace", "PyTorch"],
    specialistPct: 29,
    assistedPct: 79,
    generatedPct: 33,
    consultedPct: 58,
    strength: "Tool coverage กว้าง ครอบคลุม prompt / code / ML อย่างสมดุล",
    gap: "Embed method ควรเพิ่ม project-based มากขึ้น",
    flag: null as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "เทคโนโลยีสารสนเทศ",
    shortProg: "IT",
    entries: 20,
    fit: "good" as const,
    embedDepth: "deep" as const,
    topTools: ["ChatGPT", "Gemini", "Figma AI", "GitHub Copilot", "NotebookLM"],
    specialistPct: 10,
    assistedPct: 70,
    generatedPct: 10,
    consultedPct: 85,
    strength: "Embed method ละเอียดที่สุด — นักศึกษา consult AI สูงสุด (85%)",
    gap: "Specialist tools ต่ำ (10%) ใช้ general LLM เป็นหลัก",
    flag: null as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "เศรษฐศาสตร์",
    shortProg: "เศรษฐศาสตร์",
    entries: 11,
    fit: "moderate" as const,
    embedDepth: "surface" as const,
    topTools: ["Claude", "Google Colab", "Excel+Copilot", "TradingView"],
    specialistPct: 45,
    assistedPct: 100,
    generatedPct: 0,
    consultedPct: 0,
    strength: "Domain tools ตรง — TradingView สำหรับ investment, Claude สำหรับ analysis",
    gap: "100% assisted mode ไม่มี generate หรือ consult เลย — เสี่ยง surface-level integration",
    flag: "passive" as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "การวางแผนการเงินและการลงทุน",
    shortProg: "การเงินฯ",
    entries: 12,
    fit: "moderate" as const,
    embedDepth: "surface" as const,
    topTools: ["Claude", "Excel+Copilot", "Microsoft Copilot", "Power BI"],
    specialistPct: 42,
    assistedPct: 92,
    generatedPct: 0,
    consultedPct: 8,
    strength: "Claude/Excel Copilot เหมาะสมกับบริบทการเงิน",
    gap: "Claude ใน 11/12 entries — tool ซ้ำกันมาก, generated = 0",
    flag: "passive" as null | "passive" | "inconsistent" | "no-l2",
  },
  {
    prog: "วิศวกรรมคอมพิวเตอร์และหุ่นยนต์",
    shortProg: "CE/Robot",
    entries: 6,
    fit: "moderate" as const,
    embedDepth: "deep" as const,
    topTools: ["ROS", "Gazebo", "AWS SageMaker"],
    specialistPct: 17,
    assistedPct: 100,
    generatedPct: 0,
    consultedPct: 0,
    strength: "Embed method ลึกมาก — project-based ทั้งหมด (ROS+Gazebo+AWS integration)",
    gap: "ไม่มีข้อมูล AI tools ในฐานข้อมูล และ L1 map ทั้งหมดเป็น Ethics ไม่สอดคล้องกับ L2 เทคนิค",
    flag: "inconsistent" as null | "passive" | "inconsistent" | "no-l2",
  },
  { prog: "การบัญชี",              shortProg: "บัญชี",         entries: 0, fit: "none" as const, embedDepth: "none" as const, topTools: [], specialistPct: 0, assistedPct: 0, generatedPct: 0, consultedPct: 0, strength: "", gap: "", flag: "no-l2" as null | "passive" | "inconsistent" | "no-l2" },
  { prog: "วิศวกรรมมัลติมีเดียฯ",  shortProg: "Multimedia",    entries: 0, fit: "none" as const, embedDepth: "none" as const, topTools: [], specialistPct: 0, assistedPct: 0, generatedPct: 0, consultedPct: 0, strength: "", gap: "", flag: "no-l2" as null | "passive" | "inconsistent" | "no-l2" },
  { prog: "วิศวกรรมไฟฟ้า",         shortProg: "ไฟฟ้า",         entries: 0, fit: "none" as const, embedDepth: "none" as const, topTools: [], specialistPct: 0, assistedPct: 0, generatedPct: 0, consultedPct: 0, strength: "", gap: "", flag: "no-l2" as null | "passive" | "inconsistent" | "no-l2" },
  { prog: "สถาปัตยกรรมภายใน",      shortProg: "สถาปัตย์ภายใน", entries: 0, fit: "none" as const, embedDepth: "none" as const, topTools: [], specialistPct: 0, assistedPct: 0, generatedPct: 0, consultedPct: 0, strength: "", gap: "", flag: "no-l2" as null | "passive" | "inconsistent" | "no-l2" },
];

// ─── Curriculum Character ─────────────────────────────────────────────────────
export const curriculumCharacter = [
  {
    faculty: "คณะวิศวกรรมศาสตร์",
    programs: 4,
    character: "เทคนิคลึกที่สุด",
    description:
      "ครอบคลุม robotics (ROS/Gazebo), smart energy, multimedia AI และ full AI/ML pipeline ปี 1–4 ใช้ SFIA 9 เป็นแกนหลัก เป็นคณะเดียวที่ระบุ deployment & governance อย่างครบถ้วน",
    tags: ["SFIA 9", "MLOps", "Cloud AI (AWS)", "Robotics"],
    color: "#1a4f8a",
  },
  {
    faculty: "คณะเทคโนโลยีสารสนเทศและนวัตกรรม",
    programs: 3,
    character: "สมดุล applied กับ system-level",
    description:
      "CS เน้น system-level (cloud, DevOps, security) · IT เน้น business solutions · Game เน้น Generative AI ตลอดหลักสูตรตั้งแต่ปี 1 ทุกโปรแกรมเน้น responsible use อย่างชัดเจน",
    tags: ["System Integration", "Generative AI", "DevOps", "UX/UI"],
    color: "#0f7b6c",
  },
  {
    faculty: "คณะสถาปัตยกรรมศาสตร์",
    programs: 2,
    character: "AI เป็น design workflow tool",
    description:
      "เน้น AI ใน design process: ideation → CAD/BIM → analysis → professional practice ทั้ง 2 หลักสูตรใช้ UNESCO framework เป็นกรอบ เน้น creative application มากกว่า technical depth",
    tags: ["UNESCO Framework", "Design Thinking", "BIM/CAD", "Creative AI"],
    color: "#6a3eb5",
  },
  {
    faculty: "คณะเศรษฐศาสตร์และการลงทุน",
    programs: 2,
    character: "Domain-specific finance AI",
    description:
      "ระบุเครื่องมือจริง (Claude, Gemini, Excel+Copilot) ให้ความสำคัญ critical evaluation สูง เน้น AI สำหรับ economic analysis, investment forecasting และ responsible decision-making",
    tags: ["Claude/Gemini", "Excel+Copilot", "Financial Forecasting", "Critical Thinking"],
    color: "#b6620e",
  },
  {
    faculty: "คณะบัญชี",
    programs: 1,
    character: "วิชาชีพ + AI Assurance",
    description:
      "เฉพาะทางที่สุดในระบบ มี 'AI Assurance & Professional Skepticism' เป็น competency เฉพาะ เชื่อมกับมาตรฐาน Big 4 โดยตรง ครอบคลุม audit automation และ professional ethics",
    tags: ["AI Assurance", "Big 4 Standards", "Audit Automation", "Professional Ethics"],
    color: "#137a4a",
  },
];

// ─── Tools Gap ────────────────────────────────────────────────────────────────
export const toolsGap = {
  inCurriculum: [
    { name: "Generative AI tools (generic)", note: "ส่วนใหญ่ไม่ระบุชื่อ tool จริง" },
    { name: "ROS + Gazebo", note: "วิศวกรรมคอมพิวเตอร์และหุ่นยนต์" },
    { name: "AWS SageMaker", note: "วิศวกรรมคอมพิวเตอร์และหุ่นยนต์" },
    { name: "Excel + Copilot", note: "เศรษฐศาสตร์, การเงินและการลงทุน" },
    { name: "Python (Google Colab)", note: "เศรษฐศาสตร์" },
    { name: "Power BI / Canva AI", note: "การวางแผนการเงินและการลงทุน" },
    { name: "Claude / ChatGPT / Gemini", note: "เศรษฐศาสตร์ (ระบุในรายละเอียด)" },
  ],
  wantedByFaculty: [
    { name: "Institutional AI License (Claude/ChatGPT Pro)", note: "หลายคณะขอตรงๆ", urgent: true },
    { name: "GPU / Server / API credit", note: "CS, AI, Engineering — สำหรับ train model", urgent: true },
    { name: "Terminal-based AI / CLI agents", note: "วิศวกรรมมัลติมีเดีย", urgent: false },
    { name: "Python in Excel", note: "คณะบัญชี", urgent: false },
    { name: "AI Tool Kit / คลัง use case สำเร็จรูป", note: "ต้องการ ready-to-use ไม่ต้องสร้างเอง", urgent: false },
  ],
  keyGap:
    "ช่องว่างหลักไม่ใช่เรื่องประเภทเครื่องมือ — อาจารย์รู้จัก tool ดีแล้ว แต่ขาด institutional license ที่เพียงพอสำหรับใช้ในการสอนจริง และขาดเวลาในการเรียนรู้ tool เหล่านั้นให้ลึกพอ",
};
