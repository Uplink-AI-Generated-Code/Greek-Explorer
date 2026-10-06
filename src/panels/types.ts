import type { Option } from '../engine/labels';
import type { Rich } from '../engine/segments';
import type { Case, Num, ReadingPart, Slot } from '../types';

export interface Control {
  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case' | 'kind' | 'degree' | 'sense' | 'gender' | 'role' | 'object' | 'recipient' | 'possessor';
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

/** One way of saying the command in the Same-meaning strip (spec 5.4). */
export interface SameMeaningRow {
  /** The member's index in the group, as a string; 'close' for the bare verb. */
  key: string;
  tag: 'with noun' | 'with clitic' | 'short form';
  el: Rich;
  ro: Rich;
  en: Rich;
  /** The member the panel is showing. */
  current: boolean;
  note?: string;
}

/** The forms that mean the same as the command in the panel, built from its form group (spec 4.6, 5.4). */
export interface SameMeaning {
  meaning: string;
  rows: SameMeaningRow[];
  /** The verb with no object: close, not the same. */
  close?: { key: 'close'; el: Rich; ro: Rich; en: Rich; reason: string; current: boolean };
  /** Improver: the stress, short-form and order sentences. */
  notes: string[];
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
  /** Commands: the forms that mean the same (spec 5.4). */
  sameMeaning?: SameMeaning;
}

/** What the word panel works on: a copy of the token's slot plus the noun the word goes with. */
export interface PanelState {
  slot: Slot;
  /** Lexeme id of the noun an article, numeral, adjective or preposition goes with; null for other words. */
  noun: string | null;
  /** Number of that noun, used by the preposition and possessive panels (other words carry it in their slot). */
  nounNumber: Num;
  /** The role of that noun, for the possessive panel (the slot of a possessive holds only the possessor). */
  nounCase?: Case;
}
