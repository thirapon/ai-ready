"use client";
import { useState } from "react";

export type Lang = "th" | "en";
const LANG_KEY = "bu_air_lang";

export const translations = {
  th: {
    // System / Topbar
    sysTitle:    "ระบบบริหารหลักสูตร AI-Ready",
    sysSub:      "มหาวิทยาลัยกรุงเทพ · Office of Academic Affairs",
    roleFaculty: "ผู้ยื่นคำขอ",
    logout:      "ออกจากระบบ",
    autoSaved:   "บันทึกอัตโนมัติแล้ว",
    savingMsg:   "กำลังบันทึก...",
    savedMsg:    "บันทึกแล้ว ✓",
    loading:     "กำลังโหลด…",
    errorLoad:   "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่",
    errorConnect: "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่",
    errorGeneral: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    backHome:    "กลับหน้าหลัก",

    // Read-only banner
    readOnlyMode: "โหมดดูข้อมูล (Approver)",
    readOnlyDesc: "— ไม่สามารถแก้ไขข้อมูลได้",
    backMappingDashboard: "← กลับ Mapping Dashboard",

    // Breadcrumb
    home:         "หน้าหลัก",
    curriculumMap:"แผนที่หลักสูตร",

    // Header card meta
    curriculum: "หลักสูตร",
    faculty:    "คณะ",
    refNo:      "เลขอ้างอิง",

    // Panel
    panelAddTitle:  "เพิ่มรายวิชาใหม่",
    panelEditTitle: "แก้ไขรายวิชา",
    noNameYet:      "ยังไม่ระบุชื่อ",
    cancel:         "ยกเลิก",
    saveCourse:     "บันทึกรายวิชา",
    saveMapping:    "บันทึกการแมพ",

    // Form fields
    courseCode:       "รหัสวิชา",
    courseCodePh:     "เช่น IT101",
    studyYear:        "ปีที่เรียน",
    selectYear:       "เลือกปี",
    yearN:            (n: number) => `ปีที่ ${n}`,
    courseName:       "ชื่อรายวิชา",
    courseNamePh:     "ชื่อวิชาภาษาไทยหรืออังกฤษ",
    selectDimension:  "เลือก Dimension",
    selectCompetency: "เลือก Competency",
    embedMethod:      "วิธีการ embed AI ในรายวิชา",
    embedMethodPh:    "เช่น บูรณาการในเนื้อหาหลัก, โปรเจกต์ปลายภาค",
    aiToolLabel:      "ชื่อ AI Tool หรือ Platform",
    aiToolHint:       "พิมพ์ชื่อ tool แล้วกด Enter เพื่อเพิ่มทีละตัว (เลือกจากรายการแนะนำได้)",
    toolType:         "ประเภท",
    aiUsage:          "วิธีการใช้ AI Tool ในรายวิชา",
    aiUsagePh:        "อธิบายว่านักศึกษาใช้ AI tool นี้อย่างไรในรายวิชา...",
    aiUsagePh2:       "อธิบายว่านักศึกษาใช้ AI tool นี้อย่างไร...",
    notesPh:          "หมายเหตุหรือเงื่อนไขการใช้ AI ในรายวิชานี้...",

    // AI Integration Level
    freeZoneDesc:  "ไม่ใช้ AI ในทุกขั้นตอน — เป็นผลงานของนักศึกษาทั้งหมด",
    consultedDesc: "ใช้ AI เพื่อช่วยคิดเท่านั้น (ไอเดีย คำอธิบาย คำแนะนำ) แต่นักศึกษาผลิตผลงานทั้งหมดเอง",
    assistedDesc:  "AI และนักศึกษาร่วมกันผลิต โดยนักศึกษากำกับ แก้ไข และเป็นเจ้าของผลงานสุดท้าย",
    generatedDesc: "AI ผลิตผลงานเกือบทั้งหมดหรือทั้งหมด นักศึกษาเป็นผู้กำกับและตรวจทาน",

    // Stats / table
    totalCourses:   "รายวิชาทั้งหมด",
    applyLevel:     "ระดับ Apply",
    createLevel:    "ระดับ Create",
    uniqueCodes:    "รหัสวิชาไม่ซ้ำ",
    mappingList:    "รายการแมพ",
    courses:        "รายวิชา",
    addCourse:      "เพิ่มรายวิชา",
    addFirstCourse: "เพิ่มรายวิชาแรก",
    emptyTitle:     "ยังไม่มีรายวิชา",
    emptyDesc:      "กดปุ่มด้านบนเพื่อเพิ่มรายวิชาแรก",
    notSpecified:   "ยังไม่ระบุ",
    colCourse:      "รายวิชา",
    colEmbedMethod: "วิธีการ embed AI ในรายวิชา",
    colAiUsage:     "วิธีการใช้ AI Tool ในรายวิชา",
    colNotes:       "หมายเหตุ",

    // L1-specific
    l1HeroTitle:    "การแมพหลักสูตรสู่มาตรฐาน UNESCO",
    l1HeroDesc:     "ระบุว่าแต่ละรายวิชาสอดคล้องกับมิติ UNESCO AI Framework ใด และใช้ AI Tool ในระดับใด",
    l1HeroHintPre:  "กดปุ่ม",
    l1HeroHintBold: "+ เพิ่มรายวิชา",
    l1HeroHintPost: "เพื่อเพิ่มแต่ละรายวิชา — ระบบจะเปิด panel ทางขวาสำหรับกรอกข้อมูล",

    // L2-specific
    l2HeroTitle:     "การแมพสมรรถนะ School & Industry",
    l2HeroDesc:      "ระบุสมรรถนะ AI เฉพาะของคณะ (School) หรืออุตสาหกรรม (Industry) ที่แต่ละรายวิชาสอดคล้อง",
    l2HeroHint:      "เลือก School หรือ Industry — แล้วพิมพ์สมรรถนะได้อย่างอิสระ — 1 แถว = 1 รายวิชา × 1 สมรรถนะ",
    suggestFromForm: "เลือกจากสมรรถนะในแบบฟอร์ม:",
    competencyPh:    "เลือกจากชิพด้านบน หรือพิมพ์สมรรถนะเอง...",
    orphanWarning:   "สมรรถนะนี้ไม่ตรงกับที่ระบุไว้ใน Step 2 — ตรวจสอบว่าตั้งใจเพิ่มเอง หรือสะกดไม่ตรง",
    orphanBanner:    (n: number) => `${n} รายวิชามีสมรรถนะที่ไม่ตรงกับที่ระบุไว้ใน Step 2 ของแบบฟอร์ม — อาจมาจากการแก้ไข/ลบสมรรถนะในแบบฟอร์มภายหลัง หรือสะกดไม่ตรง`,
    notFoundStep2:   "ไม่พบใน Step 2",
    orphanTooltip:   "สมรรถนะนี้ไม่ตรงกับที่ระบุไว้ใน Step 2 ของแบบฟอร์ม",
  },
  en: {
    // System / Topbar
    sysTitle:    "AI-Ready Curriculum System",
    sysSub:      "Bangkok University · Office of Academic Affairs",
    roleFaculty: "Submitter",
    logout:      "Log out",
    autoSaved:   "Auto-saved",
    savingMsg:   "Saving...",
    savedMsg:    "Saved ✓",
    loading:     "Loading…",
    errorLoad:   "Unable to load data. Please try again.",
    errorConnect: "Connection failed. Please try again.",
    errorGeneral: "An error occurred. Please try again.",
    backHome:    "Back to Home",

    // Read-only banner
    readOnlyMode: "View-only mode (Approver)",
    readOnlyDesc: "— Cannot edit data",
    backMappingDashboard: "← Back to Mapping Dashboard",

    // Breadcrumb
    home:         "Home",
    curriculumMap:"Curriculum Map",

    // Header card meta
    curriculum: "Program",
    faculty:    "Faculty",
    refNo:      "Reference No.",

    // Panel
    panelAddTitle:  "Add New Course",
    panelEditTitle: "Edit Course",
    noNameYet:      "No name yet",
    cancel:         "Cancel",
    saveCourse:     "Save Course",
    saveMapping:    "Save Mapping",

    // Form fields
    courseCode:       "Course Code",
    courseCodePh:     "e.g. IT101",
    studyYear:        "Study Year",
    selectYear:       "Select Year",
    yearN:            (n: number) => `Year ${n}`,
    courseName:       "Course Name",
    courseNamePh:     "Course name in Thai or English",
    selectDimension:  "Select Dimension",
    selectCompetency: "Select Competency",
    embedMethod:      "AI Embed Method in Course",
    embedMethodPh:    "e.g. Integrated in core content, final project",
    aiToolLabel:      "AI Tool or Platform Name",
    aiToolHint:       "Type tool name then press Enter to add (or select from suggestions)",
    toolType:         "Type",
    aiUsage:          "AI Tool Usage in Course",
    aiUsagePh:        "Describe how students use this AI tool in the course...",
    aiUsagePh2:       "Describe how students use this AI tool...",
    notesPh:          "Notes or conditions for AI use in this course...",

    // AI Integration Level
    freeZoneDesc:  "No AI in any step — entirely the student's own work",
    consultedDesc: "AI for thinking only (ideas, explanations, suggestions) — student produces all work",
    assistedDesc:  "AI and student co-produce — student directs, edits, and owns the final work",
    generatedDesc: "AI produces most or all of the work — student directs and reviews",

    // Stats / table
    totalCourses:   "Total Courses",
    applyLevel:     "Apply Level",
    createLevel:    "Create Level",
    uniqueCodes:    "Unique Course Codes",
    mappingList:    "Mapping List",
    courses:        "courses",
    addCourse:      "Add Course",
    addFirstCourse: "Add First Course",
    emptyTitle:     "No courses yet",
    emptyDesc:      "Click the button above to add the first course",
    notSpecified:   "Not specified",
    colCourse:      "Course",
    colEmbedMethod: "AI Embed Method in Course",
    colAiUsage:     "AI Tool Usage in Course",
    colNotes:       "Notes",

    // L1-specific
    l1HeroTitle:    "Mapping Curriculum to UNESCO Standards",
    l1HeroDesc:     "Specify which UNESCO AI Framework dimension each course aligns with and the AI tool integration level",
    l1HeroHintPre:  "Click",
    l1HeroHintBold: "+ Add Course",
    l1HeroHintPost: "to add each course — the panel on the right will open for data entry",

    // L2-specific
    l2HeroTitle:     "School & Industry Competency Mapping",
    l2HeroDesc:      "Specify faculty-specific (School) or industry (Industry) AI competencies that each course aligns with",
    l2HeroHint:      "Select School or Industry — then type competency freely — 1 row = 1 course × 1 competency",
    suggestFromForm: "Select from form competencies:",
    competencyPh:    "Select from chips above, or type your own competency...",
    orphanWarning:   "This competency does not match any declared in Step 2 — check if intentional or a spelling mismatch",
    orphanBanner:    (n: number) => `${n} course(s) have competencies not matching Step 2 of the form — may be due to later edits/deletions or a spelling mismatch`,
    notFoundStep2:   "Not in Step 2",
    orphanTooltip:   "This competency does not match any declared in Step 2 of the form",
  },
};

export type T = typeof translations.th;

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "th";
    return (localStorage.getItem(LANG_KEY) as Lang) ?? "th";
  });

  const setLang = (l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  };

  return { lang, setLang, t: translations[lang] };
}
