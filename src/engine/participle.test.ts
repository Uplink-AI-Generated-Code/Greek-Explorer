import { describe, expect, it } from 'vitest';
import { LEXEMES, getAdjective, getNoun, getVerb } from '../data/lexemes';
import { buildPanel } from '../panels/panels';
import type { Case, Gender, GreekAdjective, Num, SlotOf } from '../types';
import { validate } from '../validate/validate';
import { compose } from './compose';
import { enVerbText } from './english';
import { inflectAdjective } from './greek';
import { participleReading } from './reading';
import { roAdjective, roVerb } from './romanian';
import { formText, richText } from './segments';

const adjSlot = (gender: Gender, number: Num, c: Case): SlotOf<'adjective'> => ({ pos: 'adjective', gender, number, case: c });
const greek = (id: string, s: SlotOf<'adjective'>) => formText(inflectAdjective(getAdjective(id), s));

describe('the participle stems', () => {
  it('πλένω and ψήνω store the participle stem', () => {
    expect(getVerb('pleno').voices.active?.stems.participle).toBe('πλυ');
    expect(getVerb('psino').voices.active?.stems.participle).toBe('ψη');
  });
  it('ψήνω is a regular -ω verb that offers the present', () => {
    const slot = (person: 1 | 2 | 3): SlotOf<'verb'> => ({ pos: 'verb', person, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' });
    expect([1, 2, 3].map((p) => compose(getVerb('psino'), slot(p as 1 | 2 | 3)).text)).toEqual(['ψήνω', 'ψήνεις', 'ψήνει']);
    expect(roVerb(getVerb('psino'), slot(1))).toBe('coc');
    expect(enVerbText(getVerb('psino'), slot(3), 'he/she')).toBe('he/she bakes');
  });
});

describe('πλυμένος and ψημένος', () => {
  it.each([
    ['plymenos', 'm', 'sg', 'nom', 'πλυμένος'], ['plymenos', 'f', 'sg', 'nom', 'πλυμένη'], ['plymenos', 'n', 'sg', 'nom', 'πλυμένο'],
    ['plymenos', 'm', 'sg', 'acc', 'πλυμένο'], ['plymenos', 'm', 'sg', 'gen', 'πλυμένου'], ['plymenos', 'f', 'sg', 'gen', 'πλυμένης'],
    ['plymenos', 'm', 'pl', 'nom', 'πλυμένοι'], ['plymenos', 'n', 'pl', 'nom', 'πλυμένα'], ['plymenos', 'f', 'pl', 'acc', 'πλυμένες'],
    ['psimenos', 'm', 'sg', 'nom', 'ψημένος'], ['psimenos', 'f', 'sg', 'nom', 'ψημένη'], ['psimenos', 'n', 'sg', 'nom', 'ψημένο'],
    ['psimenos', 'n', 'pl', 'acc', 'ψημένα'],
  ] as const)('%s %s %s %s -> %s', (id, g, n, c, expected) => {
    expect(greek(id, adjSlot(g, n, c))).toBe(expected);
  });

  it('the Romanian participle agrees in gender and number', () => {
    const spalat = getAdjective('plymenos');
    expect(roAdjective(spalat, 'm', 'sg', 'nom')).toBe('spălat');
    expect(roAdjective(spalat, 'f', 'sg', 'nom')).toBe('spălată');
    expect(roAdjective(spalat, 'm', 'pl', 'nom')).toBe('spălați');
    expect(roAdjective(spalat, 'f', 'pl', 'nom')).toBe('spălate');
    expect(roAdjective(spalat, 'f', 'sg', 'gen')).toBe('spălate');
    const copt = getAdjective('psimenos');
    expect(roAdjective(copt, 'm', 'sg', 'nom')).toBe('copt');
    expect(roAdjective(copt, 'f', 'sg', 'nom')).toBe('coaptă');
    expect(roAdjective(copt, 'm', 'pl', 'nom')).toBe('copți');
    expect(roAdjective(copt, 'f', 'pl', 'nom')).toBe('coapte');
  });

  it('is derived from its verb', () => {
    expect(getAdjective('plymenos').derivedFrom).toEqual({ verb: 'pleno', stem: 'πλυ' });
    expect(getAdjective('psimenos').derivedFrom).toEqual({ verb: 'psino', stem: 'ψη' });
  });
});

describe('the validator ties a participle to its verb', () => {
  const adj = getAdjective('plymenos');
  const check = (patch: Partial<GreekAdjective>) =>
    validate({ lexemes: { ...LEXEMES, plymenos: { ...adj, ...patch } as GreekAdjective }, phrases: [] });
  it('accepts the real data', () => {
    expect(check({})).toEqual([]);
  });
  it('refuses a stem that is not the participle stem + μέν', () => {
    expect(check({ stem: 'πλυμεν' })).toContain('lexeme plymenos: the stem πλυμεν is not πλυμέν');
  });
  it('refuses a participle stem the verb does not store', () => {
    expect(check({ derivedFrom: { verb: 'pleno', stem: 'πλυθ' }, stem: 'πλυθμέν' })).toContain(
      'lexeme plymenos: the participle stem πλυθ is not the stem πλυ that pleno stores',
    );
  });
  it('refuses an unknown verb and a class that is not stem-stressed', () => {
    expect(check({ derivedFrom: { verb: 'nope', stem: 'πλυ' } })).toContain('lexeme plymenos: derived from unknown verb "nope"');
    expect(check({ class: 'adj-stressed' })).toContain('lexeme plymenos: a participle in -μένος is stem-stressed');
  });
});

describe('the participle reading', () => {
  const paidi = getNoun('paidi');
  const psomi = getNoun('psomi');
  it('πλυμένο with το παιδί, as in spec 5.5', () => {
    const line = participleReading(getAdjective('plymenos'), adjSlot('n', 'sg', 'nom'), paidi);
    expect(line.parts).toEqual([
      { text: 'πλυ', label: 'πλυ-', role: 'stem', gloss: 'wash', piece: null },
      {
        text: 'μένο',
        label: '-μένο',
        role: 'ending',
        gloss: 'a describing word (washed) that matches το παιδί: neuter, one',
        piece: null,
      },
    ]);
    expect(line.beginner).toBe('πλυμένο: πλυ- = wash, -μένο = a describing word (washed) that matches το παιδί: neuter, one.');
    expect(line.improver).toBe('Passive participle: participle stem πλυ- + -μένος declined in the neuter nominative singular.');
  });
  it('names the gender, number and role of the form', () => {
    const line = participleReading(getAdjective('psimenos'), adjSlot('f', 'pl', 'gen'), getNoun('alepou'));
    expect(line.parts[1].gloss).toBe('a describing word (baked) that matches των αλεπούδων: feminine, many');
    expect(line.improver).toContain('feminine genitive plural');
  });
  it('is not used for an adjective that is not derived', () => {
    expect(() => participleReading(getAdjective('zestos'), adjSlot('m', 'sg', 'nom'), paidi)).toThrow(/not derived/);
  });
  it('works for ψημένο with το ψωμί', () => {
    expect(participleReading(getAdjective('psimenos'), adjSlot('n', 'sg', 'nom'), psomi).beginner).toBe(
      'ψημένο: ψη- = bake, -μένο = a describing word (baked) that matches το ψωμί: neuter, one.',
    );
  });
});

describe('the adjective panel of a participle', () => {
  const panel = (id: string, noun: string, g: Gender, level: 'beginner' | 'improver' = 'beginner') => {
    const slot = adjSlot(g, 'sg', 'nom');
    return buildPanel({ slot, noun, nounNumber: 'sg' }, { text: '', lexeme: id, slot }, level);
  };
  it('πλυμένο: the forms, the label and the reading', () => {
    const p = panel('plymenos', 'paidi', 'n');
    expect(p.lemma).toBe('πλυμένος / πλυμένη / πλυμένο');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'το πλυμένο παιδί', 'copilul spălat', 'the washed child',
    ]);
    expect(p.posLabel).toBe('describing word: washed (from πλένω)');
    expect(p.reading).toHaveLength(1);
    expect(p.reading?.[0]).toMatchObject({ lang: 'el', sentence: expect.stringContaining('πλυ- = wash') });
  });
  it('Improver: the technical label and sentence', () => {
    const p = panel('plymenos', 'paidi', 'n', 'improver');
    expect(p.posLabel).toBe('passive participle · adjective (stem-stressed)');
    expect(p.reading?.[0].sentence).toContain('Passive participle');
  });
  it('ψημένο with ψωμί shows the Romanian feminine', () => {
    const p = panel('psimenos', 'psomi', 'n');
    expect([richText(p.rows[0].el), richText(p.rows[0].ro), richText(p.rows[0].en)]).toEqual([
      'το ψημένο ψωμί', 'pâinea coaptă', 'the baked bread',
    ]);
  });
  it('an ordinary adjective has no reading and no derived label', () => {
    const p = panel('zestos', 'kafes', 'm');
    expect(p.reading).toBeUndefined();
    expect(p.posLabel).toBe('adjective: hot');
  });
});
