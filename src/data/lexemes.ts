import type {
  GreekFreeRelative,
  GreekRelative,
  GreekAdverb,
  CellOverride,
  GreekAdjective,
  GreekArticle,
  GreekClitic,
  GreekConjunction,
  GreekInterrogative,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
  GreekPossessive,
  GreekPreposition,
  GreekQuantifier,
  GreekVerb,
  IrregularNote,
  RoQuantifierCell,
  Stored,
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
  animate: true,
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
  animate: true,
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
  animate: true,
  lemma: 'παιδί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  enPronoun: 'him / her / it',
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

const psomi: GreekNoun = {
  id: 'psomi',
  pos: 'noun',
  lemma: 'ψωμί',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i',
  mass: true,
  stems: { sg: 'ψωμ', pl: 'ψωμ' },
  ro: {
    lemma: 'pâine',
    gender: 'f',
    forms: {
      sg: { definite: 'pâinea', indefinite: 'o pâine', genDefinite: 'pâinii', genIndefinite: 'unei pâini' },
      pl: { definite: 'pâinile', indefinite: 'pâini', genDefinite: 'pâinilor', genIndefinite: 'unor pâini' },
    },
    split: { sg: ['pâine', 'a'], pl: ['pâini', 'le'] },
  },
  en: { sg: 'bread', pl: 'bread' },
  note: 'Neuter in Greek, feminine in Romanian (pâine); "bread" has no gender and no plural in English.',
};

const nero: GreekNoun = {
  id: 'nero',
  pos: 'noun',
  lemma: 'νερό',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-o',
  mass: true,
  stems: { sg: 'νερ', pl: 'νερ' },
  ro: {
    lemma: 'apă',
    gender: 'f',
    forms: {
      sg: { definite: 'apa', indefinite: 'o apă', genDefinite: 'apei', genIndefinite: 'unei ape' },
      pl: { definite: 'apele', indefinite: 'ape', genDefinite: 'apelor', genIndefinite: 'unor ape' },
    },
    split: { sg: ['ap', 'a'], pl: ['ape', 'le'] },
  },
  en: { sg: 'water', pl: 'water' },
  note: 'Neuter in Greek, feminine in Romanian (apă); "water" has no gender and no plural in English.',
};

const ora: GreekNoun = {
  id: 'ora',
  pos: 'noun',
  lemma: 'ώρα',
  verified: { el: false, ro: false, en: false },
  gender: 'f',
  class: 'fem-a',
  stems: { sg: 'ώρ', pl: 'ώρ' },
  overrides: {
    'pl-gen': {
      stem: 'ωρ',
      ending: 'ών',
      note: { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive plural: ωρών, not ώρων.' },
    },
  },
  ro: {
    lemma: 'oră',
    gender: 'f',
    forms: {
      sg: { definite: 'ora', indefinite: 'o oră', genDefinite: 'orei', genIndefinite: 'unei ore' },
      pl: { definite: 'orele', indefinite: 'ore', genDefinite: 'orelor', genIndefinite: 'unor ore' },
    },
    split: { sg: ['or', 'a'], pl: ['ore', 'le'] },
  },
  en: { sg: 'hour', pl: 'hours' },
  note: 'Feminine in Greek and Romanian (oră). τι ώρα is literally "what hour"; English says "what time".',
};

const ACCENT_MOVES = { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive: σπιτιού, not σπίτιου.' };

const spiti: GreekNoun = {
  id: 'spiti',
  pos: 'noun',
  lemma: 'σπίτι',
  verified: { el: false, ro: false, en: false },
  gender: 'n',
  class: 'neut-i-stem',
  stems: { sg: 'σπίτ', pl: 'σπίτ' },
  overrides: {
    'sg-gen': { stem: 'σπιτ', ending: 'ιού', note: ACCENT_MOVES },
    'pl-gen': { stem: 'σπιτ', ending: 'ιών', note: { ...ACCENT_MOVES, plain: 'The accent moves onto the ending in the genitive plural: σπιτιών.' } },
  },
  ro: {
    lemma: 'casă',
    gender: 'f',
    forms: {
      sg: { definite: 'casa', indefinite: 'o casă', genDefinite: 'casei', genIndefinite: 'unei case' },
      pl: { definite: 'casele', indefinite: 'case', genDefinite: 'caselor', genIndefinite: 'unor case' },
    },
    split: { sg: ['cas', 'a'], pl: ['case', 'le'] },
  },
  en: { sg: 'house', pl: 'houses' },
  note: 'Neuter in Greek, feminine in Romanian (casă). στο σπίτι is "at home" or "in the house"; Romanian says acasă for "home".',
};

const dromos: GreekNoun = {
  id: 'dromos',
  pos: 'noun',
  lemma: 'δρόμος',
  verified: { el: false, ro: false, en: false },
  gender: 'm',
  class: 'masc-os',
  stems: { sg: 'δρόμ', pl: 'δρόμ' },
  ro: {
    lemma: 'drum',
    gender: 'n',
    forms: {
      sg: { definite: 'drumul', indefinite: 'un drum', genDefinite: 'drumului', genIndefinite: 'unui drum' },
      pl: { definite: 'drumurile', indefinite: 'drumuri', genDefinite: 'drumurilor', genIndefinite: 'unor drumuri' },
    },
    split: { sg: ['drum', 'ul'], pl: ['drumuri', 'le'] },
  },
  en: { sg: 'road', pl: 'roads' },
  note: 'Masculine in Greek, neuter in Romanian (un drum, două drumuri). δρόμος is the road or the street.',
};

const thalassa: GreekNoun = {
  id: 'thalassa',
  pos: 'noun',
  lemma: 'θάλασσα',
  verified: { el: false, ro: false, en: false },
  gender: 'f',
  class: 'fem-a',
  stems: { sg: 'θάλασσ', pl: 'θάλασσ' },
  overrides: {
    'pl-gen': {
      stem: 'θαλασσ',
      ending: 'ών',
      note: { rule: 'accent-moves', plain: 'The accent moves onto the ending in the genitive plural: θαλασσών, not θάλασσων.' },
    },
  },
  ro: {
    lemma: 'mare',
    gender: 'f',
    forms: {
      sg: { definite: 'marea', indefinite: 'o mare', genDefinite: 'mării', genIndefinite: 'unei mări' },
      pl: { definite: 'mările', indefinite: 'mări', genDefinite: 'mărilor', genIndefinite: 'unor mări' },
    },
    split: { sg: ['mare', 'a'], pl: ['mări', 'le'] },
  },
  en: { sg: 'sea', pl: 'seas' },
  note: 'Feminine in Greek and Romanian (mare).',
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

const dikos: GreekAdjective = {
  id: 'dikos',
  pos: 'adjective',
  lemma: 'δικός',
  verified: { el: false, ro: false, en: false },
  class: 'adj-stressed',
  stem: 'δικ',
  emphatic: true,
  ro: {
    lemma: 'propriu',
    forms: {
      m: { sg: 'propriu', pl: 'proprii' },
      f: { sg: 'proprie', pl: 'proprii', genSg: 'proprii' },
      n: { sg: 'propriu', pl: 'proprii' },
    },
  },
  en: 'own',
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

const plymenos: GreekAdjective = {
  id: 'plymenos',
  pos: 'adjective',
  lemma: 'πλυμένος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'πλυμέν',
  derivedFrom: { verb: 'pleno', stem: 'πλυ' },
  ro: {
    lemma: 'spălat',
    forms: {
      m: { sg: 'spălat', pl: 'spălați' },
      f: { sg: 'spălată', pl: 'spălate', genSg: 'spălate' },
      n: { sg: 'spălat', pl: 'spălate' },
    },
  },
  en: 'washed',
};

const psimenos: GreekAdjective = {
  id: 'psimenos',
  pos: 'adjective',
  lemma: 'ψημένος',
  verified: { el: false, ro: false, en: false },
  class: 'adj-unstressed',
  stem: 'ψημέν',
  derivedFrom: { verb: 'psino', stem: 'ψη' },
  ro: {
    lemma: 'copt',
    forms: {
      m: { sg: 'copt', pl: 'copți' },
      f: { sg: 'coaptă', pl: 'coapte', genSg: 'coapte' },
      n: { sg: 'copt', pl: 'coapte' },
    },
  },
  en: 'baked',
};

const same = (nom: string, gen: string = nom) => ({ nom, gen });

const note = (rule: string, plain: string): IrregularNote => ({ rule, plain });
const ACCENT_DROP = note('monosyllable', 'A one-syllable form loses its accent mark: τρως, not τρώς.');
const IMPERATIVE_GAMMA = note(
  'old-stem',
  'The present imperative of τρώω is τρώε, τρώτε. The older forms with -γ- (τρώγε, τρώγετε) are also correct; in everyday speech people usually say φάε, φάτε.',
);
const IMPERATIVE_PLURAL = note(
  'imperative-plural',
  'The command to several people drops the -ε-: κάντε. κάνετε (the present imperative) is also correct, for something that continues or repeats.',
);

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

const ro1 = (nom: Stored, gen?: Stored): RoQuantifierCell => (gen === undefined ? { nom } : { nom, gen });
/** A Romanian form not yet confirmed: shown as "not yet added" (spec 4.2). */
const PENDING: Stored = { pending: true, note: 'not yet confirmed' };

const merikoi: GreekQuantifier = {
  id: 'merikoi',
  pos: 'quantifier',
  lemma: 'μερικοί',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'μερικ', stressed: true } },
  numbers: ['pl'],
  meaning:
    'Greek has no plural "a / an": μερικοί means "some" and, with the sense control, "a few". Romanian splits it into niște and câțiva.',
  ro: {
    lemma: 'niște',
    plain: {
      determiner: { m: { pl: ro1('niște', 'unor') }, f: { pl: ro1('niște', 'unor') } },
      pronoun: { m: { pl: ro1('unii') }, f: { pl: ro1('unele') } },
    },
    few: {
      determiner: { m: { pl: ro1('câțiva', 'câtorva') }, f: { pl: ro1('câteva', 'câtorva') } },
      pronoun: { m: { pl: ro1('câțiva') }, f: { pl: ro1('câteva') } },
    },
  },
  en: {
    plain: { determiner: { pl: 'some' }, pronoun: { pl: 'some' } },
    few: { determiner: { pl: 'a few / several' }, pronoun: { pl: 'a few' } },
  },
};

const kapoios: GreekQuantifier = {
  id: 'kapoios',
  pos: 'quantifier',
  lemma: 'κάποιος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'kapoios' } },
  numbers: ['sg'],
  meaning:
    'κάποιος covers both "some" and "any": Greek does not separate them the way English does. On its own it is "someone / anyone".',
  ro: {
    lemma: 'vreun',
    plain: {
      determiner: { m: { sg: ro1('vreun', 'vreunui') }, f: { sg: ro1('vreo', 'vreunei') } },
      pronoun: { m: { sg: ro1('vreunul') }, f: { sg: ro1('vreuna') } },
    },
  },
  en: { plain: { determiner: { sg: 'some / any' }, pronoun: { sg: 'someone / anyone' } } },
};

const kanenas: GreekQuantifier = {
  id: 'kanenas',
  pos: 'quantifier',
  lemma: 'κανένας',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'kanenas' } },
  numbers: ['sg'],
  meaning:
    'κανένας means "no" or "none" and needs a negative verb: δεν θέλω κανέναν καφέ. It declines like the numeral ένας.',
  ro: {
    lemma: 'niciun',
    plain: {
      determiner: { m: { sg: ro1('niciun', 'niciunui') }, f: { sg: ro1('nicio', 'niciunei') } },
      pronoun: { m: { sg: ro1('niciunul') }, f: { sg: ro1('niciuna') } },
    },
  },
  en: { plain: { determiner: { sg: 'no' }, pronoun: { sg: 'none / no one' } }, negated: 'any' },
};

const polys: GreekQuantifier = {
  id: 'polys',
  pos: 'quantifier',
  lemma: 'πολύς',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'polys' }, comparative: { stem: 'περισσότερ' } },
  numbers: ['sg', 'pl'],
  meaning:
    'πολύς means "much" with a mass noun (πολύ ψωμί) and "many" with a count noun (πολλά ψωμιά). With the degree control it becomes περισσότερος, "more".',
  ro: {
    lemma: 'mult',
    genitiveWithArticle: ['sg'],
    genitiveWithA: 'a mulți / a multe',
    plain: {
      determiner: {
        m: { sg: ro1('mult', 'multului'), pl: ro1('mulți', 'multor') },
        f: { sg: ro1('multă', 'multei'), pl: ro1('multe', 'multor') },
      },
      pronoun: {
        m: { sg: ro1('mult'), pl: ro1('mulți') },
        f: { sg: ro1('multă'), pl: ro1('multe') },
      },
    },
  },
  en: {
    plain: {
      determiner: { sg: 'much / a lot of', pl: 'many / a lot of' },
      pronoun: { sg: 'much / a lot', pl: 'many / a lot' },
    },
    comparative: { determiner: { sg: 'more', pl: 'more' }, pronoun: { sg: 'more', pl: 'more' } },
  },
};

