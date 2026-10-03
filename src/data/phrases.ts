import type { GlossRow, Phrase, Slot, Token } from '../types';

const verbSlot = (person: 1 | 2 | 3): Slot => ({
  pos: 'verb',
  person,
  number: 'sg',
  mood: 'indicative',
  tense: 'present',
  voice: 'active',
});

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

export const PHRASES: Phrase[] = [orderingHotCoffee, orderingThreeCoffees, foxSentence];
