import type {
  GreekAdjective,
  GreekArticle,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekVerb,
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
  },
  en: { sg: 'coffee', pl: 'coffees' },
  note: 'Masculine in Greek, feminine in Romanian (o cafea), no gender in English.',
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

const one: GreekNumeral = {
  id: 'one',
  pos: 'numeral',
  lemma: 'ένας',
  verified: { el: false, ro: false, en: false },
  value: 1,
  ro: {
    m: { nom: 'un', gen: 'unui' },
    f: { nom: 'o', gen: 'unei' },
    n: { nom: 'un', gen: 'unui' },
  },
  en: 'a',
};

const def: GreekArticle = { id: 'def', pos: 'article', lemma: 'ο', verified: { el: false, ro: false, en: false } };

const thelo: GreekVerb = {
  id: 'thelo',
  pos: 'verb',
  lemma: 'θέλω',
  verified: { el: false, ro: false, en: false },
  class: 'omega',
  stems: { present: 'θέλ' },
  ro: { lemma: 'a vrea', present: ['vreau', 'vrei', 'vrea', 'vrem', 'vreți', 'vor'] },
  en: { gloss: 'want', base: 'want', third: 'wants' },
};

export const LEXEMES: Record<string, GreekLexeme> = {
  [kafes.id]: kafes,
  [zestos.id]: zestos,
  [one.id]: one,
  [def.id]: def,
  [thelo.id]: thelo,
};

export const DEF_ARTICLE: GreekArticle = def;
export const ONE: GreekNumeral = one;

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
