import type { Case, Clitic, Gender, GlossRow, GlossUnit, Link, Mood, Num, Person, Phrase, PrepSense, Slot, SlotOf, Tense, Token, Voice } from '../types';

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

/** ψωμί: το in Greek, o in Romanian (pâine is feminine). */
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
/** παιδί: το in Greek, -l in Romanian (copil is masculine). */
const IT_CHILD: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'him / her / it' };
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };
/** A command to one person. */
const command = (tense: Tense, extra: Partial<SlotOf<'verb'>> = {}): Slot => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense, voice: 'active', ...extra,
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
    { text: 'Φάε', lexeme: 'troo', slot: vslot('imperative', 'aorist', 2), agreesWith: 2 },
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
    { text: 'Πλύνε', lexeme: 'pleno', slot: vslot('imperative', 'aorist', 2), agreesWith: 2 },
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
    { text: 'Τρώγε', lexeme: 'troo', slot: vslot('imperative', 'present', 2), agreesWith: 2 },
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

const ifIHadBread: Phrase = {
  id: 'if-i-had-bread',
  title: 'If I had bread, I would eat',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Αν', lexeme: 'an', slot: { pos: 'conjunction' } },
    { text: 'είχα', lexeme: 'echo', slot: vslot('indicative', 'imperfect') },
    { text: 'ψωμί,', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
    { text: 'θα έτρωγα', lexeme: 'troo', slot: vslot('conditional', 'imperfect') },
  ],
  glosses: rows(
    [u('If', 0), u('I had', 1), u('bread,', 2), u('I would', p(3, 0)), u('eat', p(3, 1))],
    [u('if', 0), u('(I)', null), u('had', 1), u('bread', 2), u('(I)', null), u('will', p(3, 0)), u('ate', p(3, 1))],
    [u('Dacă', 0), u('aș avea', 1), u('pâine,', 2), u('aș', p(3, 0)), u('mânca', p(3, 1))],
    [u('dacă', 0), u('(eu)', null), u('aveam', 1), u('pâine', 2), u('(eu)', null), u('aș', p(3, 0)), u('mânca', p(3, 1))],
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

const childIsWashed: Phrase = {
  id: 'child-is-washed',
  title: 'The child is washed',
  theme: 'Daily life',
  level: 'improver',
  tokens: [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'παιδί', lexeme: 'paidi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'είναι', lexeme: 'eimai', slot: vslot('indicative', 'present', 3) },
    { text: 'πλυμένο', lexeme: 'plymenos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
  ],
  glosses: rows(
    [u('The', 0), u('child', 1), u('is', 2), u('washed', 3)],
    [u('the-[nom]', 0), u('child', 1), u('is', 2), u('washed-[n]', 3)],
    [seg(['copil', 1], ['ul', 0]), u('este', 2), u('spălat', 3)],
    [seg(['copil', 1], ['ul', 0]), u('este', 2), u('spălat', 3)],
  ),
  verified: false,
};

const breadIsBaked: Phrase = {
  id: 'bread-is-baked',
  title: 'The bread is baked',
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'είναι', lexeme: 'eimai', slot: vslot('indicative', 'present', 3) },
    { text: 'ψημένο', lexeme: 'psimenos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
  ],
  glosses: rows(
    [u('The', 0), u('bread', 1), u('is', 2), u('baked', 3)],
    [u('the-[nom]', 0), u('bread', 1), u('is', 2), u('baked-[n]', 3)],
    [seg(['pâine', 1], ['a', 0]), u('este', 2), u('coaptă', 3)],
    [seg(['pâine', 1], ['a', 0]), u('este', 2), u('coaptă', 3)],
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
    { text: 'Μην φας', lexeme: 'troo', slot: { ...vslot('imperative', 'aorist', 2), polarity: 'negative' } as Slot, agreesWith: 2 },
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

const eatIt: Phrase = {
  id: 'eat-it',
  title: 'Eat it!',
  theme: 'Eating',
  level: 'improver',
  tokens: [{ text: 'Φάε το!', lexeme: 'troo', slot: command('aorist', { clitics: [IT] }) }],
  glosses: rows(
    [u('Eat', p(0, 0)), u('it!', p(0, 1))],
    [u('(you)', null), u('eat', p(0, 0)), u('it-[acc]', p(0, 1))],
    [seg(['Mănâncă', p(0, 0)], ['-o!', p(0, 1)])],
    [u('(tu)', null), seg(['mănâncă', p(0, 0)], ['-o', p(0, 1)])],
  ),
  verified: false,
};

const washIt: Phrase = {
  id: 'wash-it',
  title: 'Wash him / her / it!',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Πλύνε το!', lexeme: 'pleno', slot: command('aorist', { clitics: [IT_CHILD] }) }],
  glosses: rows(
    [u('Wash', p(0, 0)), u('him / her / it!', p(0, 1))],
    [u('(you)', null), u('wash', p(0, 0)), u('it-[acc]', p(0, 1))],
    [seg(['Spală', p(0, 0)], ['-l!', p(0, 1)])],
    [u('(tu)', null), seg(['spală', p(0, 0)], ['-l', p(0, 1)])],
  ),
  verified: false,
};

const giveItToMe: Phrase = {
  id: 'give-it-to-me',
  title: 'Give it to me!',
  theme: 'Daily life',
  level: 'improver',
  tokens: [{ text: 'Δώσε μού το!', lexeme: 'dino', slot: command('aorist', { clitics: [ME, IT] }) }],
  glosses: rows(
    [u('Give', p(0, 0)), u('it', p(0, 2)), u('to me!', p(0, 1))],
    [u('(you)', null), u('give', p(0, 0)), u('me-[gen]', p(0, 1)), u('it-[acc]', p(0, 2))],
    [seg(['Dă', p(0, 0)], ['-mi', p(0, 1)], ['-o!', p(0, 2)])],
    [u('(tu)', null), seg(['dă', p(0, 0)], ['-mi', p(0, 1)], ['-o', p(0, 2)])],
  ),
  verified: false,
};

const dontEatIt: Phrase = {
  id: 'dont-eat-it',
  title: "Don't eat it!",
  theme: 'Eating',
  level: 'improver',
  tokens: [
    { text: 'Μην το φας!', lexeme: 'troo', slot: command('aorist', { clitics: [IT], polarity: 'negative' }) },
  ],
  glosses: rows(
    [u("Don't", p(0, 0)), u('eat', p(0, 2)), u('it!', p(0, 1))],
    [u('(you)', null), u('not', p(0, 0)), u('it-[acc]', p(0, 1)), u('eat', p(0, 2))],
    [u('Nu', p(0, 0)), u('o', p(0, 1)), u('mânca!', p(0, 2))],
    [u('(tu)', null), u('nu', p(0, 0)), u('o', p(0, 1)), u('mânca', p(0, 2))],
  ),
  verified: false,
};

const eatBare: Phrase = {
  id: 'eat-bare',
  title: 'Eat!',
  theme: 'Eating',
  level: 'beginner',
  tokens: [{ text: 'Φάε!', lexeme: 'troo', slot: command('aorist') }],
  glosses: rows(
    [u('Eat!', 0)],
    [u('(you)', null), u('eat', 0)],
    [u('Mănâncă!', 0)],
    [u('(tu)', null), u('mănâncă', 0)],
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

/** A question word that never changes (τι, πού, πότε, γιατί, πώς). */
const iq: Slot = { pos: 'interrogative' };
/** A hortative slot: ας + the subjunctive form. */
const hslot = (tense: Tense, person: Person, number: Num, negative = false): Slot => ({
  ...(vslot('hortative', tense, person, number) as SlotOf<'verb'>),
  ...(negative ? { polarity: 'negative' as const } : {}),
});
const present = (person: Person, number: Num = 'sg', negative = false): Slot => ({
  ...(vslot('indicative', 'present', person, number) as SlotOf<'verb'>),
  ...(negative ? { polarity: 'negative' as const } : {}),
});

const whatDoYouWant: Phrase = {
  id: 'what-do-you-want',
  title: 'What do you want?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Τι', lexeme: 'ti', slot: iq },
    { text: 'θέλεις;', lexeme: 'thelo', slot: present(2) },
  ],
  glosses: rows(
    [u('What', 0), u('do', null), u('you want?', 1)],
    [u('what', 0), u('(you)', null), u('want', 1)],
    [u('Ce', 0), u('vrei?', 1)],
    [u('ce', 0), u('(tu)', null), u('vrei', 1)],
  ),
  verified: false,
};

const whereAreYouGoing: Phrase = {
  id: 'where-are-you-going',
  title: 'Where are you going?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Πού', lexeme: 'pou', slot: iq },
    { text: 'πας;', lexeme: 'pao', slot: present(2) },
  ],
  glosses: rows(
    [u('Where', 0), u('are you going?', 1)],
    [u('where', 0), u('(you)', null), u('go', 1)],
    [u('Unde', 0), u('mergi?', 1)],
    [u('unde', 0), u('(tu)', null), u('mergi', 1)],
  ),
  verified: false,
};

const whenWillYouEat: Phrase = {
  id: 'when-will-you-eat',
  title: 'When will you eat?',
  theme: 'Questions',
  level: 'improver',
  tokens: [
    { text: 'Πότε', lexeme: 'pote', slot: iq },
    { text: 'θα φας;', lexeme: 'troo', slot: vslot('indicative', 'futureSimple', 2) },
  ],
  glosses: rows(
    [u('When', 0), u('will you', p(1, 0)), u('eat?', p(1, 1))],
    [u('when', 0), u('will', p(1, 0)), u('(you)', null), u('eat', p(1, 1))],
    [u('Când', 0), u('vei', p(1, 0)), u('mânca?', p(1, 1))],
    [u('când', 0), u('vei', p(1, 0)), u('mânca', p(1, 1))],
  ),
  verified: false,
};

const whyArentYouEating: Phrase = {
  id: 'why-arent-you-eating',
  title: "Why aren't you eating?",
  theme: 'Questions',
  level: 'improver',
  tokens: [
    { text: 'Γιατί', lexeme: 'giati', slot: iq },
    { text: 'δεν τρως;', lexeme: 'troo', slot: present(2, 'sg', true) },
  ],
  glosses: rows(
    [u('Why', 0), u("aren't you", p(1, 0)), u('eating?', p(1, 1))],
    [u('why', 0), u('not', p(1, 0)), u('(you)', null), u('eat', p(1, 1))],
    [u('De ce', 0), u('nu', p(1, 0)), u('mănânci?', p(1, 1))],
    [u('de ce', 0), u('nu', p(1, 0)), u('(tu)', null), u('mănânci', p(1, 1))],
  ),
  verified: false,
};

const howAreYou: Phrase = {
  id: 'how-are-you',
  title: 'How are you?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Πώς', lexeme: 'pos-how', slot: iq },
    { text: 'είσαι;', lexeme: 'eimai', slot: present(2) },
  ],
  glosses: rows(
    [u('How', 0), u('are you?', 1)],
    [u('how', 0), u('(you)', null), u('are', 1)],
    [u('Cum', 0), u('ești?', 1)],
    [u('cum', 0), u('(tu)', null), u('ești', 1)],
  ),
  verified: false,
};

