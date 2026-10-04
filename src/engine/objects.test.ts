import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { DEFAULT_OBJECT, cliticsFor, nounForClitic, objectKind, pronounFor } from './objects';

const command = (clitics?: Clitic[]): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...(clitics ? { clitics } : {}),
});
const ME: Clitic = { role: 'indirect', person: 1, number: 'sg' };

describe('objects of a command', () => {
  it('the pronoun that stands for a noun follows its Greek and its Romanian gender', () => {
    expect(pronounFor(getNoun('psomi'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' });
    expect(pronounFor(getNoun('paidi'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' });
    expect(pronounFor(getNoun('kafes'))).toEqual({ role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'f' });
  });

  it('finds a noun a pronoun can stand for', () => {
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' })).toBe('psomi');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' })).toBe('paidi');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'm', roGender: 'm' })).toBe('skylos');
    expect(nounForClitic({ role: 'object', person: 3, number: 'sg', gender: 'f', roGender: 'f' })).toBe('alepou');
    expect(nounForClitic({ role: 'object', person: 1, number: 'sg' })).toBeNull();
    expect(nounForClitic({ role: 'object', person: 3, number: 'pl', gender: 'n' })).toBeNull();
  });

  it('derives the kind from the pronouns and the noun', () => {
    expect(objectKind(command(), null)).toBe('none');
    expect(objectKind(command(), 'psomi')).toBe('noun');
    expect(objectKind(command([ME]), 'psomi')).toBe('noun');
    expect(objectKind(command([pronounFor(getNoun('psomi'))]), 'psomi')).toBe('pronoun');
    expect(objectKind(command([ME, pronounFor(getNoun('psomi'))]), 'psomi')).toBe('two');
  });

  it('builds the pronouns for a kind', () => {
    const psomi = getNoun('psomi');
    expect(cliticsFor('none', psomi, true)).toEqual([]);
    expect(cliticsFor('noun', psomi, false)).toEqual([]);
    expect(cliticsFor('noun', psomi, true)).toEqual([ME]);
    expect(cliticsFor('pronoun', psomi, true)).toEqual([pronounFor(psomi)]);
    expect(cliticsFor('two', psomi, true)).toEqual([ME, pronounFor(psomi)]);
  });

  it('the default object is the bread', () => {
    expect(DEFAULT_OBJECT).toBe('psomi');
  });
});
