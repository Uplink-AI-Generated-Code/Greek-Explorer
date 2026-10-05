import { describe, expect, it } from 'vitest';
import type { Clitic } from '../types';
import { cliticSlot, enClitic, greekClitic, greekStrong, personKey, roClitic, roClitics } from './clitics';

const c = (
  role: Clitic['role'],
  person: Clitic['person'],
  number: Clitic['number'],
  gender?: Clitic['gender'],
  roGender?: Clitic['roGender'],
): Clitic => ({ role, person, number, ...(gender ? { gender } : {}), ...(roGender ? { roGender } : {}) });

describe('Greek weak pronouns (spec 6.5)', () => {
  it.each([
    ['object', 1, 'sg', undefined, 'με'],
    ['object', 2, 'sg', undefined, 'σε'],
    ['object', 3, 'sg', 'm', 'τον'],
    ['object', 3, 'sg', 'f', 'την'],
    ['object', 3, 'sg', 'n', 'το'],
    ['object', 1, 'pl', undefined, 'μας'],
    ['object', 2, 'pl', undefined, 'σας'],
    ['object', 3, 'pl', 'm', 'τους'],
    ['object', 3, 'pl', 'f', 'τις'],
    ['object', 3, 'pl', 'n', 'τα'],
    ['indirect', 1, 'sg', undefined, 'μου'],
    ['indirect', 2, 'sg', undefined, 'σου'],
    ['indirect', 3, 'sg', 'm', 'του'],
    ['indirect', 3, 'sg', 'f', 'της'],
    ['indirect', 3, 'sg', 'n', 'του'],
    ['indirect', 1, 'pl', undefined, 'μας'],
    ['indirect', 2, 'pl', undefined, 'σας'],
    ['indirect', 3, 'pl', 'm', 'τους'],
    ['indirect', 3, 'pl', 'f', 'τους'],
    ['indirect', 3, 'pl', 'n', 'τους'],
  ] as const)('%s %s %s %s -> %s', (role, person, number, gender, expected) => {
    expect(greekClitic(c(role, person, number, gender))).toBe(expected);
  });

  it('a third-person pronoun needs a gender', () => {
    expect(() => greekClitic(c('object', 3, 'sg'))).toThrow(/needs a gender/);
  });

  it('the strong forms are notes: εμένα, αυτό, and σε + the strong form for the indirect role', () => {
    expect(greekStrong(c('object', 1, 'sg'))).toBe('εμένα');
    expect(greekStrong(c('object', 3, 'sg', 'n'))).toBe('αυτό');
    expect(greekStrong(c('object', 3, 'pl', 'f'))).toBe('αυτές');
    expect(greekStrong(c('indirect', 2, 'pl'))).toBe('σε εσάς');
  });

  it('keys a person and number', () => {
    expect(personKey({ person: 3, number: 'pl' })).toBe('3pl');
  });
});

describe('English pronouns', () => {
  it.each([
    [1, 'sg', undefined, 'me'],
    [2, 'sg', undefined, 'you'],
    [3, 'sg', 'm', 'him'],
    [3, 'sg', 'f', 'her'],
    [3, 'sg', 'n', 'it'],
    [1, 'pl', undefined, 'us'],
    [2, 'pl', undefined, 'you'],
    [3, 'pl', 'n', 'them'],
  ] as const)('%s %s %s -> %s', (person, number, gender, expected) => {
    expect(enClitic(c('object', person, number, gender))).toBe(expected);
  });
});

describe('Romanian pronouns', () => {
  it('free, attached after a command, and after nu', () => {
    expect(roClitic(c('object', 3, 'sg', 'm', 'm'))).toMatchObject({ free: 'îl', enclitic: '-l', afterNu: 'nu-l' });
    expect(roClitic(c('object', 3, 'sg', 'n', 'f'))).toMatchObject({ free: 'o', enclitic: '-o', afterNu: 'nu o' });
    expect(roClitic(c('indirect', 1, 'sg'))).toMatchObject({ free: 'îmi', enclitic: '-mi', afterNu: 'nu-mi' });
    expect(roClitic(c('object', 1, 'pl'))).toMatchObject({ free: 'ne', enclitic: '-ne', afterNu: 'nu ne' });
  });

  it('follows the Romanian gender of the noun, not the Greek one (clitic-gender)', () => {
    expect(roClitic(c('object', 3, 'sg', 'n', 'f')).free).toBe('o');
    expect(roClitic(c('object', 3, 'sg', 'n', 'm')).free).toBe('îl');
    expect(roClitic(c('object', 3, 'pl', 'n', 'f')).free).toBe('le');
    expect(roClitic(c('object', 3, 'pl', 'm', 'm')).free).toBe('îi');
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(roClitic(c('object', 3, 'sg', 'n', 'n')).free).toBe('îl');
    expect(roClitic(c('object', 3, 'pl', 'n', 'n')).free).toBe('le');
    expect(roClitic(c('object', 3, 'sg', 'n')).free).toBe('îl');
  });

  it('one pronoun or a cluster of two (dative then accusative)', () => {
    expect(roClitics([c('object', 3, 'sg', 'n', 'f')])).toMatchObject({ enclitic: '-o', afterNu: 'nu o' });
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'n', 'f')])).toMatchObject({
      enclitic: '-mi-o',
      afterNu: 'nu mi-o',
    });
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'sg', 'm', 'm')]).enclitic).toBe('-mi-l');
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'pl', 'm', 'm')]).enclitic).toBe('-mi-i');
    expect(roClitics([c('indirect', 1, 'sg'), c('object', 3, 'pl', 'f', 'f')]).enclitic).toBe('-mi-le');
  });

  it('refuses a cluster that is not stored, and a list that is not one or two', () => {
    expect(() => roClitics([c('indirect', 3, 'sg'), c('object', 3, 'sg', 'm', 'm')])).toThrow(/no Romanian cluster/);
    expect(() => roClitics([])).toThrow(/one or two/);
  });
});

describe('the clitic slot', () => {
  it('is the pronoun with its part of speech', () => {
    expect(cliticSlot(c('object', 3, 'sg', 'n', 'f'))).toEqual({
      pos: 'clitic',
      role: 'object',
      person: 3,
      number: 'sg',
      gender: 'n',
      roGender: 'f',
    });
  });
});