const whoIsIt: Phrase = {
  id: 'who-is-it',
  title: 'Who is it?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Ποιος', lexeme: 'poios', slot: qslot('m', 'sg', 'nom', { use: 'pronoun' }) },
    { text: 'είναι;', lexeme: 'eimai', slot: present(3) },
  ],
  glosses: rows(
    [u('Who', 0), u('is it?', 1)],
    [u('who', 0), u('is', 1)],
    [u('Cine', 0), u('este?', 1)],
    [u('cine', 0), u('este', 1)],
  ),
  verified: false,
};

const howMuchBread: Phrase = {
  id: 'how-much-bread',
  title: 'How much bread do you want?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Πόσο', lexeme: 'posos', slot: qslot('n', 'sg', 'acc'), agreesWith: 1 },
    { text: 'ψωμί', lexeme: 'psomi', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
    { text: 'θέλεις;', lexeme: 'thelo', slot: present(2) },
  ],
  glosses: rows(
    [u('How much', 0), u('bread', 1), u('do', null), u('you want?', 2)],
    [u('how-much', 0), u('bread', 1), u('(you)', null), u('want', 2)],
    [u('Câtă', 0), u('pâine', 1), u('vrei?', 2)],
    [u('câtă', 0), u('pâine', 1), u('(tu)', null), u('vrei', 2)],
  ),
  verified: false,
};

