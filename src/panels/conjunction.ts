import { plain } from '../engine/segments';
import type { GreekConjunction, Level } from '../types';
import type { Panel } from './types';

/** αν: one row, the if-clause in each language (spec 5.3). */
export function conjunctionPanel(conj: GreekConjunction, level: Level): Panel {
  return {
    lemma: conj.lemma,
    posLabel: level === 'beginner' ? 'little word: if' : 'conjunction',
    controls: [],
    rows: [
      {
        label: 'if-clause',
        el: plain(conj.example.el),
        ro: plain(conj.example.ro),
        en: plain(conj.example.en),
      },
    ],
    full: [],
    plain: conj.meaning,
    irregular: '',
    note: '',
  };
}
