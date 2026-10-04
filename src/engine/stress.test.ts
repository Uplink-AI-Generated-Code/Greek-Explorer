import { describe, expect, it } from 'vitest';
import { accentAt, secondAccent, syllables } from './stress';

const count = (...words: string[]) => syllables(words).length;

describe('Greek syllables', () => {
  it.each([
    ['δώσε', 2], ['φάε', 2], ['πλύνε', 2], ['μου', 1], ['το', 1], ['δως', 1],
    ['παιδί', 2], ['είναι', 2], ['ψωμιά', 2], ['μία', 2], ['διάβασε', 3], ['τηλεφώνησε', 5],
    ['κοιμάμαι', 3], ['ψωμιού', 2],
  ] as const)('%s has %i', (word, n) => {
    expect(count(word)).toBe(n);
  });

  it('a diphthong is one syllable, a glide ι joins the next vowel, an accented ι does not', () => {
    expect(count('ου')).toBe(1);
    expect(count('αι')).toBe(1);
    expect(count('ια')).toBe(1);
    expect(count('ία')).toBe(2);
    expect(count('άι')).toBe(2);
  });

  it('records which syllable takes the accent and where it sits', () => {
    const all = syllables(['δώσε', 'μου']);
    expect(all.map((s) => [s.word, s.at, s.stressed])).toEqual([[0, 1, true], [0, 3, false], [1, 2, false]]);
  });
});

describe('the second accent (spec 4.3)', () => {
  it('δώσε μου το: the stress would reach the fourth-last syllable, so μού gets the accent', () => {
    const accent = secondAccent(['δώσε', 'μου', 'το']);
    expect(accent).toEqual({ word: 1, at: 2 });
    expect(accentAt('μου', 2)).toBe('μού');
  });

  it('τηλεφώνησε μου: the accent goes on the last syllable of the verb', () => {
    const accent = secondAccent(['τηλεφώνησε', 'μου']);
    expect(accent).toEqual({ word: 0, at: 9 });
    expect(accentAt('τηλεφώνησε', 9)).toBe('τηλεφώνησέ');
  });

  it('διάβασε μου το: the stress is on the fifth-last syllable, the accent two syllables after it', () => {
    const accent = secondAccent(['διάβασε', 'μου', 'το']);
    expect(accent).toEqual({ word: 0, at: 6 });
    expect(accentAt('διάβασε', 6)).toBe('διάβασέ');
  });

  it.each([
    [['φάε', 'το']],
    [['πλύνε', 'το']],
    [['δώσε', 'μου']],
    [['δώσε', 'το']],
    [['δως', 'μου', 'το']],
    [['δώσε']],
  ])('%j needs no second accent', (words) => {
    expect(secondAccent(words)).toBeNull();
  });

  it('a word with no accent mark and more than one syllable has no known stress', () => {
    expect(secondAccent(['ασε', 'μου', 'το', 'ακομα'])).toBeNull();
  });
});
