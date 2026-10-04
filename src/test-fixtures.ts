import type { GreekVerb } from './types';

const NO_CELLS: readonly string[] = ['', '', '', '', '', ''];

/** A verb with only the aorist imperative, for the stress unit tests; it takes an indirect object. */
const fixture = (id: string, lemma: string, present: string, perfective: string): GreekVerb => ({
  id,
  pos: 'verb',
  lemma,
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma,
      class: 'omega',
      stems: { present, perfective },
      indirect: true,
      offers: { imperative: ['aorist'] },
      ro: { lemma: '-', infinitive: '-', participle: '-', present: NO_CELLS, subjunctive: NO_CELLS, imperfect: NO_CELLS, pluperfect: NO_CELLS },
      en: { gloss: '-', base: '-', third: '-', past: '-', pastParticiple: '-', ing: '-' },
    },
  },
});

/** τηλεφωνώ: τηλεφώνησε has its stress on the third-last syllable, so one pronoun already needs the second accent. */
export const TILEFONO = fixture('tilefono', 'τηλεφωνώ', 'τηλεφων', 'τηλεφώνησ');
/** διαβάζω: διάβασε has its stress on the fourth-last syllable. */
export const DIAVAZO = fixture('diavazo', 'διαβάζω', 'διαβάζ', 'διάβασ');
