import { contours } from 'd3-contour';
import type { Pt } from '../data/types';
import { fbm } from './noise';

export const SHEET_W = 1600;
export const SHEET_H = 1000;

const CELL = 8;
/** Cells plotted beyond the neatline, so contour closures along the grid edge are never seen. */
const PAD = 2;
const NX = SHEET_W / CELL + 1 + PAD * 2;
const NY = SHEET_H / CELL + 1 + PAD * 2;

export interface TerrainSpec {
  /** Seed for this edition's own disagreement with the ground. */
  seed: number;
  /** How far this edition's coast wanders from the shared one. */
  wobble: number;
  /** 0 = no island at Orrow, 1 = the island as charted. */
  island: number;
}

export interface Terrain {
  land: string;
  contours: string;
  indexContours: string;
  /** Water lining, from the shore outward. */
  water: string[];
}

/** The estuary: centre line with half-width at each station, widest at the Sound. */
const ESTUARY: [x: number, y: number, halfWidth: number][] = [
  [-60, 655, 150],
  [300, 640, 135],
  [520, 610, 90],
  [700, 560, 52],
  [860, 500, 13],
];

/** The Morrow above the tide. The estuary trough ends where this begins. */
export const RIVER: Pt[] = [
  [860, 500],
  [940, 486],
  [1020, 470],
  [1180, 420],
  [1330, 330],
  [1460, 200],
  [1640, 110],
];

const HILLS: [x: number, y: number, radius: number, height: number][] = [
  [1480, 540, 150, 0.5], // Null Fell
  [1400, 860, 250, 0.55], // Ansel Fell
  [1300, 720, 75, -0.3], // the Ansel valley
  [540, 110, 170, 0.3],
  [1240, 50, 160, 0.35],
  [900, 900, 200, 0.25],
];

export const ORROW: Pt = [150, 330];

function trough(x: number, y: number): number {
  let best = Infinity;
  for (let i = 0; i < ESTUARY.length - 1; i++) {
    const [ax, ay, aw] = ESTUARY[i];
    const [bx, by, bw] = ESTUARY[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    const px = ax + dx * t;
    const py = ay + dy * t;
    const w = aw + (bw - aw) * t;
    const q = ((x - px) ** 2 + (y - py) ** 2) / (w * w);
    if (q < best) best = q;
  }
  return 0.9 * Math.exp(-best);
}

export function heightAt(x: number, y: number, spec: TerrainSpec): number {
  const coastX = 300 + 50 * Math.sin(y / 190 + 1);
  let h = 0.55 * Math.tanh((x - coastX) / 260);
  for (const [hx, hy, r, a] of HILLS) {
    h += a * Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / (r * r));
  }
  h -= trough(x, y);
  h += 0.1 * fbm(x / 260, y / 260, 7);
  h += spec.wobble * fbm(x / 140, y / 140, spec.seed);
  if (spec.island > 0) {
    h += 0.6 * spec.island * Math.exp(-((x - ORROW[0]) ** 2 + (y - ORROW[1]) ** 2) / (45 * 45));
  }
  return h;
}

type Rings = number[][][][];

function toPath(polygons: Rings): string {
  let d = '';
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length; i++) {
        // d3-contour places grid point (i, j) at (i + 0.5, j + 0.5).
        const x = (ring[i][0] - 0.5 - PAD) * CELL;
        const y = (ring[i][1] - 0.5 - PAD) * CELL;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      d += 'Z';
    }
  }
  return d;
}

const LAND_STEP = 0.12;
const LAND_LEVELS = 11;
const WATER_LEVELS = [-0.035, -0.08, -0.135, -0.2];

export function buildTerrain(spec: TerrainSpec): Terrain {
  const values = new Float64Array(NX * NY);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      values[j * NX + i] = heightAt((i - PAD) * CELL, (j - PAD) * CELL, spec);
    }
  }
  const gen = contours().size([NX, NY]);
  const at = (level: number) => toPath(gen.contour(values as unknown as number[], level).coordinates as Rings);

  let minor = '';
  let index = '';
  for (let k = 1; k <= LAND_LEVELS; k++) {
    const d = at(k * LAND_STEP);
    if (k % 4 === 0) index += d;
    else minor += d;
  }
  return {
    land: at(0),
    contours: minor,
    indexContours: index,
    water: WATER_LEVELS.map(at),
  };
}

const cache = new Map<string, Terrain>();

export function terrainKey(spec: TerrainSpec): string {
  return `${spec.seed}:${spec.wobble}:${spec.island}`;
}

export function cachedTerrain(spec: TerrainSpec): Terrain | undefined {
  return cache.get(terrainKey(spec));
}

export function getTerrain(spec: TerrainSpec): Terrain {
  const key = terrainKey(spec);
  let t = cache.get(key);
  if (!t) {
    t = buildTerrain(spec);
    cache.set(key, t);
  }
  return t;
}
