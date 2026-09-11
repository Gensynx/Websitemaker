/**
 * Surface appearance, derived from colour, finish and part kind.
 *
 * Faces carry different materials: a box has six geometry groups, and the
 * outward face (+Z) takes the external colour and finish while the inward face
 * (−Z) takes the internal ones. That is why finish had to be split per side —
 * a woodgrain external with a smooth white internal is one product with two
 * surfaces.
 *
 * Woodgrain is a procedural shader, per decision 12: bands of grain computed in
 * the fragment shader, no texture and no art asset. On-screen colour, finish
 * and obscure pattern are all indicative only, and the UI says so.
 */

import * as THREE from 'three';
import type { ColourSelection, ConfigState, Glazing } from '../config/types';
import type { Finish } from '../config/material';
import { resolveInternalColour, resolveInternalFinish } from '../config/types';
import { ralEntry } from '../config/ral';
import type { PartKind } from './geometry';

const HARDWARE_COLOURS: Record<string, { colour: string; metalness: number; roughness: number }> = {
  chrome: { colour: '#d8dade', metalness: 1, roughness: 0.12 },
  'satin-chrome': { colour: '#c3c6ca', metalness: 1, roughness: 0.38 },
  black: { colour: '#17181a', metalness: 0.6, roughness: 0.45 },
  brass: { colour: '#b9924a', metalness: 1, roughness: 0.28 },
  anthracite: { colour: '#33373b', metalness: 0.7, roughness: 0.42 },
};

export function colourToHex(colour: ColourSelection): string {
  return colour.mode === 'ral' ? ralEntry(colour.code).hex : colour.hex;
}

const ROUGHNESS: Record<Finish, number> = {
  smooth: 0.34,
  textured: 0.72,
  'woodgrain-foil': 0.55,
};

function roughnessFor(finish: Finish): number {
  return ROUGHNESS[finish];
}

/**
 * Procedural woodgrain. Injected into a standard material so it still takes
 * the scene's lighting; the grain modulates base colour and roughness only.
 */
function applyWoodgrain(material: THREE.MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      '#include <common>\nvarying vec3 vGrainPos;',
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvGrainPos = position;',
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vGrainPos;
       float grainNoise(vec2 p) {
         return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
       }
       float grainBands(vec2 p) {
         // Long fibres along Y, with a wandering ring pattern across X.
         float wander = grainNoise(floor(p * vec2(0.35, 0.008))) * 2.0 - 1.0;
         float rings = sin((p.x + wander * 26.0) * 0.55);
         float fibre = grainNoise(floor(p * vec2(3.0, 0.4))) * 0.35;
         return clamp(0.5 + rings * 0.28 + fibre, 0.0, 1.0);
       }`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
       float grain = grainBands(vGrainPos.xy);
       diffuseColor.rgb *= mix(0.74, 1.10, grain);`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
       roughnessFactor *= mix(0.86, 1.16, grainBands(vGrainPos.xy));`,
    );
  };
  material.customProgramCacheKey = () => 'woodgrain';
}

function frameMaterial(colour: ColourSelection, finish: Finish): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colourToHex(colour)),
    roughness: roughnessFor(finish),
    metalness: 0.04,
  });
  if (finish === 'woodgrain-foil') applyWoodgrain(material);
  return material;
}

function glassMaterial(glazing: Glazing): THREE.MeshPhysicalMaterial {
  const base = {
    transmission: 0.92,
    thickness: 18,
    roughness: 0.04,
    metalness: 0,
    ior: 1.52,
    reflectivity: 0.5,
    color: new THREE.Color('#eef2f3'),
    transparent: true,
    opacity: 1,
  };

  switch (glazing.appearance) {
    case 'clear':
      break;
    case 'tinted':
      base.color = new THREE.Color(
        glazing.tint === 'bronze' ? '#7a5f44' : glazing.tint === 'grey' ? '#6c7073' : '#5d7486',
      );
      base.transmission = 0.72;
      break;
    case 'obscure':
      // Approximated by scattering, not by a photographed pattern.
      base.roughness = glazing.pattern === 'reeded' ? 0.42 : glazing.pattern === 'cathedral' ? 0.55 : 0.6;
      base.transmission = 0.74;
      break;
  }

  // A triple unit reads fractionally greener and less clear than a double.
  if (glazing.unit === 'triple') base.transmission -= 0.06;
  return new THREE.MeshPhysicalMaterial(base);
}

export interface ProductMaterials {
  /** Six-entry array: +X −X +Y −Y +Z(external) −Z(internal). */
  frameFaces: THREE.Material[];
  sashFaces: THREE.Material[];
  glass: THREE.Material;
  hardware: THREE.Material;
  dispose: () => void;
}

export function buildMaterials(config: ConfigState): ProductMaterials {
  const external = frameMaterial(config.colour.external, config.finish.external);
  const internal = frameMaterial(resolveInternalColour(config.colour), resolveInternalFinish(config.finish));
  // Edges read as the external face; that is how a frame is actually finished.
  const edge = external;

  const hardwareSpec = HARDWARE_COLOURS[config.hardware.finish] ?? HARDWARE_COLOURS['satin-chrome'];
  const hardware = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hardwareSpec?.colour ?? '#c3c6ca'),
    metalness: hardwareSpec?.metalness ?? 1,
    roughness: hardwareSpec?.roughness ?? 0.38,
  });

  const glass = glassMaterial(config.glazing);
  const faces = [edge, edge, edge, edge, external, internal];

  return {
    frameFaces: faces,
    sashFaces: faces,
    glass,
    hardware,
    dispose: () => {
      external.dispose();
      internal.dispose();
      hardware.dispose();
      glass.dispose();
    },
  };
}

export function materialForPart(kind: PartKind, materials: ProductMaterials): THREE.Material | THREE.Material[] {
  switch (kind) {
    case 'glazing':
      return materials.glass;
    case 'hardware':
      return materials.hardware;
    case 'sash':
    case 'leaf':
    case 'panel':
    case 'bar':
      return materials.sashFaces;
    default:
      return materials.frameFaces;
  }
}
