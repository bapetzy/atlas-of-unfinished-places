import { describe, expect, it } from 'vitest';
import { clampViewport, scaleLimits } from '../components/sheet/useViewport';
import { terrainSpec } from '../data/features';
import { gridRef, spline, streetGrid, wander } from './geometry';
import { fbm, mulberry32 } from './noise';
import { buildTerrain, heightAt, ORROW, RIVER, SHEET_H, SHEET_W } from './terrain';

describe('noise', () => {
  it('is the same on every visit', () => {
    expect(fbm(3.2, 9.1, 7)).toBe(fbm(3.2, 9.1, 7));
    expect(fbm(3.2, 9.1, 7)).not.toBe(fbm(3.2, 9.1, 8));
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within bounds', () => {
    for (let i = 0; i < 500; i++) {
      const v = fbm(i * 0.37, i * 0.91, 5);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('the ground', () => {
  it('plots identically twice', () => {
    const spec = terrainSpec('ii', {});
    const a = buildTerrain(spec);
    const b = buildTerrain(spec);
    expect(a.land).toBe(b.land);
    expect(a.land.length).toBeGreaterThan(1000);
    expect(a.water).toHaveLength(4);
  });

  it('gives each edition its own coast', () => {
    expect(buildTerrain(terrainSpec('i', {})).land).not.toBe(buildTerrain(terrainSpec('iv', {})).land);
  });

  it('has an island at Orrow only where an edition says so', () => {
    expect(heightAt(ORROW[0], ORROW[1], terrainSpec('i', {}))).toBeGreaterThan(0);
    expect(heightAt(ORROW[0], ORROW[1], terrainSpec('ii', {}))).toBeGreaterThan(0);
    expect(heightAt(ORROW[0], ORROW[1], terrainSpec('iv', {}))).toBeLessThan(0);
  });

  it('lets the reader put the island back, or take it away', () => {
    expect(heightAt(ORROW[0], ORROW[1], terrainSpec('r', { orrow: 'island' }))).toBeGreaterThan(0);
    expect(heightAt(ORROW[0], ORROW[1], terrainSpec('r', { orrow: 'none' }))).toBeLessThan(0);
  });

  it('keeps the estuary wet and the river mouth joined to it, in every edition', () => {
    for (const ed of ['i', 'ii', 'iii', 'iv', 'r'] as const) {
      const spec = terrainSpec(ed, {});
      expect(heightAt(300, 640, spec), `sound, ${ed}`).toBeLessThan(0);
      expect(heightAt(520, 610, spec), `roads, ${ed}`).toBeLessThan(0);
      expect(heightAt(700, 560, spec), `narrows, ${ed}`).toBeLessThan(0);
      expect(heightAt(RIVER[0][0] - 12, RIVER[0][1] + 5, spec), `head of tide, ${ed}`).toBeLessThan(0);
    }
  });
});

describe('geometry', () => {
  it('names grid squares west to east and north to south', () => {
    expect(gridRef([150, 330])).toBe('A2');
    expect(gridRef([990, 235])).toBe('E2');
    expect(gridRef([1599, 999])).toBe('H5');
    expect(gridRef([-20, 4000])).toBe('A5');
  });

  it('draws splines through their first and last points', () => {
    const d = spline(RIVER);
    expect(d.startsWith('M860.0 500.0')).toBe(true);
    expect(d.endsWith('1640.0 110.0')).toBe(true);
  });

  it('leaves the fixed reach of a line alone when the rest wanders', () => {
    const moved = wander(RIVER, 20, 5, 4);
    expect(moved.slice(0, 4)).toEqual(RIVER.slice(0, 4));
    expect(moved[5]).not.toEqual(RIVER[5]);
    expect(wander(RIVER, 0, 5)).toBe(RIVER);
  });

  it('builds fewer streets for a town that was laid out more fully than built', () => {
    const full = streetGrid([0, 0], 150, 100, 12.5, 0, 3, 1);
    const half = streetGrid([0, 0], 150, 100, 12.5, 0, 3, 0.5);
    expect(half.length).toBeLessThan(full.length);
    expect(half.length).toBeGreaterThan(0);
  });
});

describe('the frame', () => {
  const desk = { w: 1400, h: 760 };
  const phone = { w: 360, h: 560 };

  it('never shows desk past the edge of the sheet', () => {
    for (const size of [desk, phone]) {
      const [min] = scaleLimits(size);
      for (const vp of [
        { k: 0.01, x: 500, y: 500 },
        { k: min, x: -99999, y: -99999 },
        { k: 99, x: 0, y: 0 },
      ]) {
        const c = clampViewport(vp, size);
        expect(c.x).toBeLessThanOrEqual(0);
        expect(c.y).toBeLessThanOrEqual(0);
        expect(c.x + SHEET_W * c.k).toBeGreaterThanOrEqual(size.w - 0.001);
        expect(c.y + SHEET_H * c.k).toBeGreaterThanOrEqual(size.h - 0.001);
      }
    }
  });

  it('keeps lettering legible on a small screen by panning instead of shrinking', () => {
    expect(scaleLimits(phone)[0]).toBeGreaterThanOrEqual(0.72);
  });

  it('lets the sheet slide under open papers', () => {
    const k = scaleLimits(desk)[0];
    const shut = clampViewport({ k, x: -99999, y: 0 }, desk);
    const open = clampViewport({ k, x: -99999, y: 0 }, desk, 500);
    expect(open.x).toBe(shut.x - 500);
  });
});
