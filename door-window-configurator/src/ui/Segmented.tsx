/**
 * A segmented choice, built as a real radio group.
 *
 * Native radios give arrow-key movement, one tab stop for the whole group and
 * correct screen-reader semantics without any of it being reimplemented —
 * which is what Step 4.4 asks of every control: a real form control, operable
 * without the canvas.
 */

import { useId } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export function Segmented<T extends string>({
  legend,
  value,
  options,
  onChange,
  hideLegend = false,
}: {
  legend: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  hideLegend?: boolean;
}): JSX.Element {
  const name = useId();
  return (
    <fieldset className="segmented">
      <legend className={hideLegend ? 'visually-hidden' : 'segmented__legend'}>{legend}</legend>
      <div className="segmented__track">
        {options.map((option) => (
          <label key={option.value} className="segmented__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
