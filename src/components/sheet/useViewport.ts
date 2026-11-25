import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { SHEET_H, SHEET_W } from '../../carto/terrain';
import type { Pt } from '../../data/types';

/** Screen = map × k + (x, y). */
export interface Viewport {
  k: number;
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

/** Below this scale the lettering stops being readable, so small screens pan instead of shrinking. */
const LEGIBLE_SCALE = 0.72;
const ZOOM_RANGE = 7;

export function scaleLimits(size: Size): [min: number, max: number] {
  const cover = Math.max(size.w / SHEET_W, size.h / SHEET_H);
  const min = Math.max(cover, LEGIBLE_SCALE);
  return [min, min * ZOOM_RANGE];
}

/**
 * Keep the sheet covering the frame: no desk shows past the neatline.
 * `insetRight` is frame hidden behind an open place's papers; the sheet may
 * slide under them, so that its eastern edge can still be brought into view.
 */
export function clampViewport(vp: Viewport, size: Size, insetRight = 0): Viewport {
  const [min, max] = scaleLimits(size);
  const k = Math.max(min, Math.min(max, vp.k));
  const x = Math.max(size.w - insetRight - SHEET_W * k, Math.min(0, vp.x));
  const y = Math.max(size.h - SHEET_H * k, Math.min(0, vp.y));
  return { k, x, y };
}

export function centredOn(pt: Pt, k: number, size: Size, insetRight = 0): Viewport {
  return clampViewport({ k, x: (size.w - insetRight) / 2 - pt[0] * k, y: size.h / 2 - pt[1] * k }, size, insetRight);
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useViewport(frame: RefObject<HTMLElement | null>, home: Pt, insetRight: number) {
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  const [vp, setVpRaw] = useState<Viewport>({ k: 1, x: 0, y: 0 });
  const sizeRef = useRef(size);
  const vpRef = useRef(vp);
  const anim = useRef(0);
  const placed = useRef(false);
  const insetRef = useRef(insetRight);

  const setVp = useCallback((next: Viewport) => {
    const clamped = clampViewport(next, sizeRef.current, insetRef.current);
    vpRef.current = clamped;
    setVpRaw(clamped);
  }, []);

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight };
      if (next.w === 0 || next.h === 0) return;
      sizeRef.current = next;
      setSize(next);
      if (!placed.current) {
        placed.current = true;
        setVp(centredOn(home, scaleLimits(next)[0], next));
      } else {
        setVp(vpRef.current);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `home` only matters for the first placement
  }, [frame, setVp]);

  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const stop = useCallback(() => cancelAnimationFrame(anim.current), []);

  const flyTo = useCallback(
    (target: Viewport) => {
      cancelAnimationFrame(anim.current);
      const to = clampViewport(target, sizeRef.current, insetRef.current);
      if (prefersReducedMotion()) {
        setVp(to);
        return;
      }
      const from = vpRef.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / 520);
        const e = 1 - Math.pow(1 - t, 3);
        setVp({ k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
        if (t < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [setVp],
  );

  /** Zoom by a factor, holding the given screen point still. */
  const zoomAt = useCallback(
    (factor: number, sx: number, sy: number, animate = false) => {
      const cur = vpRef.current;
      const [min, max] = scaleLimits(sizeRef.current);
      const k = Math.max(min, Math.min(max, cur.k * factor));
      const mx = (sx - cur.x) / cur.k;
      const my = (sy - cur.y) / cur.k;
      const next = { k, x: sx - mx * k, y: sy - my * k };
      if (animate) flyTo(next);
      else setVp(next);
    },
    [flyTo, setVp],
  );

  // When the papers close, draw the sheet back over the strip they were covering.
  useEffect(() => {
    insetRef.current = insetRight;
    if (placed.current) flyTo(vpRef.current);
  }, [insetRight, flyTo]);

  return { vp, vpRef, size, sizeRef, setVp, flyTo, zoomAt, stop };
}
