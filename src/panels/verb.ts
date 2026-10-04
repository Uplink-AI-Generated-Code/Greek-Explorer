import { nounPhrase } from '../engine/agree';
import { composedRich, compose } from '../engine/compose';
import { enVerb } from '../engine/english';
import { getNoun } from '../data/lexemes';
import {
  EN_PRONOUNS,
  GREEK_PRONOUNS,
  RO_PRONOUNS,
  moodLabel,
  moodOptions,
  objectOptions,
  tenseLabel,
  tenseOptions,
  voiceOptions,
  whoOptions,
  whoOptionsFor,
} from '../engine/labels';
import {
  isOffered,
  offeredMoods,
  offeredTenses,
  offeredVoices,
  offeredWho,
  slotProblem,
  voiceOf,
} from '../engine/offers';
import { objectKind, type ObjectKind } from '../engine/objects';
import { readingFor } from '../engine/reading';
import { roVerb } from '../engine/romanian';
import { dim, plain, type Rich, type Segment } from '../engine/segments';
import { MOODS, TENSES_OF_MOOD, whoIndex } from '../engine/tenses';
import type { GreekNoun, GreekVerb, Level, Mood, Person, Reading, SlotOf, Tense, VerbClass, Voice } from '../types';
import { ALL, nounControl } from './shared';
import type { Control, Panel, PanelRow, PanelState, ReadingView } from './types';

const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
  athematic: 'athematic class',
  mediopassive: 'mediopassive -ομαι class',
  deponent: 'deponent -άμαι class',
  impersonal: 'impersonal',
  copula: 'irregular copula',
};

const SPACE: Segment = { text: ' ', role: 'plain' };

/** One sentence describing the slot (spec 5.1), keyed '<mood>.<tense>'. */
const PLAIN: Record<string, string> = {
  'indicative.present': 'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
  'indicative.imperfect': 'The imperfect says what was going on or used to happen. Greek adds a past-tense prefix to the stem and keeps it only where the stress allows.',
  'indicative.aorist': 'The aorist says what happened, once and finished. Romanian uses its one compound past for this and for the perfect.',
  'indicative.future': 'The continuous future is θα + the present form: something that will go on or repeat. English and Romanian have no separate form for it.',
  'indicative.futureSimple': 'The simple future is θα + the aorist subjunctive form: something that will happen once. It looks like the subjunctive with θα in front.',
  'indicative.perfect': 'The present perfect is έχω + one form that never changes, so only έχω changes with the person. Romanian does the same with a avea + a participle.',
  'indicative.pluperfect': 'The past perfect is είχα + the same unchanging form. Romanian has a single word for it (mâncasem).',
  'indicative.futurePerfect': 'The future perfect is θα + έχω + the unchanging form: what will have happened by a later time.',
  'subjunctive.present': 'Greek has no infinitive: "to eat" is να + a verb form. The present stem says "regularly" or "in general".',
  'subjunctive.aorist': 'The aorist stem after να says "once". Greek chooses between this and the present stem; Romanian and English do not.',
  'subjunctive.perfect': 'να + έχω + the unchanging form looks back with doubt or hope: "may have eaten".',
  'imperative.present': 'The present imperative asks for something to go on or repeat ("keep eating"). It is used for the second person only.',
  'imperative.aorist': 'The aorist imperative asks for something to be done once and finished ("eat up"). It is used for the second person only.',
  'conditional.imperfect': 'Greek has no conditional forms: θα + the imperfect says "would". It is also the polite way to ask: θα ήθελα.',
  'conditional.pluperfect': 'θα + the past perfect says "would have": what would have happened.',
};

function classMessage(data: { class: VerbClass }): string {
  return data.class === 'contracted-ao'
    ? 'Contracted -άω verbs: the stressed ending (-άς, -άει) replaces the -ω endings.'
    : '';
}

const pronounCells = (verb: GreekVerb, slot: SlotOf<'verb'>) => {
  const data = voiceOf(verb, slot.voice);
  return { show: slot.mood !== 'imperative' && !data.thirdSingularOnly, impersonal: data.thirdSingularOnly === true };
};

export function verbRow(verb: GreekVerb, slot: SlotOf<'verb'>): PanelRow {
  const index = whoIndex(slot);
  const { show, impersonal } = pronounCells(verb, slot);
  const en = enVerb(verb, slot);
  const enPronoun = impersonal ? 'it' : EN_PRONOUNS[index];
  const label = impersonal ? 'it' : whoOptions[index].label;
  const lead: Rich = en.lead ? [{ text: en.lead, role: 'plain' }, SPACE] : [];
  const subject: Rich = en.subject ? [{ text: enPronoun, role: 'pronoun' }, SPACE] : [];
  return {
    label,
    el: [...(show ? [...dim(`(${GREEK_PRONOUNS[index]})`), SPACE] : []), ...composedRich(compose(verb, slot))],
    ro: [...(show ? [...dim(`(${RO_PRONOUNS[index]})`), SPACE] : []), { text: roVerb(verb, slot), role: 'plain' }],
    en: [...lead, ...subject, { text: en.verb, role: 'plain' }],
  };
}

