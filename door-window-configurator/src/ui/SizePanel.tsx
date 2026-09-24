/**
 * Sizing controls (Step 3).
 *
 * Two numeric inputs and a row of standard sizes: the content of the Size
 * section. The section itself — heading, collapse, summary — is the panel's
 * (Section.tsx); nothing here assumes where it sits on the page.
 *
 * The in-progress text of an input is UI state, not configuration state. A
 * field holds a draft string while it is being typed and commits a number only
 * when one can be parsed, so a half-typed "83" never reaches ConfigState and
 * an emptied field does not blank the model.
 *
 * Display is integer millimetres; state is float. The field shows the rounded
 * value and only writes back when the customer actually edits it, so reading a
 * rounded number off the screen cannot quietly become a second rounding point
 * (Step 3.5).
 */

import { useId, useState } from 'react';
import { useConfigurator } from '../state/store';
import { SIZE_PRESETS, sizeLimits } from '../config/limits';
import { formatMm, roundMmHalfUp } from '../config/units';
import type { Mm } from '../config/units';
import type { ValidationIssue } from '../config/validate';

interface FieldProps {
  label: string;
  value: Mm;
  min: Mm;
  max: Mm;
  errors: ValidationIssue[];
  onCommit: (value: Mm) => void;
}

function DimensionField({ label, value, min, max, errors, onCommit }: FieldProps): JSX.Element {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = errors.length > 0;

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label} <span className="field__unit">mm</span>
      </label>
      <input
        id={id}
        className="field__input"
        type="number"
        inputMode="numeric"
        step={1}
        // The permitted range is on the control itself as well as in the
        // message, so assistive technology announces it before a mistake.
        min={roundMmHalfUp(min)}
        max={roundMmHalfUp(max)}
        value={draft ?? String(roundMmHalfUp(value))}
        aria-invalid={invalid}
        aria-describedby={`${id}-range${invalid ? ` ${id}-error` : ''}`}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const parsed = Number(raw);
          // An empty or unparseable field leaves the configuration alone; it
          // does not clear the model out from under the customer.
          if (raw.trim() !== '' && Number.isFinite(parsed)) onCommit(parsed);
        }}
        onBlur={() => setDraft(null)}
      />
      <p className="field__hint" id={`${id}-range`}>
        {formatMm(min)} to {formatMm(max)}
      </p>
      <div className="field__errors" aria-live="polite">
        {errors.map((error) => (
          <p className="field__error" id={`${id}-error`} key={error.message}>
            {error.message}
          </p>
        ))}
      </div>
    </div>
  );
}

export function SizePanel(): JSX.Element {
  const config = useConfigurator((state) => state.config);
  const validation = useConfigurator((state) => state.validation);
  const setDimensions = useConfigurator((state) => state.setDimensions);

  const limits = sizeLimits(config.material, config.productType);
  const presets = SIZE_PRESETS[config.productType];

  // The door leaf rule also reports under `width`, so both reasons land
  // against the input the customer can actually act on.
  const widthErrors = validation.errors.filter((error) => error.field === 'width');
  const heightErrors = validation.errors.filter((error) => error.field === 'height');

  return (
    <>
      <p className="section__hint">Width × height, in millimetres.</p>

      <div className="fields">
        <DimensionField
          label="Width"
          value={config.dimensions.width}
          min={limits.minWidth}
          max={limits.maxWidth}
          errors={widthErrors}
          onCommit={(width) => setDimensions(width, config.dimensions.height)}
        />
        <span className="fields__by" aria-hidden="true">
          ×
        </span>
        <DimensionField
          label="Height"
          value={config.dimensions.height}
          min={limits.minHeight}
          max={limits.maxHeight}
          errors={heightErrors}
          onCommit={(height) => setDimensions(config.dimensions.width, height)}
        />
      </div>

      <div className="presets" role="group" aria-label="Standard sizes">
        {presets.map((preset) => {
          const active =
            roundMmHalfUp(config.dimensions.width) === roundMmHalfUp(preset.width) &&
            roundMmHalfUp(config.dimensions.height) === roundMmHalfUp(preset.height);
          return (
            <button
              key={preset.label}
              type="button"
              className="preset"
              aria-pressed={active}
              onClick={() => setDimensions(preset.width, preset.height)}
            >
              <span className="preset__label">{preset.label}</span>
              <span className="preset__size">
                {roundMmHalfUp(preset.width)} × {roundMmHalfUp(preset.height)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
