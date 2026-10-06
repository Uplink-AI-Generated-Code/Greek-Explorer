import { DEF_ARTICLE, NUMERAL } from '../data/lexemes';
import { enQuantifier } from '../engine/english';
import { inflectArticle, inflectNoun, inflectNumeral, inflectQuantifier } from '../engine/greek';
import { degreeOptions, kindOptions, senseOptions } from '../engine/labels';
import { offeredCases, offeredDegrees, offeredSenses, offeredUses } from '../engine/quantifier';
import { roBareNoun, roNoun, roQuantifier } from '../engine/romanian';
import { articleRich, formRich, joinRich, notice, numeralRich, plain, richText, type Rich } from '../engine/segments';
import { NOT_YET_ADDED, storedText } from '../engine/stored';
import type { Case, Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
import { GENDERS, GENDER_ROW, caseControl, caseName, nounControl, nounOf, numberControl } from './shared';
import type { Control, Panel, PanelRow, PanelState, Related } from './types';

/** A Romanian quantifier, with the noun that follows it; a pending cell reads "not yet added". */
function roRich(q: GreekQuantifier, slot: SlotOf<'quantifier'>, roGender: Gender, noun?: string): Rich {
  const cell = roQuantifier(q, slot, roGender);
  if (cell === null) return notice('not covered');
  const word = storedText(cell);
  if (word === null) return notice(NOT_YET_ADDED);
  return plain(noun ? `${word} ${noun}` : word);
}

/** The English quantifier and noun; a count word with a mass noun in the plural has no English form. */
function enWithNoun(q: GreekQuantifier, slot: SlotOf<'quantifier'>, noun: GreekNoun): Rich {
  if (noun.mass && slot.number === 'pl') return notice('uncountable: no plural in English');
  const text = `${enQuantifier(q, slot)} ${noun.en[slot.number]}`;
  return plain(slot.case === 'gen' ? `of ${text}` : text);
}

/** The registers of a Romanian demonstrative: the formal forms or the spoken ones (spec 25). */
const registerOptions = [
  { value: 'formal', label: 'formal (acest, acesta)' },
  { value: 'spoken', label: 'spoken (ăsta, ăla)' },
];

/**
 * A near or far demonstrative with its noun in Romanian: before the noun with no article (acest copil) and after it with
 * the article (copilul acesta); the spoken forms go after the noun only (copilul ăsta).
 */
function roDemonstrativeWithNoun(q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): Rich {
  const after = roQuantifier(q, { ...det, use: 'pronoun' }, noun.ro.gender);
  if (after === null) return notice('not covered');
  const afterWord = storedText(after);
  if (afterWord === null) return notice(NOT_YET_ADDED);
  const behind = `${roNoun(noun, det.number, det.case, 'definite')} ${afterWord}`;
  if (det.register === 'spoken') return plain(behind);
  const before = roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case));
  return plain(`${richText(before)} / ${behind}`);
}

/** τέτοιος in the singular takes ένα, except with a mass noun (ένα τέτοιο σπίτι, τέτοιο ψωμί). */
const takesIndefinite = (q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): boolean =>
  q.demonstrative === 'such' && det.number === 'sg' && !noun.mass;

/** The "with a noun" row of every quantifier: the article after a near or far demonstrative, ένα before τέτοιος. */
function withNounRow(q: GreekQuantifier, det: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow {
  const nounForm = formRich(inflectNoun(noun, { pos: 'noun', number: det.number, case: det.case }));
  const near = q.demonstrative === 'near' || q.demonstrative === 'far';
  const indefinite = takesIndefinite(q, det, noun);
  const el = joinRich([
    ...(indefinite ? [numeralRich(inflectNumeral(NUMERAL, { pos: 'numeral', value: 1, gender: noun.gender, case: det.case }))] : []),
    numeralRich(inflectQuantifier(q, det)),
    ...(near ? [articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: noun.gender, number: det.number, case: det.case }))] : []),
    nounForm,
  ]);
  const ro = near
    ? roDemonstrativeWithNoun(q, det, noun)
    : q.demonstrative === 'such' && noun.mass
      ? plain(`${q.ro.lemma} ${roBareNoun(noun, det.number, det.case)}`)
      : roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case));
  const en =
    q.demonstrative === 'such' && noun.mass
      ? plain(`${det.case === 'gen' ? 'of ' : ''}such ${noun.en[det.number]}`)
      : enWithNoun(q, det, noun);
  return { label: 'with a noun', el, ro, en };
}

