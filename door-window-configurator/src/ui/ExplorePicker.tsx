/**
 * Explore mode's picker (Step 5.2): any colour at all, for ideas — never for
 * an order.
 *
 * The wheel is for pointers: hue round it, saturation out from the centre.
 * It is not the accessible path and does not pretend to be (it is hidden from
 * assistive technology). The accessible path is three real sliders — hue,
 * saturation, brightness — and a hex field, which are also simply the precise
 * way to set a colour for anyone.
 *
 * Continuous input is committed at most once per animation frame; the wheel
 * and sliders stay live from local state in between. With the geometry memo
 * in Product.tsx, a drag re-tints the model without rebuilding it.
 */

import { useEffect, useId, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { FrameMaterial } from '../config/material';
import { deltaE, hexToHsv, hsvToHex, hueName, isHex, nearestOffered, normaliseHex } from '../config/colourMath';
import type { Hsv } from '../config/colourMath';
import type { RalCode } from '../config/ral';
import { ralEntry } from '../config/ral';

function closeness(difference: number): string {
  if (difference < 3) return 'very close';
  if (difference < 8) return 'close';
  return 'noticeably different';
}

export function ExplorePicker({
  start,
  exploring,
  material,
  onChange,
  onUseOffered,
}: {
  /** The colour to start from: whatever the side currently shows. */
  start: string;
  /** True once the side actually holds an explore colour; the way back is only offered then. */
  exploring: boolean;
  material: FrameMaterial;
  onChange: (hex: string) => void;
  onUseOffered: (code: RalCode) => void;
}): JSX.Element {
  const id = useId();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(start));
  const [draft, setDraft] = useState<string | null>(null);
  const hex = hsvToHex(hsv);

  // At most one commit per frame, however fast the pointer moves.
  const pending = useRef<string | null>(null);
  const frame = useRef<number | null>(null);
  const commit = (next: Hsv): void => {
    setHsv(next);
    pending.current = hsvToHex(next);
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current !== null) onChange(pending.current);
      pending.current = null;
    });
  };
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const wheel = useRef<HTMLDivElement>(null);
  const fromPointer = (event: PointerEvent<HTMLDivElement>): void => {
    const box = wheel.current?.getBoundingClientRect();
    if (!box) return;
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const radius = box.width / 2;
    // Hue 0 (red) at the top, increasing clockwise — as the conic gradient draws it.
    const h = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
    const s = Math.min(1, Math.hypot(dx, dy) / radius);
    commit({ h, s, v: hsv.v === 0 ? 1 : hsv.v });
  };

  const angle = (hsv.h * Math.PI) / 180;
  const thumb = {
    left: `${50 + Math.sin(angle) * hsv.s * 50}%`,
    top: `${50 - Math.cos(angle) * hsv.s * 50}%`,
  };
  const nearest = nearestOffered(hex, material);
  const nearestEntry = ralEntry(nearest.code);
  const hexInvalid = draft !== null && draft.trim() !== '' && !isHex(draft);

  return (
    <div className="explore__picker">
      <div className="explore__wheel-wrap" aria-hidden="true">
        <div
          className="explore__wheel"
          ref={wheel}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            fromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
          }}
        >
          <div className="explore__shade" style={{ opacity: 1 - hsv.v }} />
          <span className="explore__thumb" style={{ ...thumb, background: hex }} />
        </div>
        <span className="explore__sample" style={{ background: hex }} />
      </div>

      <div className="explore__sliders">
        <label className="range" htmlFor={`${id}-h`}>
          <span className="range__label">Hue</span>
          <input
            id={`${id}-h`}
            type="range"
            min={0}
            max={359}
            step={1}
            value={Math.round(hsv.h)}
            aria-valuetext={`${Math.round(hsv.h)} degrees, ${hueName(hsv.h)}`}
            className="range__input range__input--hue"
            onChange={(event) => commit({ ...hsv, h: Number(event.target.value) })}
          />
        </label>
        <label className="range" htmlFor={`${id}-s`}>
          <span className="range__label">Saturation</span>
          <input
            id={`${id}-s`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(hsv.s * 100)}
            aria-valuetext={`${Math.round(hsv.s * 100)} percent`}
            className="range__input"
            style={{
              background: `linear-gradient(to right, ${hsvToHex({ ...hsv, s: 0 })}, ${hsvToHex({ ...hsv, s: 1 })})`,
            }}
            onChange={(event) => commit({ ...hsv, s: Number(event.target.value) / 100 })}
          />
        </label>
        <label className="range" htmlFor={`${id}-v`}>
          <span className="range__label">Brightness</span>
          <input
            id={`${id}-v`}
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(hsv.v * 100)}
            aria-valuetext={`${Math.round(hsv.v * 100)} percent`}
            className="range__input"
            style={{
              background: `linear-gradient(to right, #000000, ${hsvToHex({ ...hsv, v: 1 })})`,
            }}
            onChange={(event) => commit({ ...hsv, v: Number(event.target.value) / 100 })}
          />
        </label>

        <div className="field explore__hex">
          <label className="field__label" htmlFor={`${id}-hex`}>
            Hex value
          </label>
          <input
            id={`${id}-hex`}
            className="field__input"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={7}
            value={draft ?? hex.toUpperCase()}
            aria-invalid={hexInvalid}
            aria-describedby={`${id}-hex-hint`}
            onChange={(event) => {
              setDraft(event.target.value);
              if (isHex(event.target.value)) commit(hexToHsv(normaliseHex(event.target.value)));
            }}
            onBlur={() => setDraft(null)}
          />
          <p className="field__hint" id={`${id}-hex-hint`}>
            {hexInvalid ? 'Six hexadecimal digits, for example #3A4F6B.' : 'Six digits, for example #3A4F6B.'}
          </p>
        </div>
      </div>

      {/* Not a live region: it would speak on every step of a slider. */}
      {exploring && (
        <div className="explore__nearest">
          <span className="explore__pair" aria-hidden="true">
            <span style={{ background: hex }} />
            <span style={{ background: nearestEntry.hex }} />
          </span>
          <p>
            Closest colour we offer: <strong>{nearestEntry.name}</strong>, {nearestEntry.code.replace(/^RAL/, 'RAL ')} —{' '}
            {closeness(deltaE(hex, nearestEntry.hex))}.
          </p>
          <button type="button" className="button" onClick={() => onUseOffered(nearest.code)}>
            Use {nearestEntry.name}
          </button>
        </div>
      )}
    </div>
  );
}
