# Project Overview

Next.js 14 app for Bangkok University's **AI-Ready Curriculum** management system — a platform for submitting, approving, and mapping AI-readiness certifications.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Database client | @supabase/supabase-js 2 |
| Fonts | Sarabun (Thai UI) · IBM Plex Sans (numbers/mono labels) |

## Project Structure

```
.
├── app/
│   ├── layout.tsx          # Root layout — loads Sarabun + IBM Plex Sans via next/font/google
│   ├── page.tsx            # Home route — Landing page composition
│   └── globals.css         # CSS variables, body reset, pseudo-element helpers
├── components/
│   └── landing/            # Landing page sections (all Server Components)
│       ├── Navbar.tsx      # Sticky frosted-glass top nav
│       ├── Hero.tsx        # Dark gradient hero + FlowViz card
│       ├── TracksSection.tsx  # Track 1 (Approval) + Track 2 (Mapping) cards
│       ├── HowItWorks.tsx  # 4-step process grid with dashed connector
│       ├── RolesSection.tsx   # 3 role cards + resource strip
│       └── Footer.tsx      # Dark navy 4-column footer
├── public/
├── tailwind.config.ts      # BU color tokens, custom `nav` breakpoint (980px), font families
├── tsconfig.json           # Path alias @/* → ./*
└── CLAUDE.md               # This file
```

## Design Tokens

All tokens are defined as CSS custom properties in `app/globals.css` **and** as Tailwind color names in `tailwind.config.ts`.

### Brand Colors

| Token | Hex | Tailwind class |
|---|---|---|
| `--bu-blue` | `#1a4f8a` | `bg-bu-blue` / `text-bu-blue` |
| `--bu-blue-dark` | `#133a66` | `bg-bu-blue-dark` |
| `--bu-blue-light` | `#2d6cb0` | `bg-bu-blue-light` |
| `--bu-blue-50` | `#eef4fb` | `bg-bu-blue-50` |
| `--bu-blue-100` | `#dbe7f4` | `bg-bu-blue-100` |
| `--bu-gold` | `#c9a44c` | `text-bu-gold` / `bg-bu-gold` |

### Neutral (Ink) Scale

| Token | Hex | Usage |
|---|---|---|
| `--ink-900` | `#14202e` | Body text, headings |
| `--ink-700` | `#3a4859` | Secondary text, nav links |
| `--ink-500` | `#677889` | Muted text, descriptions |
| `--ink-400` | `#8b99a8` | Placeholder, meta |
| `--ink-300` | `#b9c3cf` | Borders (heavier) |
| `--ink-200` | `#dde3eb` | Default borders |
| `--ink-100` | `#eef1f6` | Subtle backgrounds |
| `--ink-50`  | `#f6f8fb` | Page tint, section bg |

### Semantic Colors

| Token | Hex |
|---|---|
| `--success` | `#137a4a` |
| `--success-bg` | `#e6f4ec` |
| `--warning` | `#a86a14` |
| `--warning-bg` | `#fcf3e1` |
| `--danger` | `#b53030` |
| `--paper` | `#ffffff` |

### Typography

- **Primary font**: Sarabun (`var(--font-sarabun)`) — all Thai and general UI text
- **Accent font**: IBM Plex Sans (`var(--font-ibm-plex)`) — stat numbers, track labels, step numbers

### Custom Tailwind Additions

