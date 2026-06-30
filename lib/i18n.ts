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

    // Login page
    loginHeroLine1:  "เตรียมหลักสูตร",
    loginHeroLine2:  "ของท่านสู่",
    loginHeroGold:   "โลก AI",
    loginHeroDesc:   "ระบบบริหารหลักสูตรที่ช่วยให้ผู้ดูแลหลักสูตรยื่นขออนุมัติสมรรถนะด้านปัญญาประดิษฐ์ ติดตามสถานะ และจัดทำ Curriculum Mapping ครบในที่เดียว",
    loginFeat1:      "ยื่นขออนุมัติหลักสูตร AI-Ready แบบ 3 ขั้นตอน",
    loginFeat2:      "แมพรายวิชาเข้ากับสมรรถนะตามกรอบ UNESCO และ Industry",
    loginFeat3:      "ติดตามสถานะคำขอ + แจ้งเตือนภายในระบบ",
    loginHomeLink:   "หน้าแรก",
    loginHelpLink:   "ช่วยเหลือ",
    loginTitle:      "เข้าสู่ระบบ",
    loginSubtitle:   "เลือกประเภทผู้ใช้ แล้วเข้าสู่ระบบด้วยบัญชีที่สำนักวิชาการกำหนดให้",
    tabFaculty:      "คณะ",
    tabApprover:     "ผู้อนุมัติ",
    labelFaculty:    "คณะของท่าน",
    selectFaculty:   "— เลือกคณะ —",
    labelPassword:   "รหัสผ่าน",
    phFacultyPw:     "กรอกรหัสผ่านของคณะ",
    rememberMe:      "จดจำการเข้าสู่ระบบ",
    forgotPw:        "ลืมรหัสผ่าน?",
    btnLoginFaculty: "เข้าสู่ระบบยื่นคำขอ",
    labelUsername:   "ชื่อผู้ใช้",
    phApproverUser:  "เช่น approver",
    phApproverPw:    "กรอกรหัสผ่านผู้อนุมัติ",
    btnLoginApprover:"เข้าสู่ Approver Dashboard",
    showPw:          "แสดงรหัสผ่าน",
    hidePw:          "ซ่อนรหัสผ่าน",
    errSelectFaculty:"กรุณาเลือกคณะของท่าน",

    // Submit / home page
    welcome:         "ยินดีต้อนรับกลับ",
    heroSub:         "จัดการคำขออนุมัติ AI-Ready และการแมพสมรรถนะของทุกหลักสูตรในที่เดียว",
    facultyPrograms: "หลักสูตรของคณะ",
    programCount:    (n: number) => `${n} หลักสูตร`,
    noPrograms:      "ยังไม่มีหลักสูตร",
    addNewProgram:   "เพิ่มหลักสูตรใหม่",
    addFirstProgram: "เพิ่มหลักสูตรแรก",
    emptySubTitle:   "เริ่มยื่นคำขออนุมัติหลักสูตรแรกของคณะได้เลย",
    unnamed:         "ไม่ระบุชื่อหลักสูตร",
    notSubmitted:    "ยังไม่ได้ส่ง",
    submittedNTimes: (n: number) => `ส่ง ${n} ครั้ง`,
    reviewerNote:    "คณะกรรมการขอแก้ไข:",
    journeyApproval: "ขออนุมัติ",
    statusNone:      "ยังไม่เริ่ม",
    statusDraft:     "ฉบับร่าง",
    statusPending:   "รออนุมัติ",
    statusChanges:   "ต้องแก้ไข",
    statusApproved:  "อนุมัติแล้ว",
    btnRevise:       "แก้ไขและส่งใหม่",
    btnViewEdit:     "ดู / แก้ไขคำขอ",
    btnView:         "ดูคำขอ",
    btnContinue:     "ทำต่อ",
    btnFill:         "กรอกคำขอ",
    btnEditL1:       (n: number) => `แก้ไข L1 (${n})`,
    btnStartL1:      "เริ่มแมพ L1",
    btnEditL2:       (n: number) => `แก้ไข L2 (${n})`,
    btnStartL2:      "เริ่มแมพ L2",
    btnL2Locked:     "L2 · ทำ L1 ก่อน",
    btnDownloadPDF:  "ดาวน์โหลด PDF",
    aiReadinessTitle:"AI Readiness ของคณะ",
    aiReadinessDesc: "ดูสถานะความพร้อม AI ของอาจารย์ในคณะ Development Path และ Support needs",
    footerNote:      "ระบบบริหารหลักสูตร AI-Ready · มหาวิทยาลัยกรุงเทพ",

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

    // Login page
    loginHeroLine1:  "Prepare Your",
    loginHeroLine2:  "Curriculum for the",
    loginHeroGold:   "AI Era",
    loginHeroDesc:   "A curriculum management system that helps program coordinators submit AI competency approval requests, track status, and complete Curriculum Mapping — all in one place.",
    loginFeat1:      "Submit AI-Ready curriculum approval in 3 steps",
    loginFeat2:      "Map courses to UNESCO and Industry competency frameworks",
    loginFeat3:      "Track request status and receive in-system notifications",
    loginHomeLink:   "Home",
    loginHelpLink:   "Help",
    loginTitle:      "Sign In",
    loginSubtitle:   "Select your role and sign in with your assigned account",
    tabFaculty:      "Faculty",
    tabApprover:     "Approver",
    labelFaculty:    "Your Faculty",
    selectFaculty:   "— Select Faculty —",
    labelPassword:   "Password",
    phFacultyPw:     "Enter faculty password",
    rememberMe:      "Remember me",
    forgotPw:        "Forgot password?",
    btnLoginFaculty: "Sign In to Submit",
    labelUsername:   "Username",
    phApproverUser:  "e.g. approver",
    phApproverPw:    "Enter approver password",
    btnLoginApprover:"Sign In to Approver Dashboard",
    showPw:          "Show password",
    hidePw:          "Hide password",
    errSelectFaculty:"Please select your faculty",

    // Submit / home page
    welcome:         "Welcome back",
    heroSub:         "Manage AI-Ready approval requests and competency mapping for all programs in one place",
    facultyPrograms: "Faculty Programs",
    programCount:    (n: number) => `${n} program${n !== 1 ? "s" : ""}`,
    noPrograms:      "No programs yet",
    addNewProgram:   "Add New Program",
    addFirstProgram: "Add First Program",
    emptySubTitle:   "Start submitting the first program approval request for your faculty",
    unnamed:         "Unnamed program",
    notSubmitted:    "Not submitted",
    submittedNTimes: (n: number) => `Submitted ${n} time${n !== 1 ? "s" : ""}`,
    reviewerNote:    "Review committee requested changes:",
    journeyApproval: "Approval",
    statusNone:      "Not started",
    statusDraft:     "Draft",
    statusPending:   "Pending approval",
    statusChanges:   "Needs revision",
    statusApproved:  "Approved",
    btnRevise:       "Revise & Resubmit",
    btnViewEdit:     "View / Edit Request",
    btnView:         "View Request",
    btnContinue:     "Continue",
    btnFill:         "Fill Request",
    btnEditL1:       (n: number) => `Edit L1 (${n})`,
    btnStartL1:      "Start L1 Mapping",
    btnEditL2:       (n: number) => `Edit L2 (${n})`,
    btnStartL2:      "Start L2 Mapping",
    btnL2Locked:     "L2 · Complete L1 first",
    btnDownloadPDF:  "Download PDF",
    aiReadinessTitle:"Faculty AI Readiness",
    aiReadinessDesc: "View AI readiness of faculty members, development paths and support needs",
    footerNote:      "AI-Ready Curriculum System · Bangkok University",

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
