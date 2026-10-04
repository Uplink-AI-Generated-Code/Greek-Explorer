import { describe, expect, it } from 'vitest';
import { LEXEMES } from '../data/lexemes';
import type { GreekVerb, Phrase, Slot, Token } from '../types';
import { validate } from './validate';

const troo = LEXEMES.troo as GreekVerb;
const base = { lexemes: LEXEMES, phrases: [] as Phrase[] };

describe('the validator builds commands with pronouns', () => {
  it('accepts the real data', () => {
    expect(validate(base)).toEqual([]);
  });

  it('reports a verb whose Romanian command cannot take a pronoun', () => {
    const active = troo.voices.active;
    if (!active) throw new Error('τρώω has an active voice');
    const broken: GreekVerb = {
      ...troo,
      voices: { active: { ...active, ro: { ...active.ro, imperative: undefined } } },
    };
    const errors = validate({ ...base, lexemes: { ...LEXEMES, troo: broken } });
    expect(errors.some((e) => e.includes('lexeme troo') && e.includes('imperative'))).toBe(true);
  });
});

describe('a verb token with pronouns', () => {
  const phraseWith = (token: Token): Phrase => ({
    id: 'test',
    title: 'test',
    theme: 'Eating',
    level: 'beginner',
    tokens: [token],
    glosses: ['natural', 'literal'].flatMap((kind) =>
      (['en', 'ro'] as const).map((language) => ({ language, kind: kind as 'natural' | 'literal', units: [{ text: 'x', link: 0 }] })),
    ),
    verified: false,
  });
  const slot = (patch: Record<string, unknown>): Slot =>
    ({ pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...patch }) as Slot;
  const it_: Record<string, unknown> = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };

  it('accepts φάε το', () => {
    expect(validate({ ...base, phrases: [phraseWith({ text: 'Φάε το!', lexeme: 'troo', slot: slot({ clitics: [it_] }) })] })).toEqual([]);
  });
  it('reports a text that is not what compose produces', () => {
    const errors = validate({ ...base, phrases: [phraseWith({ text: 'Φάε!', lexeme: 'troo', slot: slot({ clitics: [it_] }) })] });
    expect(errors).toContain('test token 0 (Φάε!): text differs from what compose produces ("φάε το")');
  });
  it('reports pronouns outside a command', () => {
    const errors = validate({
      ...base,
      phrases: [phraseWith({ text: 'Τρώω το', lexeme: 'troo', slot: slot({ mood: 'indicative', tense: 'present', clitics: [it_] }) })],
    });
    expect(errors.some((e) => e.includes('pronouns and short forms go only with a command'))).toBe(true);
  });
});