const ligos: GreekQuantifier = {
  id: 'ligos',
  pos: 'quantifier',
  lemma: 'λίγος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'λίγ' }, comparative: { stem: 'λιγότερ' } },
  numbers: ['sg', 'pl'],
  meaning:
    'λίγος means "little" with a mass noun (λίγο νερό) and "few" with a count noun (λίγα ψωμιά). With the degree control it becomes λιγότερος, "less" or "fewer".',
  ro: {
    lemma: 'puțin',
    genitiveWithArticle: ['sg', 'pl'],
    genitiveWithA: 'a puțini / a puține',
    plain: {
      determiner: {
        m: { sg: ro1('puțin', 'puținului'), pl: ro1('puțini', 'puținilor') },
        f: { sg: ro1('puțină', 'puținei'), pl: ro1('puține', 'puținelor') },
      },
      pronoun: {
        m: { sg: ro1('puțin'), pl: ro1('puțini') },
        f: { sg: ro1('puțină'), pl: ro1('puține') },
      },
    },
  },
  en: {
    plain: {
      determiner: { sg: 'little / a little', pl: 'few / a few' },
      pronoun: { sg: 'little / a little', pl: 'few / a few' },
    },
    comparative: { determiner: { sg: 'less', pl: 'fewer' }, pronoun: { sg: 'less', pl: 'fewer' } },
  },
};

