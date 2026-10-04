import { enQuantifier } from '../engine/english';
import { inflectNoun, inflectQuantifier } from '../engine/greek';
import { degreeOptions, kindOptions, senseOptions } from '../engine/labels';
import { offeredDegrees, offeredSenses } from '../engine/quantifier';
import { roBareNoun, roQuantifier } from '../engine/romanian';
import { formRich, joinRich, notice, numeralRich, plain, richText, type Rich } from '../engine/segments';
import { NOT_YET_ADDED, storedText } from '../engine/stored';
import type { Gender, GreekNoun, GreekQuantifier, Level, SlotOf } from '../types';
import { CASES, GENDERS, GENDER_ROW, caseControl, caseName, nounControl, nounOf } from './shared';
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
    CASES.map((c) => {
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
  const list: Control[] = [nounControl('Noun it goes with', state), caseControl(slot, level)];
  if (q.numbers.length > 1) {
    list.push({ key: 'kind', label: 'Kind of noun', options: kindOptions, value: slot.number === 'sg' ? 'mass' : 'count' });
  }
  if (offeredDegrees(q).length > 1) {
    list.push({ key: 'degree', label: 'Degree', options: degreeOptions(level), value: slot.degree });
  }
  if (offeredSenses(q).length > 1) {
    list.push({ key: 'sense', label: 'Romanian counterpart', options: senseOptions, value: slot.sense ?? 'some' });
  }
  return list;
}

function improverLabel(q: GreekQuantifier): string {
  const how = q.greek.plain;
  if ('stem' in how) return 'quantifier · declines like an adjective';
  if (how.table === 'kanenas') return 'quantifier · declines like the numeral ένας';
  if (how.table === 'polys') return 'quantifier · two stems (πολύ-, πολλ-)';
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

  const withNoun: PanelRow = {
    label: 'with a noun',
    el: joinRich([
      numeralRich(inflectQuantifier(q, det)),
      formRich(inflectNoun(noun, { pos: 'noun', number: det.number, case: det.case })),
    ]),
    ro: roRich(q, det, noun.ro.gender, roBareNoun(noun, det.number, det.case)),
    en: enWithNoun(q, det, noun),
  };
  const alone: PanelRow =
    slot.case === 'gen'
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
        ? `quantifier: ${enQuantifier(q, { ...det, degree: 'plain', sense: undefined })}`
        : improverLabel(q),
    badge: q.numbers.length > 1 ? (slot.number === 'sg' ? 'mass reading' : 'count reading') : undefined,
    controls: controls(q, slot, state, level),
    rows: [withNoun, alone, ...(negation ? [negation] : [])],
    full: level === 'improver' ? quantifierFull(q, here, noun) : [],
    plain:
      q.meaning +
      (q.numbers.length > 1
        ? ' The singular is the mass reading (one lump), the plural the count reading (separate things).'
        : '') +
      (slot.case === 'gen' && q.ro.genitiveWithArticle?.includes(slot.number)
        ? ' In Romanian this genitive has the article built in, so it means "of the much / the few", not plain "of much / of few".'
        : ''),
    irregular: inflectQuantifier(q, det).irregular?.plain ?? '',
    note: noun.note,
    related: numeralRelated(q, here, state),
  };
}
