/**
 * Surface appearance, derived from colour, finish and part kind.
 *
 * Everything here is lit by image-based lighting from the studio environment
 * in Viewer.tsx. That matters more than any single value below: without an
 * environment, metal has nothing to reflect and renders dull grey, glass has
 * nothing to show, and a dark frame shows no form at all.
 *
 * Box parts carry six materials — +X −X +Y −Y +Z(external) −Z(internal) — so
 * one frame member shows the external finish outside and the internal finish
 * inside. Shaped parts (panels, hardware) carry one material chosen by the
 * face they sit on.
 *
 * Every procedural effect — woodgrain, textured finish, obscure glass — is
 * computed in the shader from the part's own millimetre coordinates. There is
 * no texture and no art asset, and patterns hold their physical scale on a
 * 300 mm side light and a 2 m frame alike.
 */

import * as THREE from 'three';
import type { ColourSelection, ConfigState, Glazing } from '../config/types';
import { resolveInternalColour, resolveInternalFinish } from '../config/types';
import type { Finish } from '../config/material';
import { colourToHex } from '../config/colourHex';
import type { Part, PartKind } from './geometry';

export { colourToHex };

/* ------------------------------------------------------------------ *
 * Procedural surface detail
 * ------------------------------------------------------------------ */

/**
 * Shader chunk shared by every procedural effect: value noise, and a bump
 * perturbation that uses screen-space derivatives — three.js's own
 * perturbNormalArb technique — so no tangents or UVs are needed.
 *
 * `procFade` switches a pattern off once its features fall below about two
 * pixels. Without it, fine texture shimmers and aliases at a distance, which
 * reads as a rendering fault rather than a finish.
 */
const PROCEDURAL_PARS = /* glsl */ `
  varying vec3 vProcPos;

  float procHash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float procNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(procHash(i + vec3(0, 0, 0)), procHash(i + vec3(1, 0, 0)), f.x),
          mix(procHash(i + vec3(0, 1, 0)), procHash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(procHash(i + vec3(0, 0, 1)), procHash(i + vec3(1, 0, 1)), f.x),
          mix(procHash(i + vec3(0, 1, 1)), procHash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float procFade(float featureMm) {
    float footprint = length(fwidth(vProcPos));
    return 1.0 - smoothstep(featureMm * 0.35, featureMm * 0.7, footprint);
  }

  vec3 procPerturb(vec3 surfPos, vec3 surfNorm, float height) {
    vec3 sigmaX = dFdx(surfPos);
    vec3 sigmaY = dFdy(surfPos);
    vec3 r1 = cross(sigmaY, surfNorm);
    vec3 r2 = cross(surfNorm, sigmaX);
    float det = dot(sigmaX, r1);
    vec2 dHdxy = vec2(dFdx(height), dFdy(height));
    vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
    return normalize(abs(det) * surfNorm - grad);
  }
`;

export interface Procedural {
  key: string;
  /**
   * `local` measures the pattern from each part's own origin, which keeps a
   * pane's reeds aligned to the pane. `world` measures it across the scene,
   * which a wall built from several pieces needs, or the brick coursing breaks
   * at every seam.
   */
  space?: 'local' | 'world';
  /** GLSL expression for surface height in mm, using vProcPos. Optional. */
  height?: string;
  /** GLSL statements run after the base colour is set. Optional. */
  colour?: string;
  /** GLSL statements run after roughness is set. Optional. */
  roughness?: string;
}

export function applyProcedural(material: THREE.MeshStandardMaterial, effect: Procedural): void {
  const source =
    effect.space === 'world'
      ? // Scene units are metres; patterns are specified in millimetres.
        'vProcPos = (modelMatrix * vec4(position, 1.0)).xyz * 1000.0;'
      : 'vProcPos = position;';
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vProcPos;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${source}`);

    let fragment = shader.fragmentShader.replace('#include <common>', `#include <common>\n${PROCEDURAL_PARS}`);
    if (effect.colour) {
      fragment = fragment.replace('#include <color_fragment>', `#include <color_fragment>\n${effect.colour}`);
    }
    if (effect.roughness) {
      fragment = fragment.replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${effect.roughness}`);
    }
    if (effect.height) {
      fragment = fragment.replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>\nnormal = procPerturb(-vViewPosition, normal, ${effect.height});`,
      );
    }
    shader.fragmentShader = fragment;
  };
  material.customProgramCacheKey = () => `proc:${effect.key}`;
}

