import type { Option } from '../engine/labels';
import type { Rich } from '../engine/segments';
import type { Num, ReadingPart, Slot } from '../types';

export interface Control {
  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object';
  label: string;
  options: Option[];
  value: string;
}

export interface PanelRow {
  label: string;
  el: Rich;
  ro: Rich;
  en: Rich;
  /** Per-column highlight: the cell that holds the form in use. */
  hl?: { el?: boolean; ro?: boolean; en?: boolean };
  /** A row with no form: the reason, shown in place of the cells. */
  dimmed?: string;
}

/** One line of "how to read this" for the learner's level (spec 5.5). */
export interface ReadingView {
  lang: 'el' | 'ro' | 'en';
  parts: ReadingPart[];
  sentence: string;
}

/** A link from a panel to another panel: the verb a participle comes from, the numeral behind κανένας (spec 5.3). */
export interface Related {
  /** The line that introduces it. */
  text: string;
  /** The button label. */
  button: string;
  /** The label of the way back: "Back to the participle". */
  backLabel: string;
  lexeme: string;
  slot: Slot;
  /** The noun the opened panel goes with, when it needs one (the numeral does). */
  noun: string | null;
}

export interface Panel {
  lemma: string;
  posLabel: string;
  controls: Control[];
  rows: PanelRow[];
  /** The full paradigm; filled only at the Improver level. */
  full: PanelRow[];
  /** Verbs, Improver only: every mood and tense for the selected person. */
  overview?: PanelRow[];
  /** Verbs: the parts of the form and what each contributes. */
  reading?: ReadingView[];
  plain: string;
  /** A one-line reason when the form in use is irregular, or ''. */
  irregular: string;
  note: string;
  /** A short label shown beside the part of speech: "mass reading", "count reading". */
  badge?: string;
  /** A link to another panel (spec 5.3). */
  related?: Related;
}

/** What the word panel works on: a copy of the token's slot plus the noun the word goes with. */
export interface PanelState {
  slot: Slot;
  /** Lexeme id of the noun an article, numeral, adjective or preposition goes with; null for other words. */
  noun: string | null;
  /** Number of that noun, used by the preposition panel (other words carry it in their slot). */
  nounNumber: Num;
}
