/**
 * The bottom sheet's handle: tap to open or close, or drag it (Step 4.3).
 *
 * Behaviour from the snap-point drawer on 21st.dev, reduced to what a
 * NON-modal sheet needs: three resting states — closed (a peek that shows
 * what is configured), half (the product stays in view above it) and full
 * (room for a swatch grid) — and a drag on the handle that moves one state
 * in the direction of the gesture. Non-modal because the preview must stay
 * usable with the sheet up: no backdrop, no focus trap, no scroll lock.
 *
 * The handle stays a real <button>. Keyboard and screen-reader users get
 * Enter and Space from the element itself (closed and half; the panel
 * scrolls, so full height is a pointer convenience, not a requirement), and
 * Escape from the panel. The pointer code only adds the drag, and swallows
 * the click that follows a drag so a drag is never also read as a tap.
 */

import { useRef } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

export type SheetState = 'closed' | 'half' | 'full';

/** Travel, in CSS pixels, before a press counts as a drag. */
const DRAG_THRESHOLD = 24;

export function nextSheetState(state: SheetState, direction: 'up' | 'down'): SheetState {
  if (direction === 'up') return state === 'closed' ? 'half' : 'full';
  return state === 'full' ? 'half' : 'closed';
}

export function useSheetGesture(
  state: SheetState,
  setState: (state: SheetState) => void,
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
      setState(nextSheetState(state, travel < 0 ? 'up' : 'down'));
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
      setState(state === 'closed' ? 'half' : 'closed');
    },
  };
}
