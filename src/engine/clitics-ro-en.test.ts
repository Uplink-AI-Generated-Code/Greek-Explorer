import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Clitic, SlotOf } from '../types';
import { enVerb, enVerbText } from './english';
import { roVerb } from './romanian';

const to: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'f' };
const toChild: Clitic = { role: 'object', person: 3, number: 'sg', gender: 'n', roGender: 'm' };
const mou: Clitic = { role: 'indirect', person: 1, number: 'sg' };
const command = (clitics: Clitic[], extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
  pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', clitics, ...extra,
});
const neg = { polarity: 'negative' as const };

describe('Romanian commands with pronouns (spec 6.5)', () => {
  it('attaches the pronoun with a hyphen: mănâncă-o, spală-l, dă-mi-o', () => {
    expect(roVerb(getVerb('troo'), command([to]))).toBe('mănâncă-o');
    expect(roVerb(getVerb('pleno'), command([toChild]))).toBe('spală-l');
    expect(roVerb(getVerb('dino'), command([mou, to]))).toBe('dă-mi-o');
    expect(roVerb(getVerb('dino'), command([mou]))).toBe('dă-mi');
  });
  it('the plural: mâncați-o, dați-mi-o', () => {
    expect(roVerb(getVerb('troo'), command([to], { number: 'pl' }))).toBe('mâncați-o');
    expect(roVerb(getVerb('dino'), command([mou, to], { number: 'pl' }))).toBe('dați-mi-o');
  });
  it('a negative command: nu o mânca, nu-l mânca, nu mi-o da; plural nu o mâncați', () => {
    expect(roVerb(getVerb('troo'), command([to], neg))).toBe('nu o mânca');
    expect(roVerb(getVerb('troo'), command([toChild], neg))).toBe('nu-l mânca');
    expect(roVerb(getVerb('dino'), command([mou, to], neg))).toBe('nu mi-o da');
    expect(roVerb(getVerb('troo'), command([to], { ...neg, number: 'pl' }))).toBe('nu o mâncați');
  });
  it('a command with no pronouns is unchanged', () => {
    expect(roVerb(getVerb('troo'), command([]))).toBe('mănâncă');
    expect(roVerb(getVerb('troo'), command([], neg))).toBe('nu mânca');
  });
  it('the short form changes nothing in Romanian', () => {
    expect(roVerb(getVerb('troo'), command([to], { shortForm: true }))).toBe('mănâncă-o');
  });
});

describe('English commands with pronouns', () => {
  const text = (verb: string, slot: SlotOf<'verb'>) => enVerbText(getVerb(verb), slot, 'you');
  it('eat it, wash him, give me', () => {
    expect(text('troo', command([to]))).toBe('eat it');
    expect(text('pleno', command([{ ...toChild, gender: 'm' }]))).toBe('wash him');
    expect(text('dino', command([mou]))).toBe('give me');
  });
  it('the direct pronoun comes first: give it to me', () => {
    expect(text('dino', command([mou, to]))).toBe('give it to me');
  });
  it("don't eat it, don't give it to me", () => {
    expect(text('troo', command([to], neg))).toBe("don't eat it");
    expect(text('dino', command([mou, to], neg))).toBe("don't give it to me");
  });
  it('a command has no subject, and a command with no pronouns is unchanged', () => {
    expect(enVerb(getVerb('troo'), command([to])).subject).toBe(false);
    expect(text('troo', command([]))).toBe('eat');
  });
});
