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

// ─── UNESCO Gap Analysis ──────────────────────────────────────────────────────
export const unescoGapAnalysis = {
  dimensions: [
    {
      key: "techniques",
      name: "AI Techniques & Applications",
      strength: 90,
      status: "strong" as const,
      label: "แข็งแกร่ง",
      note: "ทุกหลักสูตรเน้นการใช้เครื่องมือและเทคนิค AI",
      color: "#137a4a",
    },
    {
      key: "design",
      name: "AI System Design",
      strength: 65,
      status: "good" as const,
      label: "ดี",
      note: "ชัดเจนใน Engineering / CS / Architecture",
      color: "#1a4f8a",
    },
    {
      key: "ethics",
      name: "Ethics of AI",
      strength: 60,
      status: "good" as const,
      label: "ดี",
      note: "มีใน 10/12 หลักสูตร แต่มักมีเพียง 1 competency",
      color: "#a86a14",
    },
    {
      key: "human",
      name: "Human-centred Mindset",
      strength: 35,
      status: "weak" as const,
      label: "อ่อน — ต้องเสริม",
      note: "ขาดการออกแบบ AI เพื่อประโยชน์มนุษย์ / สังคมโดยตรง",
      color: "#b53030",
    },
  ],
  recommendation:
    "แนะนำให้หลักสูตรเพิ่มหัวข้อ AI for social good, accessibility และ societal impact ซึ่งเป็นหัวใจของมิติ Human-centred ที่ UNESCO ให้ความสำคัญสูงสุด",
};

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