const poios: GreekQuantifier = {
  id: 'poios',
  pos: 'quantifier',
  lemma: 'ποιος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'poios' } },
  numbers: ['sg', 'pl'],
  question: 'who',
  cases: ['nom', 'acc'],
  meaning:
    'ποιος means "who" on its own and "which" in front of a noun (ποιο ψωμί, "which bread"). It changes with gender, number and role, like κάποιος. Romanian splits it into cine (who) and care (which).',
  ro: {
    lemma: 'care',
    plain: {
      determiner: { m: { sg: ro1('care'), pl: ro1('care') }, f: { sg: ro1('care'), pl: ro1('care') } },
      pronoun: { m: { sg: ro1('cine'), pl: ro1('cine') }, f: { sg: ro1('cine'), pl: ro1('cine') } },
    },
  },
  en: { plain: { determiner: { sg: 'which', pl: 'which' }, pronoun: { sg: 'who', pl: 'who' } } },
};

const posos: GreekQuantifier = {
  id: 'posos',
  pos: 'quantifier',
  lemma: 'πόσος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'πόσ' } },
  numbers: ['sg', 'pl'],
  question: 'amount',
  cases: ['nom', 'acc'],
  meaning:
    'πόσος asks "how much" with a mass noun (πόσο ψωμί) and "how many" with a count noun (πόσα ψωμιά). It declines like an adjective; Romanian cât, câtă, câți, câte changes too, English does not.',
  ro: {
    lemma: 'cât',
    plain: {
      determiner: { m: { sg: ro1('cât'), pl: ro1('câți') }, f: { sg: ro1('câtă'), pl: ro1('câte') } },
      pronoun: { m: { sg: ro1('cât'), pl: ro1('câți') }, f: { sg: ro1('câtă'), pl: ro1('câte') } },
    },
  },
  en: {
    plain: {
      determiner: { sg: 'how much', pl: 'how many' },
      pronoun: { sg: 'how much', pl: 'how many' },
    },
  },
};

/** The spoken Romanian forms of a demonstrative: after the noun, the same for both uses, with no genitive. */
const spokenCells = (msg: string, mpl: string, fsg: string, fpl: string): GreekQuantifier['ro']['plain'] => {
  const cells = { m: { sg: ro1(msg), pl: ro1(mpl) }, f: { sg: ro1(fsg), pl: ro1(fpl) } };
  return { determiner: cells, pronoun: cells };
};

const autos: GreekQuantifier = {
  id: 'autos',
  pos: 'quantifier',
  lemma: 'αυτός',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'autos' } },
  numbers: ['sg', 'pl'],
  demonstrative: 'near',
  meaning:
    'αυτός means "this" (and, in everyday Greek, "that" too). It changes with gender, number and role, and the noun keeps its article: αυτό το σπίτι. Romanian says acest copil (before the noun, no article) or copilul acesta (after the noun, with its article).',
  ro: {
    lemma: 'acest',
    plain: {
      determiner: {
        m: { sg: ro1('acest', 'acestui'), pl: ro1('acești', 'acestor') },
        f: { sg: ro1('această', 'acestei'), pl: ro1('aceste', 'acestor') },
      },
      pronoun: {
        m: { sg: ro1('acesta', 'acestuia'), pl: ro1('aceștia', 'acestora') },
        f: { sg: ro1('aceasta', 'acesteia'), pl: ro1('acestea', 'acestora') },
      },
    },
    spoken: spokenCells('ăsta', 'ăștia', 'asta', 'astea'),
  },
  en: { plain: { determiner: { sg: 'this', pl: 'these' }, pronoun: { sg: 'this', pl: 'these' } } },
};

const ekeinos: GreekQuantifier = {
  id: 'ekeinos',
  pos: 'quantifier',
  lemma: 'εκείνος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'ekeinos' } },
  numbers: ['sg', 'pl'],
  demonstrative: 'far',
  meaning:
    'εκείνος means "that", the one further away or already mentioned. It changes with gender, number and role, and the noun keeps its article: εκείνος ο σκύλος. Romanian says acel câine (before the noun) or câinele acela (after the noun).',
  ro: {
    lemma: 'acel',
    plain: {
      determiner: {
        m: { sg: ro1('acel', 'acelui'), pl: ro1('acei', 'acelor') },
        f: { sg: ro1('acea', 'acelei'), pl: ro1('acele', 'acelor') },
      },
      pronoun: {
        m: { sg: ro1('acela', 'aceluia'), pl: ro1('aceia', 'acelora') },
        f: { sg: ro1('aceea', 'aceleia'), pl: ro1('acelea', 'acelora') },
      },
    },
    spoken: spokenCells('ăla', 'ăia', 'aia', 'alea'),
  },
  en: { plain: { determiner: { sg: 'that', pl: 'those' }, pronoun: { sg: 'that', pl: 'those' } } },
};

const tetoios: GreekQuantifier = {
  id: 'tetoios',
  pos: 'quantifier',
  lemma: 'τέτοιος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'tetoios' } },
  numbers: ['sg', 'pl'],
  demonstrative: 'such',
  uses: ['determiner'],
  meaning:
    'τέτοιος means "such" and goes beside a noun only. In the singular it follows the indefinite article: ένα τέτοιο σπίτι, "such a house". It changes with gender, number and role. Romanian asemenea never changes.',
  ro: {
    lemma: 'asemenea',
    plain: {
      determiner: {
        m: { sg: ro1('un asemenea', 'unui asemenea'), pl: ro1('asemenea', 'unor asemenea') },
        f: { sg: ro1('o asemenea', 'unei asemenea'), pl: ro1('asemenea', 'unor asemenea') },
      },
    },
  },
  en: { plain: { determiner: { sg: 'such a', pl: 'such' } } },
};

