import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, Mood, SlotOf, Tense } from '../types';
import { compose } from './compose';

const TO: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const IT: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f', enPronoun: 'it' };
const slot = (mood: Mood, tense: Tense, person: 1 | 2 | 3, number: 'sg' | 'pl', clitics?: Clitic[]): SlotOf<'verb'> => ({
  pos: 'verb',
  person,
  number,
  mood,
  tense,
  voice: 'active',
  polarity: 'negative',
  ...(clitics ? { clitics } : {}),
});
const text = (verb: string, s: SlotOf<'verb'>) => compose(getVerb(verb), s).text;

describe('μη or μην: the final ν follows the same rule as στη(ν)', () => {
  it('keeps the ν before a vowel and before κ π τ ξ ψ γκ μπ ντ τσ τζ', () => {
    expect(text('pao', slot('subjunctive', 'aorist', 1, 'sg'))).toBe('να μην πάω');
    expect(text('pao', slot('hortative', 'aorist', 1, 'pl'))).toBe('ας μην πάμε');
    expect(text('troo', slot('imperative', 'aorist', 2, 'sg', [IT]))).toBe('μην το φας');
    expect(text('dino', slot('imperative', 'aorist', 2, 'sg', [{ ...TO, role: 'indirect', person: 3, gender: 'm' }]))).toBe('μην του δώσεις');
    expect(text('echo', slot('subjunctive', 'present', 1, 'sg'))).toBe('να μην έχω');
  });

  it('drops it before any other consonant', () => {
    expect(text('troo', slot('subjunctive', 'aorist', 1, 'sg'))).toBe('να μη φάω');
    expect(text('troo', slot('hortative', 'aorist', 1, 'pl'))).toBe('ας μη φάμε');
    expect(text('troo', slot('imperative', 'aorist', 2, 'sg'))).toBe('μη φας');
    expect(text('dino', slot('imperative', 'aorist', 2, 'sg', [TO, IT]))).toBe('μη μου το δώσεις');
    expect(text('kano', slot('subjunctive', 'present', 1, 'sg'))).toBe('να μην κάνω');
    expect(text('thelo', slot('subjunctive', 'present', 1, 'sg'))).toBe('να μη θέλω');
  });

  it('the negation piece carries the written form, and δεν is not touched', () => {
    const composed = compose(getVerb('troo'), slot('subjunctive', 'aorist', 1, 'sg'));
    expect(composed.pieces.find((p) => p.kind === 'negation')).toMatchObject({ text: 'μη', lexeme: 'min' });
    expect(text('troo', { ...slot('indicative', 'present', 1, 'sg') })).toBe('δεν τρώω');
  });
});
