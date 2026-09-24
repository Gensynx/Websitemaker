/**
 * The bottom sheet's handle: tap to open or close, or drag it (Step 4.3).
 *
 * Behaviour from the snap-point drawer on 21st.dev, reduced to what a
 * NON-modal sheet needs: two resting states — the peek, which shows what is
 * configured, and open — and a drag on the handle that settles into
 * whichever the gesture points at. Non-modal because the preview must stay
 * usable with the sheet up: no backdrop, no focus trap, no scroll lock.
 *
 * The handle stays a real <button>. Keyboard and screen-reader users get
 * Enter and Space from the element itself, and Escape from the panel; the
 * pointer code below only adds the drag, and swallows the click that follows
 * a drag so a drag is never also read as a tap.
 */

import { useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

/** Travel, in CSS pixels, before a press counts as a drag. */
const DRAG_THRESHOLD = 24;

export function useSheetGesture(
  open: boolean,
  setOpen: (open: boolean) => void,
): {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: () => void;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
} {
  const start = useRef<number | null>(null);
  const dragged = useRef(false);

  return {
    onPointerDown: (event) => {
      start.current = event.clientY;
      dragged.current = false;
      // Keep receiving the pointer after it leaves the handle — which a drag
      // always does — or the release lands elsewhere and is never seen.
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp: (event) => {
      if (start.current === null) return;
      const travel = event.clientY - start.current;
      start.current = null;
      if (Math.abs(travel) < DRAG_THRESHOLD) return;
      dragged.current = true;
      // Up opens, down closes, whatever state it started in.
      setOpen(travel < 0);
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClick: (event) => {
      if (dragged.current) {
        dragged.current = false;
        event.preventDefault();
        return;
      }
      setOpen(!open);
    },
  };
}
