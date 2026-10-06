import { plain } from '../engine/segments';
import type { GreekAdverb, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** εδώ and εκεί: the word on its own and in a sentence (spec 5.3). */
export function adverbPanel(word: GreekAdverb, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({
    label,
    el: plain(el),
    ro: plain(ro),
    en: plain(en),
  });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `place word: ${word.en}` : 'adverb · never changes',
    controls: [],
    rows: [
      row('on its own', word.lemma, word.ro, word.en),
      row('in a sentence', word.example.el, word.example.ro, word.example.en),
    ],
    full: [],
    plain: word.meaning,
    irregular: '',
    note: '',
  };
}