const whereAreYouFrom: Phrase = {
  id: 'where-are-you-from',
  title: 'Where are you from?',
  theme: 'Questions',
  level: 'improver',
  tokens: [
    { text: 'Από', lexeme: 'apo', slot: { pos: 'preposition' }, agreesWith: 1 },
    { text: 'πού', lexeme: 'pou', slot: iq },
    { text: 'είσαι;', lexeme: 'eimai', slot: present(2) },
  ],
  glosses: rows(
    [u('Where', 1), u('are you', 2), u('from?', 0)],
    [u('from', 0), u('where', 1), u('(you)', null), u('are', 2)],
    [u('De', 0), u('unde', 1), u('ești?', 2)],
    [u('de', 0), u('unde', 1), u('(tu)', null), u('ești', 2)],
  ),
  verified: false,
};

const untilWhenWillYouGo: Phrase = {
  id: 'until-when-will-you-go',
  title: 'Until when will you go?',
  theme: 'Questions',
  level: 'improver',
  tokens: [
    { text: 'Μέχρι', lexeme: 'mexri', slot: { pos: 'preposition' }, agreesWith: 1 },
    { text: 'πότε', lexeme: 'pote', slot: iq },
    { text: 'θα πας;', lexeme: 'pao', slot: vslot('indicative', 'futureSimple', 2) },
  ],
  glosses: rows(
    [u('Until', 0), u('when', 1), u('will you', p(2, 0)), u('go?', p(2, 1))],
    [u('until', 0), u('when', 1), u('will', p(2, 0)), u('(you)', null), u('go', p(2, 1))],
    [u('Până', 0), u('când', 1), u('vei', p(2, 0)), u('merge?', p(2, 1))],
    [u('până', 0), u('când', 1), u('vei', p(2, 0)), u('merge', p(2, 1))],
  ),
  verified: false,
};

