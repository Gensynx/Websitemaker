/**
 * Static fallback where WebGL is unavailable (performance budget).
 *
 * Drawn as an SVG elevation from the same parametric part list the 3D scene
 * uses, so it is dimensionally accurate and needs no image asset. A customer
 * without WebGL still sees their actual configuration at their actual size,
 * rather than a stock photograph of a different door.
 */

import { useMemo } from 'react';
import type { ConfigState } from '../config/types';
import { formatMm } from '../config/units';
import { buildProduct } from './geometry';
import { colourToHex } from '../config/colourHex';
import { resolveInternalColour } from '../config/types';
import { fillFor, OUTLINE_WIDTH_PX, outlineFor, SHAPE_RENDERING } from './elevationStyle';

export function StaticElevation({ config, caption = true }: { config: ConfigState; caption?: boolean }): JSX.Element {
  const model = useMemo(() => buildProduct(config), [config]);
  const frameFill = colourToHex(config.colour.external);
  void resolveInternalColour; // internal face is not visible in elevation

  const { width, height } = model.bounds;
  const margin = Math.max(width, height) * 0.12;

  // Parts nearer the viewer draw last, which is the painter's algorithm doing
  // the job a depth buffer does in the 3D scene.
  const ordered = [...model.parts].sort((a, b) => a.position[2] - b.position[2]);

  return (
    <figure className="static-elevation">
      <svg
        viewBox={`${-width / 2 - margin} ${-margin} ${width + margin * 2} ${height + margin * 2}`}
        role="img"
        shapeRendering={SHAPE_RENDERING}
        aria-label={`Elevation of the configured ${config.productType}, ${formatMm(width)} wide by ${formatMm(height)} high.`}
      >
        {/* Y is up in the model and down in SVG. */}
        <g transform={`translate(0 ${height}) scale(1 -1)`}>
          {ordered.map((part) => {
            const fill = fillFor(part.kind, frameFill);
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
      {caption && (
      <figcaption>
        3D preview is unavailable in this browser. This elevation is drawn to the configured
        dimensions: {formatMm(width)} × {formatMm(height)} (W × H).
      </figcaption>
      )}
    </figure>
  );
}
