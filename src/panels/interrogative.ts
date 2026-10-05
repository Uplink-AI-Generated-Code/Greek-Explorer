import { plain } from '../engine/segments';
import type { GreekInterrogative, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** τι, πού, πότε, γιατί, πώς: the word on its own, in a question and, for γιατί, as an answer (spec 5.3). */
export function interrogativePanel(word: GreekInterrogative, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({
    label,
    el: plain(el),
    ro: plain(ro),
    en: plain(en),
  });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `question word: ${word.en}` : 'interrogative · never changes',
    controls: [],
    rows: [
      row('on its own', word.lemma, word.ro, word.en),
      row('in a question', word.question.el, word.question.ro, word.question.en),
      ...(word.answer ? [row('as an answer', word.answer.el, word.answer.ro, word.answer.en)] : []),
    ],
    full: [],
    plain: word.meaning,
    irregular: '',
    note: '',
  };
}
