export type SurveyEditionId = 'i' | 'ii' | 'iii' | 'iv';
export type EditionId = SurveyEditionId | 'r';

export interface Edition {
  id: EditionId;
  numeral: string;
  /** Year of publication; the reader's edition is undated. */
  year: number | null;
  title: string;
  surveyor: string;
  /** The rule this edition drew by, in its own words. */
  rule: string;
  /** What a reader should know about how far to trust it. */
  caution: string;
  ink: string;
}

/**
 * How an edition draws a place. This is a statement about the drawing,
 * not about the ground.
 */
export type Status = 'stands' | 'proposed' | 'struck' | 'doubtful' | 'ruin' | 'absent';

export type PlaceKind =
  | 'city'
  | 'island'
  | 'station'
  | 'district'
  | 'hall'
  | 'light'
  | 'bridge'
  | 'reservoir'
  | 'canal'
  | 'datum';

export type Pt = [number, number];

export interface Depiction {
  status: Status;
  /** The name as lettered on this edition. */
  name: string;
  /** Annotation printed beside the name, in the edition's second ink. */
  note?: string;
  /** Position on this edition, where it differs from the place's usual one. */
  at?: Pt;
  /** Kind-specific drawing variant, e.g. a reservoir drawn as lake or as village. */
  variant?: string;
  /** Kind-specific rotation in degrees, e.g. the lie of a street grid. */
  angle?: number;
}

export type RecordBody =
  | { form: 'prose'; paragraphs: string[]; signoff?: string }
  | { form: 'entries'; entries: [when: string, text: string][] }
  | { form: 'ledger'; columns: string[]; rows: string[][]; foot?: string }
  | { form: 'wire'; lines: string[] }
  | { form: 'notice'; heading: string; paragraphs: string[] };

export interface RecordDoc {
  id: string;
  /** What sort of paper this is, in plain words: "Wage ledger", "Letter". */
  kind: string;
  title: string;
  date: string;
  author: string;
  /** The edition whose compilers relied on this record, if any did. */
  basis?: SurveyEditionId;
  body: RecordBody;
}

export interface FindingOption {
  id: string;
  /** The finding, as the reader would say it. */
  label: string;
  status: Status;
  /** Lettered on the reader's sheet beside the place. */
  note: string;
  name?: string;
  variant?: string;
  angle?: number;
  at?: Pt;
  /** Records this finding rests on. */
  cites: string[];
  /** Records this finding has to set aside. */
  setsAside: string[];
}

export interface Finding {
  question: string;
  options: FindingOption[];
}

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  kindLabel: string;
  at: Pt;
  label: { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' };
  /** One or two sentences: what is unfinished here. */
  premise: string;
  depictions: Record<SurveyEditionId, Depiction>;
  records: RecordDoc[];
  finding: Finding;
}

/** placeId -> chosen option id */
export type Findings = Record<string, string>;
