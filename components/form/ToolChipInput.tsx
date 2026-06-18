"use client";

import React, { useMemo, useRef, useState } from "react";

// Seed vocabulary for autocomplete. The parent may pass more via `suggestions`
// (e.g. tools already used elsewhere in the same curriculum) so the list grows
// with real usage. Matching is case-insensitive; multi-word names stay intact.
const SEED_TOOLS = [
  "ChatGPT", "Claude", "Gemini", "GitHub Copilot", "Microsoft Copilot", "NotebookLM",
  "Perplexity", "Hugging Face", "Cursor", "Canva AI", "Midjourney", "RunwayML",
  "DALL·E", "Stable Diffusion", "Adobe Firefly", "ElevenLabs", "Suno AI",
  "Power BI", "Tableau", "Pandas", "NumPy", "PyTorch", "TensorFlow", "Scikit-Learn",
  "Google Colab", "Jupyter", "AWS", "Azure AI", "Google Cloud", "MySQL Workbench",
  "DBDiagram", "GitHub Actions", "Qwen", "Llama", "DeepSeek", "Mistral",
];

// Storage stays a comma-joined string → fully backward-compatible.
function parse(value: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  value.split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => {
    const k = t.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  });
  return out;
}

export default function ToolChipInput({
  value, onChange, suggestions = [], placeholder = "พิมพ์ชื่อ tool แล้วกด Enter…",
}: {
  value: string;
  onChange: (v: string) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const chips = useMemo(() => parse(value), [value]);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const vocab = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    [...SEED_TOOLS, ...suggestions].forEach((t) => {
      const k = t.trim().toLowerCase();
      if (t.trim() && !seen.has(k)) { seen.add(k); out.push(t.trim()); }
    });
    return out;
  }, [suggestions]);

  const commit = (next: string[]) => onChange(next.join(", "));

  const add = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (!chips.some((c) => c.toLowerCase() === name.toLowerCase())) commit([...chips, name]);
    setText(""); setActive(-1);
  };
  const removeAt = (i: number) => commit(chips.filter((_, j) => j !== i));

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return vocab
      .filter((v) => v.toLowerCase().includes(q) && !chips.some((c) => c.toLowerCase() === v.toLowerCase()))
      .slice(0, 6);
  }, [text, vocab, chips]);

  const showDD = focused && matches.length > 0;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (active >= 0 && active < matches.length) add(matches[active]);
      else add(text);
    } else if (e.key === "Backspace" && text === "" && chips.length) {
      removeAt(chips.length - 1);
    } else if (e.key === "ArrowDown" && matches.length) {
      e.preventDefault(); setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp" && matches.length) {
      e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length);
    } else if (e.key === "Escape") {
      setActive(-1); (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
          minHeight: 42, padding: "7px 10px", background: "white",
          border: `1.5px solid ${focused ? "#1a4f8a" : "#dde3eb"}`, borderRadius: 8,
          cursor: "text", transition: "border-color 0.15s", boxSizing: "border-box",
        }}
      >
        {chips.map((name, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eef4fb", color: "#1a4f8a", border: "1px solid #cfe0f2", borderRadius: 99, padding: "3px 4px 3px 11px", fontSize: 12.5, fontWeight: 600 }}>
            {name}
            <button
              type="button" aria-label={`ลบ ${name}`}
              onClick={(e) => { e.stopPropagation(); removeAt(i); }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 17, height: 17, border: "none", borderRadius: "50%", background: "#cfe0f2", color: "#1a4f8a", cursor: "pointer", padding: 0 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text" value={text}
          onChange={(e) => { setText(e.target.value); setActive(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={chips.length === 0 ? placeholder : ""}
          style={{ flex: 1, minWidth: 130, border: "none", outline: "none", fontFamily: "inherit", fontSize: 13.5, color: "#14202e", background: "transparent", padding: "4px 2px" }}
        />
      </div>

      {showDD && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 4px)", background: "white", border: "1px solid #dde3eb", borderRadius: 8, boxShadow: "0 6px 20px rgba(20,32,46,0.1)", overflow: "hidden", zIndex: 60 }}>
          {matches.map((m, i) => (
            <div
              key={m}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); add(m); }}
              style={{ padding: "8px 12px", fontSize: 13, color: "#14202e", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: i === active ? "#eef4fb" : "white" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a86a14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