const whatTimeIsIt: Phrase = {
  id: 'what-time-is-it',
  title: 'What time is it?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Τι', lexeme: 'ti', slot: iq },
    { text: 'ώρα', lexeme: 'ora', slot: { pos: 'noun', number: 'sg', case: 'nom' } },
    { text: 'είναι;', lexeme: 'eimai', slot: present(3) },
  ],
  glosses: rows(
    [u('What', 0), u('time', 1), u('is it?', 2)],
    [u('what', 0), u('hour', 1), u('is', 2)],
    [u('Ce', 0), u('oră', 1), u('este?', 2)],
    [u('ce', 0), u('oră', 1), u('este', 2)],
  ),
  verified: false,
};

const howMuchIsIt: Phrase = {
  id: 'how-much-is-it',
  title: 'How much is it?',
  theme: 'Questions',
  level: 'beginner',
  tokens: [
    { text: 'Πόσο', lexeme: 'posos', slot: qslot('n', 'sg', 'acc', { use: 'pronoun' }) },
    { text: 'κάνει;', lexeme: 'kano', slot: present(3) },
  ],
  glosses: rows(
    [u('How much', 0), u('is it?', 1)],
    [u('how-much', 0), u('(it)', null), u('does', 1)],
    [u('Cât', 0), u('costă?', 1)],
    [u('cât', 0), u('(el)', null), u('face', 1)],
  ),
  verified: false,
};

const letsEat: Phrase = {
  id: 'lets-eat',
  title: "Let's eat!",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [{ text: 'Ας φάμε!', lexeme: 'troo', slot: hslot('aorist', 1, 'pl') }],
  glosses: rows(
    [u("Let's", p(0, 0)), u('eat!', p(0, 1))],
    [u('let', p(0, 0)), u('(we)', null), u('eat', p(0, 1))],
    [u('Să', p(0, 0)), u('mâncăm!', p(0, 1))],
    [u('să', p(0, 0)), u('(noi)', null), u('mâncăm', p(0, 1))],
  ),
  verified: false,
};

const letHimEat: Phrase = {
  id: 'let-him-eat',
  title: 'Let him / her eat',
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [{ text: 'Ας φάει.', lexeme: 'troo', slot: hslot('aorist', 3, 'sg') }],
  glosses: rows(
    [u('Let him / her', p(0, 0)), u('eat.', p(0, 1))],
    [u('let', p(0, 0)), u('(he/she)', null), u('eat', p(0, 1))],
    [u('Să', p(0, 0)), u('mănânce.', p(0, 1))],
    [u('să', p(0, 0)), u('(el/ea)', null), u('mănânce', p(0, 1))],
  ),
  verified: false,
};

const letsNotGo: Phrase = {
  id: 'lets-not-go',
  title: "Let's not go",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [{ text: 'Ας μην πάμε.', lexeme: 'pao', slot: hslot('aorist', 1, 'pl', true) }],
  glosses: rows(
    [u("Let's", p(0, 0)), u('not', p(0, 1)), u('go.', p(0, 2))],
    [u('let', p(0, 0)), u('not', p(0, 1)), u('(we)', null), u('go', p(0, 2))],
    [u('Să', p(0, 0)), u('nu', p(0, 1)), u('mergem.', p(0, 2))],
    [u('să', p(0, 0)), u('nu', p(0, 1)), u('(noi)', null), u('mergem', p(0, 2))],
  ),
  verified: false,
};