/** The bare verb for another person: the tables show forms without pronouns or short forms. */
const whoSlot = (slot: SlotOf<'verb'>, who: string): SlotOf<'verb'> => {
  const next: SlotOf<'verb'> = { ...slot, person: Number(who[0]) as Person, number: who.slice(1) as 'sg' | 'pl' };
  delete next.clitics;
  delete next.shortForm;
  return next;
};

/** Where the negation goes, added to the plain-language line of a negated slot (spec 4.3, 6.4). */
const NEGATION_PLAIN: Record<Mood, string> = {
  indicative: 'δεν goes in front of the whole group, even in front of θα: δεν θα φάω.',
  conditional: 'δεν goes in front of the whole group, even in front of θα: δεν θα έτρωγα.',
  subjunctive: 'μην goes after να: να μην φάω.',
  imperative: 'A negative command is not the imperative: Greek uses μην + the subjunctive form, as in μην φας.',
};

/** A new slot with one verb control applied; anything the new value makes invalid falls back to the first valid choice. */
export function changeVerbSlot(
  verb: GreekVerb,
  slot: SlotOf<'verb'>,
  key: 'mood' | 'tense' | 'voice' | 'polarity',
  value: string,
): SlotOf<'verb'> {
  const next = { ...slot };
  if (key === 'voice') next.voice = value as Voice;
  if (key === 'mood') next.mood = value as Mood;
  if (key === 'tense') next.tense = value as Tense;
  if (key === 'polarity') {
    if (value === 'negative') next.polarity = 'negative';
    else delete next.polarity;
  }
  const moods = offeredMoods(verb, next.voice);
  if (!moods.includes(next.mood)) next.mood = moods[0];
  const tenses = offeredTenses(verb, next.voice, next.mood);
  if (!tenses.includes(next.tense)) next.tense = tenses[0];
  const who = offeredWho(verb, next.voice, next.mood);
  if (!who.includes(`${next.person}${next.number}`)) {
    next.person = Number(who[0][0]) as Person;
    next.number = who[0].slice(1) as 'sg' | 'pl';
    if (next.mood === 'imperative') next.number = slot.number;
  }
  // A negative command needs the verb to offer the matching subjunctive; if it does not, drop the negation.
  if (next.polarity === 'negative' && !isOffered(verb, next)) delete next.polarity;
  // Pronouns and short forms are for commands; drop what no longer fits.
  if (next.mood !== 'imperative') {
    delete next.clitics;
    delete next.shortForm;
  }
  if (next.polarity === 'negative') delete next.shortForm;
  if (slotProblem(verb, next)) delete next.shortForm;
  if (slotProblem(verb, next)) delete next.clitics;
  return next;
}

/** Where the pronoun goes, added to the plain-language line of a command with pronouns (spec 6.5). */
const CLITIC_PLAIN = {
  affirmative: 'The pronoun follows an affirmative command (φάε το).',
  negative: 'The pronoun goes in front of the verb in a negative command (μην το φας).',
};

/** The command with its object spelled out: φάε το ψωμί / mănâncă pâinea / eat the bread. */
function objectRow(verb: GreekVerb, slot: SlotOf<'verb'>, noun: GreekNoun): PanelRow {
  const base = verbRow(verb, slot);
  const np = nounPhrase(noun, 'sg', 'acc', { article: 'definite' });
  return {
    ...base,
    el: [...base.el, SPACE, ...np.el],
    ro: [...base.ro, SPACE, ...plain(np.ro)],
    en: [...base.en, SPACE, ...plain(np.en)],
  };
}

