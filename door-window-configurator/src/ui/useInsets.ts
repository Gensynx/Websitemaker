/**
 * How much of the canvas the interface covers, on each side.
 *
 * Measured from the real elements rather than hard-coded, because it changes
 * with the viewport, the phone's orientation, the sheet being opened, and the
 * length of a validation message. The camera frames the product inside what
 * is left.
 */

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { Insets } from '../viewer/CameraRig';

const GAP = 12;

export function useInsets(
  refs: {
    stage: RefObject<HTMLElement>;
    title: RefObject<HTMLElement>;
    viewbar: RefObject<HTMLElement>;
    panel: RefObject<HTMLElement>;
    /** The "not drawn" notice, placed under the view bar on a phone. */
    notice?: RefObject<HTMLElement>;
  },
  revision: unknown,
): Insets {
  const [insets, setInsets] = useState<Insets>({ top: 0, right: 0, bottom: 0, left: 0 });

  useEffect(() => {
    const measure = (): void => {
      const stage = refs.stage.current?.getBoundingClientRect();
      if (!stage) return;
      const title = refs.title.current?.getBoundingClientRect();
      const viewbar = refs.viewbar.current?.getBoundingClientRect();
      const panel = refs.panel.current?.getBoundingClientRect();
      const notice = refs.notice?.current?.getBoundingClientRect();

      const panelOnRight = panel !== undefined && panel.left > stage.left + stage.width / 2;
      const panelBelow = panel !== undefined && !panelOnRight && panel.top > stage.top + stage.height / 3;

      // The view bar sits along the bottom on a desktop and under the title on
      // a phone, so it counts against whichever edge it is actually near.
      const viewbarOnTop = viewbar !== undefined && viewbar.top < stage.top + stage.height / 2;
      const next: Insets = {
        top: Math.max(
          title ? title.bottom - stage.top + GAP : 0,
          viewbarOnTop && viewbar ? viewbar.bottom - stage.top + GAP : 0,
          notice && notice.height > 0 ? notice.bottom - stage.top + GAP : 0,
        ),
        right: panelOnRight && panel ? Math.max(0, stage.right - panel.left + GAP) : 0,
        bottom: Math.max(
          !viewbarOnTop && viewbar ? stage.bottom - viewbar.top + GAP : 0,
          panelBelow && panel ? stage.bottom - panel.top + GAP : 0,
        ),
        left: 0,
      };
      setInsets((previous) =>
        previous.top === next.top &&
        previous.right === next.right &&
        previous.bottom === next.bottom &&
        previous.left === next.left
          ? previous
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const ref of Object.values(refs)) if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);

  return insets;
}
