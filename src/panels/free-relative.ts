import { plain } from '../engine/segments';
import type { GreekFreeRelative, Level } from '../types';
import type { Panel, PanelRow } from './types';

/** ό,τι and όπου: the word in each of its two readings, with an example of each (spec 5.3, 26). */
export function freeRelativePanel(word: GreekFreeRelative, level: Level): Panel {
  const row = (label: string, el: string, ro: string, en: string): PanelRow => ({ label, el: plain(el), ro: plain(ro), en: plain(en) });
  return {
    lemma: word.lemma,
    posLabel: level === 'beginner' ? `free relative: ${word.en.ever}` : 'free relative · never changes',
    controls: [],
    rows: [
      row(word.en.ever, word.lemma, word.ro.ever, word.en.ever),
      row(word.en.plain, word.lemma, word.ro.plain, word.en.plain),
      row(`in a sentence (${word.en.ever})`, word.examples.ever.el, word.examples.ever.ro, word.examples.ever.en),
      row(`in a sentence (${word.en.plain})`, word.examples.plain.el, word.examples.plain.ro, word.examples.plain.en),
    ],
    full: [],
    plain: word.meaning,
    irregular: '',
    note: '',
  };
}
