import { inflect } from '../engine/greek';
import { offeredCases, quantifierSlots } from '../engine/quantifier';
import { allVerbSlots, isOffered, shortFormOf, slotProblem } from '../engine/offers';
import { enClitic, roClitic } from '../engine/clitics';
import { RO_CLITICS, RO_CLUSTERS, type RoClitic } from '../data/clitics';
import { RECIPIENTS } from '../engine/objects';
import { possessedNounForm } from '../engine/agree';
import { enPossessive, greekPossessive, POSSESSORS } from '../engine/possessive';
import { EN_POSSESSIVES, RO_POSSESSIVES } from '../data/possessives';
import { compose, lexicalPiece } from '../engine/compose';
import { memberKind, memberText } from '../engine/groups';
import { READING_TEMPLATES } from '../data/readings';
import { readingFor } from '../engine/reading';
import { formText } from '../engine/segments';
import { enQuantifier, enVerb } from '../engine/english';
import { fusedForm } from '../engine/preposition';
import { roQuantifier, roVerb } from '../engine/romanian';
import { isSegmented, linkedToken, linksOf, unitText } from '../glossLinks';
import type { Case, Clitic, Divergence, FormGroup, Gender, GreekLexeme, GreekVerb, Num, NumeralValue, Phrase, Slot, SlotOf, Token, VerbVoice, Voice } from '../types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const CASES: Case[] = ['nom', 'acc', 'gen'];
const NUMS: Num[] = ['sg', 'pl'];
const VALUES: NumeralValue[] = [1, 2, 3, 4, 5];

export interface ValidationInput {
  lexemes: Record<string, GreekLexeme>;
  phrases: Phrase[];
  groups?: FormGroup[];
  divergences?: Divergence[];
}

const isEmpty = (s: string | undefined): boolean => !s || s.trim() === '';

/** Problems in the stored Romanian pronoun and pair tables: a blank field, or neither a fusion nor a postposed form. */
export function roTableProblems(clitics: Record<string, RoClitic>, clusters: Record<string, RoClitic>): string[] {
  const problems: string[] = [];
  for (const [key, entry] of [...Object.entries(clitics), ...Object.entries(clusters)]) {
    for (const field of ['free', 'enclitic', 'afterNu', 'afterSa'] as const) {
      if (isEmpty(entry[field])) problems.push(`lexeme clitic: ${key} has an empty ${field}`);
    }
    if (isEmpty(entry.fused) && isEmpty(entry.after)) problems.push(`lexeme clitic: ${key} has an empty fused and after`);
  }
  return problems;
}

/** Every pronoun slot: both roles, both numbers, and the three genders of the third person. */
function cliticSlots(): SlotOf<'clitic'>[] {
  return (['object', 'indirect'] as const).flatMap((role) =>
    NUMS.flatMap((number) =>
      ([1, 2, 3] as const).flatMap((person): SlotOf<'clitic'>[] =>
        person === 3
          ? GENDERS.map((gender): SlotOf<'clitic'> => ({ pos: 'clitic', person, number, gender, role }))
          : [{ pos: 'clitic', person, number, role }],
      ),
    ),
  );
}

export function slotsFor(l: GreekLexeme): Slot[] {
  switch (l.pos) {
    case 'noun':
      return NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'noun', number, case: c })));
    case 'adjective':
      return GENDERS.flatMap((gender) =>
        NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'adjective', gender, number, case: c }))),
      );
    case 'article':
      return GENDERS.flatMap((gender) =>
        NUMS.flatMap((number) => CASES.map((c): Slot => ({ pos: 'article', gender, number, case: c }))),
      );
    case 'numeral':
      return VALUES.flatMap((value) =>
        GENDERS.flatMap((gender) => CASES.map((c): Slot => ({ pos: 'numeral', value, gender, case: c }))),
      );
    case 'preposition':
      return [{ pos: 'preposition' }];
    case 'verb':
      return allVerbSlots(l);
    case 'particle':
      return [{ pos: 'particle' }];
    case 'conjunction':
      return [{ pos: 'conjunction' }];
    case 'interrogative':
      return [{ pos: 'interrogative' }];
    case 'clitic':
      return cliticSlots();
    case 'possessive':
      return POSSESSORS.map((p): Slot => ({ ...p.slot }));
    case 'quantifier':
      return quantifierSlots(l);
  }
}

