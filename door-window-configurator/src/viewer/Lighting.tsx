/**
 * Studio lighting.
 *
 * The finding that shaped this: on a near-black finish, SHADOWS DO NOT SHOW.
 * A shadow on RAL 7016 is still RAL 7016, which is why a correctly modelled
 * four-panel door measured indistinguishable from a flush one (1.08x) under
 * the original flat lighting. Dark surfaces show their form through
 * REFLECTIONS — the way a car photographer lights black paint with large
 * softboxes.
 *
 * So the environment here is deliberately uneven, and generated in-scene from
 * Lightformers rather than downloaded as an HDRI: no network fetch, no art
 * asset, and it works offline in the single-file build.
 *
 *   - a large bright box overhead: upward-facing bevels reflect it and light up
 *   - a strong strip on the left and a weaker one on the right: left- and
 *     right-facing bevels read differently from each other
 *   - a dim bounce from the floor: downward-facing bevels stay dark
 *   - a soft box behind the camera: flat front faces carry a gentle sheen
 *     rather than going dead, and two diagonal strips there that glass
 *     reflects as a streak
 *
 * The direct key light is for self-shadowing — grooves, reveals, the panel
 * shadow on a light finish — not for form on dark ones.
 */

import { Environment, Lightformer } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export function StudioEnvironment(): JSX.Element {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* Dim neutral base: some fill everywhere, so shadowed sides are not void. */}
      <color attach="background" args={['#26272a']} />

      {/* Overhead box, angled slightly towards the product. */}
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 6, 1.5]} rotation-x={Math.PI / 2.2} scale={[9, 5, 1]} />

      {/* Key strip, left. */}
      <Lightformer form="rect" intensity={2.4} color="#fffaf2" position={[-6, 2.2, 1.5]} rotation-y={Math.PI / 2} scale={[2.2, 7, 1]} />

      {/* Weaker strip, right — the asymmetry is what separates left from right bevels. */}
      <Lightformer form="rect" intensity={0.9} color="#f2f6ff" position={[6, 2.2, 1]} rotation-y={-Math.PI / 2} scale={[1.6, 6, 1]} />

      {/* Behind the camera: a soft sheen on faces pointing straight out. */}
      <Lightformer form="rect" intensity={0.55} color="#ffffff" position={[0, 1.6, 8]} rotation-y={Math.PI} scale={[10, 4, 1]} />

      {/*
        Two diagonal strips behind the camera, well inside the field of view
        a flat pane reflects. Glass square-on reflects what is behind the
        viewer; a uniform box there left every pane one flat value. The strips
        give each pane the raking streak that says "glass" — and because it is
        one environment, the streak runs continuously across adjacent panes,
        as it does on a real elevation.
      */}
      <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[-0.9, 1.4, 7.5]} rotation={[0, Math.PI, Math.PI / 5]} scale={[0.55, 9, 1]} />
      <Lightformer form="rect" intensity={1.0} color="#ffffff" position={[0.35, 1.4, 7.5]} rotation={[0, Math.PI, Math.PI / 5]} scale={[0.22, 9, 1]} />

      {/* Floor bounce, warm and dim. */}
      <Lightformer form="rect" intensity={0.25} color="#efe9df" position={[0, -3, 1]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
    </Environment>
  );
}

export function KeyLight({
  target,
  extent,
  shadowMapSize,
}: {
  /** Point the light aims at, in metres. */
  target: [number, number, number];
  /** Half-size of the shadow frustum, in metres. */
  extent: number;
  shadowMapSize: number;
}): JSX.Element {
  const targetObject = useMemo(() => new THREE.Object3D(), []);
  targetObject.position.set(...target);

  return (
    <>
      <primitive object={targetObject} />
      <directionalLight
        // Upper left and forward: a raking light across the face, so grooves
        // and mouldings throw short shadows that read on a light finish.
        position={[target[0] - 2.6, target[1] + 3.6, target[2] + 3.2]}
        target={targetObject}
        intensity={1.9}
        color="#fffaf3"
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.015}
      />
      <hemisphereLight args={['#ffffff', '#d6d1c7', 0.35]} />
    </>
  );
}
