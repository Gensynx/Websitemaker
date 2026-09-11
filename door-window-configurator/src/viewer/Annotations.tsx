/**
 * Live dimension annotations (Step 2.4).
 *
 * Labels are real DOM text positioned in 3D, not glyphs baked into geometry:
 * no font asset is needed, and the numbers are readable by a screen reader.
 * The canvas is not the only way to read the size — Step 4.4 requires the
 * configurator to be fully operable without touching it — so these labels are
 * marked aria-hidden and the accessible copy lives in the panel.
 *
 * aria-hidden goes on the DOM child, never on <Html> itself: React Three Fiber
 * reads a dashed prop as a property path, so `aria-hidden` on the R3F element
 * resolves as `instance.aria.hidden` and throws before the canvas ever mounts.
 */

import { Html, Line } from '@react-three/drei';
import type { Dimensions } from '../config/types';
import { formatMm, MM_PER_SCENE_UNIT } from '../config/units';

const TICK = 0.04;

export function Annotations({ dimensions }: { dimensions: Dimensions }): JSX.Element {
  const width = dimensions.width / MM_PER_SCENE_UNIT;
  const height = dimensions.height / MM_PER_SCENE_UNIT;
  const halfWidth = width / 2;
  const gap = Math.max(0.18, Math.max(width, height) * 0.1);

  const widthLineY = -gap;
  const heightLineX = halfWidth + gap;

  return (
    <group>
      {/* Width, below the product */}
      <Line points={[[-halfWidth, widthLineY, 0], [halfWidth, widthLineY, 0]]} color="#9aa0a6" lineWidth={1} />
      <Line points={[[-halfWidth, widthLineY - TICK, 0], [-halfWidth, widthLineY + TICK, 0]]} color="#9aa0a6" lineWidth={1} />
      <Line points={[[halfWidth, widthLineY - TICK, 0], [halfWidth, widthLineY + TICK, 0]]} color="#9aa0a6" lineWidth={1} />
      <Html position={[0, widthLineY - gap * 0.45, 0]} center distanceFactor={3.2}>
        <span className="annotation" aria-hidden="true">
          {formatMm(dimensions.width)}
        </span>
      </Html>

      {/* Height, to the right */}
      <Line points={[[heightLineX, 0, 0], [heightLineX, height, 0]]} color="#9aa0a6" lineWidth={1} />
      <Line points={[[heightLineX - TICK, 0, 0], [heightLineX + TICK, 0, 0]]} color="#9aa0a6" lineWidth={1} />
      <Line points={[[heightLineX - TICK, height, 0], [heightLineX + TICK, height, 0]]} color="#9aa0a6" lineWidth={1} />
      <Html position={[heightLineX + gap * 0.5, height / 2, 0]} center distanceFactor={3.2}>
        <span className="annotation" aria-hidden="true">
          {formatMm(dimensions.height)}
        </span>
      </Html>
    </group>
  );
}
