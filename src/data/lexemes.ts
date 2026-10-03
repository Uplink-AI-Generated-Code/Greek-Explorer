import type {
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
  GreekPreposition,
  GreekVerb,
  Tense,
} from '../types';

const kafes: GreekNoun = {
  id: 'kafes',
  pos: 'noun',
  lemma: 'καφές',
  verified: { el: false, ro: false, en: false },
  gender: 'm',
  class: 'masc-es',
  stems: { sg: 'καφ', pl: 'καφέδ' },
  ro: {
    lemma: 'cafea',
    gender: 'f',
    forms: {
      sg: { definite: 'cafeaua', indefinite: 'o cafea', genDefinite: 'cafelei', genIndefinite: 'unei cafele' },
      pl: { definite: 'cafelele', indefinite: 'cafele', genDefinite: 'cafelelor', genIndefinite: 'unor cafele' },
    },
    split: { sg: ['cafea', 'ua'], pl: ['cafele', 'le'] },
  },
  en: { sg: 'coffee', pl: 'coffees' },
  note: 'Masculine in Greek, feminine in Romanian (o cafea), no gender in English.',
};

const skylos: GreekNoun = {
  id: 'skylos',
  pos: 'noun',
  lemma: 'σκύλος',
  verified: { el: false, ro: false, en: false },
  gender: 'm',
  class: 'masc-os',
  stems: { sg: 'σκύλ', pl: 'σκύλ' },
  ro: {
    lemma: 'câine',
    gender: 'm',
    forms: {
      sg: { definite: 'câinele', indefinite: 'un câine', genDefinite: 'câinelui', genIndefinite: 'unui câine' },
      pl: { definite: 'câinii', indefinite: 'câini', genDefinite: 'câinilor', genIndefinite: 'unor câini' },
    },
    split: { sg: ['câine', 'le'], pl: ['câini', 'i'] },
  },
  en: { sg: 'dog', pl: 'dogs' },
  note: 'Masculine in Greek and Romanian.',
};

const alepou: GreekNoun = {
  id: 'alepou',
  pos: 'noun',
  lemma: 'αλεπού',
  verified: { el: false, ro: false, en: false },
  gender: 'f',
  class: 'fem-ou',
  stems: { sg: 'αλεπού', pl: 'αλεπούδ' },
  ro: {
    lemma: 'vulpe',
    gender: 'f',
    forms: {
      sg: { definite: 'vulpea', indefinite: 'o vulpe', genDefinite: 'vulpii', genIndefinite: 'unei vulpi' },
      pl: { definite: 'vulpile', indefinite: 'vulpi', genDefinite: 'vulpilor', genIndefinite: 'unor vulpi' },
    },
    split: { sg: ['vulpe', 'a'], pl: ['vulpi', 'le'] },
  },
  en: { sg: 'fox', pl: 'foxes' },
  note: 'Feminine in Greek and Romanian.',
};

const paidi: GreekNoun = {
  id: 'paidi',
  pos: 'noun',
  lemma: 'παιδί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  stems: { sg: 'παιδ', pl: 'παιδ' },
  ro: {
    lemma: 'copil',
    gender: 'm',
    forms: {
      sg: { definite: 'copilul', indefinite: 'un copil', genDefinite: 'copilului', genIndefinite: 'unui copil' },
      pl: { definite: 'copiii', indefinite: 'copii', genDefinite: 'copiilor', genIndefinite: 'unor copii' },
    },
    split: { sg: ['copil', 'ul'], pl: ['copii', 'i'] },
  },
  en: { sg: 'child', pl: 'children' },
  note: 'Neuter in Greek, masculine in Romanian (copil), no gender in English.',
};

const zestos: GreekAdjective = {
  id: 'zestos',
  pos: 'adjective',
  lemma: 'ζεστός',
  verified: { el: false, ro: false, en: false },
  class: 'adj-stressed',
  stem: 'ζεστ',
  ro: {
    lemma: 'cald',
    forms: {
      m: { sg: 'cald', pl: 'calzi' },
      f: { sg: 'caldă', pl: 'calde', genSg: 'calde' },
      n: { sg: 'cald', pl: 'calde' },
    },
  },
  en: 'hot',
};