const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };

/** The same pronoun for a noun that is masculine in Romanian (παιδί: îl), so both Romanian forms are built. */
const IT_M: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm', enPronoun: 'it' };

/**
 * The forms with pronouns the panel can build from an offered slot: one direct pronoun (in both Romanian genders)
 * and, for a verb with an indirect object, the pair "to someone + it" for every recipient; for a command also the
 * recipient alone, beside a spelled-out noun.
 * Each comes affirmative and negative, and a command also with its short form.
 */
export function pronounSlots(verb: GreekVerb, slot: SlotOf<'verb'>): SlotOf<'verb'>[] {
  const data = verb.voices[slot.voice];
  if (!data || slot.voice !== 'active' || data.intransitive) return [];
  const command = slot.mood === 'imperative';
  const sets: Clitic[][] = [
    [IT],
    [IT_M],
    ...(data.indirect === true
      ? RECIPIENTS.flatMap(({ clitic }) => [[clitic, IT], [clitic, IT_M], ...(command ? [[clitic]] : [])])
      : []),
  ];
  return sets.flatMap((clitics): SlotOf<'verb'>[] => [
    { ...slot, clitics },
    { ...slot, clitics, polarity: 'negative' },
    ...(command && shortFormOf(verb, slot) ? [{ ...slot, clitics, shortForm: true }] : []),
  ]);
}

