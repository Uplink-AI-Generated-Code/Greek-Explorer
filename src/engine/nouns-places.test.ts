import { describe, expect, it } from 'vitest';
import { getNoun } from '../data/lexemes';
import { inflect } from './greek';
import { formText } from './segments';

const forms = (id: string) =>
  (['sg', 'pl'] as const).map((number) =>
    (['nom', 'acc', 'gen'] as const).map((c) => formText(inflect(getNoun(id), { pos: 'noun', number, case: c }))),
  );

describe('the place nouns', () => {
  it('σπίτι keeps the accent on the stem except in the genitive', () => {
    expect(forms('spiti')).toEqual([
      ['σπίτι', 'σπίτι', 'σπιτιού'],
      ['σπίτια', 'σπίτια', 'σπιτιών'],
    ]);
    expect(inflect(getNoun('spiti'), { pos: 'noun', number: 'sg', case: 'gen' }).irregular?.rule).toBe('accent-moves');
    expect(inflect(getNoun('spiti'), { pos: 'noun', number: 'sg', case: 'nom' }).irregular).toBeUndefined();
  });

  it('δρόμος is a regular masculine in -ος', () => {
    expect(forms('dromos')).toEqual([
      ['δρόμος', 'δρόμο', 'δρόμου'],
      ['δρόμοι', 'δρόμους', 'δρόμων'],
    ]);
  });

  it('θάλασσα is a feminine in -α with the accent moving in the genitive plural', () => {
    expect(forms('thalassa')).toEqual([
      ['θάλασσα', 'θάλασσα', 'θάλασσας'],
      ['θάλασσες', 'θάλασσες', 'θαλασσών'],
    ]);
  });

  it('have Romanian and English forms, and genders that differ', () => {
    const spiti = getNoun('spiti');
    expect(spiti.gender).toBe('n');
    expect(spiti.ro).toMatchObject({ lemma: 'casă', gender: 'f' });
    expect(spiti.ro.forms.sg.indefinite).toBe('o casă');
    expect(getNoun('dromos').ro.forms.pl.genIndefinite).toBe('unor drumuri');
    expect(getNoun('thalassa').ro.forms.sg.genDefinite).toBe('mării');
    expect([spiti.en.sg, getNoun('dromos').en.sg, getNoun('thalassa').en.sg]).toEqual(['house', 'road', 'sea']);
  });
});
