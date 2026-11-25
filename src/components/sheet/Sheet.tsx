import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { GRID_COLS, GRID_ROWS, GRID_SQUARE } from '../../carto/geometry';
import { ORROW } from '../../carto/terrain';
import { ALL_EDITIONS, editionLabel, EDITIONS } from '../../data/editions';
import { PLACE_BY_ID, PLACES } from '../../data/places';
import { depictionFor } from '../../data/resolve';
import type { EditionId, Findings, Pt } from '../../data/types';
import { reader } from '../../state/reader';
import { buildHash, go, hrefWith, type Route } from '../../state/router';
import { EditionLayer } from './EditionLayer';
import { centredOn, scaleLimits, useViewport, type Size } from './useViewport';

/** Sixty sheet units to the mile: Sorrel Light stands six miles from the coast. */
const UNITS_PER_MILE = 60;
const HOME: Pt = [760, 470];
const DOSSIER_BREAKPOINT = 900;

function glassRadius(size: Size): number {
  return Math.max(78, Math.min(132, Math.min(size.w, size.h) * 0.19));
}

/** Width of sheet hidden behind the papers when they open beside it rather than over it. */
function dossierInset(size: Size): number {
  return window.matchMedia(`(min-width: ${DOSSIER_BREAKPOINT}px)`).matches ? Math.min(500, size.w * 0.42) : 0;
}

function ScaleBar({ k }: { k: number }) {
  const miles = [3, 1, 0.5, 0.25].find((m) => m * UNITS_PER_MILE * k <= 200) ?? 0.25;
  const label = miles >= 1 ? `${miles} ${miles === 1 ? 'mile' : 'miles'}` : miles === 0.5 ? 'Half a mile' : 'Quarter of a mile';
  return (
    <div className="scale-bar" role="img" aria-label={`Scale: this bar is ${label.toLowerCase()} long`}>
      <span className="scale-bar-rule" style={{ width: miles * UNITS_PER_MILE * k }} />
      <span className="scale-bar-label">{label}</span>
    </div>
  );
}

interface Props {
  route: Route;
  findings: Findings;
  slipDismissed: boolean;
  /** The open place's papers, laid beside or over the sheet. */
  children?: ReactNode;
}

