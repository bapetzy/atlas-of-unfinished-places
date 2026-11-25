import { ALL_EDITIONS, SURVEY_EDITIONS } from './editions';
import { KEYSTONE, PLACES } from './places';
import type { Depiction, EditionId, FindingOption, Findings, Place, Pt, SurveyEditionId } from './types';

export interface Resolved extends Depiction {
  /** False only on the reader's edition, for a place with no finding yet. */
  settled: boolean;
}

export function chosenOption(place: Place, findings: Findings): FindingOption | undefined {
  const id = findings[place.id];
  return id ? place.finding.options.find((o) => o.id === id) : undefined;
}

/** Variants a place falls back to on the reader's sheet before it has been settled. */
const UNSETTLED_VARIANT: Record<string, string> = { ansel: 'village', 'two-cuts': 'both' };

function meanPosition(place: Place): Pt {
  const pts = SURVEY_EDITIONS.map((e) => place.depictions[e].at ?? place.at);
  return [
    Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length),
    Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length),
  ];
}

export function depictionFor(place: Place, ed: EditionId, findings: Findings): Resolved {
  if (ed !== 'r') return { ...place.depictions[ed], settled: true };
  const opt = chosenOption(place, findings);
  if (!opt) {
    return {
      status: 'doubtful',
      name: place.name,
      note: 'not settled',
      variant: UNSETTLED_VARIANT[place.id],
      settled: false,
    };
  }
  return {
    status: opt.status,
    name: opt.name ?? place.name,
    note: opt.note,
    variant: opt.variant,
    angle: opt.angle,
    at: opt.variant === 'mean' ? meanPosition(place) : opt.at,
    settled: true,
  };
}

export function settledCount(findings: Findings): number {
  return PLACES.filter((p) => chosenOption(p, findings)).length;
}

/** The origin may only be settled once everything measured from it has been. */
export function keystoneLocked(findings: Findings): boolean {
  return PLACES.some((p) => p.id !== KEYSTONE && !chosenOption(p, findings));
}

export function isComplete(findings: Findings): boolean {
  return settledCount(findings) === PLACES.length;
}

/** In how many places does the reader's edition draw something different from each survey? */
export function disagreements(findings: Findings): Record<SurveyEditionId, number> {
  const out = { i: 0, ii: 0, iii: 0, iv: 0 };
  for (const place of PLACES) {
    const mine = depictionFor(place, 'r', findings);
    if (!mine.settled) continue;
    for (const ed of SURVEY_EDITIONS) {
      const theirs = place.depictions[ed];
      const samePlace = (mine.at ?? place.at).join() === (theirs.at ?? place.at).join();
      const same =
        mine.status === theirs.status &&
        (mine.variant ?? '') === (theirs.variant ?? '') &&
        (mine.angle ?? 0) === (theirs.angle ?? 0) &&
        samePlace;
      if (!same) out[ed]++;
    }
  }
  return out;
}

export function isEditionId(v: string | null | undefined): v is EditionId {
  return !!v && (ALL_EDITIONS as string[]).includes(v);
}
