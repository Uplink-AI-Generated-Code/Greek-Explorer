import type {
  CellOverride,
  GreekAdjective,
  GreekArticle,
  GreekConjunction,
  GreekLexeme,
  GreekNoun,
  GreekNumeral,
  GreekParticle,
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
  'The present imperative of τρώω keeps the older stem with -γ-: τρώγε, not τρώε. The other present forms have lost it.',
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
    plain: {
      determiner: {
        m: { sg: ro1('mult', PENDING), pl: ro1('mulți', 'multor') },
        f: { sg: ro1('multă', PENDING), pl: ro1('multe', 'multor') },
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
    plain: {
      determiner: {
        m: { sg: ro1('puțin', PENDING), pl: ro1('puțini', PENDING) },
        f: { sg: ro1('puțină', PENDING), pl: ro1('puține', PENDING) },
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
        // The present imperative keeps the older -γ- of the stem (τρώγε, not τρώε); reported by the user, awaiting review.
        'impPresent.2sg': { stem: 'τρώγ', ending: 'ε', note: IMPERATIVE_GAMMA },
        'impPresent.2pl': { stem: 'τρώγ', ending: 'ετε', note: IMPERATIVE_GAMMA },
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

const pao: GreekVerb = {
  id: 'pao',
  pos: 'verb',
  lemma: 'πάω',
  verified: { el: false, ro: false, en: false },
  voices: {
    active: {
      lemma: 'πάω',
      class: 'athematic',
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

const min: GreekParticle = {
  id: 'min',
  pos: 'particle',
  lemma: 'μην',
  verified: { el: false, ro: false, en: false },
  ro: 'nu / să nu',
  en: "don't / not",
  meaning: 'Says "not" after να and in a command: να μην φάω, μην φας.',
  example: { el: 'μην φας', ro: 'nu mânca', en: "don't eat" },
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

export const LEXEMES: Record<string, GreekLexeme> = {
  [kafes.id]: kafes,
  [skylos.id]: skylos,
  [alepou.id]: alepou,
  [paidi.id]: paidi,
  [psomi.id]: psomi,
  [nero.id]: nero,
  [zestos.id]: zestos,
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
  [thelo.id]: thelo,
  [pidao.id]: pidao,
  [troo.id]: troo,
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
  [theta.id]: theta,
  [na.id]: na,
  [den.id]: den,
  [min.id]: min,
  [an.id]: an,
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
