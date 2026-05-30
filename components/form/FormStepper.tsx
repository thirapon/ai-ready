const STEPS = [
  { label: "ขั้นตอนที่ 1", name: "ข้อมูลคณะ" },
  { label: "ขั้นตอนที่ 2", name: "AI Competencies" },
  { label: "ขั้นตอนที่ 3", name: "ตรวจสอบและส่ง" },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function FormStepper({ current }: { current: number }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        const cls = i < current ? "step done" : i === current ? "step active" : "step";
        return (
          <div key={s.name} className={cls}>
            <div className="step__bubble">
              {i < current ? <CheckIcon /> : i + 1}
            </div>
            <div className="step__text">
              <div className="step__label">{s.label}</div>
              <div className="step__name">{s.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
