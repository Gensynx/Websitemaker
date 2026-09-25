/**
 * A whole-number field — lights across, panes high, vents fitted. A native
 * number input: arrow keys step it, and the range is on the control itself so
 * assistive technology announces it before a mistake.
 */

import { useId, useState } from 'react';

export function CountField({
  label,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}): JSX.Element {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="field field--count">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="field__input"
        type="number"
        inputMode="numeric"
        step={1}
        min={min}
        max={max}
        value={draft ?? String(value)}
        aria-describedby={`${id}-range`}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const parsed = Number(raw);
          if (raw.trim() !== '' && Number.isInteger(parsed) && parsed >= min && parsed <= max) onCommit(parsed);
        }}
        onBlur={() => setDraft(null)}
      />
      <p className="field__hint" id={`${id}-range`}>
        {min} to {max}
      </p>
    </div>
  );
}