function controls(verb: GreekVerb, slot: SlotOf<'verb'>, state: PanelState, kind: ObjectKind, level: Level): Control[] {
  const list: Control[] = [
    {
      key: 'who',
      label: 'Who?',
      options: whoOptionsFor(offeredWho(verb, slot.voice, slot.mood)),
      value: `${slot.person}${slot.number}`,
    },
    {
      key: 'mood',
      label: 'Mood',
      options: moodOptions(level, offeredMoods(verb, slot.voice)),
      value: slot.mood,
    },
    {
      key: 'tense',
      label: 'When?',
      options: tenseOptions(level, slot.mood, offeredTenses(verb, slot.voice, slot.mood)),
      value: slot.tense,
    },
  ];
  const voices = offeredVoices(verb);
  if (voices.length > 1) {
    list.push({ key: 'voice', label: 'Voice', options: voiceOptions(level, voices), value: slot.voice });
  }
  list.push({
    key: 'polarity',
    label: 'Negated?',
    options: [
      { value: 'affirmative', label: 'No' },
      { value: 'negative', label: 'Yes' },
    ],
    value: slot.polarity ?? 'affirmative',
  });
  if (slot.mood === 'imperative') {
    const indirect = voiceOf(verb, slot.voice).indirect === true;
    list.push({ key: 'object', label: 'Object', options: objectOptions(level, indirect), value: kind });
    if (kind !== 'none') list.push(nounControl('Object noun', state));
  }
  return list;
}

function overviewRow(verb: GreekVerb, slot: SlotOf<'verb'>, mood: Mood, tense: Tense): PanelRow {
  const target: SlotOf<'verb'> = { ...slot, mood, tense };
  delete target.clitics;
  delete target.shortForm;
  const label = `${moodLabel('improver', mood)} · ${tenseLabel('improver', mood, tense)}`;
  if (!isOffered(verb, target)) {
    const lemma = voiceOf(verb, slot.voice).lemma;
    let reason: string;
    if (!offeredMoods(verb, slot.voice).includes(mood)) {
      reason =
        mood === 'imperative' ? `${lemma} has no imperative` : `${lemma} has no ${moodLabel('improver', mood)}`;
    } else if (!offeredTenses(verb, slot.voice, mood).includes(tense)) {
      reason = `${lemma} has no ${tenseLabel('improver', mood, tense).toLowerCase()} form`;
    } else if (mood === 'imperative' && slot.person !== 2) {
      reason = 'commands are for "you" only';
    } else {
      reason = `${lemma} has no ${moodLabel('improver', mood)} for this person`;
    }
    const none = plain('—');
    return { label, el: none, ro: none, en: none, dimmed: reason };
  }
  const row = verbRow(verb, target);
  return { ...row, label, hl: mood === slot.mood && tense === slot.tense ? ALL : undefined };
}

function readingViews(reading: Reading, level: Level): ReadingView[] {
  const view = (lang: ReadingView['lang'], line: Reading['el']): ReadingView => ({
    lang,
    parts: line.parts,
    sentence: level === 'beginner' ? line.beginner : line.improver,
  });
  return [view('el', reading.el), ...(reading.ro ? [view('ro', reading.ro)] : []), ...(reading.en ? [view('en', reading.en)] : [])];
}

export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, state: PanelState, level: Level): Panel {
  const data = voiceOf(verb, slot.voice);
  const composed = compose(verb, slot);
  const lexical = composed.pieces[composed.pieces.length - 1];
  const formNote = lexical.kind === 'verb' ? lexical.form.irregular?.plain : undefined;
  const who = offeredWho(verb, slot.voice, slot.mood);
  const kind: ObjectKind = slot.mood === 'imperative' ? objectKind(slot, state.noun) : 'none';
  const objectNoun = kind === 'noun' && state.noun ? getNoun(state.noun) : null;
  return {
    lemma: data.lemma,
    posLabel:
      level === 'beginner' ? `verb: to ${data.en.gloss}` : `verb · ${CLASS_LABEL[data.class]} · ${slot.voice}`,
    controls: controls(verb, slot, state, kind, level),
    rows: [objectNoun ? objectRow(verb, slot, objectNoun) : verbRow(verb, slot)],
    full:
      level === 'improver'
        ? who.map((w) => ({
            ...verbRow(verb, whoSlot(slot, w)),
            hl: w === `${slot.person}${slot.number}` ? ALL : undefined,
          }))
        : [],
    overview:
      level === 'improver'
        ? MOODS.flatMap((mood) => TENSES_OF_MOOD[mood].map((tense) => overviewRow(verb, slot, mood, tense)))
        : [],
    reading: readingViews(readingFor(verb, slot), level),
    plain:
      PLAIN[`${slot.mood}.${slot.tense}`] +
      (slot.polarity === 'negative' ? ` ${NEGATION_PLAIN[slot.mood]}` : '') +
      ((slot.clitics ?? []).length > 0
        ? ` ${slot.polarity === 'negative' ? CLITIC_PLAIN.negative : CLITIC_PLAIN.affirmative}`
        : ''),
    irregular: composed.irregular?.plain ?? formNote ?? classMessage(data),
    note: '',
  };
}