function checkLexeme(l: GreekLexeme, lexemes: Record<string, GreekLexeme>): string[] {
  const errors: string[] = [];
  for (const slot of slotsFor(l)) {
    try {
      const form = inflect(l, slot);
      if (isEmpty(form.stem)) errors.push(`lexeme ${l.id}: empty Greek form for ${JSON.stringify(slot)}`);
    } catch (e) {
      errors.push(`lexeme ${l.id}: cannot inflect ${JSON.stringify(slot)}: ${(e as Error).message}`);
    }
  }
  if (l.pos === 'noun') {
    for (const n of NUMS) {
      for (const [key, value] of Object.entries(l.ro.forms[n])) {
        if (isEmpty(value)) errors.push(`lexeme ${l.id}: empty Romanian form ${n}.${key}`);
      }
      if (isEmpty(l.en[n])) errors.push(`lexeme ${l.id}: empty English form ${n}`);
    }
  }
  if (l.pos === 'adjective') {
    for (const g of GENDERS) {
      for (const n of NUMS) {
        if (isEmpty(l.ro.forms[g][n])) errors.push(`lexeme ${l.id}: empty Romanian form ${g}.${n}`);
      }
    }
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
    if (l.derivedFrom) {
      const from = l.derivedFrom;
      const verb = lexemes[from.verb];
      if (!verb || verb.pos !== 'verb') {
        errors.push(`lexeme ${l.id}: derived from unknown verb "${from.verb}"`);
      } else {
        const stored = verb.voices.active?.stems.participle;
        if (stored !== from.stem) {
          errors.push(`lexeme ${l.id}: the participle stem ${from.stem} is not the stem ${stored ?? '(none)'} that ${verb.id} stores`);
        }
      }
      if (l.stem !== `${from.stem}μέν`) errors.push(`lexeme ${l.id}: the stem ${l.stem} is not ${from.stem}μέν`);
      if (l.class !== 'adj-unstressed') errors.push(`lexeme ${l.id}: a participle in -μένος is stem-stressed`);
    }
  }
  if (l.pos === 'numeral') {
    for (const v of VALUES) {
      for (const g of GENDERS) {
        if (isEmpty(l.ro[v][g].nom) || isEmpty(l.ro[v][g].gen)) {
          errors.push(`lexeme ${l.id}: empty Romanian form ${v}.${g}`);
        }
      }
      if (isEmpty(l.en[v])) errors.push(`lexeme ${l.id}: empty English form ${v}`);
    }
  }
  if (l.pos === 'verb') {
    for (const voice of Object.values(l.voices)) {
      for (const key of ['present', 'presentNot'] as const) {
        const cells = voice?.en[key];
        if (cells !== undefined && cells.length !== 6) errors.push(`lexeme ${l.id}: en.${key} has ${cells.length} cells, not six`);
      }
    }
    for (const [name, voice] of Object.entries(l.voices)) {
      const subjunctive = voice?.offers.subjunctive ?? [];
      if ((voice?.offers.hortative ?? []).length > 0 && !(subjunctive.includes('present') && subjunctive.includes('aorist'))) {
        errors.push(`lexeme ${l.id}: the ${name} voice offers the hortative but not the subjunctive present and aorist`);
      }
    }
    const slots = allVerbSlots(l).flatMap((s): SlotOf<'verb'>[] => [
      s,
      { ...s, polarity: 'negative' },
      ...pronounSlots(l, s),
    ]);
    for (const slot of slots.filter((s) => isOffered(l, s) && slotProblem(l, s) === null)) {
      const where = `lexeme ${l.id}: cannot build ${JSON.stringify(slot)}`;
      try {
        const composed = compose(l, slot);
        if (isEmpty(composed.text)) errors.push(`${where}: empty Greek group`);
        for (const part of readingFor(l, slot).el.parts) {
          if (isEmpty(part.gloss)) errors.push(`${where}: reading part "${part.text}" has no gloss`);
        }
        const rules = [composed.irregular?.rule, lexicalPiece(composed)?.form.irregular?.rule];
        for (const rule of rules) {
          if (rule && !READING_TEMPLATES.some((t) => t.rule === rule)) {
            errors.push(`lexeme ${l.id}: the irregular rule "${rule}" has no authored reading`);
          }
        }
        const ro = roVerb(l, slot);
        if (isEmpty(ro) || ro.includes('undefined') || /^\s/.test(ro) || /\s$/.test(ro) || /\s{2,}/.test(ro)) errors.push(`${where}: no Romanian form`);
        const en = enVerb(l, slot).verb;
        if (isEmpty(en) || en.includes('undefined') || /\s$/.test(en) || /\s{2,}/.test(en)) {
          errors.push(`lexeme ${l.id}: empty English form for ${JSON.stringify(slot)}`);
        }
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
  if (l.pos === 'particle') {
    if (isEmpty(l.ro) || isEmpty(l.en) || isEmpty(l.example.el)) errors.push(`lexeme ${l.id}: empty Romanian, English or example`);
  }
  if (l.pos === 'conjunction') {
    if (isEmpty(l.ro) || isEmpty(l.en) || isEmpty(l.example.el)) errors.push(`lexeme ${l.id}: empty Romanian, English or example`);
  }
  if (l.pos === 'interrogative') {
    const texts = [l.ro, l.en, l.meaning, ...Object.values(l.question), ...(l.answer ? Object.values(l.answer) : [])];
    if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian, English, meaning or example text`);
    for (const key of Object.keys(l.roAfter ?? {})) {
      if (lexemes[key]?.pos !== 'preposition') errors.push(`lexeme ${l.id}: roAfter names "${key}", which is not a preposition`);
    }
    for (const [key, value] of Object.entries(l.roAfter ?? {})) {
      if (isEmpty(value)) errors.push(`lexeme ${l.id}: roAfter for ${key} is empty`);
    }
  }
  if (l.pos === 'possessive') {
    for (const [key, entry] of Object.entries(RO_POSSESSIVES)) {
      const forms = typeof entry === 'string' ? [entry] : [entry.m.sg, entry.m.pl, entry.f.sg, entry.f.pl];
      if (forms.some(isEmpty)) errors.push(`lexeme ${l.id}: an empty Romanian possessive for ${key}`);
    }
    for (const [key, word] of Object.entries(EN_POSSESSIVES)) {
      if (isEmpty(word)) errors.push(`lexeme ${l.id}: an empty English possessive for ${key}`);
    }
    for (const p of POSSESSORS) {
      if (isEmpty(enPossessive(p.slot))) errors.push(`lexeme ${l.id}: no English possessive for ${p.value}`);
    }
  }
  if (l.pos === 'clitic') {
    errors.push(...roTableProblems(RO_CLITICS, RO_CLUSTERS));
    for (const slot of cliticSlots()) {
      const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
      try {
        if (isEmpty(roClitic(slot).free) || isEmpty(roClitic(slot).enclitic) || isEmpty(roClitic(slot).afterNu)) {
          errors.push(`${where}: empty Romanian pronoun`);
        }
        if (isEmpty(enClitic(slot))) errors.push(`${where}: empty English pronoun`);
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
  if (l.pos === 'quantifier') {
    if (l.numbers.length === 0) errors.push(`lexeme ${l.id}: a quantifier must offer at least one number`);
    if (l.ro.few && !l.en.few) errors.push(`lexeme ${l.id}: ro.few has no en.few`);
    if (l.question && !(l.cases?.length === 2 && l.cases.includes('nom') && l.cases.includes('acc'))) {
      errors.push(`lexeme ${l.id}: a question word offers the subject and object roles only`);
    }
    for (const slot of quantifierSlots(l)) {
      const where = `lexeme ${l.id}: ${JSON.stringify(slot)}`;
      for (const roGender of ['m', 'f'] as const) {
        try {
          const cell = roQuantifier(l, slot, roGender);
          if (cell === null) {
            // A stand-alone genitive pronoun is not covered (spec 6.3); a determiner must have one.
            if (slot.use === 'determiner') errors.push(`${where}: no Romanian ${roGender} determiner form in the genitive`);
          } else if (typeof cell === 'string' && isEmpty(cell)) {
            errors.push(`${where}: empty Romanian ${roGender} form`);
          }
        } catch (e) {
          errors.push(`${where}: ${(e as Error).message}`);
        }
      }
      try {
        if (isEmpty(enQuantifier(l, slot))) errors.push(`${where}: empty English form`);
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
  if (l.pos === 'preposition') {
    if (isEmpty(l.ro)) errors.push(`lexeme ${l.id}: empty Romanian form`);
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
    for (const gender of GENDERS) {
      for (const number of NUMS) {
        const form = l.fused?.[gender][number];
        if (l.fused && (!form || isEmpty(form))) errors.push(`lexeme ${l.id}: no fused form for ${gender} ${number}`);
        if (form && !form.startsWith(l.lemma.slice(0, 1))) errors.push(`lexeme ${l.id}: the fused form ${form} does not start with ${l.lemma.slice(0, 1)}`);
      }
    }
    const values = (l.senses ?? []).map((s) => s.value);
    if (new Set(values).size !== values.length) errors.push(`lexeme ${l.id}: two senses have the same value`);
    for (const sense of l.senses ?? []) {
      const texts = [sense.label, sense.en, sense.example.el, sense.example.ro, sense.example.en, ...(sense.dative ? [] : [sense.ro])];
      if (texts.some(isEmpty)) errors.push(`lexeme ${l.id}: the sense "${sense.value}" has an empty text`);
    }
  }
  return errors;
}

/** Compares a token's text with the composed text, ignoring capitals and trailing punctuation. */
const normalise = (text: string): string => text.toLowerCase().replace(/[!?.,;·]+$/u, '').trim();

/** How many parts a token has: the pieces of a verb group, two for a fused preposition (σε + the article), else 0. */
function pieceCount(token: Token | undefined, lexemes: Record<string, GreekLexeme>): number {
  if (token?.slot.pos === 'preposition') {
    const prep = lexemes[token.lexeme];
    return prep?.pos === 'preposition' && prep.fused ? 2 : 0;
  }
  if (!token || token.slot.pos !== 'verb') return 0;
  const lexeme = lexemes[token.lexeme];
  if (!lexeme || lexeme.pos !== 'verb') return 0;
  try {
    return compose(lexeme, token.slot).pieces.length;
  } catch {
    return 0;
  }
}

function checkToken(phraseId: string, phrase: Phrase, index: number, token: Token, lexemes: Record<string, GreekLexeme>): string[] {
  const where = `${phraseId} token ${index} (${token.text})`;
  const lexeme = lexemes[token.lexeme];
  if (!lexeme) return [`${where}: unknown lexeme "${token.lexeme}"`];
  if (token.slot.pos === 'clitic') {
    return [`${where}: a pronoun is a piece of the verb group, not a token of its own`];
  }
  if (token.slot.pos !== lexeme.pos) {
    return [`${where}: slot is ${token.slot.pos} but lexeme ${lexeme.id} is ${lexeme.pos}`];
  }
  const errors: string[] = [];
  let inflected = true;
  try {
    inflect(lexeme, token.slot);
  } catch (e) {
    inflected = false;
    errors.push(`${where}: ${(e as Error).message}`);
  }
  if (token.slot.pos === 'verb' && lexeme.pos === 'verb') {
    const problem = slotProblem(lexeme, token.slot);
    if (!isOffered(lexeme, token.slot)) {
      errors.push(`${where}: slot is not offered by ${lexeme.id}`);
    } else if (problem) {
      errors.push(`${where}: ${problem}`);
    } else {
      try {
        const composed = compose(lexeme, token.slot);
        if (normalise(composed.text) !== normalise(token.text)) {
          errors.push(`${where}: text differs from what compose produces ("${composed.text}")`);
        }
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
  // A quantifier on its own (Ποιος είναι;) needs no noun; a quantifier that points at a noun must agree with it.
  const aloneQuantifier = token.slot.pos === 'quantifier' && token.slot.use === 'pronoun' && token.agreesWith === undefined;
  if (
    !aloneQuantifier &&
    (token.slot.pos === 'adjective' ||
      token.slot.pos === 'numeral' ||
      token.slot.pos === 'article' ||
      token.slot.pos === 'quantifier')
  ) {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const noun = target ? lexemes[target.lexeme] : undefined;
    if (!noun || noun.pos !== 'noun') {
      errors.push(`${where}: ${token.slot.pos} needs agreesWith pointing at a noun`);
    } else if (token.slot.gender !== noun.gender) {
      errors.push(`${where}: slot gender ${token.slot.gender} differs from noun gender ${noun.gender}`);
    }
  }
  if (token.slot.pos === 'quantifier' && lexeme.pos === 'quantifier') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    if (target && target.slot.pos === 'noun' && target.slot.number !== token.slot.number) {
      errors.push(`${where}: the quantifier is ${token.slot.number} but its noun is ${target.slot.number}`);
    }
    if (target && target.slot.pos === 'noun' && target.slot.case !== token.slot.case) {
      errors.push(`${where}: the quantifier is ${token.slot.case} but its noun is ${target.slot.case}`);
    }
    if (!offeredCases(lexeme).includes(token.slot.case)) errors.push(`${where}: ${lexeme.id} does not offer the ${token.slot.case} role`);
    if (token.slot.sense === 'few' && !lexeme.ro.few) errors.push(`${where}: ${lexeme.id} has no "few" sense`);
    try {
      const form = formText(inflect(lexeme, token.slot));
      if (normalise(form) !== normalise(token.text)) errors.push(`${where}: text differs from the form ("${form}")`);
    } catch {
      // inflect failed: reported above.
    }
  }
  if (token.slot.pos === 'possessive') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const slot = token.slot;
    if (!POSSESSORS.some((p) => p.slot.person === slot.person && p.slot.number === slot.number && p.slot.gender === slot.gender)) {
      errors.push(`${where}: this possessor is not one the app offers`);
    }
    if (!target || lexemes[target.lexeme]?.pos !== 'noun') {
      errors.push(`${where}: a possessive needs agreesWith pointing at the noun it belongs to`);
    } else {
      const at = token.agreesWith as number;
      const between = phrase.tokens.slice(at + 1, index);
      // After δικός it may stand before its noun (το δικό μου σπίτι) or after the verb (είναι δικό μου).
      const before = phrase.tokens[index - 1];
      const beforeLexeme = before ? lexemes[before.lexeme] : undefined;
      const afterOwn = beforeLexeme?.pos === 'adjective' && beforeLexeme.emphatic === true && before?.agreesWith === at;
      if (afterOwn) {
        // nothing more to check about its place
      } else if (at >= index) {
        errors.push(`${where}: a possessive comes after its noun`);
      } else if (between.length > 0) {
        errors.push(`${where}: a possessive comes directly after its noun`);
      }
      const hasArticle = phrase.tokens.some((t) => t.slot.pos === 'article' && t.lexeme === 'def' && t.agreesWith === at);
      if (!hasArticle) errors.push(`${where}: the noun of a possessive needs the definite article`);
      if (inflected && normalise(greekPossessive(slot)) !== normalise(token.text)) {
        errors.push(`${where}: text differs from the possessive ("${greekPossessive(slot)}")`);
      }
    }
  }
  if (token.slot.pos === 'adjective' && lexeme.pos === 'adjective' && lexeme.emphatic) {
    // δικός is always followed by the possessive of the same noun: το δικό μου σπίτι.
    const next = phrase.tokens[index + 1];
    if (!next || next.slot.pos !== 'possessive' || next.agreesWith !== token.agreesWith) {
      errors.push(`${where}: δικός needs the possessive of the same noun directly after it`);
    }
  }
  if (token.slot.pos === 'noun' && lexeme.pos === 'noun') {
    // A noun with a possessive after it is written with the second accent where the stress rule asks for it (θάλασσά μου).
    const possessive = phrase.tokens[index + 1];
    if (possessive && possessive.slot.pos === 'possessive' && possessive.agreesWith === index) {
      try {
        const expected = formText(possessedNounForm(lexeme, token.slot.number, token.slot.case, possessive.slot));
        if (normalise(expected) !== normalise(token.text)) {
          errors.push(`${where}: text differs from the form before the possessive ("${expected}")`);
        }
      } catch (e) {
        errors.push(`${where}: ${(e as Error).message}`);
      }
    }
  }
  if (token.slot.pos === 'preposition') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const governed = target ? lexemes[target.lexeme] : undefined;
    if (!governed || (governed.pos !== 'noun' && governed.pos !== 'interrogative')) {
      errors.push(`${where}: preposition needs agreesWith pointing at the noun or question word it governs`);
    }
    if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'noun' && target?.slot.pos === 'noun') {
      // σε is written as one word with the article of its noun: στον for a masculine singular noun.
      const expected = fusedForm(lexeme, governed, target.slot.number, phrase.tokens[index + 1]?.text);
      if (expected && normalise(expected) !== normalise(token.text)) {
        errors.push(`${where}: text differs from the fused form ("${expected}")`);
      }
      if (target.slot.case !== 'acc') errors.push(`${where}: ${lexeme.lemma} governs the accusative, so its noun must be accusative`);
    } else if (lexeme.pos === 'preposition' && lexeme.fused && governed?.pos === 'interrogative') {
      errors.push(`${where}: ${lexeme.lemma} fuses with an article, so it needs a noun in agreesWith`);
    }
    if (lexeme.pos === 'preposition' && token.slot.pos === 'preposition' && token.slot.sense !== undefined) {
      const sense = token.slot.sense;
      if (!(lexeme.senses ?? []).some((s) => s.value === sense)) errors.push(`${where}: ${lexeme.lemma} has no sense "${sense}"`);
    }
  }
  return errors;
}

function checkPhrase(phrase: Phrase, lexemes: Record<string, GreekLexeme>): string[] {
  const errors: string[] = [];
  if (isEmpty(phrase.theme)) errors.push(`${phrase.id}: missing theme`);
  phrase.tokens.forEach((token, i) => errors.push(...checkToken(phrase.id, phrase, i, token, lexemes)));
  for (const language of ['en', 'ro'] as const) {
    for (const kind of ['natural', 'literal'] as const) {
      const row = phrase.glosses.find((g) => g.language === language && g.kind === kind);
      if (!row || row.units.length === 0) {
        errors.push(`${phrase.id} gloss ${language}/${kind}: missing or empty`);
        continue;
      }
      for (const unit of row.units) {
        for (const link of linksOf(unit)) {
          const token = linkedToken(link);
          if (token < 0 || token >= phrase.tokens.length) {
            errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" links to missing token ${token}`);
          }
          if (typeof link === 'object') {
            if (!Number.isInteger(link.piece) || link.piece < 0) {
              errors.push(`${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" has an invalid piece ${link.piece}`);
            } else if (token >= 0 && token < phrase.tokens.length) {
              const count = pieceCount(phrase.tokens[token], lexemes);
              if (count === 0) {
                errors.push(
                  `${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" links to piece ${link.piece} of token ${token}, which has no parts`,
                );
              } else if (link.piece >= count) {
                errors.push(
                  `${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" has piece ${link.piece} but token ${token} has ${count} piece${count === 1 ? '' : 's'}`,
                );
              }
            }
          }
        }
      }
    }
  }
  return errors;
}