const tosos: GreekQuantifier = {
  id: 'tosos',
  pos: 'quantifier',
  lemma: 'τόσος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { stem: 'τόσ' } },
  numbers: ['sg', 'pl'],
  demonstrative: 'amount',
  cases: ['nom', 'acc'],
  meaning:
    'τόσος means "so much" with a mass noun (τόσο ψωμί) and "so many" with a count noun (τόσα ψωμιά): the answer to πόσος. It declines like an adjective; Romanian atâta, atâția, atâtea changes too, English does not. It is offered as a subject or an object only.',
  ro: {
    lemma: 'atâta',
    plain: {
      determiner: {
        m: { sg: ro1('atâta'), pl: ro1('atâția') },
        f: { sg: ro1('atâta'), pl: ro1('atâtea') },
      },
      pronoun: {
        m: { sg: ro1('atât'), pl: ro1('atâția') },
        f: { sg: ro1('atâta'), pl: ro1('atâtea') },
      },
    },
  },
  en: { plain: { determiner: { sg: 'so much', pl: 'so many' }, pronoun: { sg: 'so much', pl: 'so many' } } },
};

const freeOpoios: GreekQuantifier = {
  id: 'free-opoios',
  pos: 'quantifier',
  lemma: 'όποιος',
  verified: { el: false, ro: false, en: false },
  greek: { plain: { table: 'opoiosFree' } },
  numbers: ['sg', 'pl'],
  free: true,
  cases: ['nom', 'acc'],
  meaning:
    'όποιος means "whoever" on its own and "whichever" in front of a noun (όποιο ψωμί θέλεις). It changes with gender, number and role, like ποιος. Romanian splits it into oricine (whoever) and orice (whichever); English into whoever and whichever.',
  ro: {
    lemma: 'oricine',
    plain: {
      determiner: { m: { sg: ro1('orice'), pl: ro1('orice') }, f: { sg: ro1('orice'), pl: ro1('orice') } },
      pronoun: { m: { sg: ro1('oricine'), pl: ro1('oricine') }, f: { sg: ro1('oricine'), pl: ro1('oricine') } },
    },
  },
  en: { plain: { determiner: { sg: 'whichever', pl: 'whichever' }, pronoun: { sg: 'whoever', pl: 'whoever' } } },
};

const INDICATIVE_ALL: Tense[] = [
  'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
];
const SUBJUNCTIVE_ALL: Tense[] = ['present', 'aorist', 'perfect'];
const CONDITIONAL_ALL: Tense[] = ['imperfect', 'pluperfect'];
const IMPERATIVE_ALL: Tense[] = ['present', 'aorist'];
/** The hortative (ας + the subjunctive) goes with the subjunctive present and aorist (spec 4.3). */
const HORTATIVE_ALL: Tense[] = ['present', 'aorist'];
/** Every mood except the imperative, which only some verbs offer. */
const OFFERS_NO_IMPERATIVE = {
  indicative: INDICATIVE_ALL,
  subjunctive: SUBJUNCTIVE_ALL,
  conditional: CONDITIONAL_ALL,
  hortative: HORTATIVE_ALL,
};

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

const kano: GreekVerb = {
  id: 'kano',
  pos: 'verb',
  lemma: 'κάνω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'κάνω',
      class: 'omega',
      stems: {
        present: 'κάν',
        imperfect: { strong: { augment: 'έ', stem: 'καν' }, weak: { stem: 'κάν' } },
        aorist: { strong: { augment: 'έ', stem: 'καν' }, weak: { stem: 'κάν' } },
        perfective: 'κάν',
      },
      overrides: {
        // The aorist command to several people is κάντε; κάνετε (the present imperative) is for something that continues.
        'impAorist.2pl': { stem: 'κάν', ending: 'τε', note: IMPERATIVE_PLURAL },
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a face',
        infinitive: 'face',
        participle: 'făcut',
        present: ['fac', 'faci', 'face', 'facem', 'faceți', 'fac'],
        subjunctive: ['fac', 'faci', 'facă', 'facem', 'faceți', 'facă'],
        imperfect: ['făceam', 'făceai', 'făcea', 'făceam', 'făceați', 'făceau'],
        pluperfect: ['făcusem', 'făcuseși', 'făcuse', 'făcuserăm', 'făcuserăți', 'făcuseră'],
        imperative: ['fă', 'faceți'],
      },
      en: { gloss: 'do / make', base: 'do', third: 'does', past: 'did', pastParticiple: 'done', ing: 'doing' },
    },
  },
};

