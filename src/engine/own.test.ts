import { describe, expect, it } from 'vitest';
import { getAdjective, getNoun } from '../data/lexemes';
import type { Case, Num, SlotOf } from '../types';
import { ownAlone, ownPhrase } from './agree';
import { POSSESSORS, roAloneFor, roBareNoun } from './possessive';
import { richText } from './segments';

const of = (value: string): SlotOf<'possessive'> => POSSESSORS.find((p) => p.value === value)!.slot;
const dikos = getAdjective('dikos');
const before = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = ownPhrase(dikos, getNoun(noun), number, c, of(who));
  return { el: richText(np.el), ro: np.ro, en: np.en };
};
const alone = (noun: string, who: string, number: Num = 'sg', c: Case = 'nom') => {
  const np = ownAlone(dikos, getNoun(noun), number, c, of(who));
  return { el: richText(np.el), ro: np.ro, en: np.en };
};

describe('δικός', () => {
  it('is the stressed three-ending adjective δικός, δική, δικό with Romanian propriu', () => {
    expect(dikos.lemma).toBe('δικός');
    expect(dikos.emphatic).toBe(true);
    expect(dikos.ro.lemma).toBe('propriu');
    expect(dikos.verified).toEqual({ el: false, ro: false, en: false });
  });

  it('goes before the noun with the possessive between them', () => {
    expect(before('spiti', '1sg')).toEqual({ el: 'το δικό μου σπίτι', ro: 'propria mea casă', en: 'my own house' });
    expect(before('skylos', '2sg')).toEqual({ el: 'ο δικός σου σκύλος', ro: 'propriul tău câine', en: 'your own dog' });
    expect(before('thalassa', '1pl')).toEqual({ el: 'η δική μας θάλασσα', ro: 'propria noastră mare', en: 'our own sea' });
  });

  it('takes no second accent on the noun', () => {
    expect(before('thalassa', '1sg').el).toBe('η δική μου θάλασσα');
  });

  it('the third person keeps the invariable Romanian word', () => {
    expect(before('paidi', '3sg-f')).toEqual({ el: 'το δικό της παιδί', ro: 'propriul ei copil', en: 'her own child' });
    expect(before('paidi', '3pl')).toEqual({ el: 'το δικό τους παιδί', ro: 'propriul lor copil', en: 'their own child' });
  });

  it('agrees in the plural, and in the accusative', () => {
    expect(before('spiti', '1sg', 'pl')).toEqual({ el: 'τα δικά μου σπίτια', ro: 'propriile mele case', en: 'my own houses' });
    expect(before('skylos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου σκύλοι', ro: 'proprii mei câini', en: 'my own dogs' });
    expect(before('skylos', '1sg', 'sg', 'acc')).toEqual({ el: 'τον δικό μου σκύλο', ro: 'propriul meu câine', en: 'my own dog' });
  });

  it('a Romanian neuter follows the masculine in the singular and the feminine in the plural', () => {
    expect(before('dromos', '1sg')).toEqual({ el: 'ο δικός μου δρόμος', ro: 'propriul meu drum', en: 'my own road' });
    expect(before('dromos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου δρόμοι', ro: 'propriile mele drumuri', en: 'my own roads' });
  });

  it('on its own it keeps the article and says al meu, a mea, ai mei, ale mele', () => {
    expect(alone('spiti', '1sg')).toEqual({ el: 'το δικό μου', ro: 'a mea', en: 'mine' });
    expect(alone('skylos', '1pl')).toEqual({ el: 'ο δικός μας', ro: 'al nostru', en: 'ours' });
    expect(alone('skylos', '1sg', 'pl')).toEqual({ el: 'οι δικοί μου', ro: 'ai mei', en: 'mine' });
    expect(alone('spiti', '1sg', 'pl')).toEqual({ el: 'τα δικά μου', ro: 'ale mele', en: 'mine' });
    expect(alone('paidi', '3sg-m')).toEqual({ el: 'το δικό του', ro: 'al lui', en: 'his' });
    expect(alone('thalassa', '3sg-f')).toEqual({ el: 'η δική της', ro: 'a ei', en: 'hers' });
    expect(alone('paidi', '3pl', 'pl')).toEqual({ el: 'τα δικά τους', ro: 'ai lor', en: 'theirs' });
  });

  it('gives the Romanian forms by gender for the full table', () => {
    expect(roAloneFor(of('1sg'), 'n', 'sg')).toBe('al meu');
    expect(roAloneFor(of('1sg'), 'n', 'pl')).toBe('ale mele');
    expect(roAloneFor(of('2pl'), 'f', 'sg')).toBe('a voastră');
    expect(roAloneFor(of('3sg-f'), 'm', 'pl')).toBe('ai ei');
  });

  it('the bare Romanian noun has no article', () => {
    expect(roBareNoun(getNoun('spiti'), 'sg')).toBe('casă');
    expect(roBareNoun(getNoun('skylos'), 'sg')).toBe('câine');
    expect(roBareNoun(getNoun('paidi'), 'pl')).toBe('copii');
  });
});
