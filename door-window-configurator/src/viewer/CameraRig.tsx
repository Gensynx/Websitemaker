/**
 * Camera presets, clamped orbit, and framing around the UI (Steps 2.2, 2.3).
 *
 * The configuration panel sits OVER the canvas — the brief asks for frosted
 * glass above the model — so the product must be centred in the part of the
 * canvas the panel does not cover, not in the canvas as a whole. That is done
 * by shifting the optical centre with `setViewOffset`, not by shrinking the
 * canvas, which would leave the frosting nothing to blur.
 *
 * Framing is solved for the unobstructed area on both axes, from the
 * product's own bounds, so a 600 mm window and a 1.8 m door set are each
 * fully in shot. Movement eases over ~280 ms: inside the brief's 200-300 ms,
 * and never bouncy.
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
  /** Height of the product's base above the floor, in mm. Windows in a wall sit on a cill. */
  base?: number;
}

/**
 * CSS pixels of canvas covered by UI on each side: the title block above, the
 * view bar below, the panel on the right (desktop) or the sheet below (phone).
 */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * The virtual frame and offset that put the optical centre in the middle of
 * the unobstructed rectangle. In one axis: the visible span is [0, W] and the
 * clear span [L, W - R], centred at (W + L - R) / 2; a virtual frame of
 * W + |R - L|, offset by max(R - L, 0), puts its centre exactly there.
 */
export function viewOffset(width: number, height: number, insets: Insets) {
  const dx = insets.right - insets.left;
  const dy = insets.bottom - insets.top;
  return {
    fullWidth: width + Math.abs(dx),
    fullHeight: height + Math.abs(dy),
    offsetX: Math.max(dx, 0),
    offsetY: Math.max(dy, 0),
  };
}

/** Where the hardware close-up should look, and from which side. */
export interface Focus {
  point: [number, number, number];
  /** +1 = seen from outside, -1 = from inside (window handles). */
  side: 1 | -1;
}

/** Never let the camera go under the floor. */
const MAX_POLAR_ANGLE = Math.PI / 2 - 0.035;
const MIN_POLAR_ANGLE = 0.12;

export interface CameraPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Tangents of the half-angles that span the UNOBSTRUCTED part of the view. */
export interface Frustum {
  tanHalfV: number;
  tanHalfH: number;
}

export function frustumFor(fovDegrees: number, width: number, height: number, insets: Insets): Frustum {
  const tanHalf = Math.tan((fovDegrees * Math.PI) / 180 / 2);
  const { fullHeight } = viewOffset(width, height, insets);
  // Pixels are square, so one tangent-per-pixel serves both axes.
  const clearWidth = Math.max(1, width - insets.left - insets.right);
  const clearHeight = Math.max(1, height - insets.top - insets.bottom);
  return {
    tanHalfV: tanHalf * (clearHeight / fullHeight),
    tanHalfH: tanHalf * (clearWidth / fullHeight),
  };
}

export function poseFor(preset: CameraPreset, bounds: Bounds, frustum: Frustum, focus?: Focus): CameraPose {
  const width = bounds.width / MM_PER_SCENE_UNIT;
  const height = bounds.height / MM_PER_SCENE_UNIT;
  const base = (bounds.base ?? 0) / MM_PER_SCENE_UNIT;
  const centre = new THREE.Vector3(0, base + height / 2, 0);

  // Generous on purpose: the product breathes, and the annotations sit
  // outside its bounding box.
  const margin = Math.max(width, height) * 0.24;
  const fit = Math.max((height / 2 + margin) / frustum.tanHalfV, (width / 2 + margin) / frustum.tanHalfH);

  switch (preset) {
    case 'elevation':
      return { position: new THREE.Vector3(0, centre.y, fit), target: centre };
    case 'three-quarter': {
      const azimuth = (34 * Math.PI) / 180;
      const distance = fit * 1.1;
      return {
        position: new THREE.Vector3(Math.sin(azimuth) * distance, base + height * 0.6, Math.cos(azimuth) * distance),
        target: centre,
      };
    }
    case 'hardware': {
      const point = focus
        ? new THREE.Vector3(...focus.point)
        : new THREE.Vector3(width * 0.3, base + 1050 / MM_PER_SCENE_UNIT, 0);
      const side = focus?.side ?? 1;
      const distance = 0.62;
      return {
        position: new THREE.Vector3(point.x + distance * 0.55, point.y + distance * 0.18, point.z + distance * side),
        target: point,
      };
    }
  }
}