/** λέω, "say" and "call": it offers the present, the imperfect and the present subjunctive (spec 6.6). */
const lego: GreekVerb = {
  id: 'lego',
  pos: 'verb',
  lemma: 'λέω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'λέω',
      class: 'athematic',
      stems: {
        present: 'λέ',
        imperfect: { strong: { augment: 'έ', stem: 'λεγ' }, weak: { stem: 'λέγ' } },
      },
      overrides: {
        'present.2sg': { stem: 'λε', ending: 'ς', note: ACCENT_DROP },
      },
      offers: { indicative: ['present', 'imperfect'], subjunctive: ['present'] },
      ro: {
        lemma: 'a zice',
        infinitive: 'zice',
        participle: 'zis',
        present: ['zic', 'zici', 'zice', 'zicem', 'ziceți', 'zic'],
        subjunctive: ['zic', 'zici', 'zică', 'zicem', 'ziceți', 'zică'],
        imperfect: ['ziceam', 'ziceai', 'zicea', 'ziceam', 'ziceați', 'ziceau'],
        pluperfect: ['zisesem', 'ziseseși', 'zisese', 'ziseserăm', 'ziseserăți', 'ziseseră'],
        imperative: ['zi', 'ziceți'],
      },
      en: { gloss: 'say / call', base: 'say', third: 'says', past: 'said', pastParticiple: 'said', ing: 'saying' },
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
      intransitive: true,
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

const troo: GreekVerb = {
  id: 'troo',
  pos: 'verb',
  lemma: 'τρώω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'τρώω',
      class: 'athematic',
      stems: {
        present: 'τρώ',
        imperfect: { strong: { augment: 'έ', stem: 'τρωγ' }, weak: { stem: 'τρώγ' } },
        aorist: { strong: { augment: 'έ', stem: 'φαγ' }, weak: { stem: 'φάγ' } },
        perfective: 'φά',
      },
      overrides: {
        'present.2sg': { stem: 'τρω', ending: 'ς', note: ACCENT_DROP },
        'subjAorist.2sg': { stem: 'φα', ending: 'ς', note: ACCENT_DROP },
        // The everyday present imperative is τρώε, τρώτε; the older τρώγε, τρώγετε are also correct (reported by the user, awaiting review).
        'impPresent.2sg': { stem: 'τρώ', ending: 'ε', note: IMPERATIVE_GAMMA },
        'impPresent.2pl': { stem: 'τρώ', ending: 'τε', note: IMPERATIVE_GAMMA },
      },
      shortForms: {
        'impAorist.2sg': {
          stem: 'φά',
          ending: '',
          fuse: true,
          plain: 'A short way of saying φάε το: the final -ε drops and the pronoun joins the verb.',
        },
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a mânca',
        infinitive: 'mânca',
        participle: 'mâncat',
        present: ['mănânc', 'mănânci', 'mănâncă', 'mâncăm', 'mâncați', 'mănâncă'],
        subjunctive: ['mănânc', 'mănânci', 'mănânce', 'mâncăm', 'mâncați', 'mănânce'],
        imperfect: ['mâncam', 'mâncai', 'mânca', 'mâncam', 'mâncați', 'mâncau'],
        pluperfect: ['mâncasem', 'mâncaseși', 'mâncase', 'mâncaserăm', 'mâncaserăți', 'mâncaseră'],
        imperative: ['mănâncă', 'mâncați'],
      },
      en: { gloss: 'eat', base: 'eat', third: 'eats', past: 'ate', pastParticiple: 'eaten', ing: 'eating' },
    },
  },
};

const dino: GreekVerb = {
  id: 'dino',
  pos: 'verb',
  lemma: 'δίνω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'δίνω',
      class: 'omega',
      stems: {
        present: 'δίν',
        imperfect: { strong: { augment: 'έ', stem: 'διν' }, weak: { stem: 'δίν' } },
        aorist: { strong: { augment: 'έ', stem: 'δωσ' }, weak: { stem: 'δώσ' } },
        perfective: 'δώσ',
      },
      overrides: {
        // The usual plural of the aorist imperative is δώστε, not δώσετε.
        'impAorist.2pl': { stem: 'δώσ', ending: 'τε' },
      },
      indirect: true,
      shortForms: {
        'impAorist.2sg': {
          stem: 'δω',
          ending: 'ς',
          fuse: false,
          plain: 'δως is a short form of δώσε: the pronouns follow it as separate words.',
        },
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a da',
        infinitive: 'da',
        participle: 'dat',
        present: ['dau', 'dai', 'dă', 'dăm', 'dați', 'dau'],
        subjunctive: ['dau', 'dai', 'dea', 'dăm', 'dați', 'dea'],
        imperfect: ['dădeam', 'dădeai', 'dădea', 'dădeam', 'dădeați', 'dădeau'],
        pluperfect: ['dădusem', 'dăduseși', 'dăduse', 'dăduserăm', 'dăduserăți', 'dăduseră'],
        imperative: ['dă', 'dați'],
      },
      en: { gloss: 'give', base: 'give', third: 'gives', past: 'gave', pastParticiple: 'given', ing: 'giving' },
    },
  },
};

const pao: GreekVerb = {
  id: 'pao',
  pos: 'verb',
  lemma: 'πάω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πάω',
      class: 'athematic',
      intransitive: true,
      stems: {
        present: 'πά',
        imperfect: { strong: { stem: 'πήγαιν' }, weak: { stem: 'πηγαίν' } },
        aorist: { strong: { stem: 'πήγ' }, weak: { stem: 'πήγ' } },
        perfective: 'πά',
      },
      overrides: {
        'present.2sg': { stem: 'πα', ending: 'ς', note: ACCENT_DROP },
        'subjAorist.2sg': { stem: 'πα', ending: 'ς', note: ACCENT_DROP },
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a merge',
        infinitive: 'merge',
        participle: 'mers',
        present: ['merg', 'mergi', 'merge', 'mergem', 'mergeți', 'merg'],
        subjunctive: ['merg', 'mergi', 'meargă', 'mergem', 'mergeți', 'meargă'],
        imperfect: ['mergeam', 'mergeai', 'mergea', 'mergeam', 'mergeați', 'mergeau'],
        pluperfect: ['mersesem', 'merseseși', 'mersese', 'merseserăm', 'merseserăți', 'merseseră'],
      },
      en: { gloss: 'go', base: 'go', third: 'goes', past: 'went', pastParticiple: 'gone', ing: 'going' },
    },
  },
};

/** έχω, also the auxiliary of the perfect tenses. It offers only the forms the auxiliary role and its own panel need. */
const echo: GreekVerb = {
  id: 'echo',
  pos: 'verb',
  lemma: 'έχω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'έχω',
      class: 'omega',
      stems: {
        present: 'έχ',
        imperfect: { strong: { stem: 'είχ' }, weak: { stem: 'είχ' } },
      },
      offers: { indicative: ['present', 'imperfect', 'future'], subjunctive: ['present'], conditional: ['imperfect'] },
      ro: {
        lemma: 'a avea',
        infinitive: 'avea',
        participle: 'avut',
        present: ['am', 'ai', 'are', 'avem', 'aveți', 'au'],
        subjunctive: ['am', 'ai', 'aibă', 'avem', 'aveți', 'aibă'],
        imperfect: ['aveam', 'aveai', 'avea', 'aveam', 'aveați', 'aveau'],
        pluperfect: ['avusesem', 'avuseseși', 'avusese', 'avuseserăm', 'avuseserăți', 'avuseseră'],
      },
      en: { gloss: 'have', base: 'have', third: 'has', past: 'had', pastParticiple: 'had', ing: 'having' },
    },
  },
};

const IRREGULAR_BE = note(
  'irregular-be',
  'είμαι ("to be") does not follow the usual pattern: learn its six forms together.',
);
const beCell = (word: string): CellOverride => ({ stem: word, ending: '', note: IRREGULAR_BE });
const NO_CELLS: readonly string[] = ['', '', '', '', '', ''];

