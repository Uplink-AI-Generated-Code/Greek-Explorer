import { inflect } from '../engine/greek';
import { allVerbSlots, isOffered } from '../engine/offers';
import { compose } from '../engine/compose';
import { enVerb } from '../engine/english';
import { roVerb } from '../engine/romanian';
import { isSegmented, linkedToken, linksOf, unitText } from '../glossLinks';
import type { Case, Gender, GreekLexeme, Num, NumeralValue, Phrase, Slot, Token, VerbVoice, Voice } from '../types';

const GENDERS: Gender[] = ['m', 'f', 'n'];
const CASES: Case[] = ['nom', 'acc', 'gen'];
const NUMS: Num[] = ['sg', 'pl'];
const VALUES: NumeralValue[] = [1, 2, 3, 4, 5];

export interface ValidationInput {
  lexemes: Record<string, GreekLexeme>;
  phrases: Phrase[];
}

const isEmpty = (s: string | undefined): boolean => !s || s.trim() === '';

function slotsFor(l: GreekLexeme): Slot[] {
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
  }
}

function checkLexeme(l: GreekLexeme): string[] {
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
    for (const slot of allVerbSlots(l)) {
      const where = `lexeme ${l.id}: cannot build ${JSON.stringify(slot)}`;
      try {
        if (isEmpty(compose(l, slot).text)) errors.push(`${where}: empty Greek group`);
        const ro = roVerb(l, slot);
        if (isEmpty(ro) || ro.includes('undefined')) errors.push(`${where}: no Romanian form`);
        const en = enVerb(l, slot).verb;
        if (isEmpty(en) || en.includes('undefined') || /\s$/.test(en)) {
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
  if (l.pos === 'preposition') {
    if (isEmpty(l.ro)) errors.push(`lexeme ${l.id}: empty Romanian form`);
    if (isEmpty(l.en)) errors.push(`lexeme ${l.id}: empty English form`);
  }
  return errors;
}

/** Compares a token's text with the composed text, ignoring capitals and trailing punctuation. */
const normalise = (text: string): string => text.toLowerCase().replace(/[!?.,;·]+$/u, '').trim();

/** How many pieces a verb token has (0 for any other token). */
function pieceCount(token: Token | undefined, lexemes: Record<string, GreekLexeme>): number {
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
  if (token.slot.pos !== lexeme.pos) {
    return [`${where}: slot is ${token.slot.pos} but lexeme ${lexeme.id} is ${lexeme.pos}`];
  }
  const errors: string[] = [];
  try {
    inflect(lexeme, token.slot);
  } catch (e) {
    errors.push(`${where}: ${(e as Error).message}`);
  }
  if (token.slot.pos === 'verb' && lexeme.pos === 'verb') {
    if (!isOffered(lexeme, token.slot)) {
      errors.push(`${where}: slot is not offered by ${lexeme.id}`);
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
  if (token.slot.pos === 'adjective' || token.slot.pos === 'numeral' || token.slot.pos === 'article') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const noun = target ? lexemes[target.lexeme] : undefined;
    if (!noun || noun.pos !== 'noun') {
      errors.push(`${where}: ${token.slot.pos} needs agreesWith pointing at a noun`);
    } else if (token.slot.gender !== noun.gender) {
      errors.push(`${where}: slot gender ${token.slot.gender} differs from noun gender ${noun.gender}`);
    }
  }
  if (token.slot.pos === 'preposition') {
    const target = token.agreesWith === undefined ? undefined : phrase.tokens[token.agreesWith];
    const noun = target ? lexemes[target.lexeme] : undefined;
    if (!noun || noun.pos !== 'noun') {
      errors.push(`${where}: preposition needs agreesWith pointing at the noun it governs`);
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
                  `${phrase.id} gloss ${language}/${kind}: unit "${unitText(unit)}" links to piece ${link.piece} of token ${token}, which is not a verb group`,
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

/** Returns a list of problems; an empty list means the data is valid. */
export function validate(input: ValidationInput): string[] {
  const errors: string[] = [];
  for (const lexeme of Object.values(input.lexemes)) errors.push(...checkLexeme(lexeme));
  for (const phrase of input.phrases) errors.push(...checkPhrase(phrase, input.lexemes));
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
        if (actual.length !== 2 || actual[0] !== expected[0] || actual[1] !== expected[1]) {
          out.push(
            `${where}: "${unitText(unit)}" is split ${actual.join(' + ')}, the noun data splits it ${expected.join(' + ')}`,
          );
        }
      }
    }
  }
  return out;
}