/** Long fibres along Y with wandering rings across X. Colour and roughness only. */
const WOODGRAIN: Procedural = {
  key: 'woodgrain',
  colour: /* glsl */ `
    float wander = procNoise(vec3(vProcPos.x * 0.004, vProcPos.y * 0.0008, 0.0)) * 2.0 - 1.0;
    float rings = sin((vProcPos.x + wander * 60.0) * 0.18);
    float fibre = procNoise(vec3(vProcPos.x * 0.9, vProcPos.y * 0.02, vProcPos.z * 0.9));
    float grain = clamp(0.5 + rings * 0.26 + (fibre - 0.5) * 0.4, 0.0, 1.0);
    diffuseColor.rgb *= mix(0.72, 1.12, grain);
  `,
  roughness: /* glsl */ `
    roughnessFactor *= mix(0.85, 1.15, procNoise(vec3(vProcPos.x * 0.9, vProcPos.y * 0.02, 0.0)));
  `,
};

/** A fine, broken surface: the highlight breaks up instead of sitting in one sheet. */
const TEXTURED: Procedural = {
  key: 'textured',
  height: `(procNoise(vProcPos / 2.4) * 0.09 + procNoise(vProcPos / 7.0) * 0.05) * procFade(2.4)`,
};

const OBSCURE: Record<string, Procedural> = {
  reeded: { key: 'reeded', height: `sin(vProcPos.x * 0.4488) * 0.55 * procFade(14.0)` },
  stippled: { key: 'stippled', height: `procNoise(vProcPos / 3.5) * 0.45 * procFade(3.5)` },
  cathedral: {
    key: 'cathedral',
    height: `(procNoise(vProcPos / 45.0) * 1.6 + procNoise(vProcPos / 11.0) * 0.35) * procFade(11.0)`,
  },
  sandblast: { key: 'sandblast', height: `procNoise(vProcPos / 1.2) * 0.04 * procFade(1.2)` },
};

/* ------------------------------------------------------------------ *
 * Materials
 * ------------------------------------------------------------------ */

const ROUGHNESS: Record<Finish, number> = {
  smooth: 0.36,
  textured: 0.66,
  'woodgrain-foil': 0.5,
};

/**
 * uPVC and foil have a slight lacquered sheen. A thin clearcoat gives a second,
 * sharper reflection on top of the colour — and on a dark finish that sharper
 * reflection is most of what shows the shape.
 */
const CLEARCOAT: Record<Finish, number> = {
  smooth: 0.45,
  textured: 0.1,
  'woodgrain-foil': 0.3,
};

function frameMaterial(colour: ColourSelection, finish: Finish): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colourToHex(colour)),
    roughness: ROUGHNESS[finish],
    metalness: 0,
    clearcoat: CLEARCOAT[finish],
    clearcoatRoughness: 0.28,
    envMapIntensity: 1,
  });
  if (finish === 'woodgrain-foil') applyProcedural(material, WOODGRAIN);
  if (finish === 'textured') applyProcedural(material, TEXTURED);
  return material;
}

