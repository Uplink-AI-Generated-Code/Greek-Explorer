import type { GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, Slot, Tense, Token, Voice } from '../types';

const verbSlot = (person: 1 | 2 | 3): Slot => ({
  pos: 'verb',
  person,
  number: 'sg',
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
});

/** A verb slot for any mood, tense and voice. */
const vslot = (
  mood: Mood,
  tense: Tense,
  person: Person = 1,
  number: Num = 'sg',
  voice: Voice = 'active',
): Slot => ({ pos: 'verb', person, number, mood, tense, voice });

/** A gloss unit; `null` marks a word Greek leaves out. */
const u = (text: string, link: Link | null): GlossUnit => ({ text, link });
/** A unit made of parts that link to different Greek tokens (Romanian câine|le). */
const seg = (...parts: [text: string, link: Link][]): GlossUnit => ({
  segments: parts.map(([text, link]) => ({ text, link })),
});
/** A link to one piece of a verb group. */
const p = (token: number, piece: number): Link => ({ token, piece });
/** The four gloss rows in the order the grid shows them. */
const rows = (
  enNatural: GlossUnit[],
  enLiteral: GlossUnit[],
  roNatural: GlossUnit[],
  roLiteral: GlossUnit[],
): GlossRow[] => [
  { language: 'en', kind: 'natural', units: enNatural },
  { language: 'en', kind: 'literal', units: enLiteral },
  { language: 'ro', kind: 'natural', units: roNatural },
  { language: 'ro', kind: 'literal', units: roLiteral },
];

