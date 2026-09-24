/**
 * What the product is seen against.
 *
 * Studio (Step 2.1): the brief's neutral studio. No visible floor or horizon —
 * the product stands on an unseen plane and only its soft contact shadow
 * grounds it, so nothing competes with it.
 *
 * In a wall: the product set into a real opening, with reveals, so a customer
 * can judge how it will actually sit. Brick or render, both procedural: no
 * texture, no art asset.
 *
 * A window in a wall needs a cill height to sit at. That is an INSTALLATION
 * property, deliberately kept out of ConfigState and out of shared links
 * (decision 3), so it is a view-only constant here. It changes what the
 * picture shows, never what gets ordered.
 */

import { ContactShadows } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { ConfigState } from '../config/types';
import { MM_PER_SCENE_UNIT } from '../config/units';
import { sightlines } from '../config/material';
import { applyProcedural } from './materials';

import type { SceneMode, WallFinish } from '../config/view';

export type { SceneMode, WallFinish } from '../config/view';

/** VIEW ONLY. Cill height a window is shown at in the wall scene. Not ordered, not shared. */
export const CONTEXT_CILL_HEIGHT = 900;

/** Height of the product's base above the floor in the given scene, in mm. */
export function productBase(config: ConfigState, scene: SceneMode): number {
  return scene === 'wall' && config.productType === 'window' ? CONTEXT_CILL_HEIGHT : 0;
}

/** The wall's outer face, in mm along Z. The frame sits set back inside the reveal. */
export function wallFaceZ(config: ConfigState): number {
  return sightlines(config.material).frameDepth / 2 + 75;
}

export function StudioBackdrop({ spread }: { spread: number }): JSX.Element {
  return (
    <ContactShadows
      position={[0, 0.001, 0]}
      scale={spread}
      opacity={0.5}
      blur={2.6}
      far={2.2}
      resolution={1024}
      color="#1d1f22"
    />
  );
}

/**
 * Studio only: a graded card standing directly behind the product, seen only
 * through its glazing.
 *
 * Clear glass in a pale studio is, physically, pale: it shows the backdrop,
 * and a white bar on it or a white frame round it all but disappears. Product
 * photographers solve this with a dark card behind the glass, and so does
 * this. It is cut inside the outer frame so it never shows round the edge,
 * and single-sided, so from behind the product it is not there at all.
 */
export function GlazingBacking({ config }: { config: ConfigState }): JSX.Element {
  const { width, height } = config.dimensions;
  const inset = 8;
  const z = -sightlines(config.material).frameDepth / 2 - 2;

  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(width - inset * 2, height - inset * 2, 1, 1);
    // Lighter at the head, darker towards the cill — sky over ground, which is
    // what glass in an elevation reflects and what makes it read as glass.
    const top = new THREE.Color('#a4acaf');
    const bottom = new THREE.Color('#646b6e');
    const positions = plane.getAttribute('position');
    const colours = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i += 1) {
      const c = positions.getY(i) > 0 ? top : bottom;
      colours.set([c.r, c.g, c.b], i * 3);
    }
    plane.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    return plane;
  }, [width, height]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  const scale = 1 / MM_PER_SCENE_UNIT;
  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} material={material} position={[0, height / 2, z]} />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Wall
 * ------------------------------------------------------------------ */

/** The page background as the canvas outputs it: sRGB, after tone mapping. */
const BACKGROUND_SRGB = new THREE.Vector3(0xf4 / 255, 0xf3 / 255, 0xf0 / 255);

/**
 * The context vignette. Wall and floor blend into the page's own background
 * with distance from the product, so the setting is there around the product
 * and gone before it can compete with it — and there is never a hard edge, a
 * cut end, or a floor slab floating in space.
 *
 * Blended AFTER tone mapping and colour conversion, against the exact value
 * the canvas clears to, so the two meet seamlessly rather than nearly.
 */
function applyVignette(material: THREE.Material, centre: THREE.Vector3, inner: number, outer: number): void {
  const previous = material.onBeforeCompile.bind(material);
  const key = material.customProgramCacheKey.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    previous(shader, renderer);
    shader.uniforms.uFadeCentre = { value: centre };
    shader.uniforms.uFadeInner = { value: inner };
    shader.uniforms.uFadeOuter = { value: outer };
    shader.uniforms.uFadeTo = { value: BACKGROUND_SRGB };
    if (!shader.vertexShader.includes('varying vec3 vFadeWorld;')) {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vFadeWorld;')
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvFadeWorld = (modelMatrix * vec4(position, 1.0)).xyz;',
        );
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vFadeWorld;\nuniform vec3 uFadeCentre;\nuniform float uFadeInner;\nuniform float uFadeOuter;\nuniform vec3 uFadeTo;',
      )
      .replace(
        '#include <colorspace_fragment>',
        '#include <colorspace_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, uFadeTo, smoothstep(uFadeInner, uFadeOuter, distance(vFadeWorld, uFadeCentre)));',
      );
  };
  material.customProgramCacheKey = () => `${key()}:vignette`;
}

