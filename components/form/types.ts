export interface Competency {
  id: number;
  name: string;
  source: "school" | "industry";
  years: number[];
  desc: string;
  note: string;
}

export interface FormData {
  // Step 1
  faculty: string;
  program: string;
  owner: string;
  position: string;
  email: string;
  framework: string;
  submitDate: string;
  sectors: string[];
  // Step 2
  competencies: Competency[];
}

export const INITIAL_DATA: FormData = {
  faculty: "",
  program: "",
  owner: "",
  position: "",
  email: "",
  framework: "",
  submitDate: "",
  sectors: [],
  competencies: [
    { id: 1, name: "", source: "school",    years: [], desc: "", note: "" },
    { id: 2, name: "", source: "school",    years: [], desc: "", note: "" },
    { id: 3, name: "", source: "school",    years: [], desc: "", note: "" },
    { id: 4, name: "", source: "industry",  years: [], desc: "", note: "" },
    { id: 5, name: "", source: "industry",  years: [], desc: "", note: "" },
  ],
};

export const FACULTY_PROGRAMS: Record<string, string[]> = {
  การบัญชี: ["การบัญชี"],
  บริหารธุรกิจ: ["การตลาด","การตลาดดิจิทัล","การจัดการ","การเงิน","การจัดการธุรกิจระหว่างประเทศ","การจัดการธุรกิจระหว่างประเทศ (มุ่งเน้นจีน)","การจัดการโลจิสติกส์และโซ่อุปทาน"],
  นิเทศศาสตร์: ["ศิลปะการแสดง","วิทยุกระจายเสียง วิทยุโทรทัศน์ และการผลิตสื่อสตรีมมิ่ง","การผลิตเนื้อหาสร้างสรรค์และประสบการณ์ดิจิทัล","การผลิตอีเว้นท์และการจัดการนิทรรศการและการประชุม","การสื่อสารและสื่อใหม่"],
  นิติศาสตร์: ["นิติศาสตร์"],
  มนุษยศาสตร์และการจัดการการท่องเที่ยว: ["ภาษาอังกฤษ","การจัดการการท่องเที่ยวและเรือสำราญ","การจัดการการโรงแรม","ศิลปะการประกอบอาหารและการจัดการการบริการธุรกิจร้านอาหาร","การจัดการธุรกิจสายการบิน"],
  เศรษฐศาสตร์และการลงทุน: ["เศรษฐศาสตร์","การวางแผนการเงินและการลงทุน"],
  เทคโนโลยีสารสนเทศและนวัตกรรม: ["เทคโนโลยีสารสนเทศ","วิทยาการคอมพิวเตอร์","เกมและสื่อเชิงโต้ตอบ"],
  ศิลปกรรมศาสตร์: ["การออกแบบนิเทศศิลป์","การออกแบบแฟชั่น","ศิลปะและการออกแบบ"],
  วิศวกรรมศาสตร์: ["วิศวกรรมคอมพิวเตอร์และหุ่นยนต์","วิศวกรรมปัญญาประดิษฐ์และวิทยาการข้อมูล","วิศวกรรมไฟฟ้า","วิศวกรรมมัลติมีเดียและเอ็นเทอร์เทนเมนต์"],
  สถาปัตยกรรมศาสตร์: ["สถาปัตยกรรม","สถาปัตยกรรมภายใน"],
  การสร้างเจ้าของธุรกิจและการบริหารกิจการ: ["การเป็นเจ้าของธุรกิจ","AI Engineering and Entrepreneurship (International Program)","Entrepreneurship (International Program)"],
  ดิจิทัลมีเดียและศิลปะภาพยนตร์: ["ภาพยนตร์","สื่อดิจิทัล","Film, Series and Global Content Production and Business (International Program)"],
  วิทยาลัยนานาชาติ: ["Business English (International Program)","Creative Communication Design (International Program)","Marketing (International Program)","International Tourism and Hospitality Management (International Program)","Culinary Arts and Design (International Program)","Innovative Media Production (International Program)","Media and Communication (International Program)","Computer Science (International Program)","Business Administration (International Program)"],
  วิทยาลัยนานาชาติจีน: ["ภาษาจีนธุรกิจ","Business Administration (Bilingual Program)"],
};

export const SECTORS = [
  "การเงินและการธนาคาร",
  "การศึกษาและการเรียนรู้",
  "เทคโนโลยีและซอฟต์แวร์",
  "สื่อและบันเทิง",
  "การออกแบบและสร้างสรรค์",
  "การท่องเที่ยวและบริการ",
  "อาหารและการบริการ",
  "ค้าปลีกและอีคอมเมิร์ซ",
  "ธุรกิจระหว่างประเทศ",
  "โลจิสติกส์และซัพพลายเชน",
  "อุตสาหกรรมการผลิต",
  "ภาครัฐและบริการสาธารณะ",
];
