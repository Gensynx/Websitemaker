/**
 * Geometry for each part shape, in millimetres, centred on the origin.
 *
 * Every shape fills — and never exceeds — the part's bounding box, so the
 * containment tests written against bounding boxes stay true for what is
 * actually drawn.
 */

import * as THREE from 'three';
import type { MouldingProfile } from '../config/types';
import type { Part } from './geometry';

/** One step of a moulding: how far in from the outer edge, at what depth. */
interface Ring {
  inset: number;
  z: number;
}

/**
 * The profile from the back outline to the front field, as rings.
 *
 * - square: a straight upstand with a 2 mm eased arris — real square
 *   mouldings are never knife-edged, and that hairline is what catches light.
 * - chamfer: a short upstand, then a single flat bevel to the field.
 * - ovolo: a short upstand, then a convex quarter-ellipse in six facets, so
 *   the highlight grades across it as it does on a real moulding.
 */
export function mouldingRings(
  profile: MouldingProfile,
  width: number,
  height: number,
  depth: number,
  bevelOverride?: number,
): Ring[] {
  const back = -depth / 2;
  const front = depth / 2;
  // Never wider than a third of the short side, or the field inverts.
  const limit = Math.min(width, height) / 3;
  const bevel = Math.min(limit, bevelOverride ?? Math.max(6, Math.min(40, Math.min(width, height) * 0.12)));

  switch (profile) {
    case 'square': {
      const arris = Math.min(2, depth / 4);
      return [
        { inset: 0, z: back },
        { inset: 0, z: front - arris },
        { inset: arris, z: front },
      ];
    }
    case 'chamfer': {
      const upstand = back + depth * 0.3;
      return [
        { inset: 0, z: back },
        { inset: 0, z: upstand },
        { inset: bevel, z: front },
      ];
    }
    case 'ovolo': {
      const upstand = back + depth * 0.2;
      const rings: Ring[] = [
        { inset: 0, z: back },
        { inset: 0, z: upstand },
      ];
      const segments = 6;
      for (let step = 1; step <= segments; step += 1) {
        const angle = (step / segments) * (Math.PI / 2);
        rings.push({
          inset: bevel * (1 - Math.cos(angle)),
          z: upstand + (front - upstand) * Math.sin(angle),
        });
      }
      return rings;
    }
  }
}

/**
 * A stepped frustum: the side of each ring joined to the next by four mitred
 * faces, capped front and back. Non-indexed, so every facet gets its own flat
 * normal — which is the point: each facet reflects a different part of the
 * environment.
 */
export function raisedGeometry(
  width: number,
  height: number,
  depth: number,
  profile: MouldingProfile,
  bevel?: number,
): THREE.BufferGeometry {
  const rings = mouldingRings(profile, width, height, depth, bevel);
  const positions: number[] = [];

  const corners = (ring: Ring): Array<[number, number, number]> => {
    const x = width / 2 - ring.inset;
    const y = height / 2 - ring.inset;
    // Anticlockwise seen from the front: bottom-left, bottom-right, top-right, top-left.
    return [
      [-x, -y, ring.z],
      [x, -y, ring.z],
      [x, y, ring.z],
      [-x, y, ring.z],
    ];
  };

  const quad = (a: number[], b: number[], c: number[], d: number[]): void => {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
  };

  for (let index = 0; index < rings.length - 1; index += 1) {
    const inner = corners(rings[index + 1] as Ring);
    const outer = corners(rings[index] as Ring);
    // Each side: outer edge (further back) to inner edge (further forward),
    // wound so the normal faces outwards and forwards.
    for (let side = 0; side < 4; side += 1) {
      const next = (side + 1) % 4;
      quad(outer[side] as number[], outer[next] as number[], inner[next] as number[], inner[side] as number[]);
    }
  }

  const front = corners(rings[rings.length - 1] as Ring);
  quad(front[0] as number[], front[1] as number[], front[2] as number[], front[3] as number[]);
  const back = corners(rings[0] as Ring);
  quad(back[0] as number[], back[3] as number[], back[2] as number[], back[1] as number[]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** The geometry to draw for a part, in its own millimetre space. */
export function geometryForPart(part: Part): THREE.BufferGeometry {
  const [w, h, d] = part.size;
  const shape = part.shape ?? { kind: 'box' };

  switch (shape.kind) {
    case 'box':
      return new THREE.BoxGeometry(w, h, d);

    case 'raised': {
      const geometry = raisedGeometry(w, h, d, shape.profile, shape.bevel);
      // The inside face is the same panel turned to face the other way. A
      // half-turn about Y rather than a mirror in Z, because a mirror inverts
      // the winding and would light the panel from the wrong side.
      if (part.facing === 'internal') geometry.rotateY(Math.PI);
      return geometry;
    }

    case 'cylinder': {
      const segments = 32;
      if (shape.axis === 'z') {
        const radius = Math.min(w, h) / 2;
        return new THREE.CylinderGeometry(radius, radius, d, segments).rotateX(Math.PI / 2);
      }
      if (shape.axis === 'x') {
        const radius = Math.min(h, d) / 2;
        return new THREE.CylinderGeometry(radius, radius, w, segments).rotateZ(Math.PI / 2);
      }
      const radius = Math.min(w, d) / 2;
      return new THREE.CylinderGeometry(radius, radius, h, segments);
    }

    case 'sphere':
      return new THREE.SphereGeometry(0.5, 32, 20).scale(w, h, d);

    case 'torus': {
      const tube = d / 2;
      const radius = Math.min(w, h) / 2 - tube;
      return new THREE.TorusGeometry(Math.max(tube, radius), tube, 16, 48);
    }
  }
}
