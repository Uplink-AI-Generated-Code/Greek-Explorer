import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import { nounPhrase } from './agree';
import { richText } from './segments';

const kafes = getNoun('kafes');
const zestos = getAdjective('zestos');

describe('nounPhrase', () => {
  it('indefinite singular accusative with an adjective, in three languages', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'one', adjective: zestos });
    expect(richText(np.el)).toBe('έναν ζεστό καφέ');
    expect(np.ro).toBe('o cafea caldă');
    expect(np.en).toBe('a hot coffee');
  });

  it('definite singular accusative with an adjective', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('τον ζεστό καφέ');
    expect(np.ro).toBe('cafeaua caldă');
    expect(np.en).toBe('the hot coffee');
  });

  it('definite plural nominative, no adjective', () => {
    const np = nounPhrase(kafes, 'pl', 'nom', { article: 'definite' });
    expect(richText(np.el)).toBe('οι καφέδες');
    expect(np.ro).toBe('cafelele');
    expect(np.en).toBe('the coffees');
  });

  it('definite singular genitive with an adjective uses the Romanian feminine genitive', () => {
    const np = nounPhrase(kafes, 'sg', 'gen', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('του ζεστού καφέ');
    expect(np.ro).toBe('cafelei calde');
    expect(np.en).toBe('of the hot coffee');
  });

  it('plural adjective agrees: Romanian pl forms', () => {
    const np = nounPhrase(kafes, 'pl', 'acc', { article: 'definite', adjective: zestos });
    expect(richText(np.el)).toBe('τους ζεστούς καφέδες');
    expect(np.ro).toBe('cafelele calde');
    expect(np.en).toBe('the hot coffees');
  });

  it('rejects an indefinite article in the plural', () => {
    expect(() => nounPhrase(kafes, 'pl', 'nom', { article: 'one' })).toThrow(
      'Greek has no plural indefinite article',
    );
  });

  it('marks the article and ending roles for the Greek side', () => {
    const np = nounPhrase(kafes, 'sg', 'acc', { article: 'definite' });
    expect(np.el).toEqual([
      { text: 'τον', role: 'article' },
      { text: ' ', role: 'plain' },
      { text: 'καφ', role: 'stem' },
      { text: 'έ', role: 'ending' },
    ]);
  });
});
