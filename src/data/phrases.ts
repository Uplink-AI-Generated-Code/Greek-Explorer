import type { Case, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, Slot, SlotOf, Tense, Token, Voice } from '../types';

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

/** A quantifier slot (beside a noun); `patch` sets the degree or the sense. */
const qslot = (gender: Gender, number: Num, c: Case, patch: Partial<SlotOf<'quantifier'>> = {}): Slot => ({
  pos: 'quantifier',
  gender,
  number,
  case: c,
  degree: 'plain',
  use: 'determiner',
  ...patch,
});

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

const wantALittleWater: Phrase = {
  id: 'want-a-little-water',
  title: 'I want a little water',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'λίγο', lexeme: 'ligos', slot: qslot('n', 'sg', 'acc'), agreesWith: 2 },
    { text: 'νερό', lexeme: 'nero', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('a little', 1), u('water', 2)],
    [u('(I)', null), u('want', 0), u('little', 1), u('water', 2)],
    [u('Vreau', 0), u('puțină', 1), u('apă', 2)],
    [u('(Eu)', null), u('vreau', 0), u('puțină', 1), u('apă', 2)],
  ),
  verified: false,
};

const wantSomeCoffees: Phrase = {
  id: 'want-some-coffees',
  title: 'I want some coffees',
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'μερικούς', lexeme: 'merikoi', slot: qslot('m', 'pl', 'acc'), agreesWith: 2 },
    { text: 'καφέδες', lexeme: 'kafes', slot: { pos: 'noun', number: 'pl', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('some', 1), u('coffees', 2)],
    [u('(I)', null), u('want', 0), u('some', 1), u('coffees', 2)],
    [u('Vreau', 0), u('niște', 1), u('cafele', 2)],
    [u('(Eu)', null), u('vreau', 0), u('niște', 1), u('cafele', 2)],
  ),
  verified: false,
};

const dontWantAnyCoffee: Phrase = {
  id: 'dont-want-any-coffee',
  title: "I don't want any coffee",
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Δεν θέλω', lexeme: 'thelo', slot: { ...vslot('indicative', 'present'), polarity: 'negative' } as Slot },
    { text: 'κανέναν', lexeme: 'kanenas', slot: qslot('m', 'sg', 'acc'), agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("I don't", p(0, 0)), u('want', p(0, 1)), u('any', 1), u('coffee', 2)],
    [u('(I)', null), u('not', p(0, 0)), u('want', p(0, 1)), u('no-[acc]', 1), u('coffee', 2)],
    [u('Nu', p(0, 0)), u('vreau', p(0, 1)), u('nicio', 1), u('cafea', 2)],
    [u('(Eu)', null), u('nu', p(0, 0)), u('vreau', p(0, 1)), u('nicio', 1), u('cafea', 2)],
  ),
  verified: false,
};

const wantMoreWater: Phrase = {
  id: 'want-more-water',
  title: 'I want more water',
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: verbSlot(1) },
    { text: 'περισσότερο', lexeme: 'polys', slot: qslot('n', 'sg', 'acc', { degree: 'comparative' }), agreesWith: 2 },
    { text: 'νερό', lexeme: 'nero', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I want', 0), u('more', 1), u('water', 2)],
    [u('(I)', null), u('want', 0), u('more', 1), u('water', 2)],
    [u('Vreau', 0), u('mai multă', 1), u('apă', 2)],
    [u('(Eu)', null), u('vreau', 0), u('mai multă', 1), u('apă', 2)],
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

const foxHasJumped: Phrase = {
  id: 'fox-has-jumped',
  title: 'The fox has jumped over the dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: [
    { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'έχει πηδήξει', lexeme: 'pidao', slot: vslot('indicative', 'perfect', 3) },
    { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 5 },
    { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 5 },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('The', 0), u('fox', 1), u('has', p(2, 0)), u('jumped', p(2, 1)), u('over', 3), u('the', 4), u('dog', 5)],
    [
      u('the-[nom]', 0), u('fox', 1), u('has', p(2, 0)), u('jumped', p(2, 1)),
      u('above-from', 3), u('the-[acc]', 4), u('dog-[acc]', 5),
    ],
    [seg(['vulpe', 1], ['a', 0]), u('a', p(2, 0)), u('sărit', p(2, 1)), u('peste', 3), seg(['câine', 5], ['le', 4])],
    [seg(['vulpe', 1], ['a', 0]), u('a', p(2, 0)), u('sărit', p(2, 1)), u('peste', 3), seg(['câine', 5], ['le', 4])],
  ),
  verified: false,
};

