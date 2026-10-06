import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import type { Case, Num } from '../types';
import { nounPhrase } from './agree';
import { richText } from './segments';

const owned = (noun: string, owner: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = nounPhrase(getNoun(noun), number, c, { article: 'definite', owner: getNoun(owner) });
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('a noun possessor in the genitive', () => {
  it('goes after the noun with its own article', () => {
    expect(owned('spiti', 'paidi')).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(owned('skylos', 'paidi')).toEqual({ el: 'ο σκύλος του παιδιού', ro: 'câinele copilului', en: "the child's dog" });
  });

  it("takes the article of the possessor's own gender", () => {
    expect(owned('spiti', 'skylos')).toEqual({ el: 'το σπίτι του σκύλου', ro: 'casa câinelui', en: "the dog's house" });
    expect(owned('paidi', 'thalassa')).toEqual({ el: 'το παιδί της θάλασσας', ro: 'copilul mării', en: "the sea's child" });
    expect(owned('skylos', 'alepou')).toEqual({ el: 'ο σκύλος της αλεπούς', ro: 'câinele vulpii', en: "the fox's dog" });
  });

  it('follows the possessed noun in number and role', () => {
    expect(owned('spiti', 'paidi', 'pl')).toEqual({ el: 'τα σπίτια του παιδιού', ro: 'casele copilului', en: "the child's houses" });
    expect(owned('spiti', 'paidi', 'sg', 'acc')).toEqual({ el: 'το σπίτι του παιδιού', ro: 'casa copilului', en: "the child's house" });
    expect(owned('spiti', 'paidi', 'sg', 'gen')).toEqual({ el: 'του σπιτιού του παιδιού', ro: 'casei copilului', en: "of the child's house" });
  });

  it('goes with the definite article alone', () => {
    const paidi = getNoun('paidi');
    const spiti = getNoun('spiti');
    expect(() => nounPhrase(spiti, 'sg', 'nom', { owner: paidi })).toThrow(/definite article alone/);
    expect(() => nounPhrase(spiti, 'sg', 'nom', { article: 'definite', owner: paidi, adjective: getAdjective('zestos') })).toThrow(/definite article alone/);
  });
});