/** Spec 7: a group has two members or more, one verb and one mood, members that compose and are not bare, and a close verb with no pronouns. */
function checkGroup(group: FormGroup, lexemes: Record<string, GreekLexeme>): string[] {
  const errors: string[] = [];
  const where = `group ${group.id}`;
  if (isEmpty(group.meaning)) errors.push(`${where}: has no meaning text`);
  if (group.members.length < 2) errors.push(`${where}: needs at least two members`);
  const first = group.members[0];
  if (first && group.members.some((m) => m.verb.lexeme !== first.verb.lexeme || m.verb.slot.mood !== first.verb.slot.mood)) {
    errors.push(`${where}: the members use different verbs or moods`);
  }
  const same = (s: SlotOf<'verb'>) => JSON.stringify([s.person, s.number, s.tense, s.polarity ?? 'affirmative']);
  if (first && group.members.some((m) => same(m.verb.slot) !== same(first.verb.slot))) {
    errors.push(`${where}: the members differ in person, number, tense or polarity`);
  }
  group.members.forEach((member, i) => {
    const lexeme = lexemes[member.verb.lexeme];
    if (!lexeme || lexeme.pos !== 'verb') {
      errors.push(`${where}: member ${i} uses the unknown verb "${member.verb.lexeme}"`);
      return;
    }
    if (member.object && !lexemes[member.object.noun]) {
      errors.push(`${where}: member ${i} uses the unknown noun "${member.object.noun}"`);
      return;
    }
    try {
      memberKind(member);
    } catch {
      errors.push(`${where}: member ${i} is a bare verb, which is not a member`);
      return;
    }
    try {
      const text = memberText(member);
      if (isEmpty(text.ro) || isEmpty(text.en) || text.el.length === 0) errors.push(`${where}: member ${i} has an empty text`);
    } catch (e) {
      errors.push(`${where}: member ${i} does not compose: ${(e as Error).message}`);
    }
  });
  const close = group.closeNotSame;
  if (close) {
    const closeLexeme = lexemes[close.verb.lexeme];
    if (!closeLexeme || closeLexeme.pos !== 'verb') {
      errors.push(`${where}: the close-but-not-the-same verb uses the unknown verb "${close.verb.lexeme}"`);
    } else {
      if (first && close.verb.lexeme !== first.verb.lexeme) {
        errors.push(`${where}: the close-but-not-the-same verb is not the verb of the members`);
      }
      try {
        memberText({ verb: close.verb });
      } catch (e) {
        errors.push(`${where}: the close-but-not-the-same verb does not compose: ${(e as Error).message}`);
      }
    }
    if ((close.verb.slot.clitics ?? []).length > 0) {
      errors.push(`${where}: the close-but-not-the-same verb must have no pronouns`);
    }
    if (isEmpty(close.reason)) errors.push(`${where}: the close-but-not-the-same verb has no reason`);
  }
  return errors;
}