/** The same verb slot with pronouns (spec 4.3). */
const withClitics = (slot: Slot, clitics: Clitic[]): Slot => ({ ...(slot as SlotOf<'verb'>), clitics });

const whatIsItCalled: Phrase = {
  id: 'what-is-it-called',
  title: 'What is it called?',
  theme: 'Daily life',
  level: 'beginner',
  tokens: [
    { text: 'Πώς', lexeme: 'pos-how', slot: iq },
    { text: 'το λένε;', lexeme: 'lego', slot: withClitics(present(3, 'pl'), [IT_CHILD]) },
  ],
  glosses: rows(
    [u('What', 0), u('is', null), u('it', p(1, 0)), u('called?', p(1, 1))],
    [u('how', 0), u('it', p(1, 0)), u('(they)', null), u('say', p(1, 1))],
    [u('Cum', 0), u('se', null), u('numește?', p(1, 1))],
    [u('cum', 0), u('îl', p(1, 0)), u('zic', p(1, 1))],
  ),
  verified: false,
};

const letsEatIt: Phrase = {
  id: 'lets-eat-it',
  title: "Let's eat it!",
  theme: 'Wishes and possibility',
  level: 'improver',
  tokens: [{ text: 'Ας το φάμε!', lexeme: 'troo', slot: withClitics(hslot('aorist', 1, 'pl'), [IT]) }],
  glosses: rows(
    [u("Let's", p(0, 0)), u('eat', p(0, 2)), u('it!', p(0, 1))],
    [u('let', p(0, 0)), u('it', p(0, 1)), u('(we)', null), u('eat', p(0, 2))],
    [u('Să', p(0, 0)), u('o', p(0, 1)), u('mâncăm!', p(0, 2))],
    [u('să', p(0, 0)), u('o', p(0, 1)), u('(noi)', null), u('mâncăm', p(0, 2))],
  ),
  verified: false,
};

const willYouGiveItToMe: Phrase = {
  id: 'will-you-give-it-to-me',
  title: 'Will you give it to me?',
  theme: 'Daily life',
  level: 'improver',
  tokens: [
    { text: 'Θα μου το δώσεις;', lexeme: 'dino', slot: withClitics(vslot('indicative', 'futureSimple', 2), [ME, IT]) },
  ],
  glosses: rows(
    [u('Will you', p(0, 0)), u('give', p(0, 3)), u('it', p(0, 2)), u('to me?', p(0, 1))],
    [u('will', p(0, 0)), u('to-me', p(0, 1)), u('it', p(0, 2)), u('(you)', null), u('give', p(0, 3))],
    [seg(['Mi', p(0, 1)], ['-o', p(0, 2)]), u('vei', p(0, 0)), u('da?', p(0, 3))],
    [u('(tu)', null), seg(['mi', p(0, 1)], ['-o', p(0, 2)]), u('vei', p(0, 0)), u('da', p(0, 3))],
  ),
  verified: false,
};

