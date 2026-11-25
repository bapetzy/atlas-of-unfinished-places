import { describe, expect, it } from 'vitest';
import { heightAt, SHEET_H, SHEET_W } from '../carto/terrain';
import { SURVEY_EDITIONS } from './editions';
import { terrainSpec } from './features';
import { KEYSTONE, PLACE_BY_ID, PLACES } from './places';
import { depictionFor, disagreements, isComplete, keystoneLocked, settledCount } from './resolve';
import type { Findings, RecordDoc } from './types';

const allRecords: RecordDoc[] = PLACES.flatMap((p) => p.records);

function textOf(record: RecordDoc): string[] {
  const b = record.body;
  switch (b.form) {
    case 'prose':
      return [...b.paragraphs, b.signoff ?? ''];
    case 'entries':
      return b.entries.map(([, text]) => text);
    case 'ledger':
      return [...b.rows.flat(), b.foot ?? ''];
    case 'wire':
      return b.lines;
    case 'notice':
      return [b.heading, ...b.paragraphs];
  }
}

describe('the ten places', () => {
  it('are looked up by id without finding anything inherited', () => {
    expect(PLACE_BY_ID.orrow.name).toBe('Orrow');
    for (const id of ['constructor', 'toString', 'hasOwnProperty', '__proto__', 'atlantis']) {
      expect(PLACE_BY_ID[id], id).toBeUndefined();
    }
  });

  it('have unique ids and sit on the sheet', () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    expect(PLACES).toHaveLength(10);
    for (const p of PLACES) {
      expect(p.at[0]).toBeGreaterThan(0);
      expect(p.at[0]).toBeLessThan(SHEET_W);
      expect(p.at[1]).toBeGreaterThan(0);
      expect(p.at[1]).toBeLessThan(SHEET_H);
    }
  });

  it('are drawn by every survey edition, and not all the same way', () => {
    for (const p of PLACES) {
      for (const ed of SURVEY_EDITIONS) expect(p.depictions[ed], `${p.id} on ${ed}`).toBeDefined();
      const drawings = new Set(
        SURVEY_EDITIONS.map((ed) => {
          const d = p.depictions[ed];
          return [d.status, d.name, d.variant, d.angle, d.at?.join()].join('|');
        }),
      );
      expect(drawings.size, `${p.id} should be disputed`).toBeGreaterThan(1);
    }
  });

  it('keep their papers in order', () => {
    expect(new Set(allRecords.map((r) => r.id)).size).toBe(allRecords.length);
    for (const p of PLACES) {
      expect(p.records.length, p.id).toBeGreaterThanOrEqual(3);
      for (const r of p.records) {
        expect(r.title.length).toBeGreaterThan(0);
        expect(textOf(r).join('').length, r.id).toBeGreaterThan(20);
        if (r.basis) expect(SURVEY_EDITIONS).toContain(r.basis);
      }
    }
  });

  it('link only to places that exist', () => {
    for (const r of allRecords) {
      for (const text of textOf(r)) {
        for (const match of text.matchAll(/\[\[([^|\]]+)\|[^\]]+\]\]/g)) {
          expect(PLACE_BY_ID[match[1]], `${r.id} links to ${match[1]}`).toBeDefined();
        }
      }
    }
  });

  it('offer findings that rest on their own papers', () => {
    for (const p of PLACES) {
      const ids = new Set(p.records.map((r) => r.id));
      expect(p.finding.options.length, p.id).toBeGreaterThanOrEqual(2);
      expect(new Set(p.finding.options.map((o) => o.id)).size).toBe(p.finding.options.length);
      for (const o of p.finding.options) {
        expect(o.cites.length, `${p.id}/${o.id} must rest on something`).toBeGreaterThan(0);
        for (const id of [...o.cites, ...o.setsAside]) expect(ids.has(id), `${p.id}/${o.id} cites ${id}`).toBe(true);
        expect(o.cites.filter((id) => o.setsAside.includes(id))).toEqual([]);
      }
    }
  });

  it('stand on dry land in every edition, except the island and the bridge', () => {
    for (const p of PLACES) {
      if (p.kind === 'island' || p.kind === 'bridge') continue;
      for (const ed of SURVEY_EDITIONS) {
        const at = p.depictions[ed].at ?? p.at;
        expect(heightAt(at[0], at[1], terrainSpec(ed, {})), `${p.id} on ${ed}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('the reader’s edition', () => {
  const everything: Findings = Object.fromEntries(PLACES.map((p) => [p.id, p.finding.options[0].id]));

  it('leaves unsettled places doubtful and in grey', () => {
    const d = depictionFor(PLACE_BY_ID.halme, 'r', {});
    expect(d.settled).toBe(false);
    expect(d.status).toBe('doubtful');
  });

  it('draws a finding as its option directs', () => {
    const d = depictionFor(PLACE_BY_ID.ansel, 'r', { ansel: 'full' });
    expect(d).toMatchObject({ settled: true, status: 'stands', name: 'Ansel Water', variant: 'lake' });
  });

  it('puts the mean origin somewhere no survey put it', () => {
    const d = depictionFor(PLACE_BY_ID[KEYSTONE], 'r', { [KEYSTONE]: 'mean' });
    const surveyed = SURVEY_EDITIONS.map((ed) => (PLACE_BY_ID[KEYSTONE].depictions[ed].at ?? []).join());
    expect(d.at).toBeDefined();
    expect(surveyed).not.toContain(d.at!.join());
  });

  it('hears the origin last', () => {
    expect(keystoneLocked({})).toBe(true);
    const nine = { ...everything };
    delete nine[KEYSTONE];
    expect(keystoneLocked(nine)).toBe(false);
    expect(isComplete(nine)).toBe(false);
    expect(isComplete(everything)).toBe(true);
    expect(settledCount(everything)).toBe(10);
  });

  it('agrees entirely with no survey, whatever is found', () => {
    const choices = PLACES.map((p) => p.finding.options.map((o) => o.id));
    // Walk a spread of complete editions rather than all 3,888.
    for (let n = 0; n < 400; n++) {
      const findings: Findings = {};
      PLACES.forEach((p, i) => {
        findings[p.id] = choices[i][(n * (i + 3) + i) % choices[i].length];
      });
      const counts = disagreements(findings);
      for (const ed of SURVEY_EDITIONS) expect(counts[ed], `edition ${ed}`).toBeGreaterThan(0);
    }
  });

  it('counts nothing against a survey until something is settled', () => {
    expect(disagreements({})).toEqual({ i: 0, ii: 0, iii: 0, iv: 0 });
  });
});
