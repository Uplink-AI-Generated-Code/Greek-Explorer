import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { GreekVerb, Person, SlotOf, Tense, VerbVoice } from '../types';
import { allVerbSlots, isOffered, offeredMoods, offeredTenses, offeredVoices, offeredWho, voiceOf } from './offers';

const thelo = getVerb('thelo');
const slot = (mood: SlotOf<'verb'>['mood'], tense: Tense, person: Person = 1, number: 'sg' | 'pl' = 'sg') =>
  ({ pos: 'verb', person, number, mood, tense, voice: 'active' }) as const;

/** θέλω with the active voice's offers (and optional extra fields) replaced. */
const withVoice = (extra: Partial<VerbVoice>): GreekVerb => ({
  ...thelo,
  voices: { active: { ...(thelo.voices.active as VerbVoice), ...extra } },
});

describe('offers', () => {
  it('lists voices, moods and tenses in their canonical order', () => {
    expect(offeredVoices(thelo)).toEqual(['active']);
    expect(offeredMoods(thelo, 'active')).toEqual(['indicative', 'subjunctive', 'conditional']);
    expect(offeredTenses(thelo, 'active', 'indicative')).toEqual([
      'present', 'imperfect', 'aorist', 'future', 'futureSimple', 'perfect', 'pluperfect', 'futurePerfect',
    ]);
    expect(offeredTenses(thelo, 'active', 'imperative')).toEqual([]);
  });

  it('voiceOf throws for a voice the verb does not have', () => {
    expect(voiceOf(thelo, 'active').class).toBe('omega');
    expect(() => voiceOf(thelo, 'mediopassive')).toThrow('thelo has no mediopassive voice');
  });

  it('isOffered checks voice, mood and tense', () => {
    expect(isOffered(thelo, slot('indicative', 'present'))).toBe(true);
    expect(isOffered(thelo, slot('conditional', 'pluperfect'))).toBe(true);
    expect(isOffered(thelo, slot('imperative', 'aorist', 2))).toBe(false);
    expect(isOffered(thelo, { ...slot('indicative', 'present'), voice: 'mediopassive' })).toBe(false);
  });

  it('offers the imperative to the second person only', () => {
    const verb = withVoice({ offers: { imperative: ['present', 'aorist'] } });
    expect(isOffered(verb, slot('imperative', 'aorist', 2))).toBe(true);
    expect(isOffered(verb, slot('imperative', 'aorist', 2, 'pl'))).toBe(true);
    expect(isOffered(verb, slot('imperative', 'aorist', 1))).toBe(false);
    expect(isOffered(verb, slot('imperative', 'aorist', 3, 'pl'))).toBe(false);
    expect(offeredWho(verb, 'active', 'imperative')).toEqual(['2sg', '2pl']);
  });

  it('offers an impersonal verb in the third person singular only', () => {
    const verb = withVoice({ offers: { indicative: ['present'] }, thirdSingularOnly: true });
    expect(isOffered(verb, slot('indicative', 'present', 3))).toBe(true);
    expect(isOffered(verb, slot('indicative', 'present', 1))).toBe(false);
    expect(offeredWho(verb, 'active', 'indicative')).toEqual(['3sg']);
  });

  it('offers all six persons otherwise', () => {
    expect(offeredWho(thelo, 'active', 'indicative')).toEqual(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']);
  });

  it('lists every offered slot once', () => {
    const slots = allVerbSlots(thelo);
    expect(slots).toHaveLength(13 * 6);
    expect(new Set(slots.map((s) => JSON.stringify(s))).size).toBe(13 * 6);
    expect(slots.every((s) => isOffered(thelo, s))).toBe(true);
  });
});