/** είμαι, the copula. It offers only the present indicative (spec 4.2); the six forms are overrides. */
const eimai: GreekVerb = {
  id: 'eimai',
  pos: 'verb',
  lemma: 'είμαι',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'είμαι',
      class: 'copula',
      intransitive: true,
      stems: { present: 'είμαι' },
      overrides: {
        'present.1sg': beCell('είμαι'),
        'present.2sg': beCell('είσαι'),
        'present.3sg': beCell('είναι'),
        'present.1pl': beCell('είμαστε'),
        'present.2pl': beCell('είστε'),
        'present.3pl': beCell('είναι'),
      },
      offers: { indicative: ['present'] },
      ro: {
        lemma: 'a fi',
        infinitive: 'fi',
        participle: 'fost',
        present: ['sunt', 'ești', 'este', 'suntem', 'sunteți', 'sunt'],
        subjunctive: NO_CELLS,
        imperfect: NO_CELLS,
        pluperfect: NO_CELLS,
      },
      en: {
        gloss: 'be',
        base: 'be',
        third: 'is',
        past: 'was',
        pastParticiple: 'been',
        ing: 'being',
        present: ['am', 'are', 'is', 'are', 'are', 'are'],
        presentNot: ['am not', "aren't", "isn't", "aren't", "aren't", "aren't"],
      },
    },
  },
};

/** ψήνω is here for its participle (ψημένος); it offers only the present indicative. */
const psino: GreekVerb = {
  id: 'psino',
  pos: 'verb',
  lemma: 'ψήνω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'ψήνω',
      class: 'omega',
      stems: { present: 'ψήν', participle: 'ψη' },
      offers: { indicative: ['present'] },
      ro: {
        lemma: 'a coace',
        infinitive: 'coace',
        participle: 'copt',
        present: ['coc', 'coci', 'coace', 'coacem', 'coaceți', 'coc'],
        subjunctive: NO_CELLS,
        imperfect: NO_CELLS,
        pluperfect: NO_CELLS,
      },
      en: { gloss: 'bake', base: 'bake', third: 'bakes', past: 'baked', pastParticiple: 'baked', ing: 'baking' },
    },
  },
};

const pleno: GreekVerb = {
  id: 'pleno',
  pos: 'verb',
  lemma: 'πλένω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πλένω',
      class: 'omega',
      stems: {
        present: 'πλέν',
        imperfect: { strong: { augment: 'έ', stem: 'πλεν' }, weak: { stem: 'πλέν' } },
        aorist: { strong: { augment: 'έ', stem: 'πλυν' }, weak: { stem: 'πλύν' } },
        perfective: 'πλύν',
        participle: 'πλυ',
      },
      offers: { ...OFFERS_NO_IMPERATIVE, imperative: IMPERATIVE_ALL },
      ro: {
        lemma: 'a spăla',
        infinitive: 'spăla',
        participle: 'spălat',
        present: ['spăl', 'speli', 'spală', 'spălăm', 'spălați', 'spală'],
        subjunctive: ['spăl', 'speli', 'spele', 'spălăm', 'spălați', 'spele'],
        imperfect: ['spălam', 'spălai', 'spăla', 'spălam', 'spălați', 'spălau'],
        pluperfect: ['spălasem', 'spălaseși', 'spălase', 'spălaserăm', 'spălaserăți', 'spălaseră'],
        imperative: ['spală', 'spălați'],
      },
      en: { gloss: 'wash', base: 'wash', third: 'washes', past: 'washed', pastParticiple: 'washed', ing: 'washing' },
    },
    mediopassive: {
      lemma: 'πλένομαι',
      class: 'mediopassive',
      stems: {
        present: 'πλέν',
        imperfect: { strong: { stem: 'πλεν' }, weak: { stem: 'πλεν' } },
        aorist: { strong: { stem: 'πλύθ' }, weak: { stem: 'πλυθ' } },
        perfective: 'πλυθ',
      },
      overrides: {
        'present.1pl': {
          stem: 'πλεν',
          ending: 'όμαστε',
          note: note('stress-shift', 'In "we" the stress moves onto the ending: πλενόμαστε.'),
        },
        'imperfect.3pl': {
          stem: 'πλέν',
          ending: 'ονταν',
          note: note('stress-shift', 'In "they" the stress stays on the stem: πλένονταν.'),
        },
      },
      offers: {
        indicative: ['present', 'imperfect', 'aorist', 'perfect', 'pluperfect'],
        subjunctive: ['present', 'aorist'],
        hortative: HORTATIVE_ALL,
      },
      ro: {
        lemma: 'a se spăla',
        infinitive: 'spăla',
        participle: 'spălat',
        present: ['mă spăl', 'te speli', 'se spală', 'ne spălăm', 'vă spălați', 'se spală'],
        subjunctive: ['mă spăl', 'te speli', 'se spele', 'ne spălăm', 'vă spălați', 'se spele'],
        imperfect: ['mă spălam', 'te spălai', 'se spăla', 'ne spălam', 'vă spălați', 'se spălau'],
        pluperfect: ['mă spălasem', 'te spălaseși', 'se spălase', 'ne spălaserăm', 'vă spălaserăți', 'se spălaseră'],
        perfect: ['m-am spălat', 'te-ai spălat', 's-a spălat', 'ne-am spălat', 'v-ați spălat', 's-au spălat'],
      },
      en: {
        gloss: 'wash',
        base: 'wash',
        third: 'washes',
        past: 'washed',
        pastParticiple: 'washed',
        ing: 'washing',
        reflexive: true,
      },
    },
  },
};

/** κοιμάμαι is deponent: passive in form, not reflexive in meaning. */
const koimamai: GreekVerb = {
  id: 'koimamai',
  pos: 'verb',
  lemma: 'κοιμάμαι',
  verified: { el: false, ro: false, en: false },
  voices: {
    mediopassive: {
      lemma: 'κοιμάμαι',
      class: 'deponent',
      stems: {
        present: 'κοιμ',
        imperfect: { strong: { stem: 'κοιμ' }, weak: { stem: 'κοιμ' } },
        aorist: { strong: { stem: 'κοιμήθ' }, weak: { stem: 'κοιμηθ' } },
        perfective: 'κοιμηθ',
      },
      offers: OFFERS_NO_IMPERATIVE,
      ro: {
        lemma: 'a dormi',
        infinitive: 'dormi',
        participle: 'dormit',
        present: ['dorm', 'dormi', 'doarme', 'dormim', 'dormiți', 'dorm'],
        subjunctive: ['dorm', 'dormi', 'doarmă', 'dormim', 'dormiți', 'doarmă'],
        imperfect: ['dormeam', 'dormeai', 'dormea', 'dormeam', 'dormeați', 'dormeau'],
        pluperfect: ['dormisem', 'dormiseși', 'dormise', 'dormiserăm', 'dormiserăți', 'dormiseră'],
      },
      en: { gloss: 'sleep', base: 'sleep', third: 'sleeps', past: 'slept', pastParticiple: 'slept', ing: 'sleeping' },
    },
  },
};

