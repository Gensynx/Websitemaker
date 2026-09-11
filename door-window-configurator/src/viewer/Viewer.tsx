/**
 * The 3D viewer (Step 2).
 *
 * Default-exported and imported lazily, so the WebGL bundle is not on the
 * critical path for first paint.
 *
 * Lighting is a neutral studio: a soft key, a cool fill, and a broad ambient,
 * with a contact shadow on the ground. No coloured lights and no environment
 * map — the product's own colour is what is being judged, and the whole point
 * of the configurator is that the customer trusts what they see, within the
 * indicative-only caveat.
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import type { ConfigState } from '../config/types';
import type { CameraPreset } from '../config/view';
import { MM_PER_SCENE_UNIT } from '../config/units';
import { Product } from './Product';
import { Annotations } from './Annotations';
import { Silhouette } from './Silhouette';
import { CameraRig, poseFor } from './CameraRig';

export interface ViewerProps {
  config: ConfigState;
  camera: CameraPreset;
  presetToken: number;
  showSilhouette: boolean;
}

export default function Viewer({ config, camera, presetToken, showSilhouette }: ViewerProps): JSX.Element {
  const bounds = { width: config.dimensions.width, height: config.dimensions.height };
  // Approximate: the rig reframes against the real aspect on the first frame.
  const initial = poseFor(camera, bounds);
  const halfWidth = config.dimensions.width / MM_PER_SCENE_UNIT / 2;
  // The shadow frustum tracks the product, so a 3 m door set is not clipped
  // and a 600 mm window does not waste its shadow map on empty floor.
  const shadowExtent = Math.max(2, config.dimensions.height / MM_PER_SCENE_UNIT * 1.4);

  return (
    <Canvas
      shadows
      // Clamped so a high-density phone does not render four times the pixels
      // it needs; the 30 fps floor on mid-range mobile depends on it.
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: initial.position.toArray(), fov: 35, near: 0.05, far: 60 }}
    >
      <color attach="background" args={['#f5f5f3']} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[2.6, 4.2, 3.4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent * 0.3}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-3.2, 2.4, -2.2]} intensity={0.35} />

      <Suspense fallback={null}>
        <Product config={config} />
        <Annotations dimensions={config.dimensions} />
        {showSilhouette && <Silhouette offsetX={-halfWidth - 0.55} />}
      </Suspense>

      <ContactShadows
        position={[0, 0.001, 0]}
        scale={Math.max(4, halfWidth * 6)}
        opacity={0.42}
        blur={2.4}
        far={2.5}
        resolution={512}
      />

      <CameraRig preset={camera} bounds={bounds} presetToken={presetToken} />
    </Canvas>
  );
}