const BRICK = /* glsl */ `
  // Face or reveal: project onto whichever plane the surface lies in, so the
  // coursing wraps round the reveal instead of smearing across it.
  vec3 faceNormal = normalize(cross(dFdx(vProcPos), dFdy(vProcPos)));
  bool interior = faceNormal.z < -0.5;
  vec2 uv = abs(faceNormal.z) > 0.5 ? vProcPos.xy : vec2(vProcPos.z, vProcPos.y);

  // Stretcher bond: 215 x 65 mm bricks, 10 mm joints.
  float course = floor(uv.y / 75.0);
  float shift = mod(course, 2.0) * 112.5;
  float column = floor((uv.x + shift) / 225.0);
  vec2 inBrick = vec2(mod(uv.x + shift, 225.0), mod(uv.y, 75.0));
  // Joints softened by a pixel, and faded to the average once they shrink
  // below one — hard-edged at a distance they alias into speckle.
  float px = max(fwidth(uv.x), fwidth(uv.y));
  float jointX = smoothstep(215.0 - px, 215.0 + px, inBrick.x);
  float jointY = smoothstep(65.0 - px, 65.0 + px, inBrick.y);
  float joint = mix(clamp(jointX + jointY, 0.0, 1.0), 0.2, smoothstep(4.0, 9.0, px));
`;

const BRICK_COLOUR = /* glsl */ `
  ${BRICK}
  // Per-brick variation only — no per-pixel noise, which aliases at a
  // distance into exactly the speckle this replaced. A muted, brown-leaning
  // UK stock red rather than a saturated orange.
  float tone = procHash(vec3(column, course, 3.0));
  float fleck = procHash(vec3(column, course, 7.0));
  vec3 brick = mix(vec3(0.19, 0.075, 0.047), vec3(0.31, 0.13, 0.083), tone);
  brick = mix(brick, brick * vec3(0.78, 0.8, 0.86), step(0.86, fleck));
  brick *= mix(0.94, 1.04, procNoise(vec3(uv * 0.004, 1.0)));
  vec3 mortar = vec3(0.40, 0.38, 0.34);
  // The inside face of the wall is plastered, not brick.
  vec3 plaster = vec3(0.84, 0.82, 0.78);
  diffuseColor.rgb = interior ? plaster : mix(brick, mortar, joint);
`;

function brickMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0 });
  applyProcedural(material, {
    key: 'wall-brick',
    space: 'world',
    colour: BRICK_COLOUR,
    height: `brickJointDepth()`,
  });
  const inject = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    inject(shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec3 procPerturb(',
      /* glsl */ `
      float brickJointDepth() {
        ${BRICK}
        // Mortar recessed ~1 mm; faded out once a joint is under two pixels.
        // Deeper, every course carried a bright lit edge and read as tiling.
        return interior ? 0.0 : -joint * 0.9 * procFade(10.0);
      }
      vec3 procPerturb(`,
    );
  };
  return material;
}

function renderMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ color: '#ece8e0', roughness: 0.94, metalness: 0 });
  applyProcedural(material, {
    key: 'wall-render',
    space: 'world',
    // Very large, very gentle variation: hand-applied render is never one flat
    // value, but blotches read as damp, not as texture.
    colour: `diffuseColor.rgb *= mix(0.975, 1.015, procNoise(vProcPos * 0.0012));`,
    height: `procNoise(vProcPos / 2.5) * 0.12 * procFade(2.5)`,
  });
  return material;
}

/**
 * The wall as ONE extruded shape with the opening cut out. Built from
 * separate boxes it showed a seam at every joint; extruded, it has none, and
 * the reveals come out of the extrusion itself.
 */