export function Sheet({ route, findings, slipDismissed, children }: Props) {
  const { ed, glass, placeId } = route;
  const frame = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clip = useRef<SVGCircleElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [inset, setInset] = useState(0);
  const { vp, vpRef, size, sizeRef, setVp, flyTo, zoomAt, stop } = useViewport(frame, HOME, inset);

  const measured = size.w > 0;

  const lens = useRef<{ x: number; y: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; k: number; mx: number; my: number } | null>(null);
  const suppressClick = useRef(false);
  const clickTimer = useRef(0);

  const hrefFor = useCallback(
    (id: string) => buildHash({ view: 'sheet', placeId: id, ed, glass }),
    [ed, glass],
  );

  const syncLens = useCallback(() => {
    const at = lens.current;
    if (!at) return;
    const v = vpRef.current;
    const r = glassRadius(sizeRef.current);
    if (clip.current) {
      clip.current.setAttribute('cx', String((at.x - v.x) / v.k));
      clip.current.setAttribute('cy', String((at.y - v.y) / v.k));
      clip.current.setAttribute('r', String(r / v.k));
    }
    if (ring.current) {
      ring.current.style.width = ring.current.style.height = `${r * 2}px`;
      ring.current.style.transform = `translate(${at.x - r}px, ${at.y - r}px)`;
    }
  }, [sizeRef, vpRef]);

  // Rest the glass on Orrow to begin with: the island is the plainest disagreement on the sheet.
  useLayoutEffect(() => {
    if (size.w === 0) return;
    if (!lens.current) {
      const v = vpRef.current;
      const r = glassRadius(size);
      // Half on, half off, so the island is seen to stop at the rim of the glass.
      const x = ORROW[0] * v.k + v.x + r * 0.62;
      const y = ORROW[1] * v.k + v.y + r * 0.62;
      const visible = x > r * 0.6 && x < size.w - r * 0.6 && y > r * 0.6 && y < size.h - r * 0.6;
      lens.current = visible ? { x, y } : { x: size.w / 2, y: size.h * 0.64 };
    } else {
      lens.current = {
        x: Math.min(size.w, lens.current.x),
        y: Math.min(size.h, lens.current.y),
      };
    }
    syncLens();
  }, [size, vp, glass, syncLens, vpRef]);

  // Bring an opened place to the middle of whatever sheet is left showing.
  useEffect(() => {
    const frameSize = sizeRef.current;
    if (!placeId || frameSize.w === 0) return;
    const place = PLACE_BY_ID[placeId];
    if (!place) return;
    const at = depictionFor(place, ed, findings).at ?? place.at;
    const k = Math.max(vpRef.current.k, scaleLimits(frameSize)[0] * 1.45);
    flyTo(centredOn(at, k, frameSize, inset));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-centre on opening a place, not on resize or a change of edition
  }, [placeId, inset, measured]);

  const wantedInset = placeId ? dossierInset(size) : 0;
  if (wantedInset !== inset) setInset(wantedInset);

  // When papers are closed, hand the keyboard back to the place they belonged to.
  const lastPlace = useRef<string | null>(placeId);
  useEffect(() => {
    const closed = lastPlace.current;
    lastPlace.current = placeId;
    if (placeId || !closed) return;
    const mark = frame.current?.querySelector<SVGAElement>(`a.place[data-place="${CSS.escape(closed)}"]:not([aria-hidden])`);
    (mark ?? frame.current)?.focus({ preventScroll: true });
  }, [placeId]);

  const local = (e: { clientX: number; clientY: number }) => {
    const rect = frame.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const armPinch = useCallback(() => {
    const [a, b] = [...pointers.current.values()];
    const v = vpRef.current;
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    pinch.current = { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), k: v.k, mx: (cx - v.x) / v.k, my: (cy - v.y) / v.k };
    drag.current = null;
    suppressClick.current = true;
  }, [vpRef]);

  // Releases are heard on the window, so a finger lifted off the chart is never left on the books.
  useEffect(() => {
    const release = (e: PointerEvent) => {
      if (!pointers.current.delete(e.pointerId)) return;
      pinch.current = null;
      drag.current = null;
      const left = [...pointers.current.entries()];
      if (left.length === 1) {
        const [id, p] = left[0];
        const v = vpRef.current;
        drag.current = { id, sx: p.x, sy: p.y, vx: v.x, vy: v.y, moved: true };
      } else if (left.length >= 2) {
        armPinch();
      } else {
        // The click that ends a drag arrives just after the release. Past that, stop swallowing clicks.
        window.clearTimeout(clickTimer.current);
        clickTimer.current = window.setTimeout(() => {
          suppressClick.current = false;
        }, 400);
      }
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.clearTimeout(clickTimer.current);
    };
  }, [armPinch, vpRef]);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    stop();
    const p = local(e);
    // A primary pointer going down means nothing else is touching; drop any pointer whose release was never seen.
    if (e.isPrimary) pointers.current.clear();
    pointers.current.set(e.pointerId, p);
    window.clearTimeout(clickTimer.current);
    suppressClick.current = false;
    if (pointers.current.size === 1) {
      const v = vpRef.current;
      drag.current = { id: e.pointerId, sx: p.x, sy: p.y, vx: v.x, vy: v.y, moved: false };
    } else if (pointers.current.size === 2) {
      armPinch();
    }
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const p = local(e);
    if (e.pointerType === 'mouse') {
      lens.current = p;
      syncLens();
    }
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, p);

    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const [min, max] = scaleLimits(sizeRef.current);
      const k = Math.max(min, Math.min(max, (pinch.current.k * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.d));
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      setVp({ k, x: cx - pinch.current.mx * k, y: cy - pinch.current.my * k });
      return;
    }

    const d = drag.current;
    if (d && d.id === e.pointerId) {
      const dx = p.x - d.sx;
      const dy = p.y - d.sy;
      if (!d.moved && Math.hypot(dx, dy) > 4) {
        d.moved = true;
        suppressClick.current = true;
        svg.current?.setPointerCapture(e.pointerId);
      }
      if (d.moved) setVp({ k: vpRef.current.k, x: d.vx + dx, y: d.vy + dy });
    }
  };

  // A drag that happens to end on a place must not open it.
  const onClickCapture = (e: ReactMouseEvent) => {
    // Enter on a focused place reports detail 0 and is never the tail of a drag.
    if (suppressClick.current && e.detail !== 0) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stop();
      const p = local(e);
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016)), p.x, p.y);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [stop, zoomAt]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // A key pressed during a flight takes over from it.
    if (e.key.startsWith('Arrow')) stop();
    const v = vpRef.current;
    const s = sizeRef.current;
    const step = 90;
    const midX = (s.w - inset) / 2;
    switch (e.key) {
      case 'ArrowLeft':
        setVp({ ...v, x: v.x + step });
        break;
      case 'ArrowRight':
        setVp({ ...v, x: v.x - step });
        break;
      case 'ArrowUp':
        setVp({ ...v, y: v.y + step });
        break;
      case 'ArrowDown':
        setVp({ ...v, y: v.y - step });
        break;
      case '+':
      case '=':
        zoomAt(1.35, midX, s.h / 2, true);
        break;
      case '-':
      case '_':
        zoomAt(1 / 1.35, midX, s.h / 2, true);
        break;
      case '0':
        flyTo(centredOn(HOME, scaleLimits(s)[0], s, inset));
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        go(hrefWith(route, { ed: ALL_EDITIONS[Number(e.key) - 1] }), true);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const notShown = ed === 'r' ? [] : PLACES.filter((p) => p.depictions[ed as Exclude<EditionId, 'r'>].status === 'absent');
  const originIsReader = ed === 'r' && findings['null-cairn'] === 'reader';
  const ready = size.w > 0;

  return (
    <div className="sheet">
      <div
        className="sheet-map"
        ref={frame}
        tabIndex={0}
        // On a narrow screen the papers cover the whole sheet, so nothing beneath them should take focus.
        inert={!!placeId && measured && wantedInset === 0}
        role="group"
        aria-label={`Chart, ${editionLabel(ed)}. Arrow keys move the sheet. Plus and minus change the scale. Zero shows the whole sheet.`}
        onKeyDown={onKeyDown}
      >
        <svg
          ref={svg}
          className="chart"
          width={size.w}
          height={size.h}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          <defs>
            <clipPath id="glass-clip">
              <circle ref={clip} r={1} />
            </clipPath>
          </defs>
          {ready && (
            <g transform={`translate(${vp.x} ${vp.y}) scale(${vp.k})`}>
              <EditionLayer ed={ed} findings={findings} primary activePlace={placeId} hrefFor={hrefFor} />
              {glass && (
                <g clipPath="url(#glass-clip)">
                  <EditionLayer ed={glass} findings={findings} primary={false} activePlace={placeId} hrefFor={hrefFor} />
                </g>
              )}
            </g>
          )}
        </svg>

        {glass && (
          <div className={`glass-ring ed-${glass}`} ref={ring} aria-hidden="true">
            <span className="glass-tag">
              Edition {EDITIONS[glass].numeral}
              {EDITIONS[glass].year ? `, ${EDITIONS[glass].year}` : ', yours'}
            </span>
          </div>
        )}

        {originIsReader && (
          <div className="reader-origin" aria-hidden="true">
            <svg viewBox="-12 -12 24 24" width="26" height="26">
              <path d="M0 -10L9 6L-9 6Z" />
              <circle r="1.8" cy="1" />
            </svg>
            <span>Origin</span>
          </div>
        )}

        <div className="grid-letters" aria-hidden="true">
          {GRID_COLS.map((c, i) => {
            const sx = (i + 0.5) * GRID_SQUARE * vp.k + vp.x;
            return sx > 14 && sx < size.w - 14 ? (
              <span key={c} className="grid-col" style={{ left: sx }}>
                {c}
              </span>
            ) : null;
          })}
          {GRID_ROWS.map((r, i) => {
            const sy = (i + 0.5) * GRID_SQUARE * vp.k + vp.y;
            return sy > 14 && sy < size.h - 14 ? (
              <span key={r} className="grid-row" style={{ top: sy }}>
                {r}
              </span>
            ) : null;
          })}
        </div>

        <div className="sheet-foot">
          <ScaleBar k={vp.k} />
          {notShown.length > 0 && (
            <p className="not-shown">
              Not on this edition:{' '}
              {notShown.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ', '}
                  <a href={hrefFor(p.id)}>{p.name}</a>
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="zoom" role="group" aria-label="Scale of the sheet" style={inset > 0 ? { right: inset + 16 } : undefined}>
          <button type="button" onClick={() => zoomAt(1.5, (size.w - inset) / 2, size.h / 2, true)} aria-label="Larger scale">
            +
          </button>
          <button type="button" onClick={() => zoomAt(1 / 1.5, (size.w - inset) / 2, size.h / 2, true)} aria-label="Smaller scale">
            −
          </button>
          <button type="button" className="zoom-whole" onClick={() => flyTo(centredOn(HOME, scaleLimits(size)[0], size, inset))}>
            Whole sheet
          </button>
        </div>

        {!slipDismissed && !placeId && (
          <aside className="slip" aria-label="How to read this sheet">
            <p className="slip-lead">One estuary, surveyed four times. The four charts do not agree.</p>
            <p>
              The circle is a reading glass: it shows a second edition through the first. Open any place to read the
              papers each survey relied on, then settle it. Your findings are drawn as a fifth edition.
            </p>
            <button
              type="button"
              onClick={() => {
                // The button is about to go; leave the keyboard on the sheet rather than nowhere.
                frame.current?.focus({ preventScroll: true });
                reader.dismissSlip();
              }}
            >
              Put this slip away
            </button>
          </aside>
        )}
      </div>
      {children}
    </div>
  );
}
