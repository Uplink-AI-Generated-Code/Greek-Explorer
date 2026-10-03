import type { GlossRow, Phrase, Token } from '../types';

const tokens: Token[] = [
  {
    text: 'Θέλω',
    lexeme: 'thelo',
    slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
  },
  {
    text: 'έναν',
    lexeme: 'one',
    slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' },
    agreesWith: 3,
  },
  {
    text: 'ζεστό',
    lexeme: 'zestos',
    slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'acc' },
    agreesWith: 3,
  },
  { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];

const glosses: GlossRow[] = [
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
];

export const PHRASES: Phrase[] = [
  {
    id: 'ordering-hot-coffee',
    title: 'Ordering a hot coffee',
    theme: 'Ordering',
    level: 'beginner',
    tokens,
    glosses,
    verified: false,
  },
];
