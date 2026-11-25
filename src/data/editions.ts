import type { Edition, EditionId, Status, SurveyEditionId } from './types';

export const SURVEY_EDITIONS: SurveyEditionId[] = ['i', 'ii', 'iii', 'iv'];
export const ALL_EDITIONS: EditionId[] = ['i', 'ii', 'iii', 'iv', 'r'];

export const EDITIONS: Record<EditionId, Edition> = {
  i: {
    id: 'i',
    numeral: 'I',
    year: 1871,
    title: 'The Proposing Survey',
    surveyor: 'Col. Aubrey Tench, for the Morrow Improvement Commissioners',
    rule: 'Works sanctioned by the Commissioners are shown in full line; works petitioned for, in broken line.',
    caution: 'Tench drew what had been promised. Much of it had not been started.',
    ink: 'Engraver’s black',
  },
  ii: {
    id: 'ii',
    numeral: 'II',
    year: 1908,
    title: 'The Railway Revision',
    surveyor: 'Drawing Office, Morrow & Halme Junction Railway',
    rule: 'Revised at the Company’s expense. Railways and stations in red.',
    caution: 'Drawn by a company selling shares in the line it shows.',
    ink: 'Black, with railway red',
  },
  iii: {
    id: 'iii',
    numeral: 'III',
    year: 1934,
    title: 'The Correcting Survey',
    surveyor: 'Ines Varga, Corrector to the Survey Office',
    rule: 'Corrections in magenta. Nothing is shown that was not found, with one exception.',
    caution: 'Varga walked the whole sheet and struck out what she could not find. She added one thing she did not visit.',
    ink: 'Black, corrected in magenta',
  },
  iv: {
    id: 'iv',
    numeral: 'IV',
    year: 1962,
    title: 'The Aerial Edition',
    surveyor: 'Aerial Survey Unit, from photographs flown 1959–61',
    rule: 'Compiled from the air. Shows what was standing at the moment of exposure.',
    caution: 'A camera records shadows. It cannot ask anyone anything.',
    ink: 'Grey, with land in buff',
  },
  r: {
    id: 'r',
    numeral: 'V',
    year: null,
    title: 'The Reader’s Reconciliation',
    surveyor: 'Compiled by you, from the other four',
    rule: 'Your findings in blue pencil. Places you have not settled are left in grey.',
    caution: 'This edition is filed with the others and has the same authority.',
    ink: 'Blue pencil',
  },
};

export const STATUS_LABEL: Record<Status, string> = {
  stands: 'Shown',
  proposed: 'Broken line',
  struck: 'Struck out',
  doubtful: 'Doubtful',
  ruin: 'Remains',
  absent: 'Not shown',
};

export const STATUS_MEANING: Record<Status, string> = {
  stands: 'Drawn in full line, as a thing that is there.',
  proposed: 'Drawn in broken line, as a thing intended.',
  struck: 'Drawn and then cancelled by the corrector.',
  doubtful: 'Drawn with a caution: position or existence not confirmed.',
  ruin: 'Drawn in dotted outline, as what is left.',
  absent: 'Not on this edition at all.',
};

export function editionLabel(id: EditionId): string {
  const e = EDITIONS[id];
  return e.year ? `Edition ${e.numeral}, ${e.year}` : `Edition ${e.numeral}, yours`;
}