/** σε with the meaning a phrase uses; the token text is the fused form (στο, στον …). */
const preposition = (sense: PrepSense): Slot => ({ pos: 'preposition', sense });
const accSg = { pos: 'noun', number: 'sg', case: 'acc' } as const;
const nomSg = { pos: 'noun', number: 'sg', case: 'nom' } as const;
const theDog: Token[] = [
  { text: 'Ο', lexeme: 'def', slot: { pos: 'article', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 1 },
  { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
];

const goingHome: Phrase = {
  id: 'going-home',
  title: "I'm going home",
  theme: 'Places',
  level: 'beginner',
  tokens: [
    { text: 'Πάω', lexeme: 'pao', slot: present(1) },
    { text: 'στο', lexeme: 'se', slot: preposition('to'), agreesWith: 2 },
    { text: 'σπίτι', lexeme: 'spiti', slot: accSg },
  ],
  glosses: rows(
    [u("I'm going", 0), u('home', 2)],
    [u('(I)', null), u('go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('house', 2)],
    [u('Merg', 0), u('acasă', 2)],
    [u('(eu)', null), u('merg', 0), u('la', p(1, 0)), seg(['cas', 2], ['a', p(1, 1)])],
  ),
  verified: false,
};

const atHome: Phrase = {
  id: 'at-home',
  title: "I'm at home",
  theme: 'Places',
  level: 'beginner',
  tokens: [
    { text: 'Είμαι', lexeme: 'eimai', slot: present(1) },
    { text: 'στο', lexeme: 'se', slot: preposition('at'), agreesWith: 2 },
    { text: 'σπίτι', lexeme: 'spiti', slot: accSg },
  ],
  glosses: rows(
    [u("I'm", 0), u('at', p(1, 0)), u('home', 2)],
    [u('(I)', null), u('am', 0), u('at', p(1, 0)), u('the', p(1, 1)), u('house', 2)],
    [u('Sunt', 0), u('acasă', 2)],
    [u('(eu)', null), u('sunt', 0), u('la', p(1, 0)), seg(['cas', 2], ['a', p(1, 1)])],
  ),
  verified: false,
};

const goToTheSea: Phrase = {
  id: 'go-to-the-sea',
  title: 'Shall we go to the sea?',
  theme: 'Places',
  level: 'improver',
  tokens: [
    { text: 'Πάμε', lexeme: 'pao', slot: present(1, 'pl') },
    { text: 'στη', lexeme: 'se', slot: preposition('to'), agreesWith: 2 },
    { text: 'θάλασσα;', lexeme: 'thalassa', slot: accSg },
  ],
  glosses: rows(
    [u('Shall we go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('sea?', 2)],
    [u('(we)', null), u('go', 0), u('to', p(1, 0)), u('the', p(1, 1)), u('sea', 2)],
    [u('Mergem', 0), u('la', p(1, 0)), u('mare?', 2)],
    [u('(noi)', null), u('mergem', 0), u('la', p(1, 0)), seg(['mare', 2], ['a', p(1, 1)])],
  ),
  verified: false,
};

const dogOnTheRoad: Phrase = {
  id: 'dog-on-the-road',
  title: 'The dog is on the road',
  theme: 'Places',
  level: 'improver',
  tokens: [
    ...theDog,
    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
    { text: 'στον', lexeme: 'se', slot: preposition('on'), agreesWith: 4 },
    { text: 'δρόμο', lexeme: 'dromos', slot: accSg },
  ],
  glosses: rows(
    [u('The', 0), u('dog', 1), u('is', 2), u('on', p(3, 0)), u('the', p(3, 1)), u('road', 4)],
    [u('the', 0), u('dog', 1), u('is', 2), u('on', p(3, 0)), u('the', p(3, 1)), u('road', 4)],
    [seg(['Câine', 1], ['le', 0]), u('este', 2), u('pe', p(3, 0)), u('drum', 4)],
    [seg(['câine', 1], ['le', 0]), u('este', 2), u('pe', p(3, 0)), seg(['drum', 4], ['ul', p(3, 1)])],
  ),
  verified: false,
};

const giveBreadToTheChild: Phrase = {
  id: 'give-bread-to-the-child',
  title: 'I give the bread to the child',
  theme: 'Daily life',
  level: 'improver',
  tokens: [
    { text: 'Δίνω', lexeme: 'dino', slot: present(1) },
    { text: 'το', lexeme: 'def', slot: { pos: 'article', gender: 'n', number: 'sg', case: 'acc' }, agreesWith: 2 },
    { text: 'ψωμί', lexeme: 'psomi', slot: accSg },
    { text: 'στο', lexeme: 'se', slot: preposition('person'), agreesWith: 4 },
    { text: 'παιδί', lexeme: 'paidi', slot: accSg },
  ],
  glosses: rows(
    [u('I give', 0), u('the', 1), u('bread', 2), u('to', p(3, 0)), u('the', p(3, 1)), u('child', 4)],
    [u('(I)', null), u('give', 0), u('the', 1), u('bread', 2), u('to', p(3, 0)), u('the', p(3, 1)), u('child', 4)],
    [u('Dau', 0), seg(['pâine', 2], ['a', 1]), u('copilului', 4)],
    [u('(eu)', null), u('dau', 0), seg(['pâine', 2], ['a', 1]), u('la', p(3, 0)), seg(['copil', 4], ['ul', p(3, 1)])],
  ),
  verified: false,
};

const dogJumpsIntoTheWater: Phrase = {
  id: 'dog-jumps-into-the-water',
  title: 'The dog jumps into the water',
  theme: 'Places',
  level: 'improver',
  tokens: [
    ...theDog,
    { text: 'πηδάει', lexeme: 'pidao', slot: present(3) },
    { text: 'στο', lexeme: 'se', slot: preposition('in'), agreesWith: 4 },
    { text: 'νερό', lexeme: 'nero', slot: accSg },
  ],
  glosses: rows(
    [u('The', 0), u('dog', 1), u('jumps', 2), u('into', p(3, 0)), u('the', p(3, 1)), u('water', 4)],
    [u('the', 0), u('dog', 1), u('jumps', 2), u('in', p(3, 0)), u('the', p(3, 1)), u('water', 4)],
    [seg(['Câine', 1], ['le', 0]), u('sare', 2), u('în', p(3, 0)), u('apă', 4)],
    [seg(['câine', 1], ['le', 0]), u('sare', 2), u('în', p(3, 0)), seg(['ap', 4], ['a', p(3, 1)])],
  ),
  verified: false,
};

/** The weak possessive after a noun (μου, σου …); `gender` is for a third-person singular possessor. */
const possessive = (person: Person, number: Num, gender?: Gender): Slot => ({
  pos: 'possessive',
  person,
  number,
  ...(gender ? { gender } : {}),
});
const article = (gender: Gender, c: Case, agreesWith: number): Token => ({
  text: '',
  lexeme: 'def',
  slot: { pos: 'article', gender, number: 'sg', case: c },
  agreesWith,
});

const myHouse: Phrase = {
  id: 'my-house',
  title: 'My house',
  theme: 'Possession',
  level: 'beginner',
  tokens: [
    { ...article('n', 'nom', 1), text: 'Το' },
    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 1 },
  ],
  glosses: rows(
    [u('My', 2), u('house', 1)],
    [u('the', 0), u('house', 1), u('my', 2)],
    [seg(['Cas', 1], ['a', 0]), u('mea', 2)],
    [seg(['cas', 1], ['a', 0]), u('mea', 2)],
  ),
  verified: false,
};

const ourSea: Phrase = {
  id: 'our-sea',
  title: 'Our sea',
  theme: 'Possession',
  level: 'improver',
  tokens: [
    { ...article('f', 'nom', 1), text: 'Η' },
    { text: 'θάλασσά', lexeme: 'thalassa', slot: nomSg },
    { text: 'μας', lexeme: 'possessive', slot: possessive(1, 'pl'), agreesWith: 1 },
  ],
  glosses: rows(
    [u('Our', 2), u('sea', 1)],
    [u('the', 0), u('sea', 1), u('our', 2)],
    [seg(['Mare', 1], ['a', 0]), u('noastră', 2)],
    [seg(['mare', 1], ['a', 0]), u('noastră', 2)],
  ),
  verified: false,
};

const yourDog: Phrase = {
  id: 'your-dog',
  title: 'Your dog',
  theme: 'Possession',
  level: 'beginner',
  tokens: [
    { ...article('m', 'nom', 1), text: 'Ο' },
    { text: 'σκύλος', lexeme: 'skylos', slot: nomSg },
    { text: 'σου', lexeme: 'possessive', slot: possessive(2, 'sg'), agreesWith: 1 },
  ],
  glosses: rows(
    [u('Your', 2), u('dog', 1)],
    [u('the', 0), u('dog', 1), u('your', 2)],
    [seg(['Câine', 1], ['le', 0]), u('tău', 2)],
    [seg(['câine', 1], ['le', 0]), u('tău', 2)],
  ),
  verified: false,
};

const hisChild: Phrase = {
  id: 'his-child',
  title: 'His child',
  theme: 'Possession',
  level: 'beginner',
  tokens: [
    { ...article('n', 'nom', 1), text: 'Το' },
    { text: 'παιδί', lexeme: 'paidi', slot: nomSg },
    { text: 'του', lexeme: 'possessive', slot: possessive(3, 'sg', 'm'), agreesWith: 1 },
  ],
  glosses: rows(
    [u('His', 2), u('child', 1)],
    [u('the', 0), u('child', 1), u('his', 2)],
    [seg(['Copil', 1], ['ul', 0]), u('lui', 2)],
    [seg(['copil', 1], ['ul', 0]), u('lui', 2)],
  ),
  verified: false,
};

const whereIsYourHouse: Phrase = {
  id: 'where-is-your-house',
  title: 'Where is your house?',
  theme: 'Possession',
  level: 'improver',
  tokens: [
    { text: 'Πού', lexeme: 'pou', slot: iq },
    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
    { ...article('n', 'nom', 3), text: 'το' },
    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
    { text: 'σου;', lexeme: 'possessive', slot: possessive(2, 'sg'), agreesWith: 3 },
  ],
  glosses: rows(
    [u('Where', 0), u('is', 1), u('your', 4), u('house?', 3)],
    [u('where', 0), u('is', 1), u('the', 2), u('house', 3), u('your', 4)],
    [u('Unde', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('ta?', 4)],
    [u('unde', 0), u('este', 1), seg(['cas', 3], ['a', 2]), u('ta', 4)],
  ),
  verified: false,
};

const myHotCoffee: Phrase = {
  id: 'my-hot-coffee',
  title: 'My hot coffee',
  theme: 'Possession',
  level: 'improver',
  tokens: [
    { ...article('m', 'nom', 2), text: 'Ο' },
    { text: 'ζεστός', lexeme: 'zestos', slot: { pos: 'adjective', gender: 'm', number: 'sg', case: 'nom' }, agreesWith: 2 },
    { text: 'καφές', lexeme: 'kafes', slot: nomSg },
    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 2 },
  ],
  glosses: rows(
    [u('My', 3), u('hot', 1), u('coffee', 2)],
    [u('the', 0), u('hot', 1), u('coffee', 2), u('my', 3)],
    [seg(['Cafea', 2], ['ua', 0]), u('mea', 3), u('caldă', 1)],
    [seg(['cafea', 2], ['ua', 0]), u('mea', 3), u('caldă', 1)],
  ),
  verified: false,
};

const myOwnHouse: Phrase = {
  id: 'my-own-house',
  title: 'My own house',
  theme: 'Possession',
  level: 'improver',
  tokens: [
    { ...article('n', 'nom', 3), text: 'Το' },
    { text: 'δικό', lexeme: 'dikos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 3 },
    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 3 },
    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
  ],
  glosses: rows(
    [u('My', 2), u('own', 1), u('house', 3)],
    [u('the', 0), u('own', 1), u('my', 2), u('house', 3)],
    [u('Propria', 1), u('mea', 2), u('casă', 3)],
    [u('propria', 1), u('mea', 2), u('casă', 3)],
  ),
  verified: false,
};

const theHouseIsMine: Phrase = {
  id: 'the-house-is-mine',
  title: 'The house is mine',
  theme: 'Possession',
  level: 'improver',
  tokens: [
    { ...article('n', 'nom', 1), text: 'Το' },
    { text: 'σπίτι', lexeme: 'spiti', slot: nomSg },
    { text: 'είναι', lexeme: 'eimai', slot: present(3) },
    { text: 'δικό', lexeme: 'dikos', slot: { pos: 'adjective', gender: 'n', number: 'sg', case: 'nom' }, agreesWith: 1 },
    { text: 'μου', lexeme: 'possessive', slot: possessive(1, 'sg'), agreesWith: 1 },
  ],
  glosses: rows(
    [u('The', 0), u('house', 1), u('is', 2), u('mine', 3)],
    [u('the', 0), u('house', 1), u('is', 2), u('own', 3), u('my', 4)],
    [seg(['Cas', 1], ['a', 0]), u('este', 2), u('a', 3), u('mea', 4)],
    [seg(['cas', 1], ['a', 0]), u('este', 2), u('a', 3), u('mea', 4)],
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
  ifIHadBread,
  wouldHaveEaten,
  childIsWashed,
  breadIsBaked,
  eatIt,
  washIt,
  giveItToMe,
  dontEatIt,
  eatBare,
  wantNotToGo,
  whatDoYouWant,
  whereAreYouGoing,
  whenWillYouEat,
  whyArentYouEating,
  howAreYou,
  whoIsIt,
  howMuchBread,
  whereAreYouFrom,
  untilWhenWillYouGo,
  whatTimeIsIt,
  howMuchIsIt,
  letsEat,
  letHimEat,
  letsNotGo,
  whatIsItCalled,
  letsEatIt,
  willYouGiveItToMe,
  goingHome,
  atHome,
  goToTheSea,
  dogOnTheRoad,
  giveBreadToTheChild,
  dogJumpsIntoTheWater,
  myHouse,
  ourSea,
  yourDog,
  hisChild,
  whereIsYourHouse,
  myHotCoffee,
  myOwnHouse,
  theHouseIsMine,
];
