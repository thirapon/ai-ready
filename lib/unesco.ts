// ─── UNESCO AI Competency Framework (4 dimensions) ───────────────────────────

export interface UnescoDimension {
  id: string;
  label: string;
  labelTH: string;
  color: string;
  bg: string;
  border: string;
  competencies: { id: string; label: string; labelTH: string; level: "apply" | "create" }[];
}

export const UNESCO_DIMENSIONS: UnescoDimension[] = [
  {
    id: "human",
    label: "Human-centred Mindset",
    labelTH: "Human-centred Mindset",
    color: "#1a4f8a",
    bg: "#eef4fb",
    border: "#dbe7f4",
    competencies: [
      { id: "apply_human",  label: "Human accountability",      labelTH: "Apply: Human accountability",      level: "apply"  },
      { id: "create_human", label: "Citizenship in the era of AI", labelTH: "Create: Citizenship in the era of AI", level: "create" },
    ],
  },
  {
    id: "ethics",
    label: "Ethics of AI",
    labelTH: "Ethics of AI",
    color: "#b53030",
    bg: "#fdecec",
    border: "#f4d0d0",
    competencies: [
      { id: "apply_ethics",  label: "Safe and responsible use", labelTH: "Apply: Safe and responsible use", level: "apply"  },
      { id: "create_ethics", label: "Ethics by design",         labelTH: "Create: Ethics by design",        level: "create" },
    ],
  },
  {
    id: "techniques",
    label: "AI Techniques & Applications",
    labelTH: "AI Techniques & Applications",
    color: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    competencies: [
      { id: "apply_techniques",  label: "Application skills",  labelTH: "Apply: Application skills",  level: "apply"  },
      { id: "create_techniques", label: "Creating AI tools",   labelTH: "Create: Creating AI tools",  level: "create" },
    ],
  },
  {
    id: "design",
    label: "AI System Design",
    labelTH: "AI System Design",
    color: "#a86a14",
    bg: "#fcf3e1",
    border: "#f0dca6",
    competencies: [
      { id: "apply_design",  label: "Architecture design",         labelTH: "Apply: Architecture design",         level: "apply"  },
      { id: "create_design", label: "Iteration and feedback loops", labelTH: "Create: Iteration and feedback loops", level: "create" },
    ],
  },
];

export function getDimension(id: string) {
  return UNESCO_DIMENSIONS.find((d) => d.id === id);
}
export function getCompetency(compId: string) {
  for (const d of UNESCO_DIMENSIONS) {
    const c = d.competencies.find((c) => c.id === compId);
    if (c) return { ...c, dimension: d };
  }
  return null;
}

// ─── Mapping row ──────────────────────────────────────────────────────────────
export interface MappingRow {
  id: string;
  courseCode: string;
  courseName: string;
  dimension: string;
  competency: string;
  year: string;
  embedMethod: string;
  aiTool: string;
  toolType: "essential" | "specialist" | "competitive" | "";
  aiUsage: string;
  freeZone: boolean;
  consulted: boolean;
  assisted: boolean;
  generated: boolean;
  notes: string;
}

export function newRow(): MappingRow {
  return {
    id: Math.random().toString(36).slice(2),
    courseCode: "",
    courseName: "",
    dimension: "",
    competency: "",
    year: "",
    embedMethod: "",
    aiTool: "",
    toolType: "",
    aiUsage: "",
    freeZone: false,
    consulted: false,
    assisted: false,
    generated: false,
    notes: "",
  };
}

// legacy type kept for API compatibility
export type Layer1Mapping = MappingRow[];

// ─── Layer 2 row (School & Industry) ─────────────────────────────────────────
export interface Layer2Row {
  id: string;
  sector: "school" | "industry" | "";
  competency: string;   // free text — user defines
  courseCode: string;
  courseName: string;
  year: string;
  embedMethod: string;
  aiTool: string;
  toolType: "essential" | "specialist" | "competitive" | "";
  aiUsage: string;
  freeZone: boolean;
  consulted: boolean;
  assisted: boolean;
  generated: boolean;
  notes: string;
}

export function newLayer2Row(): Layer2Row {
  return {
    id: Math.random().toString(36).slice(2),
    sector: "",
    competency: "",
    courseCode: "",
    courseName: "",
    year: "",
    embedMethod: "",
    aiTool: "",
    toolType: "",
    aiUsage: "",
    freeZone: false,
    consulted: false,
    assisted: false,
    generated: false,
    notes: "",
  };
}