function negationRow(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow | null {
  if (!q.en.negated) return null;
  // The concord is shown in the object role, whatever role the panel is on.
  const object: SlotOf<'quantifier'> = { ...here, case: 'acc', number: 'sg', use: 'determiner' };
  const word = roQuantifier(q, object, noun.ro.gender);
  return {
    label: 'with negation',
    el: joinRich([
      [{ text: 'δεν θέλω', role: 'neg' }],
      numeralRich(inflectQuantifier(q, object)),
      formRich(inflectNoun(noun, { pos: 'noun', number: 'sg', case: 'acc' })),
    ]),
    ro: typeof word === 'string' ? plain(`nu vreau ${word} ${roBareNoun(noun, 'sg', 'acc')}`) : notice(NOT_YET_ADDED),
    en: plain(`I don't want ${q.en.negated} ${noun.en.sg}`),
  };
}

function quantifierFull(q: GreekQuantifier, here: SlotOf<'quantifier'>, noun: GreekNoun): PanelRow[] {
  return GENDERS.flatMap((g) =>
    offeredCases(q).map((c) => {
      const s: SlotOf<'quantifier'> = { ...here, gender: g, case: c, use: 'determiner' };
      return {
        label: `${GENDER_ROW[g]} ${caseName(c)}`,
        el: numeralRich(inflectQuantifier(q, s)),
        ro: roRich(q, s, g),
        en: plain(enQuantifier(q, s)),
        hl: { el: g === noun.gender && c === here.case, ro: g === noun.ro.gender && c === here.case, en: false },
      };
    }),
  );
}

function controls(q: GreekQuantifier, slot: SlotOf<'quantifier'>, state: PanelState, level: Level): Control[] {
  const role = caseControl(slot, level);
  const list: Control[] = [
    nounControl('Noun it goes with', state),
    { ...role, options: role.options.filter((o) => offeredCases(q).includes(o.value as Case)) },
  ];
  if (q.numbers.length > 1) {
    list.push(
      q.question === 'who' || (q.demonstrative && q.demonstrative !== 'amount')
        ? numberControl(slot.number)
        : { key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' },
    );
  }
  if (offeredDegrees(q).length > 1) {
    list.push({ key: 'degree', label: 'Degree', options: degreeOptions(level), value: slot.degree });
  }
  if (offeredSenses(q).length > 1) {
    list.push({ key: 'sense', label: 'Romanian counterpart', options: senseOptions, value: slot.sense ?? 'some' });
  }
  if (q.ro.spoken) {
    list.push({ key: 'register', label: 'Romanian form', options: registerOptions, value: slot.register ?? 'formal' });
  }
  return list;
}

const DEMONSTRATIVE_LABEL: Record<NonNullable<GreekQuantifier['demonstrative']>, string> = {
  near: 'demonstrative · near ("this")',
  far: 'demonstrative · far ("that")',
  such: 'demonstrative · "such", beside a noun only',
  amount: 'demonstrative · "so much / so many", declines like an adjective',
};

function improverLabel(q: GreekQuantifier): string {
  if (q.demonstrative) return DEMONSTRATIVE_LABEL[q.demonstrative];
  const how = q.greek.plain;
  if ('stem' in how) return 'quantifier · declines like an adjective';
  if (how.table === 'kanenas') return 'quantifier · declines like the numeral ένας';
  if (how.table === 'polys') return 'quantifier · two stems (πολύ-, πολλ-)';
  if (how.table === 'poios') return 'quantifier · declines like κάποιος, with a plural';
  return 'quantifier · singular only';
}

/** κανένας shares its pattern with the numeral ένας (spec 5.3). */
function numeralRelated(q: GreekQuantifier, here: SlotOf<'quantifier'>, state: PanelState): Related | undefined {
  const how = q.greek.plain;
  if ('stem' in how || how.table !== 'kanenas') return undefined;
  return {
    text: `${q.lemma} follows the numeral ένας.`,
    button: 'Open the numeral ένας',
    backLabel: `Back to ${q.lemma}`,
    lexeme: 'numeral',
    slot: { pos: 'numeral', value: 1, gender: here.gender, case: here.case },
    noun: state.noun,
  };
}

export function quantifierPanel(q: GreekQuantifier, slot: SlotOf<'quantifier'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const here: SlotOf<'quantifier'> = { ...slot, gender: noun.gender };
  const det: SlotOf<'quantifier'> = { ...here, use: 'determiner' };
  const pro: SlotOf<'quantifier'> = { ...here, use: 'pronoun' };

  const forms = GENDERS.map((gender) =>
    richText(
      numeralRich(
        inflectQuantifier(q, { ...here, gender, number: q.numbers[0], case: 'nom', degree: 'plain', use: 'determiner' }),
      ),
    ),
  );

  const withNoun = withNounRow(q, det, noun);
  // τέτοιος has no stand-alone use, so its row is never built.
  const aloneRow = (): PanelRow =>
    slot.case === 'gen' && !q.demonstrative
      ? {
          label: 'on its own',
          el: plain('—'),
          ro: plain('—'),
          en: plain('—'),
          dimmed: 'On its own, the possessor form is not covered in this prototype.',
        }
      : {
          label: 'on its own',
          el: numeralRich(inflectQuantifier(q, pro)),
          ro: roRich(q, pro, noun.ro.gender),
          en: plain(enQuantifier(q, pro)),
        };
  const negation = negationRow(q, here, noun);

  return {
    lemma: [...new Set(forms)].join(' / '),
    posLabel:
      level === 'beginner'
        ? `${q.question ? 'question word' : q.demonstrative ? 'demonstrative' : 'quantifier'}: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined, register: undefined })}`
        : improverLabel(q),
    badge: q.question
      ? 'question word'
      : q.demonstrative
        ? 'demonstrative'
        : q.numbers.length > 1
        ? slot.number === 'sg'
          ? 'mass reading'
          : 'count reading'
        : undefined,
    controls: controls(q, slot, state, level),
    rows: [withNoun, ...(offeredUses(q).includes('pronoun') ? [aloneRow()] : []), ...(negation ? [negation] : [])],
    full: level === 'improver' ? quantifierFull(q, here, noun) : [],
    plain:
      q.meaning +
      (q.numbers.length > 1 && q.question !== 'who' && (!q.demonstrative || q.demonstrative === 'amount')
        ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
        : '') +
      (slot.case === 'gen' && q.ro.genitiveWithArticle?.includes(slot.number)
        ? ' In Romanian this genitive has the article built in, so it means "of the much / the few", not plain "of much / of few".'
        : '') +
      (slot.case === 'gen' && slot.number === 'pl' && q.ro.genitiveWithA
        ? ` Romanian also says "${q.ro.genitiveWithA}" (a + the plain plural) with the same meaning.`
        : '') +
      (slot.register === 'spoken'
        ? ' The spoken Romanian forms (ăsta, ăla) go after the noun, which keeps its article (casa asta), and have no genitive.'
        : ''),
    irregular: inflectQuantifier(q, det).irregular?.plain ?? '',
    note: noun.note,
    related: numeralRelated(q, here, state),
  };
}
