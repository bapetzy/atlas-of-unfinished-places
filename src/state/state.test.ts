import { describe, expect, it } from 'vitest';
import { createReaderStore, sanitize, STORAGE_KEY, type KeyValue } from './reader';
import { buildHash, hrefWith, parseHash, type Route } from './router';

function memory(initial: Record<string, string> = {}): KeyValue & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
}

describe('addresses', () => {
  it('open on the first edition with the newest in the glass', () => {
    expect(parseHash('')).toEqual({ view: 'sheet', placeId: null, ed: 'i', glass: 'iv' });
    expect(parseHash('#/')).toEqual({ view: 'sheet', placeId: null, ed: 'i', glass: 'iv' });
  });

  it('read a place, an edition and a glass', () => {
    expect(parseHash('#/place/halme?ed=iii&glass=ii')).toEqual({ view: 'sheet', placeId: 'halme', ed: 'iii', glass: 'ii' });
    expect(parseHash('#/gazetteer?ed=r').view).toBe('gazetteer');
    expect(parseHash('#/?glass=off').glass).toBeNull();
  });

  it('never put the same edition on the sheet and in the glass', () => {
    expect(parseHash('#/?ed=iv').glass).toBe('i');
    expect(parseHash('#/?ed=ii&glass=ii').glass).toBeNull();
  });

  it('treat anything else as off the sheet, without throwing', () => {
    expect(parseHash('#/nowhere').view).toBe('lost');
    expect(parseHash('#/place').view).toBe('lost');
    expect(parseHash('#/place/a/b').view).toBe('lost');
    expect(parseHash('#/?ed=xiv').ed).toBe('i');
    expect(parseHash('#/place/%E0%A4%A').view).toBe('lost');
  });

  it('survive a round trip', () => {
    const routes: Route[] = [
      { view: 'sheet', placeId: null, ed: 'i', glass: 'iv' },
      { view: 'sheet', placeId: 'two-cuts', ed: 'iii', glass: null },
      { view: 'sheet', placeId: null, ed: 'iv', glass: 'i' },
      { view: 'sheet', placeId: null, ed: 'r', glass: 'ii' },
      { view: 'gazetteer', placeId: null, ed: 'ii', glass: 'iv' },
      { view: 'yours', placeId: null, ed: 'r', glass: null },
    ];
    for (const r of routes) expect(parseHash(buildHash(r))).toEqual(r);
    expect(buildHash(routes[0])).toBe('#/');
  });

  it('swap sheet and glass when the glass’s edition is put on the sheet', () => {
    const here: Route = { view: 'sheet', placeId: 'orrow', ed: 'i', glass: 'iv' };
    expect(parseHash(hrefWith(here, { ed: 'iv' }))).toEqual({ view: 'sheet', placeId: 'orrow', ed: 'iv', glass: 'i' });
    expect(parseHash(hrefWith(here, { ed: 'ii' }))).toMatchObject({ ed: 'ii', glass: 'iv' });
  });

  it('close a place’s papers on leaving the sheet', () => {
    const here: Route = { view: 'sheet', placeId: 'orrow', ed: 'ii', glass: null };
    expect(parseHash(hrefWith(here, { view: 'gazetteer' }))).toEqual({ view: 'gazetteer', placeId: null, ed: 'ii', glass: null });
  });
});

describe('the reader’s findings', () => {
  it('are kept, and read back on the next visit', () => {
    const storage = memory();
    const first = createReaderStore(storage);
    first.settle('orrow', 'sometimes');
    first.settle('halme', 'one');
    first.dismissSlip();
    const second = createReaderStore(storage);
    expect(second.get()).toEqual({ findings: { orrow: 'sometimes', halme: 'one' }, slipDismissed: true });
    expect(second.isPersistent()).toBe(true);
  });

  it('can be withdrawn singly or all together', () => {
    const store = createReaderStore(memory());
    store.settle('orrow', 'none');
    store.settle('halme', 'never');
    store.withdraw('orrow');
    expect(store.get().findings).toEqual({ halme: 'never' });
    store.withdrawAll();
    expect(store.get().findings).toEqual({});
  });

  it('tell whoever is listening', () => {
    const store = createReaderStore(memory());
    let calls = 0;
    const stop = store.subscribe(() => calls++);
    store.settle('orrow', 'island');
    stop();
    store.settle('orrow', 'none');
    expect(calls).toBe(1);
  });

  it('discard findings about places or options that are not on file', () => {
    const clean = sanitize({ findings: { orrow: 'sometimes', atlantis: 'yes', halme: 'maybe', sorrel: 7 }, slipDismissed: 'yes' });
    expect(clean).toEqual({ findings: { orrow: 'sometimes' }, slipDismissed: false });
    expect(sanitize(null).findings).toEqual({});
    expect(sanitize('nonsense').findings).toEqual({});
    expect(sanitize({ findings: { constructor: 'x', toString: 'y', hasOwnProperty: 'z' } }).findings).toEqual({});
  });

  it('start empty from damaged storage', () => {
    const store = createReaderStore(memory({ [STORAGE_KEY]: '{not json' }));
    expect(store.get().findings).toEqual({});
  });

  it('work for one visit when the browser refuses to keep anything', () => {
    const refusing: KeyValue = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    const store = createReaderStore(refusing);
    store.settle('orrow', 'island');
    expect(store.get().findings).toEqual({ orrow: 'island' });
    expect(store.isPersistent()).toBe(false);
    expect(createReaderStore(null).isPersistent()).toBe(false);
  });
});