/** How far back the elevation stands to fit the product in the clear area. */
export function framingDistance(bounds: Bounds, frustum: Frustum): number {
  const pose = poseFor('elevation', bounds, frustum);
  return pose.position.distanceTo(pose.target);
}

export function distanceLimits(bounds: Bounds, framing = 0): { min: number; max: number } {
  const fit = Math.max(bounds.width, bounds.height) / MM_PER_SCENE_UNIT;
  return { min: 0.35, max: Math.max(fit * 4 + 3, framing * 1.5) };
}

/** Eased approach; `1 - pow(decay, dt)` is frame-rate independent. */
function approach(current: THREE.Vector3, goal: THREE.Vector3, delta: number): boolean {
  const factor = 1 - Math.pow(0.0015, delta);
  current.lerp(goal, Math.min(1, factor));
  return current.distanceToSquared(goal) < 1e-7;
}

export function CameraRig({
  preset,
  bounds,
  presetToken,
  insets,
  focus,
}: {
  preset: CameraPreset;
  bounds: Bounds;
  /** Changes whenever the preset is (re)selected, including a reset. */
  presetToken: number;
  insets: Insets;
  focus?: Focus;
}): JSX.Element {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const goal = useRef<CameraPose | null>(null);
  const frustum = frustumFor(camera.fov, size.width, size.height, insets);
  // The zoom-out limit must never be tighter than the distance the elevation
  // needs to fit the product into the CLEAR area. With the phone sheet open
  // that area is small, the fit is far away, and a fixed limit clamped the
  // camera short of it — the door ran up behind the title.
  const limits = distanceLimits(bounds, framingDistance(bounds, frustum));

  // Recomputed whenever the framing inputs change — including the panel
  // opening, the sheet expanding, or a phone rotating.
  useEffect(() => {
    goal.current = poseFor(preset, bounds, frustum, focus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, presetToken, bounds.width, bounds.height, bounds.base, frustum.tanHalfV, frustum.tanHalfH, focus?.point[0], focus?.point[1], focus?.side]);

  useFrame((_, delta) => {
    // Optical centre shifted into the unobstructed area. Applied every frame
    // because React Three Fiber resets the aspect on resize; setting it here
    // always wins, and costs one matrix update.
    const view = viewOffset(size.width, size.height, insets);
    camera.aspect = view.fullWidth / view.fullHeight;
    camera.setViewOffset(view.fullWidth, view.fullHeight, view.offsetX, view.offsetY, size.width, size.height);
    camera.updateProjectionMatrix();

    const orbit = controls.current;
    const pose = goal.current;
    if (pose === null) {
      orbit?.update();
      return;
    }

    // OrbitControls rewrites camera.position from its own spherical state on
    // every update, so lerping the position while it updates means the two
    // fight and the camera settles somewhere that is neither pose — visibly
    // off-square, which a three-quarter view hides and an elevation does not.
    if (orbit !== null) orbit.enabled = false;
    const positionSettled = approach(camera.position, pose.position, delta);
    const targetSettled = orbit === null ? true : approach(orbit.target, pose.target, delta);
    camera.lookAt(orbit === null ? pose.target : orbit.target);

    if (positionSettled && targetSettled) {
      // Snap to the exact pose: an elevation a millimetre off-axis is not one.
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