/** Spec 7: a divergence note that names a lexeme must name one that exists, of the part of speech the note applies to. */
function checkDivergence(d: Divergence, lexemes: Record<string, GreekLexeme>): string[] {
  const named = d.appliesTo.lexeme;
  if (named === undefined) return [];
  const errors: string[] = [];
  for (const id of Array.isArray(named) ? named : [named]) {
    const lexeme = lexemes[id];
    if (!lexeme) errors.push(`divergence ${d.id}: unknown lexeme "${id}"`);
    else if (lexeme.pos !== d.appliesTo.pos) errors.push(`divergence ${d.id}: lexeme ${id} is a ${lexeme.pos}, not a ${d.appliesTo.pos}`);
  }
  return errors;
}

/** Returns a list of problems; an empty list means the data is valid. */
export function validate(input: ValidationInput): string[] {
  const errors: string[] = [];
  for (const lexeme of Object.values(input.lexemes)) errors.push(...checkLexeme(lexeme, input.lexemes));
  for (const phrase of input.phrases) errors.push(...checkPhrase(phrase, input.lexemes));
  for (const group of input.groups ?? []) errors.push(...checkGroup(group, input.lexemes));
  for (const divergence of input.divergences ?? []) errors.push(...checkDivergence(divergence, input.lexemes));
  return errors;
}