/** μπορεί ("it is possible; may") has one slot: the third person singular of the present. */
const mporei: GreekVerb = {
  id: 'mporei',
  pos: 'verb',
  lemma: 'μπορεί',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'μπορεί',
      class: 'impersonal',
      intransitive: true,
      stems: { present: 'μπορ' },
      offers: { indicative: ['present'] },
      thirdSingularOnly: true,
      ro: {
        lemma: 'a putea',
        infinitive: 'putea',
        participle: 'putut',
        present: ['', '', 'poate', '', '', ''],
        subjunctive: ['', '', 'poată', '', '', ''],
        imperfect: ['', '', '', '', '', ''],
        pluperfect: ['', '', '', '', '', ''],
      },
      en: {
        gloss: 'be able to',
        base: 'may',
        third: 'may',
        past: 'might',
        pastParticiple: 'been able to',
        ing: 'being able to',
        modal: true,
      },
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
const apo = preposition('apo', 'από', 'de la', 'from', 'from');
const mexri = preposition('mexri', 'μέχρι', 'până la', 'until', 'until');

/** σε governs the accusative and is written as one word with the article after it (spec 4.4). */
const se: GreekPreposition = {
  id: 'se',
  pos: 'preposition',
  lemma: 'σε',
  verified: { el: false, ro: false, en: false },
  ro: 'la',
  en: 'to',
  meaning: 'to / at / in / on',
  fused: {
    m: { sg: 'στον', pl: 'στους' },
    f: { sg: 'στην', pl: 'στις' },
    n: { sg: 'στο', pl: 'στα' },
  },
  senses: [
    { value: 'to', label: 'to (direction)', ro: 'la', en: 'to', example: { el: 'πάω στο σπίτι', ro: 'merg acasă', en: 'I go home' } },
    { value: 'at', label: 'at (place)', ro: 'la', en: 'at', example: { el: 'είμαι στο σπίτι', ro: 'sunt acasă', en: "I'm at home" } },
    { value: 'in', label: 'in, into', ro: 'în', en: 'in', example: { el: 'πηδάει στο νερό', ro: 'sare în apă', en: 'jumps into the water' } },
    { value: 'on', label: 'on (a surface)', ro: 'pe', en: 'on', example: { el: 'στον δρόμο', ro: 'pe drum', en: 'on the road' } },
    {
      value: 'person',
      label: 'to a person',
      ro: '',
      en: 'to',
      dative: true,
      example: { el: 'δίνω το ψωμί στο παιδί', ro: 'dau pâinea copilului', en: 'I give the bread to the child' },
    },
  ],
};

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

const den: GreekParticle = {
  id: 'den',
  pos: 'particle',
  lemma: 'δεν',
  verified: { el: false, ro: false, en: false },
  ro: 'nu',
  en: "not (don't, won't …)",
  meaning: 'Says "not". It goes in front of the whole verb group, even in front of θα: δεν θέλω, δεν θα φάω.',
  example: { el: 'δεν θέλω', ro: 'nu vreau', en: "don't want" },
};

const as: GreekParticle = {
  id: 'as',
  pos: 'particle',
  lemma: 'ας',
  verified: { el: false, ro: false, en: false },
  ro: 'să (+ verb)',
  en: "let / let's",
  meaning:
    'Suggests or allows: ας φάμε "let\'s eat", ας φάει "let him eat". Where να gives a wish or a purpose (θέλω να φάω), ας invites or permits.',
  example: { el: 'ας φάμε', ro: 'să mâncăm', en: "let's eat" },
};

const min: GreekParticle = {
  id: 'min',
  pos: 'particle',
  lemma: 'μη(ν)',
  verified: { el: false, ro: false, en: false },
  ro: 'nu / să nu',
  en: "don't / not",
  meaning: 'Says "not" after να and in a command: να μη φάω, μην το φας. It is written μην before a vowel and before κ, π, τ, ξ, ψ, γκ, μπ, ντ, τσ, τζ, and μη before any other consonant.',
  example: { el: 'μη φας', ro: 'nu mânca', en: "don't eat" },
};

const an: GreekConjunction = {
  id: 'an',
  pos: 'conjunction',
  lemma: 'αν',
  verified: { el: false, ro: false, en: false },
  ro: 'dacă',
  en: 'if',
  meaning:
    'Starts a condition. With a past tense it says "if … were": Greek αν + the imperfect, Romanian dacă + the conditional, English if + the past.',
  example: { el: 'αν είχα ψωμί', ro: 'dacă aș avea pâine', en: 'if I had bread' },
};

const interrogative = (
  id: string,
  lemma: string,
  ro: string,
  en: string,
  meaning: string,
  question: GreekInterrogative['question'],
  extra: Pick<GreekInterrogative, 'roAfter' | 'answer'> = {},
): GreekInterrogative => ({
  id,
  pos: 'interrogative',
  lemma,
  verified: { el: false, ro: false, en: false },
  ro,
  en,
  meaning,
  question,
  ...extra,
});

const adverb = (
  id: string,
  lemma: string,
  ro: string,
  en: string,
  meaning: string,
  example: GreekAdverb['example'],
  roAfter?: GreekAdverb['roAfter'],
): GreekAdverb => ({
  id,
  pos: 'adverb',
  lemma,
  verified: { el: false, ro: false, en: false },
  ro,
  en,
  meaning,
  example,
  ...(roAfter ? { roAfter } : {}),
});

const edo = adverb(
  'edo',
  'εδώ',
  'aici',
  'here',
  'εδώ means "here", the place near the speaker. It never changes. Romanian aici, English here.',
  { el: 'Εδώ είναι το σπίτι', ro: 'Aici este casa', en: 'Here is the house' },
  { apo: 'de aici', mexri: 'până aici' },
);

const ekei = adverb(
  'ekei',
  'εκεί',
  'acolo',
  'there',
  'εκεί means "there", the place away from the speaker. It never changes. Romanian acolo, English there.',
  { el: 'Εκεί είναι ο σκύλος', ro: 'Acolo este câinele', en: 'There is the dog' },
  { apo: 'de acolo', mexri: 'până acolo' },
);

const oti: GreekFreeRelative = {
  id: 'free-oti',
  pos: 'freeRelative',
  lemma: 'ό,τι',
  verified: { el: false, ro: false, en: false },
  ro: { ever: 'orice', plain: 'ce' },
  en: { ever: 'whatever', plain: 'what' },
  meaning:
    'ό,τι never changes and has no noun to refer to: it means "what" and "whatever" (Ό,τι θέλεις). Romanian has two words, ce (what) and orice (whatever); so does English. The comma tells it apart from ότι ("that"); the accented ό- tells it apart from the question τι.',
  examples: {
    ever: { el: 'Ό,τι θέλεις', ro: 'Orice vrei', en: 'Whatever you want' },
    plain: { el: 'Ό,τι έχω', ro: 'Ce am', en: 'What I have' },
  },
};

const opou: GreekFreeRelative = {
  id: 'free-opou',
  pos: 'freeRelative',
  lemma: 'όπου',
  verified: { el: false, ro: false, en: false },
  ro: { ever: 'oriunde', plain: 'unde' },
  en: { ever: 'wherever', plain: 'where' },
  meaning:
    'όπου never changes and means "where" and "wherever" (Όπου πας). Romanian has two words, unde (where) and oriunde (wherever); so does English. It is not the question πού.',
  examples: {
    ever: { el: 'Όπου πας', ro: 'Oriunde mergi', en: 'Wherever you go' },
    plain: { el: 'Εκεί όπου είναι το σπίτι', ro: 'Acolo unde este casa', en: 'There where the house is' },
  },
};

const relPou: GreekRelative = {
  id: 'rel-pou',
  pos: 'relative',
  lemma: 'που',
  verified: { el: false, ro: false, en: false },
  kind: 'pou',
  meaning:
    'που never changes. As the subject or the object it stands alone (το ψωμί που έφαγα); for any other job the clause needs a pronoun (που του έδωσα) or a preposition with a pronoun (που … με αυτόν). Romanian care and English who, which or that do the same work.',
};

const relOpoios: GreekRelative = {
  id: 'rel-opoios',
  pos: 'relative',
  lemma: 'ο οποίος',
  verified: { el: false, ro: false, en: false },
  kind: 'opoios',
  meaning:
    'ο οποίος agrees with the noun it refers to in gender and number and takes the case of its job in the clause (τον οποίο, του οποίου). It can follow a preposition (με τον οποίο, στον οποίο). It is more formal than που.',
};

const ti = interrogative(
  'ti',
  'τι',
  'ce',
  'what',
  'τι means "what". It never changes, and it can stand in front of a noun: τι ώρα, "what time".',
  { el: 'Τι θέλεις;', ro: 'Ce vrei?', en: 'What do you want?' },
);
const pou = interrogative(
  'pou',
  'πού',
  'unde',
  'where',
  'πού means "where". After από it means "from where": Greek and English use two words, Romanian one (de unde).',
  { el: 'Πού πας;', ro: 'Unde mergi?', en: 'Where are you going?' },
  { roAfter: { apo: 'de unde' } },
);
const pote = interrogative(
  'pote',
  'πότε',
  'când',
  'when',
  'πότε means "when". After μέχρι it means "until when": Romanian has the fused phrase până când.',
  { el: 'Πότε θα φας;', ro: 'Când vei mânca?', en: 'When will you eat?' },
  { roAfter: { mexri: 'până când' } },
);
const giati = interrogative(
  'giati',
  'γιατί',
  'de ce',
  'why',
  'γιατί means both "why" (in a question) and "because" (in an answer). Romanian has two words, de ce and pentru că.',
  { el: 'Γιατί δεν τρως;', ro: 'De ce nu mănânci?', en: "Why aren't you eating?" },
  { answer: { el: 'γιατί δεν θέλω', ro: 'pentru că nu vreau', en: "because I don't want to" } },
);
const posHow = interrogative(
  'pos-how',
  'πώς',
  'cum',
  'how',
  'πώς means "how". It never changes.',
  { el: 'Πώς είσαι;', ro: 'Cum ești?', en: 'How are you?' },
);

const possessive: GreekPossessive = { id: 'possessive', pos: 'possessive', lemma: 'μου', verified: { el: false, ro: false, en: false } };

const clitic: GreekClitic = { id: 'clitic', pos: 'clitic', lemma: 'το', verified: { el: false, ro: false, en: false } };

export const LEXEMES: Record<string, GreekLexeme> = {
  [kafes.id]: kafes,
  [skylos.id]: skylos,
  [alepou.id]: alepou,
  [paidi.id]: paidi,
  [psomi.id]: psomi,
  [nero.id]: nero,
  [ora.id]: ora,
  [spiti.id]: spiti,
  [dromos.id]: dromos,
  [thalassa.id]: thalassa,
  [zestos.id]: zestos,
  [dikos.id]: dikos,
  [grigoros.id]: grigoros,
  [tembelikos.id]: tembelikos,
  [kafeAdj.id]: kafeAdj,
  [plymenos.id]: plymenos,
  [psimenos.id]: psimenos,
  [numeral.id]: numeral,
  [def.id]: def,
  [merikoi.id]: merikoi,
  [kapoios.id]: kapoios,
  [kanenas.id]: kanenas,
  [polys.id]: polys,
  [ligos.id]: ligos,
  [poios.id]: poios,
  [posos.id]: posos,
  [autos.id]: autos,
  [ekeinos.id]: ekeinos,
  [tetoios.id]: tetoios,
  [tosos.id]: tosos,
  [freeOpoios.id]: freeOpoios,
  [thelo.id]: thelo,
  [pidao.id]: pidao,
  [kano.id]: kano,
  [lego.id]: lego,
  [troo.id]: troo,
  [dino.id]: dino,
  [pao.id]: pao,
  [echo.id]: echo,
  [eimai.id]: eimai,
  [psino.id]: psino,
  [pleno.id]: pleno,
  [koimamai.id]: koimamai,
  [mporei.id]: mporei,
  [pano.id]: pano,
  [kato.id]: kato,
  [me.id]: me,
  [gia.id]: gia,
  [apo.id]: apo,
  [mexri.id]: mexri,
  [se.id]: se,
  [theta.id]: theta,
  [na.id]: na,
  [as.id]: as,
  [den.id]: den,
  [min.id]: min,
  [an.id]: an,
  [clitic.id]: clitic,
  [possessive.id]: possessive,
  [ti.id]: ti,
  [pou.id]: pou,
  [pote.id]: pote,
  [giati.id]: giati,
  [posHow.id]: posHow,
  [edo.id]: edo,
  [oti.id]: oti,
  [opou.id]: opou,
  [relPou.id]: relPou,
  [relOpoios.id]: relOpoios,
  [ekei.id]: ekei,
};

export const DEF_ARTICLE: GreekArticle = def;
export const NUMERAL: GreekNumeral = numeral;

/** The prepositions shown together in the Improver table, in display order. */
export const PREPOSITIONS: GreekPreposition[] = [pano, kato, me, gia, apo, mexri, se];

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
