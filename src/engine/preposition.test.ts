import { describe, expect, it } from 'vitest';
import { getLexeme, getNoun } from '../data/lexemes';
import type { GreekPreposition } from '../types';
import { fusedForm, senseOf, splitFused } from './preposition';

const se = getLexeme('se') as GreekPreposition;

describe('σε with the article', () => {
  it('fuses into the six forms, by the gender and number of the noun', () => {
    expect(fusedForm(se, getNoun('skylos'), 'sg')).toBe('στον');
    expect(fusedForm(se, getNoun('skylos'), 'pl')).toBe('στους');
    expect(fusedForm(se, getNoun('alepou'), 'sg')).toBe('στην');
    expect(fusedForm(se, getNoun('alepou'), 'pl')).toBe('στις');
    expect(fusedForm(se, getNoun('psomi'), 'sg')).toBe('στο');
    expect(fusedForm(se, getNoun('psomi'), 'pl')).toBe('στα');
  });

  it('drops the ν of στην in front of most consonants, and keeps it in front of vowels and κ π τ ξ ψ γκ μπ ντ τσ τζ', () => {
    const alepou = getNoun('alepou');
    const next = (word: string) => fusedForm(se, alepou, 'sg', word);
    expect(next('θάλασσα')).toBe('στη');
    expect(next('βιβλιοθήκη')).toBe('στη');
    expect(next('αλεπού')).toBe('στην');
    expect(next('κουζίνα')).toBe('στην');
    expect(next('πόλη')).toBe('στην');
    expect(next('ξενοδοχείο')).toBe('στην');
    expect(next('μπάλα')).toBe('στην');
    expect(next('τσάντα')).toBe('στην');
  });

  it('keeps every other form whole, whatever follows', () => {
    expect(fusedForm(se, getNoun('skylos'), 'sg', 'θάλασσα')).toBe('στον');
    expect(fusedForm(se, getNoun('alepou'), 'pl', 'θάλασσες')).toBe('στις');
    expect(fusedForm(se, getNoun('psomi'), 'sg', 'θάλασσα')).toBe('στο');
  });

  it('is not defined for a preposition that does not fuse', () => {
    expect(fusedForm(getLexeme('pano') as GreekPreposition, getNoun('skylos'), 'sg')).toBeUndefined();
  });

  it('splits into σ and the article', () => {
    expect(splitFused('στον')).toEqual(['σ', 'τον']);
    expect(splitFused('Στο')).toEqual(['Σ', 'το']);
    expect(splitFused('στις')).toEqual(['σ', 'τις']);
  });
});

describe('the meanings of σε', () => {
  it('gives each meaning its Romanian and English word', () => {
    const words = (v: 'to' | 'at' | 'in' | 'on' | 'person') => {
      const s = senseOf(se, v)!;
      return [s.ro, s.en];
    };
    expect(words('to')).toEqual(['la', 'to']);
    expect(words('at')).toEqual(['la', 'at']);
    expect(words('in')).toEqual(['în', 'in']);
    expect(words('on')).toEqual(['pe', 'on']);
    expect(words('person')).toEqual(['', 'to']);
    expect(senseOf(se, 'person')?.dative).toBe(true);
  });

  it('starts with "to" when no meaning is asked for, and is undefined for a preposition without meanings', () => {
    expect(senseOf(se)?.value).toBe('to');
    expect(senseOf(getLexeme('pano') as GreekPreposition, 'on')).toBeUndefined();
  });
});
