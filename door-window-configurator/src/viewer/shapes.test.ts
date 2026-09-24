import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { geometryForPart, mouldingRings, raisedGeometry } from './shapes';
import type { Part } from './geometry';

function facetNormals(geometry: THREE.BufferGeometry): THREE.Vector3[] {
  const position = geometry.getAttribute('position');
  const normals: THREE.Vector3[] = [];
  for (let i = 0; i < position.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(position, i);
    const b = new THREE.Vector3().fromBufferAttribute(position, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(position, i + 2);
    normals.push(new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize());
  }
  return normals;
}

describe('raised panel geometry', () => {
  for (const profile of ['square', 'chamfer', 'ovolo'] as const) {
    it(`${profile}: every facet faces outwards or forwards, never into the leaf`, () => {
      const geometry = raisedGeometry(600, 800, 18, profile);
      const position = geometry.getAttribute('position');
      const normals = facetNormals(geometry);
      normals.forEach((normal, facet) => {
        const centroid = new THREE.Vector3();
        for (let k = 0; k < 3; k += 1) centroid.add(new THREE.Vector3().fromBufferAttribute(position, facet * 3 + k));
        centroid.divideScalar(3);
        // The back cap faces -Z by design; every other facet must face away
        // from the panel's centre in the plane, or straight out.
        const isBack = normal.z < -0.99;
        if (isBack) return;
        const outward = normal.x * centroid.x + normal.y * centroid.y;
        expect(normal.z, `${profile} facet ${facet} faces backwards`).toBeGreaterThanOrEqual(-1e-6);
        expect(outward, `${profile} facet ${facet} faces inwards`).toBeGreaterThanOrEqual(-1e-6);
      });
    });

    it(`${profile}: stays inside its bounding box`, () => {
      const geometry = raisedGeometry(600, 800, 18, profile);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox as THREE.Box3;
      expect(box.min.x).toBeCloseTo(-300, 6);
      expect(box.max.x).toBeCloseTo(300, 6);
      expect(box.min.z).toBeCloseTo(-9, 6);
      expect(box.max.z).toBeCloseTo(9, 6);
    });
  }

  it('gives the bevelled profiles faces at more than one angle — the reason this exists', () => {
    // A flat box has one front-facing normal. Relief on a dark finish needs
    // faces that reflect DIFFERENT parts of the environment.
    const angles = (profile: 'chamfer' | 'ovolo') =>
      new Set(
        facetNormals(raisedGeometry(600, 800, 18, profile))
          .filter((n) => n.z > 0.01 && n.z < 0.999)
          .map((n) => n.z.toFixed(3)),
      ).size;
    expect(angles('chamfer')).toBeGreaterThanOrEqual(1);
    expect(angles('ovolo')).toBeGreaterThanOrEqual(5);
  });

  it('builds the ovolo as a convex curve from the upstand to the field', () => {
    const rings = mouldingRings('ovolo', 600, 800, 18);
    for (let i = 2; i < rings.length; i += 1) {
      expect((rings[i] as { inset: number }).inset).toBeGreaterThanOrEqual((rings[i - 1] as { inset: number }).inset);
      expect((rings[i] as { z: number }).z).toBeGreaterThan((rings[i - 1] as { z: number }).z);
    }
    expect(rings[rings.length - 1]?.z).toBeCloseTo(9, 6);
  });

  it('turns an inside panel to face the other way without inverting it', () => {
    const part: Part = {
      id: 'p',
      kind: 'panel',
      position: [0, 0, 0],
      size: [600, 800, 18],
      shape: { kind: 'raised', profile: 'chamfer' },
      facing: 'internal',
    };
    const normals = facetNormals(geometryForPart(part));
    // The front field now faces -Z; nothing faces +Z except the back cap.
    expect(normals.some((n) => n.z < -0.99)).toBe(true);
    expect(normals.filter((n) => n.z > 0.99)).toHaveLength(2); // the back cap's two triangles
  });
});

describe('every shape fits its bounding box', () => {
  const shapes: Part['shape'][] = [
    { kind: 'box' },
    { kind: 'cylinder', axis: 'x' },
    { kind: 'cylinder', axis: 'y' },
    { kind: 'cylinder', axis: 'z' },
    { kind: 'sphere' },
    { kind: 'torus' },
  ];
  for (const shape of shapes) {
    it(JSON.stringify(shape), () => {
      const size: [number, number, number] =
        shape?.kind === 'cylinder' && shape.axis === 'x' ? [120, 18, 18]
        : shape?.kind === 'cylinder' && shape.axis === 'y' ? [30, 400, 30]
        : shape?.kind === 'torus' ? [110, 110, 16]
        : [52, 52, 10];
      const geometry = geometryForPart({ id: 's', kind: 'hardware', position: [0, 0, 0], size, ...(shape ? { shape } : {}) });
      geometry.computeBoundingBox();
      const box = geometry.boundingBox as THREE.Box3;
      const extent = new THREE.Vector3();
      box.getSize(extent);
      expect(extent.x).toBeLessThanOrEqual(size[0] + 1e-3);
      expect(extent.y).toBeLessThanOrEqual(size[1] + 1e-3);
      expect(extent.z).toBeLessThanOrEqual(size[2] + 1e-3);
    });
  }
});
