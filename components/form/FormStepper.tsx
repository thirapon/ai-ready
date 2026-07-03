import type { T } from "@/lib/i18n";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function FormStepper({ current, t }: { current: number; t: T }) {
  const steps = [
    { label: t.fStep1Label, name: t.fStep1Name },
    { label: t.fStep2Label, name: t.fStep2Name },
    { label: t.fStep3Label, name: t.fStep3Name },
  ];
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const cls = i < current ? "step done" : i === current ? "step active" : "step";
        return (
          <div key={i} className={cls}>
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
