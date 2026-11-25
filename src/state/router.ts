import { useSyncExternalStore } from 'react';
import { isEditionId } from '../data/resolve';
import type { EditionId } from '../data/types';

/**
 * Hash routing, so the atlas works from any static host or straight off disk.
 *
 *   #/                       the sheet
 *   #/place/halme            the sheet, with a place's papers open
 *   #/gazetteer              every place against every edition
 *   #/yours                  the reader's findings
 *   #/about                  how to read the sheet
 *
 * `ed` and `glass` ride along as query parameters on every route.
 */

export type View = 'sheet' | 'gazetteer' | 'yours' | 'about' | 'lost';

export interface Route {
  view: View;
  placeId: string | null;
  ed: EditionId;
  /** The edition seen through the reading glass, or null when the glass is put away. */
  glass: EditionId | null;
}

export const DEFAULT_ED: EditionId = 'i';
export const DEFAULT_GLASS: EditionId = 'iv';

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const q = new URLSearchParams(queryPart);
  let segs: string[];
  try {
    segs = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    // A mangled escape in the address is somewhere off the sheet, not a fault.
    segs = ['?'];
  }

  const edParam = q.get('ed');
  const ed = isEditionId(edParam) ? edParam : DEFAULT_ED;
  const glassParam = q.get('glass');
  let glass: EditionId | null;
  if (glassParam === 'off') glass = null;
  else if (isEditionId(glassParam)) glass = glassParam;
  else glass = ed === DEFAULT_GLASS ? DEFAULT_ED : DEFAULT_GLASS;
  if (glass === ed) glass = null;

  let view: View = 'lost';
  let placeId: string | null = null;
  if (segs.length === 0) view = 'sheet';
  else if (segs[0] === 'place' && segs.length === 2) {
    view = 'sheet';
    placeId = segs[1];
  } else if (segs.length === 1 && (segs[0] === 'gazetteer' || segs[0] === 'yours' || segs[0] === 'about')) {
    view = segs[0];
  }
  return { view, placeId, ed, glass };
}

export function buildHash(route: Route): string {
  let path = '/';
  if (route.view === 'sheet' && route.placeId) path = `/place/${encodeURIComponent(route.placeId)}`;
  else if (route.view !== 'sheet' && route.view !== 'lost') path = `/${route.view}`;

  const q = new URLSearchParams();
  if (route.ed !== DEFAULT_ED) q.set('ed', route.ed);
  const impliedGlass = route.ed === DEFAULT_GLASS ? DEFAULT_ED : DEFAULT_GLASS;
  if (route.glass === null) q.set('glass', 'off');
  else if (route.glass !== impliedGlass) q.set('glass', route.glass);
  const qs = q.toString();
  return '#' + path + (qs ? '?' + qs : '');
}

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const getHash = () => window.location.hash;

let lastHash: string | null = null;
let lastRoute: Route | null = null;

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  if (hash !== lastHash || !lastRoute) {
    lastHash = hash;
    lastRoute = parseHash(hash);
  }
  return lastRoute;
}

/** The href for the current route with some part of it changed. */
export function hrefWith(route: Route, change: Partial<Route>): string {
  const next = { ...route, ...change };
  if (change.view && change.view !== 'sheet') next.placeId = null;
  // Putting the glass's edition on the sheet swaps the two, so the glass never shows the sheet to itself.
  if (change.ed && change.glass === undefined && next.glass === next.ed) next.glass = route.ed;
  if (next.glass === next.ed) next.glass = null;
  return buildHash(next);
}

export function go(href: string, replace = false): void {
  if (replace) {
    window.history.replaceState(null, '', href);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = href;
  }
}
