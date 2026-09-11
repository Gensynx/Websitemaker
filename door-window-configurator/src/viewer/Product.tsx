/**
 * The configured product, drawn from the parametric part list.
 *
 * Scene units are metres; the part list is millimetres. `toSceneUnits` is the
 * single conversion, applied once at the group level so nothing downstream has
 * to remember which system it is in.
 */

import { useEffect, useMemo } from 'react';
import type { ConfigState } from '../config/types';
import { MM_PER_SCENE_UNIT } from '../config/units';
import { buildProduct } from './geometry';
import { buildMaterials, materialForPart } from './materials';

export function Product({ config }: { config: ConfigState }): JSX.Element {
  const model = useMemo(() => buildProduct(config), [config]);
  const materials = useMemo(() => buildMaterials(config), [config]);

  // Materials hold GPU resources; a configurator changes them constantly.
  useEffect(() => () => materials.dispose(), [materials]);

  const scale = 1 / MM_PER_SCENE_UNIT;

  return (
    <group scale={[scale, scale, scale]}>
      {model.parts.map((part) => (
        <mesh
          key={part.id}
          position={part.position}
          castShadow={part.kind !== 'glazing'}
          receiveShadow
          material={materialForPart(part.kind, materials)}
        >
          <boxGeometry args={part.size} />
        </mesh>
      ))}
    </group>
  );
}
