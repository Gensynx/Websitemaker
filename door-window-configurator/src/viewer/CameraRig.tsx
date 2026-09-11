/**
 * Camera presets and clamped orbit (Steps 2.2 and 2.3).
 *
 * Preset positions are computed from the product's own bounds, so framing
 * holds for a 600 mm window and a 1.8 m door set alike rather than being tuned
 * to one size. Movement is damped and eased over ~280 ms — within the 200-300
 * ms band, and never bouncy.
 */

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { CameraPreset } from '../config/view';
import { MM_PER_SCENE_UNIT } from '../config/units';

export interface Bounds {
  width: number;
  height: number;
}

/** Never let the camera go under the floor. */
const MAX_POLAR_ANGLE = Math.PI / 2 - 0.035;
const MIN_POLAR_ANGLE = 0.12;

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/**
 * Frames the product from its own bounds and the canvas aspect.
 *
 * Distance is solved for BOTH axes and the larger taken, so a wide low window
 * and a tall narrow door are each fully in shot. The margin is deliberate
 * generosity: the product needs room to breathe, and the dimension
 * annotations sit outside its bounding box.
 */
export function poseFor(
  preset: CameraPreset,
  bounds: Bounds,
  aspect = 1.6,
  fovDegrees = 35,
): CameraPose {
  const width = bounds.width / MM_PER_SCENE_UNIT;
  const height = bounds.height / MM_PER_SCENE_UNIT;
  const centre = new THREE.Vector3(0, height / 2, 0);

  const halfFov = (fovDegrees * Math.PI) / 180 / 2;
  const margin = Math.max(width, height) * 0.3;
  const forHeight = (height / 2 + margin) / Math.tan(halfFov);
  const forWidth = (width / 2 + margin) / (Math.tan(halfFov) * aspect);
  const fit = Math.max(forHeight, forWidth);

  switch (preset) {
    case 'elevation':
      return { position: new THREE.Vector3(0, height / 2, fit), target: centre };
    case 'three-quarter': {
      // Turned 34°, so the product presents a wider silhouette and needs a
      // little more room than the straight-on fit.
      const azimuth = (34 * Math.PI) / 180;
      const distance = fit * 1.12;
      return {
        position: new THREE.Vector3(
          Math.sin(azimuth) * distance,
          height * 0.58,
          Math.cos(azimuth) * distance,
        ),
        target: centre,
      };
    }
    case 'hardware': {
      // Framed on the handle: 1050 mm up, on the leading edge.
      const handle = new THREE.Vector3(width * 0.3, 1050 / MM_PER_SCENE_UNIT, 0);
      const distance = Math.max(0.5, Math.min(0.85, fit * 0.22));
      return {
        position: new THREE.Vector3(handle.x + distance * 0.6, handle.y + distance * 0.22, distance),
        target: handle,
      };
    }
  }
}

export function distanceLimits(bounds: Bounds): { min: number; max: number } {
  const fit = Math.max(bounds.width, bounds.height) / MM_PER_SCENE_UNIT;
  return { min: Math.max(0.45, fit * 0.35), max: fit * 4 + 2 };
}

/** Eased approach; `1 - pow(decay, dt)` is frame-rate independent. */
function approach(current: THREE.Vector3, goal: THREE.Vector3, delta: number): boolean {
  const factor = 1 - Math.pow(0.0015, delta);
  current.lerp(goal, Math.min(1, factor));
  return current.distanceToSquared(goal) < 1e-6;
}

export function CameraRig({
  preset,
  bounds,
  presetToken,
}: {
  preset: CameraPreset;
  bounds: Bounds;
  /** Changes whenever the preset is (re)selected, including a reset. */
  presetToken: number;
}): JSX.Element {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const goal = useRef<CameraPose | null>(null);
  const limits = distanceLimits(bounds);
  const aspect = size.width / Math.max(1, size.height);

  useEffect(() => {
    goal.current = poseFor(preset, bounds, aspect, camera.fov);
    // Re-framing on resize is what keeps a phone in portrait from cropping the
    // product that a desktop shows comfortably.
  }, [preset, presetToken, bounds, aspect, camera.fov]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const pose = goal.current;

    if (pose === null) {
      // Damping needs an update every frame, even with no input.
      orbit?.update();
      return;
    }

    // OrbitControls rewrites camera.position from its own spherical state on
    // every update, so lerping the position while it updates means the two
    // fight and the camera settles somewhere that is neither pose — visibly
    // off-square, which a three-quarter view hides and an elevation does not.
    // Drive the camera directly while animating, and hand control back only
    // once it has arrived.
    if (orbit !== null) orbit.enabled = false;

    const positionSettled = approach(camera.position, pose.position, delta);
    const targetSettled = orbit === null ? true : approach(orbit.target, pose.target, delta);
    camera.lookAt(orbit === null ? pose.target : orbit.target);

    if (positionSettled && targetSettled) {
      // Snap to the exact pose: an elevation that is a millimetre off-axis is
      // still not an elevation.
      camera.position.copy(pose.position);
      if (orbit !== null) {
        orbit.target.copy(pose.target);
        orbit.enabled = true;
        orbit.update();
      }
      camera.lookAt(pose.target);
      goal.current = null;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={limits.min}
      maxDistance={limits.max}
      minPolarAngle={MIN_POLAR_ANGLE}
      maxPolarAngle={MAX_POLAR_ANGLE}
    />
  );
}
