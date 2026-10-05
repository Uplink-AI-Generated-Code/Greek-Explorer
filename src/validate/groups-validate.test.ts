import { describe, expect, it } from 'vitest';
import { FORM_GROUPS } from '../data/form-groups';
import { LEXEMES } from '../data/lexemes';
import type { FormGroup } from '../types';
import { validate } from './validate';

const input = (groups: FormGroup[]) => ({ lexemes: LEXEMES, phrases: [], groups });
const eat = FORM_GROUPS[0];

describe('the validator checks form groups (spec 7)', () => {
  it('accepts the real groups', () => {
    expect(validate(input(FORM_GROUPS))).toEqual([]);
  });
  it('refuses a group with fewer than two members', () => {
    expect(validate(input([{ ...eat, members: [eat.members[0]] }]))).toContain('group eat-the-bread: needs at least two members');
  });
  it('refuses members of different verbs or moods', () => {
    const other = { ...eat.members[1], verb: { ...eat.members[1].verb, lexeme: 'pleno' } };
    expect(validate(input([{ ...eat, members: [eat.members[0], other] }]))).toContain(
      'group eat-the-bread: the members use different verbs or moods',
    );
  });
  it('refuses a member that does not compose', () => {
    const broken = {
      ...eat.members[1],
      verb: { ...eat.members[1].verb, slot: { ...eat.members[1].verb.slot, mood: 'indicative' as const, tense: 'present' as const, shortForm: true } },
    };
    const errors = validate(input([{ ...eat, members: [eat.members[0], broken] }]));
    expect(errors.some((e) => e.startsWith('group eat-the-bread: member 1'))).toBe(true);
  });
  it('refuses a bare verb as a member', () => {
    const bare = { verb: eat.members[0].verb };
    const errors = validate(input([{ ...eat, members: [eat.members[0], bare] }]));
    expect(errors).toContain('group eat-the-bread: member 1 is a bare verb, which is not a member');
  });
  it('refuses a close-but-not-the-same verb with pronouns', () => {
    const close = eat.closeNotSame && { ...eat.closeNotSame, verb: eat.members[1].verb };
    expect(validate(input([{ ...eat, closeNotSame: close }]))).toContain(
      'group eat-the-bread: the close-but-not-the-same verb must have no pronouns',
    );
  });
  it('refuses a close-but-not-the-same verb that does not exist, is another verb, or does not compose', () => {
    const close = eat.closeNotSame;
    if (!close) throw new Error('the eat group has a close verb');
    const errorsFor = (verb: typeof close.verb) =>
      validate(input([{ ...eat, closeNotSame: { ...close, verb } }])).filter((e) => e.startsWith('group eat-the-bread: the close'));
    expect(errorsFor({ ...close.verb, lexeme: 'nope' })).toEqual(['group eat-the-bread: the close-but-not-the-same verb uses the unknown verb "nope"']);
    expect(errorsFor({ ...close.verb, lexeme: 'pleno' })).toEqual([
      'group eat-the-bread: the close-but-not-the-same verb is not the verb of the members',
    ]);
    const broken = errorsFor({ ...close.verb, slot: { ...close.verb.slot, person: 1 } });
    expect(broken.some((e) => e.includes('does not compose'))).toBe(true);
  });
  it('refuses members that differ in person, number, tense or polarity', () => {
    const change = (patch: Record<string, unknown>) => ({
      ...eat.members[1],
      verb: { ...eat.members[1].verb, slot: { ...eat.members[1].verb.slot, ...patch } },
    });
    for (const patch of [{ number: 'pl' }, { tense: 'present' }, { polarity: 'negative' }]) {
      const errors = validate(input([{ ...eat, members: [eat.members[0], change(patch)] }]));
      expect(errors).toContain('group eat-the-bread: the members differ in person, number, tense or polarity');
    }
  });
  it('refuses an object noun that does not exist', () => {
    const ghost = { ...eat.members[0], object: { noun: 'nope', number: 'sg' as const, case: 'acc' as const } };
    const errors = validate(input([{ ...eat, members: [ghost, eat.members[1]] }]));
    expect(errors.some((e) => e.includes('member 0') && e.includes('nope'))).toBe(true);
  });
});