export function buildWallGeometry(config: ConfigState, base: number): { geometry: THREE.BufferGeometry; faceZ: number; thickness: number } {
  const { width, height } = config.dimensions;
  const faceZ = wallFaceZ(config);
  const thickness = 290;
  const halfWall = width / 2 + 3200;
  const wallTop = base + height + 2200;
  const left = -width / 2;
  const right = width / 2;
  const top = base + height;

  const shape = new THREE.Shape();
  if (base === 0) {
    // A door opening meets the floor, so the outline runs round it.
    shape.moveTo(-halfWall, 0);
    shape.lineTo(left, 0);
    shape.lineTo(left, top);
    shape.lineTo(right, top);
    shape.lineTo(right, 0);
    shape.lineTo(halfWall, 0);
    shape.lineTo(halfWall, wallTop);
    shape.lineTo(-halfWall, wallTop);
    shape.closePath();
  } else {
    shape.moveTo(-halfWall, 0);
    shape.lineTo(halfWall, 0);
    shape.lineTo(halfWall, wallTop);
    shape.lineTo(-halfWall, wallTop);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(left, base);
    hole.lineTo(left, top);
    hole.lineTo(right, top);
    hole.lineTo(right, base);
    hole.closePath();
    shape.holes.push(hole);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
  geometry.translate(0, 0, faceZ - thickness);
  return { geometry, faceZ, thickness };
}

export function WallBackdrop({
  config,
  base,
  finish,
}: {
  config: ConfigState;
  base: number;
  finish: WallFinish;
}): JSX.Element {
  const { width, height } = config.dimensions;
  const wall = useMemo(() => buildWallGeometry(config, base), [config, base]);

  const scene = useMemo(() => {
    // Vignette centred on the product, sized to it: the setting is legible
    // for about a product's width around it, then gives way to the page.
    const centre = new THREE.Vector3(0, (base + height / 2) / MM_PER_SCENE_UNIT, wall.faceZ / MM_PER_SCENE_UNIT);
    const reach = Math.max(width, height) / MM_PER_SCENE_UNIT;
    const inner = reach * 0.62 + 0.35;
    const outer = inner + reach * 0.75 + 0.9;

    const wallMaterial = finish === 'brick' ? brickMaterial() : renderMaterial();
    applyVignette(wallMaterial, centre, inner, outer);
    const floor = new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.96 });
    applyVignette(floor, centre, inner, outer);
    const sill = new THREE.MeshStandardMaterial({ color: '#e4e1da', roughness: 0.82 });
    // The room behind the wall. Seen from outside in daylight an interior is
    // darker than the facade, and that — not a tint — is why glass in a real
    // elevation reads as glass. Rendered from inside (BackSide), in shade, and
    // exempt from the vignette: it is only ever seen through the glazing.
    //
    // Unlit, with the floor a step darker than the walls. Lit, the floor
    // caught the overhead light and showed through the lower glazing as a
    // pale band with a hard top edge — which read as a fault, not a floor.
    const roomFace = (colour: string) => new THREE.MeshBasicMaterial({ color: colour, side: THREE.BackSide });
    const walls = roomFace('#6b6760');
    const interior = [walls, walls, roomFace('#77736c'), roomFace('#57544e'), walls, walls];
    return { wallMaterial, floor, sill, interior };
  }, [finish, base, width, height, wall.faceZ]);

  useEffect(() => () => wall.geometry.dispose(), [wall]);
  useEffect(
    () => () => {
      scene.wallMaterial.dispose();
      scene.floor.dispose();
      scene.sill.dispose();
      for (const face of new Set(scene.interior)) face.dispose();
    },
    [scene],
  );

  const scale = 1 / MM_PER_SCENE_UNIT;
  return (
    <group scale={[scale, scale, scale]}>
      {/*
        The wall neither casts nor receives the key light's shadow. Either way
        round, the shadow map put false shadows on the brickwork up to a metre
        and a half from the opening — of the reveal, and of the door furniture
        — where no light could throw them. Nothing legitimately shadows the
        wall face (the product sits back inside the reveal), so the only loss
        is the cill's shadow under a window, and the reveal's across the frame
        head. The soft environment lighting still models both.
      */}
      <mesh geometry={wall.geometry} material={scene.wallMaterial} />
      {/* Outside only: the floor stops at the wall's inner face, or it shows through the glazing inside the room. */}
      <mesh position={[0, -10, wall.faceZ - wall.thickness + 4000]} material={scene.floor} receiveShadow>
        <boxGeometry args={[16000, 20, 8000]} />
      </mesh>
      <mesh position={[0, 1300, wall.faceZ - wall.thickness - 2200]} material={scene.interior}>
        <boxGeometry args={[width + 6000, 2600, 4400]} />
      </mesh>
      {base > 0 && (
        // An external sill: projecting, and wider than the opening.
        <mesh position={[0, base - 25, wall.faceZ - 20]} material={scene.sill} castShadow receiveShadow>
          <boxGeometry args={[width + 90, 50, 110]} />
        </mesh>
      )}
    </group>
  );
}