function glassMaterial(glazing: Glazing): THREE.MeshPhysicalMaterial {
  const material = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    thickness: glazing.unit === 'triple' ? 36 : 24,
    roughness: 0.02,
    metalness: 0,
    ior: 1.5,
    specularIntensity: 1,
    // Reflection is the main cue that a pane is glass at all.
    envMapIntensity: 1.8,
    // Light transmittance, not a tint: a double-glazed unit passes about 78%
    // of visible light and a triple about 70%. Set in linear terms, because
    // that is what a transmittance is.
    color: new THREE.Color().setRGB(
      glazing.unit === 'triple' ? 0.68 : 0.76,
      glazing.unit === 'triple' ? 0.72 : 0.79,
      glazing.unit === 'triple' ? 0.71 : 0.78,
    ),
    // Float glass is faintly green through its thickness; a triple unit,
    // with a third pane, more so.
    attenuationColor: new THREE.Color(glazing.unit === 'triple' ? '#cfe3dc' : '#dcebe6'),
    attenuationDistance: 600,
  });

  switch (glazing.appearance) {
    case 'clear':
      break;
    case 'tinted':
      material.color = new THREE.Color(
        glazing.tint === 'bronze' ? '#b99a78' : glazing.tint === 'grey' ? '#9aa0a4' : '#8fa8bb',
      );
      material.transmission = 0.92;
      break;
    case 'obscure': {
      const effect = OBSCURE[glazing.pattern];
      material.roughness = glazing.pattern === 'sandblast' ? 0.55 : 0.12;
      if (effect) applyProcedural(material, effect);
      break;
    }
  }
  return material;
}

const HARDWARE: Record<string, { colour: string; metalness: number; roughness: number }> = {
  chrome: { colour: '#f1f2f4', metalness: 1, roughness: 0.07 },
  'satin-chrome': { colour: '#d8dbde', metalness: 1, roughness: 0.3 },
  black: { colour: '#1c1d1f', metalness: 0.25, roughness: 0.42 },
  brass: { colour: '#d8ae62', metalness: 1, roughness: 0.2 },
  anthracite: { colour: '#3b3f43', metalness: 0.55, roughness: 0.4 },
};

export interface ProductMaterials {
  /** Six-entry array for box parts: +X −X +Y −Y +Z(external) −Z(internal). */
  faces: THREE.Material[];
  /** EPDM weatherseal: black, matte, whatever the frame colour. */
  seal: THREE.Material;
  /** Warm-edge spacer bar inside a sealed unit. */
  spacer: THREE.Material;
  external: THREE.Material;
  internal: THREE.Material;
  glass: THREE.Material;
  hardware: THREE.Material;
  dispose: () => void;
}

export function buildMaterials(config: ConfigState): ProductMaterials {
  const external = frameMaterial(config.colour.external, config.finish.external);
  const internal = frameMaterial(resolveInternalColour(config.colour), resolveInternalFinish(config.finish));
  const spec = HARDWARE[config.hardware.finish] ?? HARDWARE['satin-chrome'];
  const hardware = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec?.colour ?? '#d8dbde'),
    metalness: spec?.metalness ?? 1,
    roughness: spec?.roughness ?? 0.3,
    envMapIntensity: 1.2,
  });
  const glass = glassMaterial(config.glazing);
  const seal = new THREE.MeshStandardMaterial({ color: '#0d0e0f', roughness: 0.85, metalness: 0 });
  const spacer = new THREE.MeshStandardMaterial({ color: '#2b2d2f', roughness: 0.6, metalness: 0.2 });

  return {
    seal,
    spacer,
    // Edges read as the external face; that is how a frame is actually finished.
    faces: [external, external, external, external, external, internal],
    external,
    internal,
    glass,
    hardware,
    dispose: () => {
      external.dispose();
      internal.dispose();
      hardware.dispose();
      glass.dispose();
      seal.dispose();
      spacer.dispose();
    },
  };
}

export function materialForPart(part: Part, materials: ProductMaterials): THREE.Material | THREE.Material[] {
  const kind: PartKind = part.kind;
  if (kind === 'glazing') return materials.glass;
  if (kind === 'seal') return materials.seal;
  if (kind === 'spacer') return materials.spacer;
  if (kind === 'hardware') return materials.hardware;
  const shaped = part.shape !== undefined && part.shape.kind !== 'box';
  if (shaped) return part.facing === 'internal' ? materials.internal : materials.external;
  return materials.faces;
}
