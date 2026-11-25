import { spline, wander } from '../carto/geometry';
import { RIVER, type TerrainSpec } from '../carto/terrain';
import type { EditionId, Findings, Pt } from './types';

/** What is drawn besides the ten disputed places: the ground they are disputed on. */

export type LineMode = 'full' | 'broken' | 'struck' | 'trace';

export interface LineFeature {
  id: string;
  kind: 'road' | 'rail' | 'canal';
  d: string;
  mode: LineMode;
}

export interface NameLabel {
  id: string;
  text: string;
  at: Pt;
  cls: 'sea' | 'water' | 'region' | 'hill';
  rotate?: number;
}

export interface Town {
  id: string;
  names: Partial<Record<EditionId, string>> & { default: string };
  at: Pt;
  count: number;
  spread: number;
  seed: number;
  label: { dx: number; dy: number; anchor: 'start' | 'end' };
}

const ISLAND_WHEN_UNSURE = 0.55;

export function terrainSpec(ed: EditionId, findings: Findings): TerrainSpec {
  switch (ed) {
    case 'i':
      return { seed: 11, wobble: 0.06, island: 1 };
    case 'ii':
      return { seed: 23, wobble: 0.04, island: 1 };
    case 'iii':
      return { seed: 37, wobble: 0.025, island: ISLAND_WHEN_UNSURE };
    case 'iv':
      return { seed: 0, wobble: 0, island: 0 };
    case 'r': {
      const orrow = findings.orrow;
      const island = orrow === 'none' ? 0 : orrow === 'island' ? 1 : ISLAND_WHEN_UNSURE;
      return { seed: 0, wobble: 0, island };
    }
  }
}

/** Older editions were less sure of the upper river. The tidal reach is fixed by the bridge. */
const RIVER_WANDER: Record<EditionId, number> = { i: 16, ii: 9, iii: 5, iv: 0, r: 0 };

export function riverPath(ed: EditionId): string {
  return spline(wander(RIVER, RIVER_WANDER[ed], 5, 4));
}

interface Route {
  id: string;
  pts: Pt[];
  editions: EditionId[];
}

const EVERY: EditionId[] = ['i', 'ii', 'iii', 'iv', 'r'];
const LATER: EditionId[] = ['ii', 'iii', 'iv', 'r'];

const ROADS: Route[] = [
  { id: 'coast', pts: [[452, 468], [560, 440], [728, 402], [850, 430], [922, 452]], editions: EVERY },
  { id: 'sorrel', pts: [[728, 402], [700, 300], [658, 222]], editions: EVERY },
  { id: 'halme', pts: [[922, 452], [950, 360], [982, 292]], editions: LATER },
  { id: 'east', pts: [[922, 452], [1100, 392], [1290, 292], [1440, 160], [1640, 70]], editions: LATER },
  { id: 'south', pts: [[640, 676], [760, 702], [900, 692], [1050, 702], [1200, 716], [1292, 722]], editions: EVERY },
  { id: 'tolland-south', pts: [[900, 692], [938, 600], [958, 530]], editions: EVERY },
];

const RAILWAY: Pt[] = [[470, 452], [600, 418], [730, 392], [860, 330], [960, 272], [1100, 180], [1250, 90], [1400, -30]];

const CANAL_AS_PLANNED: Pt[] = [[660, 652], [770, 648], [890, 636], [1010, 612], [1100, 540], [1150, 480], [1186, 422]];
const NORTH_CUT: Pt[] = [[1186, 422], [1150, 480], [1095, 540], [1030, 580], [985, 598]];
const SOUTH_CUT: Pt[] = [[660, 652], [770, 650], [890, 644], [1000, 640], [1085, 648]];

function railMode(ed: EditionId, findings: Findings): LineMode | null {
  switch (ed) {
    case 'i':
      return null;
    case 'ii':
      return 'full';
    case 'iii':
      return 'struck';
    case 'iv':
      return 'trace';
    case 'r':
      return findings.quillfold === 'once' ? 'full' : findings.quillfold === 'never' ? 'trace' : 'broken';
  }
}

function cutModes(ed: EditionId, findings: Findings): [north: LineMode, south: LineMode] | null {
  switch (ed) {
    case 'i':
    case 'ii':
      return null;
    case 'iii':
      return ['struck', 'struck'];
    case 'iv':
      return ['trace', 'trace'];
    case 'r':
      switch (findings['two-cuts']) {
        case 'north':
          return ['full', 'trace'];
        case 'south':
          return ['trace', 'full'];
        case 'neither':
          return ['struck', 'struck'];
        default:
          return ['broken', 'broken'];
      }
  }
}

export function linesFor(ed: EditionId, findings: Findings): LineFeature[] {
  const out: LineFeature[] = [];
  for (const road of ROADS) {
    if (road.editions.includes(ed)) out.push({ id: `road-${road.id}`, kind: 'road', d: spline(road.pts), mode: 'full' });
  }
  const cuts = cutModes(ed, findings);
  if (cuts) {
    out.push({ id: 'cut-north', kind: 'canal', d: spline(NORTH_CUT), mode: cuts[0] });
    out.push({ id: 'cut-south', kind: 'canal', d: spline(SOUTH_CUT), mode: cuts[1] });
  } else {
    out.push({ id: 'canal', kind: 'canal', d: spline(CANAL_AS_PLANNED), mode: 'full' });
  }
  const rail = railMode(ed, findings);
  if (rail) out.push({ id: 'rail', kind: 'rail', d: spline(RAILWAY), mode: rail });
  return out;
}

export function namesFor(ed: EditionId): NameLabel[] {
  return [
    { id: 'sound', text: ed === 'i' ? 'The Sound\nof Morrow' : 'Morrow\nSound', at: [128, 760], cls: 'sea' },
    { id: 'roads', text: ed === 'iv' || ed === 'r' ? 'Morrow Roads' : 'The Roads', at: [404, 632], cls: 'water', rotate: -5 },
    { id: 'river', text: 'River Morrow', at: [1238, 364], cls: 'water', rotate: -31 },
    { id: 'levels', text: 'The Levels', at: [760, 152], cls: 'region' },
    { id: 'ansel-fell', text: 'Ansel Fell', at: [1440, 905], cls: 'hill' },
    { id: 'null-fell', text: 'Null Fell', at: [1462, 628], cls: 'hill' },
  ];
}

export const TOWNS: Town[] = [
  {
    id: 'morrowmouth',
    names: { default: 'Morrowmouth', i: 'Morrow Mouth' },
    at: [452, 474],
    count: 46,
    spread: 34,
    seed: 41,
    label: { dx: -30, dy: -36, anchor: 'end' },
  },
  {
    id: 'stannet',
    names: { default: 'Stannet', i: 'Stannett' },
    at: [640, 672],
    count: 22,
    spread: 22,
    seed: 17,
    label: { dx: -26, dy: 28, anchor: 'end' },
  },
  {
    id: 'tolland',
    names: { default: 'Tolland' },
    at: [918, 446],
    count: 9,
    spread: 12,
    seed: 29,
    label: { dx: -14, dy: -13, anchor: 'end' },
  },
  {
    id: 'tolland-south',
    names: { default: 'Tolland South' },
    at: [962, 528],
    count: 7,
    spread: 10,
    seed: 53,
    label: { dx: 16, dy: 14, anchor: 'start' },
  },
];