- `nav` breakpoint at **980px** (matches design's responsive breakpoint)
- `font-ibm` → IBM Plex Sans
- `max-w-content` → 1180px

### Special CSS Classes (globals.css)

| Class | Purpose |
|---|---|
| `.hero-overlay` | Applies the `::before` grid-dot pattern over the hero gradient |
| `.how-grid-line` | Adds the dashed horizontal connector line between the 4 steps; collapses to 1-col at 980px |

## Key Conventions

- **Server Components only** for the landing page (no `"use client"` needed)
- **Responsive breakpoint**: `max-[980px]:` arbitrary Tailwind variant; or `.how-grid-line` media query in `globals.css`
- **Inline styles** are used for complex multi-stop gradients and non-standard pixel values (e.g. `13.5px`)
- **Tailwind `!` modifier** (`!grid-cols-1`) overrides inline styles at mobile breakpoints via `!important`
- **Routing**: `#tracks`, `#how`, `#roles` anchor links within the landing page

## Dev Commands

```bash
npm run dev     # start dev server at http://localhost:3000
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

## Next Steps (suggested)

1. Build `app/login/page.tsx` — Google Workspace SSO entry point
2. Build the 4-step submission form under `app/submit/` using `step1.jsx`…`step5.jsx` from the design bundle
3. Build `app/approver/` dashboard
4. Create `lib/supabase.ts` — browser and server Supabase client helpers
5. Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Claude AI Insights Workflow

### ทำงานอย่างไร
Insights ใน `/approver/insights` แบ่งเป็น 2 ส่วน:
- **Part A** (computed) — คำนวณจาก Layer 1/2 mapping แบบ real-time
- **Part B** (static) — วิเคราะห์โดย Claude ในบทสนทนา แล้ว hardcode ใน `lib/insights-static.ts`

### เมื่อพี่พิมพ์ "update insights"
ทำตามลำดับนี้:

**1. ดึงข้อมูล Supabase**
```javascript
// รัน node script จาก project root
const { createClient } = require('@supabase/supabase-js');
// ดึง submissions table — form_data.competencies, sectors, faculty_name, status
```

**2. ดึงข้อมูล Google Sheets Faculty Readiness**
```javascript
// ต้องใช้ NODE_OPTIONS=--openssl-legacy-provider
// ใช้ regex นี้ extract private key:
const get = (k) => { const m = env.match(new RegExp(k+'="?(.+?)"?\\s*$', 'm')); return m ? m[1].trim().replace(/\\n/g,'\n') : ''; };
// Range: 'Raw Data!A2:T'
// col 17 = qb (อยากพัฒนาอะไร), col 18 = qc (ต้องการ support อะไร)
```

**3. ดึงข้อมูล Layer 1 และ Layer 2 mapping จาก Supabase**
```javascript
// เพิ่มใน query: .select('faculty_name,program_name,layer1_mapping,layer2_mapping')
// layer1_mapping fields ที่ใช้: dimension (human/ethics/techniques/design), competency
// layer2_mapping fields ที่ใช้: sector, competency, embedMethod, aiTool, aiUsage,
//   toolType, assisted, generated, consulted, freeZone
```

**4. วิเคราะห์ใน Claude conversation แล้ว overwrite**
อัปเดต `lib/insights-static.ts` — 9 exports:
- `executiveSummary` — narrative ภาพรวม
- `developmentThemes` — clusters จาก qb
- `supportNeeds` — priority items จาก qc
- `competencyPatterns` — กลุ่มสมรรถนะจาก form_data.competencies
- `unescoGapAnalysis` — ความครอบคลุม 4 มิติ จาก L1 จริง (progCount/progTotal)
- `unescoHeatmap` — per-program L1 dimension data (human/ethics/techniques/design count)
- `l2Assessment` — per-program embed/tool analysis (fit, embedDepth, topTools, mode bars, flag)
- `curriculumCharacter` — ลักษณะรายคณะ
- `toolsGap` — tools ในหลักสูตร vs ที่อาจารย์ต้องการ

อัปเดต `INSIGHTS_GENERATED_AT` เป็นวันที่วันนั้น

**5. Deploy สู่ production**
```bash
git add lib/insights-static.ts
git commit -m "Insights: update static AI analysis (YYYY-MM-DD)"
# push ตรงไปที่ main (ไม่ต้องสร้าง PR):
cd "/Users/gim/Documents/Claude/Code/AI Ready"
git push origin main
# Vercel auto-deploy
```

### แหล่งข้อมูล
| Source | Field | ใช้สำหรับ |
|---|---|---|
| Supabase `submissions` | `form_data.competencies` | Pattern, Curriculum Character |
| Supabase `submissions` | `form_data.sectors` | Industry linkage |
| Supabase `submissions` | `layer1_mapping.dimension` | UNESCO Heatmap, Gap Analysis |
| Supabase `submissions` | `layer2_mapping.*` | L2 Assessment (embed/tool fit) |
| Google Sheets col 17 | `qb` | Development themes |
| Google Sheets col 18 | `qc` | Support needs |
| Google Sheets col 8–12 | `d1–d4, score` | Faculty readiness scores |

### หน้าที่แสดงผล
`/approver/insights` — ส่วน Claude AI Insights อยู่ด้านล่างของหน้า ต่อจาก Part A (computed)
