import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import { compose } from '../engine/compose';
import { linksOf } from '../glossLinks';
import { buildPanel, initialState } from '../panels/panels';
import { richText } from '../engine/segments';
import type { SlotOf } from '../types';
import { validate, warnings } from '../validate/validate';
import { DIVERGENCES } from './divergences';
import { LEXEMES, getVerb } from './lexemes';
import { PHRASES } from './phrases';

const IDS = ['eat-it', 'wash-it', 'give-it-to-me', 'dont-eat-it', 'eat-bare'];
const byId = (id: string) => {
  const phrase = PHRASES.find((p) => p.id === id);
  if (!phrase) throw new Error(`no phrase ${id}`);
  return phrase;
};

describe('phrases with pronouns (34 to 38)', () => {
  it('validate with no errors and no warnings', () => {
    expect(validate({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
    expect(warnings({ lexemes: LEXEMES, phrases: PHRASES })).toEqual([]);
  });

  it('start unverified and have a theme', () => {
    for (const id of IDS) {
      expect(byId(id).verified).toBe(false);
      expect(byId(id).theme).not.toBe('');
    }
  });

  it.each([
    ['eat-it', 'Φάε το!', 2],
    ['wash-it', 'Πλύνε το!', 2],
    ['give-it-to-me', 'Δώσε μού το!', 3],
    ['dont-eat-it', 'Μην το φας!', 3],
    ['eat-bare', 'Φάε!', 1],
  ])('%s is one token, «%s», of %i pieces', (id, text, pieces) => {
    const phrase = byId(id);
    expect(phrase.tokens).toHaveLength(1);
    expect(phrase.tokens[0].text).toBe(text);
    const slot = phrase.tokens[0].slot as SlotOf<'verb'>;
    expect(compose(getVerb(phrase.tokens[0].lexeme), slot).pieces).toHaveLength(pieces);
  });

  it('every gloss unit links to a real piece', () => {
    for (const id of IDS) {
      const phrase = byId(id);
      const count = compose(getVerb(phrase.tokens[0].lexeme), phrase.tokens[0].slot as SlotOf<'verb'>).pieces.length;
      for (const row of phrase.glosses) {
        for (const unit of row.units) {
          for (const link of linksOf(unit)) {
            if (typeof link === 'object') expect(link.piece).toBeLessThan(count);
          }
        }
      }
    }
  });

  it('the panel rows in the three languages (spec 6.1)', () => {
    const row = (id: string) => {
      const phrase = byId(id);
      const r = buildPanel(initialState(phrase.tokens[0], phrase), phrase.tokens[0], 'beginner').rows[0];
      return [richText(r.el), richText(r.ro), richText(r.en)];
    };
    expect(row('eat-it')).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(row('wash-it')).toEqual(['πλύνε το', 'spală-l', 'wash him / her / it']);
    expect(row('give-it-to-me')).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(row('dont-eat-it')).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(row('eat-bare')).toEqual(['φάε', 'mănâncă', 'eat']);
  });

  it('the verbs of phrases 24, 25 and 26 go with their noun, so the panel starts on the with-noun reading', () => {
    for (const id of ['eat-the-bread', 'dont-eat-the-bread', 'wash-the-child']) {
      const phrase = byId(id);
      expect(phrase.tokens[0].agreesWith).toBe(2);
      expect(initialState(phrase.tokens[0], phrase).noun).toBe(phrase.tokens[2].lexeme);
    }
  });
});

describe('the pronoun notes', () => {
  const ids = (slot: Partial<SlotOf<'verb'>>, level: 'beginner' | 'improver') =>
    selectDivergences(DIVERGENCES, 'verb', 'troo', level, {
      pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...slot,
    }).map((d) => d.id);
  const to = { role: 'object' as const, person: 3 as const, number: 'sg' as const, gender: 'n' as const };

  it('appear only for a command with pronouns', () => {
    expect(ids({}, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([]);
    expect(ids({ clitics: [to] }, 'beginner').filter((id) => id.startsWith('clitic-'))).toEqual(['clitic-position', 'clitic-gender']);
    expect(ids({ clitics: [to] }, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([
      'clitic-position', 'clitic-gender', 'clitic-stress',
    ]);
  });
  it('the order note needs two pronouns', () => {
    const two = [{ role: 'indirect' as const, person: 1 as const, number: 'sg' as const }, to];
    expect(ids({ clitics: two }, 'improver').filter((id) => id.startsWith('clitic-'))).toEqual([
      'clitic-position', 'clitic-gender', 'clitic-order', 'clitic-stress',
    ]);
  });
  it('the pronoun panel has its own note', () => {
    expect(selectDivergences(DIVERGENCES, 'clitic', 'clitic', 'beginner').map((d) => d.id)).toEqual(['clitic-weak-strong']);
  });
  it('start unverified', () => {
    for (const d of DIVERGENCES.filter((row) => row.id.startsWith('clitic-'))) expect(d.verified).toBe(false);
  });
});