const ateTheBread: Phrase = {
  id: 'ate-the-bread',
  title: 'I ate the bread',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Έφαγα', lexeme: 'troo', slot: vslot('indicative', 'aorist') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I ate', 0), u('the', 1), u('bread', 2)],
    [u('(I)', null), u('ate', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Am mâncat', 0), seg(['pâine', 2], ['a', 1])],
    [u('(Eu)', null), u('am mâncat', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const eatLessBread: Phrase = {
  id: 'eat-less-bread',
  title: 'I will eat less bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Θα τρώω', lexeme: 'troo', slot: vslot('indicative', 'future') },
    { text: 'λιγότερο', lexeme: 'ligos', slot: qslot('n', 'sg', 'acc', { degree: 'comparative' }), agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I will', p(0, 0)), u('eat', p(0, 1)), u('less', 1), u('bread', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('eat', p(0, 1)), u('less', 1), u('bread', 2)],
    [u('Voi', p(0, 0)), u('mânca', p(0, 1)), u('mai puțină', 1), u('pâine', 2)],
    [u('(Eu)', null), u('voi', p(0, 0)), u('mânca', p(0, 1)), u('mai puțină', 1), u('pâine', 2)],
  ),
  verified: false,
};

const usedToEatBread: Phrase = {
  id: 'used-to-eat-bread',
  title: 'I used to eat a lot of bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Έτρωγα', lexeme: 'troo', slot: vslot('indicative', 'imperfect') },
    { text: 'πολύ', lexeme: 'polys', slot: qslot('n', 'sg', 'acc'), agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I used to eat', 0), u('a lot of', 1), u('bread', 2)],
    [u('(I)', null), u('was eating', 0), u('much', 1), u('bread', 2)],
    [u('Mâncam', 0), u('multă', 1), u('pâine', 2)],
    [u('(Eu)', null), u('mâncam', 0), u('multă', 1), u('pâine', 2)],
  ),
  verified: false,
};

const wantedACoffee: Phrase = {
  id: 'wanted-a-coffee',
  title: "I'd like a coffee",
  theme: 'Ordering',
  level: 'beginner',
  tokens: [
    { text: 'Ήθελα', lexeme: 'thelo', slot: vslot('indicative', 'imperfect') },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("I'd like", 0), u('a', 1), u('coffee', 2)],
    [u('(I)', null), u('wanted', 0), u('a-one', 1), u('coffee', 2)],
    [u('Aș vrea', 0), u('o', 1), u('cafea', 2)],
    [u('(Eu)', null), u('voiam', 0), u('o', 1), u('cafea', 2)],
  ),
  verified: false,
};

const foxWasJumping: Phrase = {
  id: 'fox-was-jumping',
  title: 'The fox was jumping over the dog',
  theme: 'The fox sentence',
  level: 'improver',
  tokens: [
    { text: 'Η', lexeme: 'def', slot: { pos: 'article', gender: 'f', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'αλεπού', lexeme: 'alepou', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'πηδούσε', lexeme: 'pidao', slot: vslot('indicative', 'imperfect', 3) },
    { text: 'πάνω από', lexeme: 'pano', slot: { pos: 'preposition' }, agreesWith: 5 },
    { text: 'τον', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'acc' }, agreesWith: 5 },
    { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('The', 0), u('fox', 1), u('was jumping', 2), u('over', 3), u('the', 4), u('dog', 5)],
    [u('the-[nom]', 0), u('fox', 1), u('was jumping', 2), u('above-from', 3), u('the-[acc]', 4), u('dog-[acc]', 5)],
    [seg(['vulpe', 1], ['a', 0]), u('sărea', 2), u('peste', 3), seg(['câine', 5], ['le', 4])],
    [seg(['vulpe', 1], ['a', 0]), u('sărea', 2), u('peste', 3), seg(['câine', 5], ['le', 4])],
  ),
  verified: false,
};

const eatTheBread: Phrase = {
  id: 'eat-the-bread',
  title: 'Eat the bread!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Φάε', lexeme: 'troo', slot: vslot('imperative', 'aorist', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Eat', 0), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('eat', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Mănâncă', 0), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('mănâncă', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const washTheChild: Phrase = {
  id: 'wash-the-child',
  title: 'Wash the child!',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [
    { text: 'Πλύνε', lexeme: 'pleno', slot: vslot('imperative', 'aorist', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'παιδί!', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Wash', 0), u('the', 1), u('child!', 2)],
    [u('(you)', null), u('wash', 0), u('the-[acc]', 1), u('child', 2)],
    [u('Spală', 0), seg(['copil', 2], ['ul!', 1])],
    [u('(tu)', null), u('spală', 0), seg(['copil', 2], ['ul', 1])],
  ),
  verified: false,
};

const keepEatingTheBread: Phrase = {
  id: 'keep-eating-the-bread',
  title: 'Keep eating the bread!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Τρώγε', lexeme: 'troo', slot: vslot('imperative', 'present', 2) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('Keep eating', 0), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('eat-[ongoing]', 0), u('the-[acc]', 1), u('bread', 2)],
    [u('Mănâncă', 0), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('mănâncă', 0), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const mayHaveEaten: Phrase = {
  id: 'may-have-eaten',
  title: 'He / she may have eaten',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Μπορεί', lexeme: 'mporei', slot: vslot('indicative', 'present', 3) },
    { text: 'να έχει φάει', lexeme: 'troo', slot: vslot('subjunctive', 'perfect', 3) },
  ],
  glosses: rows(
    [u('He / she may', 0), u('have', p(1, 1)), u('eaten', p(1, 2))],
    [u('it-is-possible', 0), u('that', p(1, 0)), u('(he/she)', null), u('has', p(1, 1)), u('eaten', p(1, 2))],
    [u('Poate', 0), u('să', p(1, 0)), u('fi', p(1, 1)), u('mâncat', p(1, 2))],
    [u('poate', 0), u('să', p(1, 0)), u('fi', p(1, 1)), u('mâncat', p(1, 2))],
  ),
  verified: false,
};

const wouldLikeACoffee: Phrase = {
  id: 'would-like-a-coffee',
  title: 'I would like a coffee',
  theme: 'Ordering',
  level: 'improver',
  tokens: [
    { text: 'Θα ήθελα', lexeme: 'thelo', slot: vslot('conditional', 'imperfect') },
    { text: 'έναν', lexeme: 'numeral', slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' }, agreesWith: 2 },
    { text: 'καφέ', lexeme: 'kafes', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I would', p(0, 0)), u('like', p(0, 1)), u('a', 1), u('coffee', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('wanted', p(0, 1)), u('a-one', 1), u('coffee', 2)],
    [u('Aș', p(0, 0)), u('vrea', p(0, 1)), u('o', 1), u('cafea', 2)],
    [u('(Eu)', null), u('aș', p(0, 0)), u('vrea', p(0, 1)), u('o', 1), u('cafea', 2)],
  ),
  verified: false,
};

const wouldHaveEaten: Phrase = {
  id: 'would-have-eaten-the-bread',
  title: 'I would have eaten the bread',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Θα είχα φάει', lexeme: 'troo', slot: vslot('conditional', 'pluperfect') },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u('I would', p(0, 0)), u('have', p(0, 1)), u('eaten', p(0, 2)), u('the', 1), u('bread', 2)],
    [u('(I)', null), u('will', p(0, 0)), u('had', p(0, 1)), u('eaten', p(0, 2)), u('the-[acc]', 1), u('bread', 2)],
    [u('Aș', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2)), seg(['pâine', 2], ['a', 1])],
    [u('(Eu)', null), u('aș', p(0, 0)), u('fi', p(0, 1)), u('mâncat', p(0, 2)), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const dontWantToGo: Phrase = {
  id: 'dont-want-to-go',
  title: "I don't want to go",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Δεν θέλω', lexeme: 'thelo', slot: { ...vslot('indicative', 'present'), polarity: 'negative' } as Slot },
    { text: 'να πάω', lexeme: 'pao', slot: vslot('subjunctive', 'aorist') },
  ],
  glosses: rows(
    [u("I don't", p(0, 0)), u('want', p(0, 1)), u('to', p(1, 0)), u('go', p(1, 1))],
    [u('(I)', null), u('not', p(0, 0)), u('want', p(0, 1)), u('that', p(1, 0)), u('(I)', null), u('go', p(1, 1))],
    [u('Nu', p(0, 0)), u('vreau', p(0, 1)), u('să', p(1, 0)), u('merg', p(1, 1))],
    [u('(Eu)', null), u('nu', p(0, 0)), u('vreau', p(0, 1)), u('să', p(1, 0)), u('(eu)', null), u('merg', p(1, 1))],
  ),
  verified: false,
};

const dontEatTheBread: Phrase = {
  id: 'dont-eat-the-bread',
  title: "Don't eat the bread!",
  theme: 'Eating',
  level: 'beginner',
  tokens: [
    { text: 'Μην φας', lexeme: 'troo', slot: { ...vslot('imperative', 'aorist', 2), polarity: 'negative' } as Slot },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί!', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
  ],
  glosses: rows(
    [u("Don't", p(0, 0)), u('eat', p(0, 1)), u('the', 1), u('bread!', 2)],
    [u('(you)', null), u('not', p(0, 0)), u('eat', p(0, 1)), u('the-[acc]', 1), u('bread', 2)],
    [u('Nu', p(0, 0)), u('mânca', p(0, 1)), seg(['pâine', 2], ['a!', 1])],
    [u('(tu)', null), u('nu', p(0, 0)), u('mânca', p(0, 1)), seg(['pâine', 2], ['a', 1])],
  ),
  verified: false,
};

const wantNotToGo: Phrase = {
  id: 'want-not-to-go',
  title: "I'd rather not go",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [
    { text: 'Θέλω', lexeme: 'thelo', slot: vslot('indicative', 'present') },
    { text: 'να μην πάω', lexeme: 'pao', slot: { ...vslot('subjunctive', 'aorist'), polarity: 'negative' } as Slot },
  ],
  glosses: rows(
    [u("I'd rather", 0), u('not', p(1, 1)), u('go', p(1, 2))],
    [u('(I)', null), u('want', 0), u('that', p(1, 0)), u('not', p(1, 1)), u('(I)', null), u('go', p(1, 2))],
    [u('Vreau', 0), u('să', p(1, 0)), u('nu', p(1, 1)), u('merg', p(1, 2))],
    [u('(Eu)', null), u('vreau', 0), u('să', p(1, 0)), u('nu', p(1, 1)), u('(eu)', null), u('merg', p(1, 2))],
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
  wantALittleWater, wantSomeCoffees, dontWantAnyCoffee, wantMoreWater,
  presentPerfect,
  pastPerfect,
  futurePerfect,
  wantToEat,
  wantToEatRegularly,
  dontWantToGo,
  foxHasJumped,
  haveWashedMyself,
  ateTheBread,
  eatLessBread, usedToEatBread,
  wantedACoffee,
  foxWasJumping,
  eatTheBread,
  dontEatTheBread,
  washTheChild,
  keepEatingTheBread,
  mayHaveEaten,
  wouldLikeACoffee,
  wouldHaveEaten,
  wantNotToGo,
];