/** Problems that do not fail the build: authored gloss segments that disagree with the noun data (spec 4.5). */
export function warnings(input: ValidationInput): string[] {
  const out: string[] = [];
  for (const phrase of input.phrases) {
    for (const row of phrase.glosses) {
      if (row.language !== 'ro') continue;
      for (const unit of row.units) {
        if (!isSegmented(unit)) continue;
        // Segments that are pieces of a verb group (mănâncă|-o) are not a noun and its article.
        if (unit.segments.every((segment) => typeof segment.link !== 'number')) continue;
        const where = `${phrase.id} gloss ro/${row.kind}`;
        const nounToken = unit.segments
          .map((s) => phrase.tokens[linkedToken(s.link)])
          .find((t) => t !== undefined && t.slot.pos === 'noun');
        const noun = nounToken ? input.lexemes[nounToken.lexeme] : undefined;
        if (!nounToken || nounToken.slot.pos !== 'noun' || !noun || noun.pos !== 'noun') {
          out.push(`${where}: segmented unit "${unitText(unit)}" is not linked to a noun`);
          continue;
        }
        const expected = noun.ro.split[nounToken.slot.number];
        const actual = unit.segments.map((s) => s.text.replace(/[!?.,;]+$/u, ''));
        if (actual.length !== 2 || actual[0].toLowerCase() !== expected[0].toLowerCase() || actual[1] !== expected[1]) {
          out.push(
            `${where}: "${unitText(unit)}" is split ${actual.join(' + ')}, the noun data splits it ${expected.join(' + ')}`,
          );
        }
      }
    }
  }
  return out;
}

/** Every stored Romanian cell that is still `pending`, one line each (spec 7). */
export function pendingCells(lexemes: Record<string, GreekLexeme>): string[] {
  const out: string[] = [];
  for (const l of Object.values(lexemes)) {
    if (l.pos !== 'quantifier') continue;
    for (const [setName, set] of [['plain', l.ro.plain], ['few', l.ro.few]] as const) {
      if (!set) continue;
      for (const use of ['determiner', 'pronoun'] as const) {
        for (const g of ['m', 'f'] as const) {
          for (const number of ['sg', 'pl'] as const) {
            const cell = set[use][g][number];
            if (!cell) continue;
            for (const key of ['nom', 'gen'] as const) {
              const value = cell[key];
              if (value !== undefined && typeof value !== 'string') {
                out.push(`${l.id} Romanian ${setName} ${use} ${g} ${number} ${key}`);
              }
            }
          }
        }
      }
    }
  }
  return out;
}
