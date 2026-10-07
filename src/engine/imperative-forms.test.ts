import { describe, expect, it } from 'vitest';
import { getVerb } from '../data/lexemes';
import type { Num, SlotOf, Tense } from '../types';
import { inflectVerb } from './greek';
import { formText } from './segments';

const command = (tense: Tense, number: Num): SlotOf<'verb'> => ({ pos: 'verb', person: 2, number, mood: 'imperative', tense, voice: 'active' });
const form = (verb: string, tense: Tense, number: Num) => inflectVerb(getVerb(verb), command(tense, number));

describe('the commands people say', () => {
  it('κάνω: κάντε for the aorist plural, κάνετε for the present plural, κάνε for both singulars', () => {
    expect(formText(form('kano', 'aorist', 'pl'))).toBe('κάντε');
    expect(form('kano', 'aorist', 'pl').irregular?.rule).toBe('imperative-plural');
    expect(formText(form('kano', 'present', 'pl'))).toBe('κάνετε');
    expect(form('kano', 'present', 'pl').irregular).toBeUndefined();
    expect(formText(form('kano', 'aorist', 'sg'))).toBe('κάνε');
    expect(formText(form('kano', 'present', 'sg'))).toBe('κάνε');
  });

  it('τρώω: τρώε and τρώτε, with a note that τρώγε and τρώγετε are also correct; φάε and φάτε are the aorist', () => {
    expect(formText(form('troo', 'present', 'sg'))).toBe('τρώε');
    expect(formText(form('troo', 'present', 'pl'))).toBe('τρώτε');
    for (const number of ['sg', 'pl'] as const) {
      const f = form('troo', 'present', number);
      expect(f.irregular?.rule).toBe('old-stem');
      expect(f.irregular?.plain).toContain('τρώγε, τρώγετε');
    }
    expect(formText(form('troo', 'aorist', 'sg'))).toBe('φάε');
    expect(formText(form('troo', 'aorist', 'pl'))).toBe('φάτε');
  });
});

describe('syncopated aorist imperative plurals', () => {
  it('δώστε and πλύντε drop the -ε- like κάντε', () => {
    const plural = (id: string) => formText(inflectVerb(getVerb(id), { pos: 'verb', person: 2, number: 'pl', mood: 'imperative', tense: 'aorist', voice: 'active' }));
    expect(plural('dino')).toBe('δώστε');
    expect(plural('pleno')).toBe('πλύντε');
  });
});
