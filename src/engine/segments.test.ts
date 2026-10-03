import { describe, expect, it } from 'vitest';
import { articleRich, dim, formRich, joinRich, numeralRich, plain, richText } from './segments';

describe('segments', () => {
  it('formRich splits stem and ending', () => {
    expect(formRich({ stem: 'καφ', ending: 'έ' })).toEqual([
      { text: 'καφ', role: 'stem' },
      { text: 'έ', role: 'ending' },
    ]);
  });
  it('formRich omits an empty ending', () => {
    expect(formRich({ stem: 'μία', ending: '' })).toEqual([{ text: 'μία', role: 'stem' }]);
  });
  it('articleRich marks the whole word as an article', () => {
    expect(articleRich({ stem: 'τον', ending: '' })).toEqual([{ text: 'τον', role: 'article' }]);
  });
  it('numeralRich marks the stem as article and the ending as ending', () => {
    expect(numeralRich({ stem: 'ένα', ending: 'ν' })).toEqual([
      { text: 'ένα', role: 'article' },
      { text: 'ν', role: 'ending' },
    ]);
  });
  it('joinRich puts one plain space between parts', () => {
    const joined = joinRich([plain('a'), dim('b'), plain('c')]);
    expect(richText(joined)).toBe('a b c');
    expect(joined[1]).toEqual({ text: ' ', role: 'plain' });
  });
});