const grigoros: GreekAdjective = {
  id: 'grigoros',
  pos: 'adjective',
  lemma: 'γρήγορος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'γρήγορ',
  ro: {
    lemma: 'rapid',
    forms: {
      m: { sg: 'rapid', pl: 'rapizi' },
      f: { sg: 'rapidă', pl: 'rapide', genSg: 'rapide' },
      n: { sg: 'rapid', pl: 'rapide' },
    },
  },
  en: 'quick',
};

const tembelikos: GreekAdjective = {
  id: 'tembelikos',
  pos: 'adjective',
  lemma: 'τεμπέλικος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'τεμπέλικ',
  ro: {
    lemma: 'leneș',
    forms: {
      m: { sg: 'leneș', pl: 'leneși' },
      f: { sg: 'leneșă', pl: 'leneșe', genSg: 'leneșe' },
      n: { sg: 'leneș', pl: 'leneșe' },
    },
  },
  en: 'lazy',
};

const kafeAdj: GreekAdjective = {
  id: 'kafe-adj',
  pos: 'adjective',
  lemma: 'καφέ',
  verified: { el: false, ro: false, en: false },
  class: 'adj-indeclinable',
  stem: 'καφέ',
  ro: {
    lemma: 'maro',
    forms: {
      m: { sg: 'maro', pl: 'maro' },
      f: { sg: 'maro', pl: 'maro' },
      n: { sg: 'maro', pl: 'maro' },
    },
  },
  en: 'brown',
};

const same = (nom: string, gen: string = nom) => ({ nom, gen });

const numeral: GreekNumeral = {
  id: 'numeral',
  pos: 'numeral',
  lemma: 'ένας',
  verified: { el: false, ro: false, en: false },
  ro: {
    1: { m: same('un', 'unui'), f: same('o', 'unei'), n: same('un', 'unui') },
    2: { m: same('doi'), f: same('două'), n: same('două') },
    3: { m: same('trei'), f: same('trei'), n: same('trei') },
    4: { m: same('patru'), f: same('patru'), n: same('patru') },
    5: { m: same('cinci'), f: same('cinci'), n: same('cinci') },
  },
  en: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' },
};

const def: GreekArticle = { id: 'def', pos: 'article', lemma: 'ο', verified: { el: false, ro: false, en: false } };

const INDICATIVE_ALL: Tense[] = [
  'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
];
const SUBJUNCTIVE_ALL: Tense[] = ['present', 'aorist', 'perfect'];
const CONDITIONAL_ALL: Tense[] = ['imperfect', 'pluperfect'];
const IMPERATIVE_ALL: Tense[] = ['present', 'aorist'];
/** Every mood except the imperative, which only some verbs offer. */
const OFFERS_NO_IMPERATIVE = { indicative: INDICATIVE_ALL, subjunctive: SUBJUNCTIVE_ALL, conditional: CONDITIONAL_ALL };

const thelo: GreekVerb = {
  id: 'thelo',
  pos: 'verb',
  lemma: 'θέλω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'θέλω',
      class: 'omega',
      stems: {
        present: 'θέλ',
        imperfect: { strong: { augment: 'ή', stem: 'θελ' }, weak: { stem: 'θέλ' } },
        aorist: { strong: { stem: 'θέλησ' }, weak: { stem: 'θελήσ' } },
        perfective: 'θελήσ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a vrea',
        infinitive: 'vrea',
        participle: 'vrut',
        present: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vor'],
        subjunctive: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vrea'],
        imperfect: ['voiam', 'voiai', 'voia', 'voiam', 'voiați', 'voiau'],
        pluperfect: ['voisem', 'voiseși', 'voise', 'voiserăm', 'voiserăți', 'voiseră'],
      },
      en: { gloss: 'want', base: 'want', third: 'wants', past: 'wanted', pastParticiple: 'wanted', ing: 'wanting' },
    },
  },
};

