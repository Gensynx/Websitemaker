/**
 * The 3D viewer (Step 2).
 *
 * Default-exported and imported lazily, so the WebGL bundle is never on the
 * critical path for first paint: the page shows an accurate SVG elevation
 * first and this fades in over it once the first real frame is ready.
 *
 * Tone mapping is Khronos PBR Neutral, chosen for this job specifically. It
 * was designed for product and e-commerce rendering: it keeps a base colour's
 * hue and saturation where they are, where ACES — the React Three Fiber
 * default — shifts saturated colours (a RAL red drifts towards orange). In a
 * configurator whose whole purpose includes choosing a colour, fidelity beats
 * drama. On-screen colour stays indicative only, and the page says so.
 */

import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import type { ConfigState } from '../config/types';
import type { CameraPreset } from '../config/view';
import { MM_PER_SCENE_UNIT } from '../config/units';
import { Product } from './Product';
import { Annotations } from './Annotations';
import { Silhouette } from './Silhouette';
import { CameraRig, frustumFor, NO_INSETS, poseFor } from './CameraRig';
import type { Focus, Insets } from './CameraRig';
import { KeyLight, StudioEnvironment } from './Lighting';
import { GlazingBacking, productBase, StudioBackdrop, WallBackdrop, wallFaceZ } from './Backdrop';
import type { SceneMode, WallFinish } from './Backdrop';
import { buildProduct } from './geometry';

export type { SceneMode, WallFinish } from './Backdrop';

export interface ViewerProps {
  config: ConfigState;
  camera: CameraPreset;
  presetToken: number;
  showSilhouette: boolean;
  scene: SceneMode;
  wallFinish: WallFinish;
  insets: Insets;
  /** Called once the first frame with the environment in place has drawn. */
  onReady?: () => void;
}

/** Where the hardware close-up looks: the lever outside a door, the handle inside a window. */
function hardwareFocus(config: ConfigState, base: number): Focus | undefined {
  const parts = buildProduct(config).parts;
  const preferred =
    config.productType === 'door'
      ? parts.find((p) => p.id === 'handle-lever' || p.id === 'handle-knob' || p.id === 'handle')
      : parts.find((p) => /^handle-\d+-(lever|knob|plate)$/.test(p.id));
  if (preferred === undefined) return undefined;
  const [x, y, z] = preferred.position;
  return {
    point: [x / MM_PER_SCENE_UNIT, (y + base) / MM_PER_SCENE_UNIT, z / MM_PER_SCENE_UNIT],
    side: preferred.facing === 'internal' ? -1 : 1,
  };
}

/** Fires once, a couple of frames in, so the environment map has rendered. */
function ReadySignal({ onReady }: { onReady?: () => void }): null {
  const frames = useRef(0);
  const fired = useRef(false);
  useFrame(() => {
    frames.current += 1;
    if (!fired.current && frames.current > 2) {
      fired.current = true;
      onReady?.();
    }
  });
  return null;
}

function Scene({
  config,
  camera,
  presetToken,
  showSilhouette,
  scene,
  wallFinish,
  insets,
  onReady,
  quality,
}: ViewerProps & { quality: 'high' | 'low' }): JSX.Element {
  const width = useThree((state) => state.size.width);
  const base = productBase(config, scene);
  const bounds = { width: config.dimensions.width, height: config.dimensions.height, base };
  const focus = useMemo(() => hardwareFocus(config, base), [config, base]);

  const widthM = config.dimensions.width / MM_PER_SCENE_UNIT;
  const heightM = config.dimensions.height / MM_PER_SCENE_UNIT;
  const baseM = base / MM_PER_SCENE_UNIT;
  const extent = Math.max(2.2, Math.max(widthM, heightM + baseM) * 1.25) + (scene === 'wall' ? 1.2 : 0);
  // Phones get a smaller shadow map; the 30 fps floor on mid-range mobile
  // depends on it more than on anything else here.
  const shadowMapSize = quality === 'low' || width < 700 ? 1024 : 2048;
  const silhouetteZ = scene === 'wall' ? wallFaceZ(config) / MM_PER_SCENE_UNIT + 0.45 : 0.02;

  return (
    <>
      <color attach="background" args={['#f4f3f0']} />
      <StudioEnvironment />
      <KeyLight target={[0, baseM + heightM / 2, 0]} extent={extent} shadowMapSize={shadowMapSize} />

      <Suspense fallback={null}>
        <group position={[0, baseM, 0]}>
          <Product config={config} />
          <Annotations dimensions={config.dimensions} />
          {scene === 'studio' && <GlazingBacking config={config} />}
        </group>
        {scene === 'wall' && <WallBackdrop config={config} base={base} finish={wallFinish} />}
        {showSilhouette && <Silhouette offsetX={-widthM / 2 - 0.6} z={silhouetteZ} />}
      </Suspense>

      {scene === 'studio' && <StudioBackdrop spread={Math.max(5, widthM * 5)} />}

      <CameraRig preset={camera} bounds={bounds} presetToken={presetToken} insets={insets} {...(focus ? { focus } : {})} />
      <ReadySignal {...(onReady ? { onReady } : {})} />
    </>
  );
}

export default function Viewer(props: ViewerProps): JSX.Element {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const [quality, setQuality] = useState<'high' | 'low'>('high');

  // First-frame camera, before the rig refines it against the real canvas.
  const initial = poseFor(
    props.camera,
    { width: props.config.dimensions.width, height: props.config.dimensions.height, base: productBase(props.config, props.scene) },
    frustumFor(32, 16, 9, NO_INSETS),
  );

  return (
    <Canvas
      shadows="soft"
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: initial.position.toArray(), fov: 32, near: 0.05, far: 80 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.18;
      }}
    >
      {/* Drops resolution, then shadow quality, if the frame rate cannot hold. */}
      <PerformanceMonitor
        onDecline={() => {
          setDpr([1, 1.25]);
          setQuality('low');
        }}
      >
        <Scene {...props} quality={quality} />
      </PerformanceMonitor>
    </Canvas>
  );
}
