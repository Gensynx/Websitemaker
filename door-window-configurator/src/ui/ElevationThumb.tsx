/**
 * A thumbnail of a configuration, for option tiles: "this is what the door
 * becomes if you choose this".
 *
 * Drawn from buildProduct — the same part list as the 3D scene and the SVG
 * fallback — so a thumbnail cannot show a style differently from how it will
 * be built, and adding a style needs no new artwork (the core constraint).
 * Decorative: the tile's text carries the meaning.
 */

import { useMemo } from 'react';
import type { ConfigState } from '../config/types';
import { buildProduct } from '../viewer/geometry';
import { shapeKey } from '../viewer/keys';
import { colourToHex } from '../config/colourHex';
import { fillFor, OUTLINE_WIDTH_PX, outlineFor, SHAPE_RENDERING } from '../viewer/elevationStyle';

export function ElevationThumb({ config }: { config: ConfigState }): JSX.Element {
  // Keyed on shape, as the 3D product is: a colour change (every frame of a
  // wheel drag) re-fills the thumbnails without rebuilding their part lists.
  const shape = shapeKey(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const model = useMemo(() => buildProduct(config), [shape]);
  const frame = colourToHex(config.colour.external);
  const { width, height } = model.bounds;
  const pad = Math.max(width, height) * 0.04;
  // Outside only, back to front: the painter's algorithm standing in for depth.
  // Degenerate parts are skipped: a thumbnail must never throw SVG errors,
  // whatever configuration it is handed.
  const parts = model.parts
    .filter((part) => part.facing !== 'internal' && !part.id.includes('inside'))
    .filter((part) => part.size[0] > 0 && part.size[1] > 0)
    .sort((a, b) => a.position[2] - b.position[2]);

  return (
    <svg
      className="thumb"
      viewBox={`${-width / 2 - pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering={SHAPE_RENDERING}
    >
      <g transform={`translate(0 ${height}) scale(1 -1)`}>
        {parts.map((part) => {
          const fill = fillFor(part.kind, frame);
          return (
            <rect
              key={part.id}
              x={part.position[0] - part.size[0] / 2}
              y={part.position[1] - part.size[1] / 2}
              width={part.size[0]}
              height={part.size[1]}
              fill={fill}
              stroke={outlineFor(fill)}
              strokeWidth={OUTLINE_WIDTH_PX}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </g>
    </svg>
  );
}
