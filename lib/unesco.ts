export interface UnescoDomain {
  id: string;
  code: string;
  label: string;
  labelTH: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}

export const UNESCO_DOMAINS: UnescoDomain[] = [
  {
    id: "hcm",
    code: "HCM",
    label: "Human-Centred Mindset",
    labelTH: "มุมมองที่เน้นมนุษย์",
    color: "#1a4f8a",
    bg: "#eef4fb",
    border: "#dbe7f4",
    desc: "ความคิดสร้างสรรค์ ความร่วมมือ และบริบทสังคม-วัฒนธรรม",
  },
  {
    id: "eth",
    code: "ETH",
    label: "Ethics of AI",
    labelTH: "จริยธรรม AI",
    color: "#b53030",
    bg: "#fdecec",
    border: "#f4d0d0",
    desc: "ความเป็นส่วนตัว อคติ ความยุติธรรม และความโปร่งใส",
  },
  {
    id: "fnd",
    code: "FND",
    label: "AI Foundations",
    labelTH: "พื้นฐาน AI",
    color: "#137a4a",
    bg: "#e6f4ec",
    border: "#b5dbc5",
    desc: "แนวคิดพื้นฐาน ข้อมูล อัลกอริทึม และ Machine Learning",
  },
  {
    id: "tec",
    code: "TEC",
    label: "AI Techniques & Applications",
    labelTH: "เทคนิค & ประยุกต์ AI",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    desc: "ML, Deep Learning, NLP, Computer Vision และเครื่องมือ AI",
  },
  {
    id: "des",
    code: "DES",
    label: "AI System Design",
    labelTH: "ออกแบบระบบ AI",
    color: "#a86a14",
    bg: "#fcf3e1",
    border: "#f0dca6",
    desc: "ระบุปัญหา เตรียมข้อมูล เลือก model ทดสอบ และ deploy",
  },
  {
    id: "soc",
    code: "SOC",
    label: "AI & the World",
    labelTH: "AI กับสังคม",
    color: "#0f766e",
    bg: "#f0fdfa",
    border: "#99f6e4",
    desc: "ผลกระทบต่อสังคม ตลาดแรงงาน และการพัฒนาอย่างยั่งยืน",
  },
];

// mapping[competencyIndex] = array of domain ids
export type Layer1Mapping = Record<string, string[]>;
