/**
 * 1.7 m human silhouette for scale (Step 2.5).
 *
 * Generated from a THREE.Shape rather than loaded: an outline traced with arcs
 * and lines, extruded a few millimetres. No asset, and it scales exactly to
 * 1700 mm by construction rather than by eyeballing an import.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

/** Nominal height of the figure. */
export const SILHOUETTE_HEIGHT_MM = 1700;

function buildOutline(): THREE.Shape {
  // Drawn in units of the figure's height, then scaled, so the proportions
  // hold whatever height is asked for.
  const shape = new THREE.Shape();
  const headR = 0.043;

  shape.moveTo(-0.055, 0);
  shape.lineTo(-0.055, 0.44);
  shape.lineTo(-0.075, 0.45);
  shape.lineTo(-0.082, 0.74);
  shape.lineTo(-0.062, 0.755);
  shape.lineTo(-0.057, 0.86);
  shape.lineTo(-0.021, 0.875);
  shape.absarc(0, 0.875 + headR * 0.85, headR, Math.PI, 0, true);
  shape.lineTo(0.021, 0.875);
  shape.lineTo(0.057, 0.86);
  shape.lineTo(0.062, 0.755);
  shape.lineTo(0.082, 0.74);
  shape.lineTo(0.075, 0.45);
  shape.lineTo(0.055, 0.44);
  shape.lineTo(0.055, 0);
  shape.lineTo(0.012, 0);
  shape.lineTo(0.012, 0.42);
  shape.lineTo(-0.012, 0.42);
  shape.lineTo(-0.012, 0);
  shape.closePath();
  return shape;
}

export function Silhouette({ offsetX }: { offsetX: number }): JSX.Element {
  const geometry = useMemo(() => {
    const height = SILHOUETTE_HEIGHT_MM / 1000;
    const geo = new THREE.ExtrudeGeometry(buildOutline(), { depth: 0.004, bevelEnabled: false });
    geo.scale(height, height, 1);
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[offsetX, 0, 0.02]} renderOrder={2}>
      <meshBasicMaterial color="#9aa0a6" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  );
}
