import { useSyncExternalStore } from 'react';
import { PLACE_BY_ID } from '../data/places';
import type { Findings } from '../data/types';

/** The reader's edition lives in this browser only. Nothing is sent anywhere. */

export interface ReaderState {
  findings: Findings;
  /** The slip explaining the sheet has been read and put away. */
  slipDismissed: boolean;
}

export const STORAGE_KEY = 'atlas-of-unfinished-places.reader.v1';

const EMPTY: ReaderState = { findings: {}, slipDismissed: false };

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Keep only findings that still name a real place and a real option. */
export function sanitize(raw: unknown): ReaderState {
  if (!raw || typeof raw !== 'object') return EMPTY;
  const obj = raw as Record<string, unknown>;
  const findings: Findings = {};
  if (obj.findings && typeof obj.findings === 'object') {
    for (const [placeId, optionId] of Object.entries(obj.findings as Record<string, unknown>)) {
      const place = PLACE_BY_ID[placeId];
      if (place && typeof optionId === 'string' && place.finding.options.some((o) => o.id === optionId)) {
        findings[placeId] = optionId;
      }
    }
  }
  return { findings, slipDismissed: obj.slipDismissed === true };
}

export function createReaderStore(storage: KeyValue | null) {
  let state: ReaderState = EMPTY;
  /** False when the browser refuses storage; the edition then lasts for this visit only. */
  let persistent = storage !== null;
  const listeners = new Set<() => void>();

  const load = () => {
    if (!storage) return;
    try {
      const text = storage.getItem(STORAGE_KEY);
      state = text ? sanitize(JSON.parse(text)) : EMPTY;
    } catch {
      state = EMPTY;
      persistent = false;
    }
  };
  load();

  const commit = (next: ReaderState) => {
    state = next;
    if (storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(next));
        persistent = true;
      } catch {
        persistent = false;
      }
    }
    listeners.forEach((l) => l());
  };

  return {
    get: () => state,
    isPersistent: () => persistent,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Another tab changed the edition. */
    reload() {
      load();
      listeners.forEach((l) => l());
    },
    settle(placeId: string, optionId: string) {
      commit({ ...state, findings: { ...state.findings, [placeId]: optionId } });
    },
    withdraw(placeId: string) {
      const findings = { ...state.findings };
      delete findings[placeId];
      commit({ ...state, findings });
    },
    withdrawAll() {
      commit({ ...state, findings: {} });
    },
    dismissSlip() {
      commit({ ...state, slipDismissed: true });
    },
  };
}

function browserStorage(): KeyValue | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const reader = createReaderStore(browserStorage());

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) reader.reload();
  });
}

export function useReader(): ReaderState {
  return useSyncExternalStore(reader.subscribe, reader.get, reader.get);
}
