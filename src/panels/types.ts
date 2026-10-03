import type { Option } from '../engine/labels';
import type { Rich } from '../engine/segments';
import type { Num, Slot } from '../types';

export interface Control {
  key: 'who' | 'mood' | 'tense' | 'voice' | 'polarity' | 'noun' | 'number' | 'count' | 'value' | 'case';
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

export interface Panel {
  lemma: string;
  posLabel: string;
  controls: Control[];
  rows: PanelRow[];
  /** The full paradigm; filled only at the Improver level. */
  full: PanelRow[];
  /** Verbs, Improver only: every mood and tense for the selected person. */
  overview?: PanelRow[];
  plain: string;
  /** A one-line reason when the form in use is irregular, or ''. */
  irregular: string;
  note: string;
}

/** What the word panel works on: a copy of the token's slot plus the noun the word goes with. */
export interface PanelState {
  slot: Slot;
  /** Lexeme id of the noun an article, numeral, adjective or preposition goes with; null for other words. */
  noun: string | null;
  /** Number of that noun, used by the preposition panel (other words carry it in their slot). */
  nounNumber: Num;
}