const orderingHotCoffee: Phrase = {
  id: 'ordering-hot-coffee',
  title: 'Ordering a hot coffee',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 3 },
    { text: 'ζεστό', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 3 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: [
    {
      language: 'en',
      kind: 'natural',
      units: [
        { text: 'I want', link: 0 },
        { text: 'a', link: 1 },
        { text: 'hot', link: 2 },
        { text: 'coffee', link: 3 },
      ],
    },
    {
      language: 'en',
      kind: 'literal',
      units: [
        { text: '(I)', link: null },
        { text: 'want', link: 0 },
        { text: 'a-one', link: 1 },
        { text: 'hot', link: 2 },
        { text: 'coffee', link: 3 },
      ],
    },
    {
      language: 'ro',
      kind: 'natural',
      units: [
        { text: 'Vreau', link: 0 },
        { text: 'o', link: 1 },
        { text: 'cafea', link: 3 },
        { text: 'caldă', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'literal',
      units: [
        { text: '(Eu)', link: null },
        { text: 'vreau', link: 0 },
        { text: 'o', link: 1 },
        { text: 'cafea', link: 3 },
        { text: 'caldă', link: 2 },
      ],
    },
  ],
  verified: false,
};

const orderingThreeCoffees: Phrase = {
  id: 'ordering-three-coffees',
  title: 'Ordering three coffees',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'τρεις', lexeme: 'numeral', slot: { pos: 'numeral', value: 3, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέδες', lexeme: 'kafes', slot: { pos: 'noun', number: 'pl', case: 'acc', count: 3 } },
  ],
  glosses: [
    {
      language: 'en',
      kind: 'natural',
      units: [
        { text: 'I want', link: 0 },
        { text: 'three', link: 1 },
        { text: 'coffees', link: 2 },
      ],
    },
    {
      language: 'en',
      kind: 'literal',
      units: [
        { text: '(I)', link: null },
        { text: 'want', link: 0 },
        { text: 'three', link: 1 },
        { text: 'coffees', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'natural',
      units: [
        { text: 'Vreau', link: 0 },
        { text: 'trei', link: 1 },
        { text: 'cafele', link: 2 },
      ],
    },
    {
      language: 'ro',
      kind: 'literal',
      units: [
        { text: '(Eu)', link: null },
        { text: 'vreau', link: 0 },
        { text: 'trei', link: 1 },
        { text: 'cafele', link: 2 },
      ],
    },
  ],
  verified: false,
};

const foxTokens: Token[] = [
  { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'γρήγορη', lexeme: 'grigoros', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'καφέ', lexeme: 'kafe-adj', slot: { pos: 'adjective', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 3 },
  { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
  { text: 'πηδάει', lexeme: 'pidao', slot: verbSlot(3) },
  { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 8 },
  { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 8 },
  { text: 'τεμπέλικο', lexeme: 'tembelikos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 8 },
  { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];

const foxGlosses: GlossRow[] = [
  {
    language: 'en',
    kind: 'natural',
    units: [
      { text: 'The', link: 0 },
      { text: 'quick', link: 1 },
      { text: 'brown', link: 2 },
      { text: 'fox', link: 3 },
      { text: 'jumps', link: 4 },
      { text: 'over', link: 5 },
      { text: 'the', link: 6 },
      { text: 'lazy', link: 7 },
      { text: 'dog', link: 8 },
    ],
  },
  {
    language: 'en',
    kind: 'literal',
    units: [
      { text: 'The', link: 0 },
      { text: 'quick-[f]', link: 1 },
      { text: 'brown-[indecl.]', link: 2 },
      { text: 'fox', link: 3 },
      { text: '(she) jumps', link: 4 },
      { text: 'above-from', link: 5 },
      { text: 'the-[acc]', link: 6 },
      { text: 'lazy-[acc]', link: 7 },
      { text: 'dog-[acc]', link: 8 },
    ],
  },
  {
    language: 'ro',
    kind: 'natural',
    units: [
      {
        segments: [
          { text: 'vulpe', link: 3 },
          { text: 'a', link: 0 },
        ],
      },
      { text: 'rapidă', link: 1 },
      { text: 'și', link: null },
      { text: 'maro', link: 2 },
      { text: 'sare', link: 4 },
      { text: 'peste', link: 5 },
      {
        segments: [
          { text: 'câine', link: 8 },
          { text: 'le', link: 6 },
        ],
      },
      { text: 'leneș', link: 7 },
    ],
  },
  {
    language: 'ro',
    kind: 'literal',
    units: [
      {
        segments: [
          { text: 'vulpe', link: 3 },
          { text: 'a', link: 0 },
        ],
      },
      { text: 'rapidă', link: 1 },
      { text: 'maro', link: 2 },
      { text: '(ea) sare', link: 4 },
      { text: 'peste', link: 5 },
      {
        segments: [
          { text: 'câine', link: 8 },
          { text: 'le', link: 6 },
        ],
      },
      { text: 'leneș', link: 7 },
    ],
  },
];

const foxSentence: Phrase = {
  id: 'fox-sentence',
  title: 'The quick brown fox jumps over the lazy dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: foxTokens,
  glosses: foxGlosses,
  verified: false,
};

const washingMyself: Phrase = {
  id: 'washing-myself',
  title: 'I wash (myself)',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [{ text: 'Πλένομαι', lexeme: 'pleno', slot: vslot('indicative', 'present', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I wash (myself)', 0)],
    [u('(I)', null), u('wash-[self]', 0)],
    [u('Mă spăl', 0)],
    [u('(Eu)', null), u('mă spăl', 0)],
  ),
  verified: false,
};

const washingTheChild: Phrase = {
  id: 'washing-the-child',
  title: 'I wash the child',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [
    { text: 'Πλένω', lexeme: 'pleno', slot: vslot('indicative', 'present') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I wash', 0), u('the', 1), u('child', 2)],
    [u('(I)', null), u('wash', 0), u('the-[acc]', 1), u('child', 2)],
    [u('Spăl', 0), seg(['copil', 2], ['ul', 1])],
    [u('(Eu)', null), u('spăl', 0), seg(['copil', 2], ['ul', 1])],
  ),
  verified: false,
};

const sleeping: Phrase = {
  id: 'sleeping',
  title: 'I sleep',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [{ text: 'Κοιμάμαι', lexeme: 'koimamai', slot: vslot('indicative', 'present', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I sleep', 0)],
    [u('(I)', null), u('sleep', 0)],
    [u('Dorm', 0)],
    [u('(Eu)', null), u('dorm', 0)],
  ),
  verified: false,
};

const presentPerfect: Phrase = {
  id: 'present-perfect',
  title: 'I have eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Έχω φάει', lexeme: 'troo', slot: vslot('indicative', 'perfect') }],
  glosses: rows(
    [u('I have', p(0, 0)), u('eaten', p(0, 1))],
    [u('(I)', null), u('have', p(0, 0)), u('eaten', p(0, 1))],
    [u('Am', p(0, 0)), u('mâncat', p(0, 1))],
    [u('(Eu)', null), u('am', p(0, 0)), u('mâncat', p(0, 1))],
  ),
  verified: false,
};

const pastPerfect: Phrase = {
  id: 'past-perfect',
  title: 'I had eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Είχα φάει', lexeme: 'troo', slot: vslot('indicative', 'pluperfect') }],
  glosses: rows(
    [u('I had', p(0, 0)), u('eaten', p(0, 1))],
    [u('(I)', null), u('had', p(0, 0)), u('eaten', p(0, 1))],
    [u('Mâncasem', 0)],
    [u('(Eu)', null), u('mâncasem', 0)],
  ),
  verified: false,
};

const futurePerfect: Phrase = {
  id: 'future-perfect',
  title: 'I will have eaten',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Θα έχω φάει', lexeme: 'troo', slot: vslot('indicative', 'futurePerfect') }],
  glosses: rows(
    [u('I will', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2))],
    [u('(I)', null), u('will', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2))],
    [u('Voi', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2))],
    [u('(Eu)', null), u('voi', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2))],
  ),
  verified: false,
};

const wantToEat: Phrase = {
  id: 'want-to-eat',
  title: 'I want to eat',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να φάω', lexeme: 'troo', slot: vslot('subjunctive', 'aorist') },
  ],
  glosses: rows(
    [u('I want', 0), u('to', p(1, 0)), u('eat', p(1, 1))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('(I)', null), u('eat', p(1, 1))],
    [u('Vreau', 0), u('să', p(1, 0)), u('mănânc', p(1, 1))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('(eu)', null), u('mănânc', p(1, 1))],
  ),
  verified: false,
};

const wantToEatRegularly: Phrase = {
  id: 'want-to-eat-regularly',
  title: 'I want to eat (regularly)',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να τρώω', lexeme: 'troo', slot: vslot('subjunctive', 'present') },
  ],
  glosses: rows(
    [u('I want', 0), u('to', p(1, 0)), u('eat (regularly)', p(1, 1))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('(I)', null), u('eat-[ongoing]', p(1, 1))],
    [u('Vreau', 0), u('să', p(1, 0)), u('mănânc', p(1, 1))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('(eu)', null), u('mănânc', p(1, 1))],
  ),
  verified: false,
};

const haveWashedMyself: Phrase = {
  id: 'have-washed-myself',
  title: 'I have washed (myself)',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Έχω πλυθεί', lexeme: 'pleno', slot: vslot('indicative', 'perfect', 1, 'sg', 'mediopassive') }],
  glosses: rows(
    [u('I have', p(0, 0)), u('washed (myself)', p(0, 1))],
    [u('(I)', null), u('have', p(0, 0)), u('washed-[self]', p(0, 1))],
    [u('M-am spălat', 0)],
    [u('(Eu)', null), u('m-am spălat', 0)],
  ),
  verified: false,
};

export const PHRASES: Phrase[] = [
  orderingHotCoffee,
  orderingThreeCoffees,
  foxSentence,
  washingMyself,
  washingTheChild,
  sleeping,
  presentPerfect,
  pastPerfect,
  futurePerfect,
  wantToEat,
  wantToEatRegularly,
  haveWashedMyself,
];