const pidao: GreekVerb = {
  id: 'pidao',
  pos: 'verb',
  lemma: 'πηδάω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πηδάω',
      class: 'contracted-ao',
      stems: {
        present: 'πηδ',
        imperfect: { strong: { stem: 'πηδ' }, weak: { stem: 'πηδ' } },
        aorist: { strong: { stem: 'πήδηξ' }, weak: { stem: 'πηδήξ' } },
        perfective: 'πηδήξ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a sări',
        infinitive: 'sări',
        participle: 'sărit',
        present: ['sar', 'sari', 'sare', 'sărim', 'săriți', 'sar'],
        subjunctive: ['sar', 'sari', 'sară', 'sărim', 'săriți', 'sară'],
        imperfect: ['săream', 'săreai', 'sărea', 'săream', 'săreați', 'săreau'],
        pluperfect: ['sărisem', 'săriseși', 'sărise', 'săriserăm', 'săriserăți', 'săriseră'],
      },
      en: { gloss: 'jump', base: 'jump', third: 'jumps', past: 'jumped', pastParticiple: 'jumped', ing: 'jumping' },
    },
  },
};

const preposition = (id: string, lemma: string, ro: string, en: string, meaning: string): GreekPreposition => ({
  id,
  pos: 'preposition',
  lemma,
  verified: { el: false, ro: false, en: false },
  ro,
  en,
  meaning,
});

const pano = preposition('pano', 'πάνω από', 'peste', 'over', 'above');
const kato = preposition('kato', 'κάτω από', 'sub', 'under', 'below');
const me = preposition('me', 'με', 'cu', 'with', 'with');
const gia = preposition('gia', 'για', 'pentru', 'for', 'for');

const theta: GreekParticle = {
  id: 'theta',
  pos: 'particle',
  lemma: 'θα',
  verified: { el: false, ro: false, en: false },
  ro: 'voi / aș (+ verb)',
  en: 'will / would',
  meaning: 'Marks the future (θα φάω) and, with a past tense, "would" (θα έτρωγα).',
  example: { el: 'θα φάω', ro: 'voi mânca', en: 'will eat' },
};

const na: GreekParticle = {
  id: 'na',
  pos: 'particle',
  lemma: 'να',
  verified: { el: false, ro: false, en: false },
  ro: 'să (+ verb)',
  en: 'to / that',
  meaning: 'Introduces a wish, a purpose or a possibility: Greek has no infinitive, so "to eat" is "να φάω".',
  example: { el: 'να φάω', ro: 'să mănânc', en: 'to eat' },
};

export const LEXEMES: Record<string, GreekLexeme> = {
  [kafes.id]: kafes,
  [skylos.id]: skylos,
  [alepou.id]: alepou,
  [paidi.id]: paidi,
  [zestos.id]: zestos,
  [grigoros.id]: grigoros,
  [tembelikos.id]: tembelikos,
  [kafeAdj.id]: kafeAdj,
  [numeral.id]: numeral,
  [def.id]: def,
  [thelo.id]: thelo,
  [pidao.id]: pidao,
  [pano.id]: pano,
  [kato.id]: kato,
  [me.id]: me,
  [gia.id]: gia,
  [theta.id]: theta,
  [na.id]: na,
};

export const DEF_ARTICLE: GreekArticle = def;
export const NUMERAL: GreekNumeral = numeral;

/** The prepositions shown together in the Improver table, in display order. */
export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia];

export function getLexeme(id: string): GreekLexeme {
  const lexeme = LEXEMES[id];
  if (!lexeme) throw new Error(`unknown lexeme: ${id}`);
  return lexeme;
}

export function getNoun(id: string): GreekNoun {
  const l = getLexeme(id);
  if (l.pos !== 'noun') throw new Error(`lexeme ${id} is a ${l.pos}, not a noun`);
  return l;
}

export function getAdjective(id: string): GreekAdjective {
  const l = getLexeme(id);
  if (l.pos !== 'adjective') throw new Error(`lexeme ${id} is a ${l.pos}, not an adjective`);
  return l;
}

export function getVerb(id: string): GreekVerb {
  const l = getLexeme(id);
  if (l.pos !== 'verb') throw new Error(`lexeme ${id} is a ${l.pos}, not a verb`);
  return l;
}
