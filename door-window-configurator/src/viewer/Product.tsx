/**
 * The configured product, drawn from the parametric part list.
 *
 * Scene units are metres; the part list is millimetres. The single conversion
 * happens once, as a scale on the group, so nothing downstream has to know
 * which system it is in.
 *
 * Geometry and materials are built once per configuration and disposed when
 * it changes. A configurator rebuilds constantly, and leaking GPU buffers on
 * every keystroke is how a session gets slower the longer someone uses it.
 */

import { useEffect, useMemo } from 'react';
import type { ConfigState } from '../config/types';
import { MM_PER_SCENE_UNIT } from '../config/units';
import { buildProduct } from './geometry';
import { buildMaterials, materialForPart } from './materials';
import { geometryForPart } from './shapes';
import { appearanceKey, shapeKey } from './keys';

export function Product({ config }: { config: ConfigState }): JSX.Element {
  const shape = shapeKey(config);
  const appearance = appearanceKey(config);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const model = useMemo(() => buildProduct(config), [shape]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const materials = useMemo(() => buildMaterials(config), [appearance]);
  const meshes = useMemo(
    () => model.parts.map((part) => ({ part, geometry: geometryForPart(part) })),
    [model],
  );

  useEffect(() => () => materials.dispose(), [materials]);
  useEffect(() => () => meshes.forEach(({ geometry }) => geometry.dispose()), [meshes]);

  const scale = 1 / MM_PER_SCENE_UNIT;

  return (
    <group scale={[scale, scale, scale]}>
      {meshes.map(({ part, geometry }) => (
        <mesh
          key={part.id}
          geometry={geometry}
          position={part.position}
          // Glass casts no shadow: a pane would otherwise throw a solid dark
          // block onto the floor, which reads as a wall, not a window.
          castShadow={part.kind !== 'glazing'}
          receiveShadow={part.kind !== 'glazing'}
          material={materialForPart(part, materials)}
        />
      ))}
    </group>
  );
}
