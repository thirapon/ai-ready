#!/usr/bin/env python3
"""
BU AI-Ready Curriculum — Faculty User Manual
สร้าง PDF คู่มือสำหรับผู้บริหารคณะวิชา (fpdf2 version)
"""

import os
from fpdf import FPDF

# ─── Font paths ───────────────────────────────────────────────────────────────
FONT_DIR = os.path.expanduser("~/Library/Fonts")
FONT_REG  = os.path.join(FONT_DIR, "THSarabunNew.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "THSarabunNew Bold.ttf")
FONT_ITAL = os.path.join(FONT_DIR, "THSarabunNew Italic.ttf")

# ─── Colors ───────────────────────────────────────────────────────────────────
BU_BLUE   = (26,  79, 138)
BU_BLUE_D = (19,  58, 102)
BU_BLUE_L = (238, 244, 251)
BU_GOLD   = (201, 164,  76)
INK_900   = (20,  32,  46)
INK_700   = (58,  72,  89)
INK_500   = (103, 120, 137)
INK_100   = (238, 241, 246)
SUCCESS   = (19, 122,  74)
SUCCESS_L = (230, 244, 236)
WARNING   = (168, 106,  20)
WARNING_L = (252, 243, 225)
DANGER    = (181,  48,  48)
DANGER_L  = (253, 236, 236)
WHITE     = (255, 255, 255)
GRAY_BORDER = (221, 227, 235)


class ManualPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(20, 20, 20)
        self.set_auto_page_break(auto=True, margin=20)
        self.add_font("TH",   "",  FONT_REG,  uni=True)
        self.add_font("TH",   "B", FONT_BOLD, uni=True)
        self.add_font("TH",   "I", FONT_ITAL, uni=True)
        self._page_num = 0

    # ── helpers ──────────────────────────────────────────────────────────────
    def set_color(self, rgb, fill=True, draw=True):
        if fill: self.set_fill_color(*rgb)
        if draw: self.set_draw_color(*rgb)

    def set_text_col(self, rgb):
        self.set_text_color(*rgb)

    def th(self, style="", size=12):
        self.set_font("TH", style, size)

    # ── cover page ────────────────────────────────────────────────────────────
    def cover(self):
        self.add_page()
        w, h = self.w, self.h

        # Background
        self.set_fill_color(*BU_BLUE_D)
        self.rect(0, 0, w, h, "F")

        # Gold top bar
        self.set_fill_color(*BU_GOLD)
        self.rect(0, 0, w, 4, "F")

        # BU circle
        self.set_fill_color(*BU_BLUE)
        self.ellipse(20, 18, 22, 22, "F")
        self.set_draw_color(*BU_GOLD)
        self.set_line_width(1)
        self.ellipse(20, 18, 22, 22, "D")
        self.th("B", 16); self.set_text_color(*WHITE)
        self.set_xy(20, 25); self.cell(22, 8, "BU", align="C")

        # Sub title
        self.th("", 10); self.set_text_color(202, 220, 252)
        self.set_xy(48, 20); self.cell(100, 6, "Bangkok University")
        self.th("B", 11); self.set_text_color(*WHITE)
        self.set_xy(48, 27); self.cell(120, 6, "Office of Academic Affairs")

        # Main title
        self.th("B", 34); self.set_text_color(*WHITE)
        self.set_xy(0, h/2 - 30); self.cell(w, 14, "คู่มือการใช้งาน", align="C")

        self.th("B", 22); self.set_text_color(*BU_GOLD)
        self.set_xy(0, h/2 - 10); self.cell(w, 10, "ระบบ AI-Ready Curriculum", align="C")

        self.th("", 14); self.set_text_color(202, 220, 252)
        self.set_xy(0, h/2 + 4); self.cell(w, 8, "สำหรับผู้บริหารและบุคลากรคณะวิชา", align="C")

        # Divider
        self.set_draw_color(*BU_GOLD)
        self.set_line_width(0.8)
        self.line(w/2 - 30, h/2 + 16, w/2 + 30, h/2 + 16)

        # URL
        self.th("", 12); self.set_text_color(202, 220, 252)
        self.set_xy(0, h/2 + 20); self.cell(w, 7, "ai-ready-eight.vercel.app", align="C")

        # Footer bar
        self.set_fill_color(20, 50, 85)
        self.rect(0, h - 22, w, 22, "F")
        self.th("", 9); self.set_text_color(180, 200, 220)
        self.set_xy(0, h - 16); self.cell(w, 6, "มหาวิทยาลัยกรุงเทพ · Bangkok University · 2026", align="C")

    # ── page header/footer ────────────────────────────────────────────────────
    def header(self):
        if self.page_no() == 1:
            return
        self.set_fill_color(*BU_BLUE)
        self.rect(0, 0, self.w, 10, "F")
        self.th("B", 9); self.set_text_color(*WHITE)
        self.set_xy(20, 2)
        self.cell(0, 6, "ระบบ AI-Ready Curriculum · มหาวิทยาลัยกรุงเทพ")
        self.ln(8)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-14)
        self.set_draw_color(*GRAY_BORDER)
        self.set_line_width(0.4)
        self.line(20, self.get_y(), self.w - 20, self.get_y())
        self.th("", 8); self.set_text_color(*INK_500)
        self.set_xy(20, self.get_y() + 1)
        self.cell(0, 5, f"หน้า {self.page_no() - 1}", align="R")

    # ── section header ────────────────────────────────────────────────────────
    def section_header(self, text):
        self.set_fill_color(*BU_BLUE)
        self.set_text_color(*WHITE)
        self.th("B", 14)
        self.cell(0, 10, text, fill=True, ln=True)
        self.ln(3)

    # ── colored box ───────────────────────────────────────────────────────────
    def info_box(self, label, text, bg=BU_BLUE_L, text_color=INK_700, label_color=None):
        if label_color is None: label_color = BU_BLUE
        x = self.get_x(); y = self.get_y(); w = self.w - 40

        # Draw background
        self.set_fill_color(*bg)
        self.set_draw_color(*label_color)
        self.set_line_width(0.5)

        # Measure text height first
        self.th("B", 10)
        label_h = 5
        self.th("", 10)
        # estimate lines
        chars_per_line = int(w / 3.2)
        lines = max(2, len(text) // chars_per_line + 2)
        box_h = label_h + lines * 5 + 8

        self.rect(x, y, w, box_h, "FD")
        self.set_xy(x + 3, y + 3)
        self.th("B", 10); self.set_text_color(*label_color)
        self.cell(w - 6, 5, label, ln=True)
        self.set_x(x + 3)
        self.th("", 10); self.set_text_color(*text_color)
        self.multi_cell(w - 6, 5, text)
        self.set_y(y + box_h + 2)

    # ── simple table ─────────────────────────────────────────────────────────
    def _row_height(self, row, col_widths, line_h=5):
        """Estimate height needed for a table row."""
        max_lines = 1
        for cell_txt, cw in zip(row, col_widths):
            txt = cell_txt[0] if isinstance(cell_txt, tuple) else str(cell_txt)
            # Thai chars ~3.2mm wide at 10pt, ASCII ~2.5mm — use conservative 2.8
            chars_per_line = max(1, int(cw / 2.8))
            lines = max(1, (len(txt) + chars_per_line - 1) // chars_per_line)
            max_lines = max(max_lines, lines)
        return max(8, max_lines * line_h + 4)

    def _draw_header_row(self, headers, col_widths, cell_h=8):
        self.set_fill_color(*BU_BLUE)
        self.set_text_color(*WHITE)
        self.th("B", 10)
        for h, cw in zip(headers, col_widths):
            self.cell(cw, cell_h, h, border=0, fill=True, align="C")
        self.ln()

    def draw_table(self, headers, rows, col_widths, col_aligns=None, row_colors=None):
        if col_aligns is None:
            col_aligns = ["L"] * len(headers)
        if row_colors is None:
            row_colors = [WHITE, INK_100]

        w_total = sum(col_widths)
        page_bottom = self.h - self.b_margin

        # Disable auto page break — we'll manage manually
        self.set_auto_page_break(False)

        try:
            self._draw_header_row(headers, col_widths)

            for ri, row in enumerate(rows):
                bg = row_colors[ri % len(row_colors)]
                row_h = self._row_height(row, col_widths)

                # Page break if row won't fit
                if self.get_y() + row_h > page_bottom - 5:
                    self.add_page()
                    self._draw_header_row(headers, col_widths)

                x_start = self.l_margin
                y_start = self.get_y()

                # Fill background for entire row first
                self.set_fill_color(*bg)
                self.rect(x_start, y_start, w_total, row_h, "F")

                # Draw each cell
                for ci, (cell_txt, cw, align) in enumerate(zip(row, col_widths, col_aligns)):
                    txt = cell_txt[0] if isinstance(cell_txt, tuple) else str(cell_txt)
                    style = cell_txt[1] if isinstance(cell_txt, tuple) else {}

                    font_style  = style.get("style", "")
                    font_size   = style.get("size",  10)
                    txt_color   = style.get("color", INK_700)
                    fill_color  = style.get("fill",  None)

                    cx = x_start + sum(col_widths[:ci])
                    if fill_color:
                        self.set_fill_color(*fill_color)
                        self.rect(cx, y_start, cw, row_h, "F")

                    self.set_text_color(*txt_color)
                    self.th(font_style, font_size)
                    self.set_xy(cx + 2, y_start + 2)
                    self.multi_cell(cw - 4, 5, txt, border=0, fill=False, align=align)

                # Row border
                self.set_draw_color(*GRAY_BORDER)
                self.set_line_width(0.3)
                x = x_start
                self.line(x, y_start + row_h, x + w_total, y_start + row_h)
                for cw in col_widths:
                    self.line(x, y_start, x, y_start + row_h)
                    x += cw
                self.line(x, y_start, x, y_start + row_h)

                self.set_y(y_start + row_h)

            # Outer border top
            self.set_draw_color(*GRAY_BORDER)
            self.ln(4)

        finally:
            self.set_auto_page_break(True, margin=self.b_margin)

    # ── numbered steps ────────────────────────────────────────────────────────
    def numbered_steps(self, steps):
        for i, (title, desc) in enumerate(steps, 1):
            x = self.get_x(); y = self.get_y()
            # Number circle
            self.set_fill_color(*BU_BLUE)
            self.ellipse(x, y, 7, 7, "F")
            self.th("B", 10); self.set_text_color(*WHITE)
            self.set_xy(x, y); self.cell(7, 7, str(i), align="C")
            # Text
            self.th("B", 11); self.set_text_color(*INK_900)
            self.set_xy(x + 9, y)
            self.cell(0, 5, title, ln=True)
            self.th("", 10); self.set_text_color(*INK_700)
            self.set_x(x + 9)
            self.multi_cell(self.w - 40 - 9, 5, desc)
            self.ln(2)

    # ── TOC entry ─────────────────────────────────────────────────────────────
    def toc_entry(self, num, title, page):
        self.th("", 12); self.set_text_color(*INK_700)
        self.set_x(20)
        self.cell(8, 7, str(num) + ".", align="L")
        self.cell(self.w - 60, 7, title, align="L")
        self.th("B", 12); self.set_text_color(*BU_BLUE)
        self.cell(0, 7, str(page), align="R", ln=True)
        # Dotted separator
        self.set_draw_color(*INK_100)
        self.set_line_width(0.3)
        y = self.get_y()
        self.line(20, y, self.w - 20, y)

    # ── 4-dim cards ──────────────────────────────────────────────────────────
    def dim_cards(self, dims):
        x0 = self.get_x(); y0 = self.get_y()
        cw = (self.w - 40) / 2 - 2
        ch = 28
        for i, (title, desc, bg, border_c) in enumerate(dims):
            col = i % 2; row = i // 2
            cx = x0 + col * (cw + 4)
            cy = y0 + row * (ch + 4)
            self.set_fill_color(*bg)
            self.set_draw_color(*border_c)
            self.set_line_width(0.5)
            self.rect(cx, cy, cw, ch, "FD")
            self.th("B", 11); self.set_text_color(*border_c)
            self.set_xy(cx + 3, cy + 3); self.cell(cw - 6, 5, title, ln=True)
            self.th("", 9); self.set_text_color(*INK_700)
            self.set_xy(cx + 3, cy + 9)
            self.multi_cell(cw - 6, 4, desc)
        self.set_y(y0 + (((len(dims)-1)//2)+1) * (ch + 4) + 3)


# ─── Build pages ──────────────────────────────────────────────────────────────
def build(pdf: ManualPDF):
    W = pdf.w - 40  # usable width

    # ── สารบัญ ───────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.th("B", 20); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 12, "สารบัญ", align="C", ln=True)
    pdf.set_draw_color(*BU_BLUE)
    pdf.set_line_width(1.2)
    pdf.line(20, pdf.get_y(), pdf.w - 20, pdf.get_y())
    pdf.ln(5)

    toc = [
        (1, "บทนำ — ระบบ AI-Ready Curriculum คืออะไร", 3),
        (2, "การเข้าสู่ระบบ", 4),
        (3, "หน้าหลัก — ดูสถานะหลักสูตร", 5),
        (4, "การยื่นแบบฟอร์มขออนุมัติหลักสูตร AI-Ready", 6),
        (5, "Layer 1 — UNESCO AI Competency Mapping", 8),
        (6, "Layer 2 — School & Industry Mapping", 10),
        (7, "การติดตามสถานะและรับผลการพิจารณา", 12),
        (8, "คำถามที่พบบ่อย (FAQ)", 13),
    ]
    for num, title, page in toc:
        pdf.toc_entry(num, title, page)

    # ── บทนำ ─────────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("1. บทนำ — ระบบ AI-Ready Curriculum คืออะไร")

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "วัตถุประสงค์ของระบบ", ln=True)
    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "ระบบ AI-Ready Curriculum เป็นแพลตฟอร์มออนไลน์ของมหาวิทยาลัยกรุงเทพ "
        "สำหรับบริหารกระบวนการรับรองหลักสูตรที่มีความพร้อมด้าน AI โดยครอบคลุม "
        "ตั้งแต่การยื่นคำขออนุมัติ การแมพสมรรถนะ AI ตามมาตรฐาน UNESCO "
        "ไปจนถึงการรายงานผลให้ผู้บริหารระดับมหาวิทยาลัย")
    pdf.ln(3)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ประโยชน์ที่คณะวิชาจะได้รับ", ln=True)
    benefits = [
        ("ยื่นคำขออนุมัติออนไลน์ได้ทุกที่ทุกเวลา",
         "ไม่ต้องส่งเอกสารกระดาษ ติดตามสถานะได้แบบ real-time"),
        ("แสดงความพร้อม AI ของหลักสูตรได้อย่างเป็นระบบ",
         "ใช้กรอบมาตรฐาน UNESCO AI Competency Framework ระดับสากล"),
        ("รับแจ้งผลการพิจารณาทางอีเมลทันที",
         "ระบบส่งผลอัตโนมัติเมื่อคณะกรรมการพิจารณาแล้วเสร็จ"),
    ]
    pdf.numbered_steps(benefits)
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ภาพรวมขั้นตอนการใช้งาน", ln=True)
    pdf.draw_table(
        ["ขั้นตอนที่", "การดำเนินการ", "หน้าในระบบ"],
        [
            [("1", {"style":"B","color":WHITE,"fill":BU_BLUE}),
             "เข้าสู่ระบบด้วยบัญชีคณะ", "/login"],
            [("2", {"style":"B","color":WHITE,"fill":BU_BLUE}),
             "ยื่นแบบฟอร์มขออนุมัติหลักสูตร AI-Ready", "/submit/form"],
            [("3", {"style":"B","color":WHITE,"fill":BU_BLUE}),
             "รอผลการพิจารณา (ได้รับอีเมลแจ้งผล)", "—"],
            [("4", {"style":"B","color":WHITE,"fill":BU_BLUE}),
             "ทำ Layer 1 — UNESCO Competency Mapping", "/mapping/layer1"],
            [("5", {"style":"B","color":WHITE,"fill":BU_BLUE}),
             "ทำ Layer 2 — School & Industry Mapping", "/mapping/layer2"],
        ],
        [18, W - 60, 42],
        ["C", "L", "L"]
    )

    # ── เข้าสู่ระบบ ───────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("2. การเข้าสู่ระบบ")

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "URL ของระบบ", ln=True)
    pdf.th("B", 14); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 8, "ai-ready-eight.vercel.app", ln=True)
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ขั้นตอนการเข้าสู่ระบบ", ln=True)
    login_steps = [
        ("เปิด Browser และไปที่ URL", "แนะนำให้ใช้ Chrome หรือ Safari เวอร์ชันล่าสุด"),
        ("เลือก 'เข้าสู่ระบบในฐานะคณะ'", "ระบบจะแสดงรายชื่อคณะทั้งหมด"),
        ("เลือกชื่อคณะของท่าน", "เลือกจากรายการ dropdown"),
        ("กรอกรหัสผ่านของคณะ", "รหัสผ่านจัดส่งโดยสายวิชาการ"),
        ("กดปุ่ม 'เข้าสู่ระบบ'", "ระบบจะนำท่านไปยังหน้าหลักโดยอัตโนมัติ"),
    ]
    pdf.numbered_steps(login_steps)
    pdf.ln(3)
    pdf.info_box("! ข้อควรระวัง",
        "รหัสผ่านของแต่ละคณะเป็นความลับ กรุณาไม่เผยแพร่ให้บุคคลภายนอก "
        "หากต้องการเปลี่ยนรหัสผ่าน กรุณาติดต่อสายวิชาการ",
        bg=WARNING_L, text_color=INK_700, label_color=WARNING)

    # ── หน้าหลัก ─────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("3. หน้าหลัก — ดูสถานะหลักสูตร")

    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "หลังจาก Login สำเร็จ ระบบจะแสดง หน้าหลักของคณะ (/submit) "
        "ซึ่งแสดงข้อมูลต่อไปนี้")
    pdf.ln(2)

    items = [
        ("รายการหลักสูตรที่ยื่นขออนุมัติแล้ว",
         "แสดงชื่อหลักสูตร สถานะ วันที่ยื่น และความคืบหน้า Mapping"),
        ("ปุ่ม 'ยื่นคำขอใหม่'",
         "เริ่มกระบวนการยื่นแบบฟอร์มสำหรับหลักสูตรใหม่"),
        ("ปุ่ม 'แก้ไข / ดูรายละเอียด'",
         "เข้าไปแก้ไขหลักสูตรที่มีสถานะ 'ขอแก้ไข' หรือดูรายละเอียด"),
        ("ความคืบหน้า Mapping",
         "แสดงว่า Layer 1 และ Layer 2 ดำเนินการไปถึงไหนแล้ว"),
    ]
    pdf.numbered_steps(items)
    pdf.ln(3)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "สถานะที่แสดงในหน้าหลัก", ln=True)

    pdf.draw_table(
        ["สถานะ", "ความหมาย", "สิ่งที่ต้องทำต่อ"],
        [
            ["Draft", "บันทึกแบบร่าง ยังไม่ยื่น",
             "กดปุ่มยื่นคำขอเพื่อส่งให้คณะกรรมการ"],
            [("รออนุมัติ", {"color":WARNING}),
             "ยื่นแล้ว รอคณะกรรมการพิจารณา",
             "รอรับอีเมลแจ้งผลการพิจารณา"],
            [("อนุมัติแล้ว", {"color":SUCCESS}),
             "ผ่านการอนุมัติ",
             "ดำเนินการ Layer 1 และ Layer 2 Mapping ได้เลย"],
            [("ขอแก้ไข", {"color":BU_BLUE}),
             "คณะกรรมการขอให้แก้ไขข้อมูล",
             "แก้ไขตามความเห็นและยื่นใหม่"],
            [("ไม่อนุมัติ", {"color":DANGER}),
             "ไม่ผ่านการพิจารณา",
             "ติดต่อสายวิชาการเพื่อขอคำแนะนำ"],
        ],
        [30, W/2 - 10, W/2 - 20],
        ["C", "L", "L"]
    )

    # ── ยื่นแบบฟอร์ม ─────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("4. การยื่นแบบฟอร์มขออนุมัติหลักสูตร AI-Ready")

    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "แบบฟอร์มการยื่นขออนุมัติประกอบด้วย 3 ขั้นตอน "
        "ท่านสามารถบันทึกแบบร่างได้ตลอดเวลาและกลับมาแก้ไขภายหลัง")
    pdf.ln(3)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ขั้นตอนที่ 1 — ข้อมูลคณะและหลักสูตร", ln=True)
    pdf.draw_table(
        ["ฟิลด์", "รายละเอียด"],
        [
            ["ชื่อคณะ", "ดึงจากบัญชีที่ Login อัตโนมัติ ไม่ต้องกรอก"],
            ["ชื่อหลักสูตร", "เลือกจาก Dropdown หลักสูตรภายในคณะ"],
            ["ชื่อผู้รับผิดชอบ", "ชื่อ-นามสกุล เช่น ผศ.ดร. สมชาย ใจดี"],
            ["ตำแหน่ง", "เช่น ประธานหลักสูตร / หัวหน้าภาควิชา"],
            ["อีเมลรับผลอนุมัติ", "ระบบจะส่งผลการพิจารณามาที่อีเมลนี้"],
            ["Industry Framework ที่อ้างอิง", "เช่น UNESCO AI Competency Framework for Students (2024)"],
            ["วันที่ยื่นเสนอ", "วันที่ต้องการให้คณะกรรมการพิจารณา"],
            ["ภาคอุตสาหกรรมที่เกี่ยวข้อง", "เลือกได้หลายภาคส่วน"],
        ],
        [W * 0.38, W * 0.62],
        ["L", "L"]
    )

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ขั้นตอนที่ 2 — สมรรถนะ AI ที่ฝังในหลักสูตร", ln=True)
    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "กรอกสมรรถนะ AI ที่หลักสูตรได้ฝังไว้ในรายวิชาต่าง ๆ โดยระบุ ชื่อสมรรถนะ, "
        "ที่มา (School หรือ Industry), ชั้นปีที่สอน, และรายละเอียดการจัดการเรียนรู้")
    pdf.ln(2)
    pdf.info_box("* เคล็ดลับ",
        "สามารถเพิ่มได้หลายสมรรถนะ แนะนำให้ระบุอย่างน้อย 3-5 รายการ "
        "เพื่อให้ภาพรวมหลักสูตรมีความสมบูรณ์")
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ขั้นตอนที่ 3 — ตรวจสอบและยืนยัน", ln=True)
    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "ตรวจสอบข้อมูลทั้งหมดก่อนกด 'ยื่นคำขอ' "
        "หลังจากยื่นแล้ว สถานะจะเปลี่ยนเป็น 'รออนุมัติ' ทันที")
    pdf.ln(2)
    pdf.info_box("* เคล็ดลับ",
        "หากพบข้อผิดพลาดหลังยื่นแล้ว รอให้คณะกรรมการตีกลับ (ขอแก้ไข) "
        "แล้วค่อยแก้ไขและยื่นใหม่ได้")

    # ── Layer 1 ───────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("5. Layer 1 — UNESCO AI Competency Mapping")

    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "Layer 1 คือการแมพว่าแต่ละรายวิชาในหลักสูตรสอดคล้องกับมิติใดของ "
        "UNESCO AI Competency Framework สามารถเข้าทำได้หลังจากหลักสูตรได้รับ 'อนุมัติ' แล้ว")
    pdf.ln(3)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "4 มิติหลักของ UNESCO AI Competency Framework", ln=True)

    pdf.dim_cards([
        ("1. Human-centred Mindset",
         "ความรับผิดชอบต่อสังคมและพลเมืองยุค AI\n(Apply / Create)",
         BU_BLUE_L, BU_BLUE),
        ("2. Ethics of AI",
         "การใช้ AI อย่างปลอดภัยและมีจริยธรรม\n(Apply / Create)",
         DANGER_L, DANGER),
        ("3. AI Techniques & Applications",
         "ทักษะการประยุกต์ใช้และสร้างระบบ AI\n(Apply / Create)",
         (245,243,255), (109,40,217)),
        ("4. AI System Design",
         "การออกแบบสถาปัตยกรรมและระบบ AI\n(Apply / Create)",
         WARNING_L, WARNING),
    ])
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ข้อมูลที่ต้องกรอกในแต่ละรายวิชา", ln=True)
    pdf.draw_table(
        ["ฟิลด์", "รายละเอียด"],
        [
            ["รหัสวิชา / ชื่อวิชา", "รหัสและชื่อรายวิชาตามหลักสูตร"],
            ["มิติ UNESCO", "เลือก 1 ใน 4 มิติที่วิชานี้สอดคล้อง"],
            ["ระดับสมรรถนะ", "Apply (ประยุกต์ใช้) หรือ Create (สร้างสรรค์)"],
            ["ชั้นปีที่สอน", "ปีที่ 1, 2, 3 หรือ 4"],
            ["วิธีการบูรณาการ AI", "อธิบายว่าฝัง AI ในการสอนอย่างไร"],
            ["เครื่องมือ AI ที่ใช้", "เช่น ChatGPT, Claude, GitHub Copilot, Midjourney"],
            ["ประเภทเครื่องมือ", "Essential / Specialist / Competitive"],
            ["ระดับการใช้ AI", "AI Free Zone / Consulted / Assisted / Generated"],
        ],
        [W * 0.38, W * 0.62], ["L", "L"]
    )
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ระดับการใช้ AI (Autonomy Levels)", ln=True)
    pdf.draw_table(
        ["ระดับ", "ความหมาย"],
        [
            ["AI Free Zone", "วิชานี้ไม่ใช้ AI โดยเจตนา (เน้นทักษะพื้นฐาน)"],
            ["AI Consulted", "ใช้ AI เพื่อค้นหาข้อมูล / อ้างอิงเท่านั้น"],
            ["AI Assisted",  "AI ช่วยสนับสนุนการทำงาน นักศึกษายังตัดสินใจหลัก"],
            ["AI Generated", "AI สร้างผลลัพธ์หลัก นักศึกษาตรวจสอบและปรับแต่ง"],
        ],
        [W * 0.35, W * 0.65], ["L", "L"]
    )

    # ── Layer 2 ───────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("6. Layer 2 — School & Industry Mapping")

    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "Layer 2 คือการแมพสมรรถนะ AI ในบริบทของ School (หลักสูตร) และ Industry (ภาคอุตสาหกรรม) "
        "ว่าหลักสูตรเตรียมบัณฑิตให้ใช้ AI ในสภาพแวดล้อมจริงอย่างไร")
    pdf.ln(3)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ความแตกต่างระหว่าง School และ Industry", ln=True)
    pdf.draw_table(
        ["", "School", "Industry"],
        [
            ["ความหมาย",
             "สมรรถนะที่พัฒนาในบริบทการเรียนรู้ภายในมหาวิทยาลัย",
             "สมรรถนะที่ตรงกับความต้องการของภาคอุตสาหกรรม"],
            ["ตัวอย่าง",
             "ใช้ ChatGPT วิเคราะห์กรณีศึกษาในห้องเรียน",
             "ใช้ Power BI สร้าง Dashboard สำหรับองค์กร"],
            ["สัดส่วนแนะนำ", "40-60%", "40-60%"],
        ],
        [W * 0.22, W * 0.39, W * 0.39], ["C", "L", "L"]
    )
    pdf.ln(2)

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "ข้อมูลที่ต้องกรอกในแต่ละแถว", ln=True)
    pdf.draw_table(
        ["ฟิลด์", "รายละเอียด"],
        [
            ["ประเภท (Sector)", "School หรือ Industry"],
            ["ชื่อสมรรถนะ", "กำหนดเองได้อย่างอิสระ เช่น การวิเคราะห์ข้อมูลด้วย AI"],
            ["รหัสวิชา / ชื่อวิชา", "รายวิชาที่พัฒนาสมรรถนะนี้"],
            ["ชั้นปีที่สอน", "ปีที่ 1, 2, 3 หรือ 4"],
            ["วิธีการบูรณาการ AI", "อธิบายกิจกรรมการเรียนรู้"],
            ["เครื่องมือ AI ที่ใช้", "เช่น ChatGPT, Tableau, GitHub Copilot"],
            ["ระดับการใช้ AI", "AI Free Zone / Consulted / Assisted / Generated"],
        ],
        [W * 0.35, W * 0.65], ["L", "L"]
    )
    pdf.ln(2)
    pdf.info_box("* เคล็ดลับ",
        "Layer 1 และ Layer 2 บันทึกอัตโนมัติทุกครั้งที่มีการแก้ไข "
        "ท่านสามารถออกจากระบบและกลับมาทำต่อได้โดยไม่สูญเสียข้อมูล")

    # ── ติดตามสถานะ ───────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("7. การติดตามสถานะและรับผลการพิจารณา")

    pdf.th("B", 13); pdf.set_text_color(*BU_BLUE)
    pdf.cell(0, 7, "การรับแจ้งผลทางอีเมล", ln=True)
    pdf.th("", 12); pdf.set_text_color(*INK_700)
    pdf.multi_cell(0, 6,
        "เมื่อคณะกรรมการ AI-Ready พิจารณาคำขอของท่านแล้ว "
        "ระบบจะส่งอีเมลแจ้งผลไปยังอีเมลที่ท่านระบุไว้ในแบบฟอร์ม (Step 1) โดยอัตโนมัติ")
    pdf.ln(3)

    pdf.draw_table(
        ["ผลการพิจารณา", "เนื้อหาอีเมล", "สิ่งที่ต้องทำ"],
        [
            [("อนุมัติ", {"color":SUCCESS}),
             "แจ้งเลขที่อ้างอิง และผลอนุมัติ",
             "เริ่มทำ Layer 1 และ Layer 2 Mapping ได้ทันที"],
            [("ขอแก้ไข", {"color":WARNING}),
             "แจ้งความเห็นและจุดที่ต้องแก้ไข",
             "Login แก้ไขตามความเห็น แล้วยื่นใหม่"],
            [("ไม่อนุมัติ", {"color":DANGER}),
             "แจ้งเหตุผลที่ไม่อนุมัติ",
             "ติดต่อสายวิชาการเพื่อขอคำปรึกษา"],
        ],
        [W * 0.20, W * 0.42, W * 0.38], ["C", "L", "L"]
    )
    pdf.ln(3)
    pdf.info_box("! หมายเหตุ",
        "ตรวจสอบกล่อง Spam/Junk ด้วย หากไม่ได้รับอีเมลภายใน 1 วันทำการ "
        "กรุณาติดต่อสายวิชาการ",
        bg=WARNING_L, text_color=INK_700, label_color=WARNING)

    # ── FAQ ───────────────────────────────────────────────────────────────────
    pdf.add_page()
    pdf.section_header("8. คำถามที่พบบ่อย (FAQ)")

    faqs = [
        ("ต้องยื่นทุกหลักสูตรในคณะหรือไม่?",
         "ไม่จำเป็นต้องยื่นพร้อมกันทุกหลักสูตร สามารถเริ่มจากหลักสูตรที่พร้อมก่อน"),
        ("หากลืมรหัสผ่านของคณะต้องทำอย่างไร?",
         "ติดต่อสายวิชาการหรือ IT ของมหาวิทยาลัยเพื่อขอรีเซ็ตรหัสผ่าน"),
        ("Layer 1 และ Layer 2 ต้องทำก่อน-หลังกันไหม?",
         "แนะนำให้ทำ Layer 1 ก่อน แต่ระบบไม่ได้บังคับลำดับ"),
        ("สามารถแก้ไข Layer 1 / Layer 2 หลัง Submit แล้วได้ไหม?",
         "ได้ครับ Layer 1 และ Layer 2 สามารถแก้ไขได้ตลอดเวลา ไม่ต้องผ่านการอนุมัติซ้ำ"),
        ("ใช้คนหลายคนช่วยกรอกข้อมูลได้ไหม?",
         "ปัจจุบันระบบใช้บัญชีเดียวต่อคณะ หากต้องการหลายคนทำงานร่วมกัน สามารถแชร์การเข้าสู่ระบบได้"),
        ("ระบบรองรับการแนบไฟล์เพิ่มเติมไหม?",
         "ปัจจุบันรองรับการกรอกข้อมูลในรูปแบบฟอร์มออนไลน์เท่านั้น"),
    ]

    for i, (q, a) in enumerate(faqs, 1):
        pdf.th("B", 12); pdf.set_text_color(*BU_BLUE)
        pdf.cell(0, 7, f"Q{i}: {q}", ln=True)
        pdf.th("", 11); pdf.set_text_color(*INK_700)
        pdf.set_x(25)
        pdf.multi_cell(pdf.w - 45, 5, f"A: {a}")
        pdf.set_draw_color(*INK_100)
        pdf.set_line_width(0.3)
        pdf.line(20, pdf.get_y(), pdf.w - 20, pdf.get_y())
        pdf.ln(3)

    # Contact box
    pdf.ln(4)
    pdf.set_fill_color(*BU_BLUE_L)
    pdf.set_draw_color(*BU_BLUE)
    pdf.set_line_width(0.8)
    x = pdf.get_x(); y = pdf.get_y()
    pdf.rect(x, y, pdf.w - 40, 24, "FD")
    pdf.th("B", 11); pdf.set_text_color(*BU_BLUE)
    pdf.set_xy(x + 4, y + 3); pdf.cell(0, 6, "ติดต่อสอบถาม", ln=True)
    pdf.th("", 10); pdf.set_text_color(*INK_700)
    pdf.set_x(x + 4)
    pdf.multi_cell(pdf.w - 48, 5,
        "สายวิชาการ มหาวิทยาลัยกรุงเทพ | ai-ready-eight.vercel.app | thirapon.w@bu.ac.th")


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    out_path = "/Users/gim/Documents/Claude/Code/AI Ready/public/BU-AIReady-Manual.pdf"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    pdf = ManualPDF()
    pdf.cover()
    build(pdf)
    pdf.output(out_path)

    size = os.path.getsize(out_path)
    print(f"PDF created: {out_path}")
    print(f"Size: {size:,} bytes ({size//1024} KB)")


if __name__ == "__main__":
    main()
