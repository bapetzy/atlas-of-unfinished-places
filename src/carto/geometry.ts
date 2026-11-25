import type { Pt } from '../data/types';
import { mulberry32 } from './noise';

const f = (n: number) => n.toFixed(1);

export function line(pts: Pt[]): string {
  return pts.map((p, i) => (i === 0 ? 'M' : 'L') + f(p[0]) + ' ' + f(p[1])).join('');
}

/** Catmull–Rom spline through the points, as cubic Béziers. */
export function spline(pts: Pt[], closed = false): string {
  const n = pts.length;
  if (n < 3) return line(pts);
  const get = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    d +=
      'C' +
      f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
      f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' +
      f(p2[0]) + ' ' + f(p2[1]);
  }
  return closed ? d + 'Z' : d;
}

export function rotate(p: Pt, c: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  return [c[0] + x * cos - y * sin, c[1] + x * sin + y * cos];
}

export function rectPath(c: Pt, w: number, h: number, deg = 0): string {
  const corners: Pt[] = [
    [c[0] - w / 2, c[1] - h / 2],
    [c[0] + w / 2, c[1] - h / 2],
    [c[0] + w / 2, c[1] + h / 2],
    [c[0] - w / 2, c[1] + h / 2],
  ];
  return line(corners.map((p) => rotate(p, c, deg))) + 'Z';
}

/** An irregular closed outline: a lake, a bank, a parcel. */
export function blob(c: Pt, rx: number, ry: number, seed: number, n = 12): string {
  const rnd = mulberry32(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 0.78 + rnd() * 0.44;
    pts.push([c[0] + Math.cos(a) * rx * k, c[1] + Math.sin(a) * ry * k]);
  }
  return spline(pts, true);
}

/**
 * A planned street grid inside a w × h plot. `keep` below 1 drops streets,
 * for towns that were laid out more fully than they were built.
 */
export function streetGrid(c: Pt, w: number, h: number, step: number, deg: number, seed: number, keep = 1): string {
  const rnd = mulberry32(seed);
  let d = '';
  const seg = (a: Pt, b: Pt) => {
    d += line([rotate(a, c, deg), rotate(b, c, deg)]);
  };
  for (let x = -w / 2 + step; x < w / 2 - 0.01; x += step) {
    const r = rnd();
    if (r > keep) continue;
    seg([c[0] + x, c[1] - h / 2], [c[0] + x, c[1] + h / 2]);
  }
  for (let y = -h / 2 + step; y < h / 2 - 0.01; y += step) {
    const r = rnd();
    if (r > keep) continue;
    seg([c[0] - w / 2, c[1] + y], [c[0] + w / 2, c[1] + y]);
  }
  return d;
}

/** A scatter of small buildings, for towns the atlas has no quarrel with. */
export function blocks(c: Pt, count: number, spread: number, seed: number, size = 5): string {
  const rnd = mulberry32(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * spread;
    const p: Pt = [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.7];
    d += rectPath(p, size * (0.7 + rnd() * 0.9), size * (0.6 + rnd() * 0.5), Math.round(rnd() * 3) * 30);
  }
  return d;
}

/** Shift interior points of a line, leaving the first `fixed` points where they are. */
export function wander(pts: Pt[], amount: number, seed: number, fixed = 0): Pt[] {
  if (amount === 0) return pts;
  const rnd = mulberry32(seed);
  return pts.map((p, i) => {
    const dx = (rnd() - 0.5) * 2 * amount;
    const dy = (rnd() - 0.5) * 2 * amount;
    return i < fixed ? p : [p[0] + dx, p[1] + dy];
  });
}

const COLS = 'ABCDEFGH';

/** Sheet grid reference: letters west to east, numbers north to south, 200 units a square. */
export function gridRef(p: Pt): string {
  const col = Math.max(0, Math.min(7, Math.floor(p[0] / 200)));
  const row = Math.max(0, Math.min(4, Math.floor(p[1] / 200)));
  return COLS[col] + (row + 1);
}

export const GRID_COLS = COLS.split('');
export const GRID_ROWS = ['1', '2', '3', '4', '5'];
export const GRID_SQUARE = 200;
