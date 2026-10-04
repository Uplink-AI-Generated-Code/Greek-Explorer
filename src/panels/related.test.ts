import { describe, expect, it } from 'vitest';
import type { Gender, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const quantifier = (patch: Partial<SlotOf<'quantifier'>> = {}): SlotOf<'quantifier'> => ({
  pos: 'quantifier', gender: 'm', number: 'sg', case: 'acc', degree: 'plain', use: 'determiner', ...patch,
});
const adjective = (gender: Gender): SlotOf<'adjective'> => ({ pos: 'adjective', gender, number: 'sg', case: 'nom' });
const panelOf = (lexeme: string, state: PanelState) => buildPanel(state, { text: '', lexeme, slot: state.slot }, 'beginner');

describe('related panels', () => {
  it('a participle points at its verb', () => {
    const p = panelOf('plymenos', { slot: adjective('n'), noun: 'paidi', nounNumber: 'sg' });
    expect(p.related).toEqual({
      text: 'Derived from πλένω (πλυ- + -μένος).',
      button: 'Open πλένω',
      backLabel: 'Back to the participle',
      lexeme: 'pleno',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
      noun: null,
    });
    expect(panelOf('psimenos', { slot: adjective('n'), noun: 'psomi', nounNumber: 'sg' }).related?.lexeme).toBe('psino');
  });

  it('an ordinary adjective points nowhere', () => {
    expect(panelOf('zestos', { slot: adjective('m'), noun: 'kafes', nounNumber: 'sg' }).related).toBeUndefined();
  });

  it('κανένας points at the numeral ένας, with the same noun, gender and role', () => {
    const state: PanelState = { slot: quantifier(), noun: 'kafes', nounNumber: 'sg' };
    expect(panelOf('kanenas', state).related).toEqual({
      text: 'κανένας follows the numeral ένας.',
      button: 'Open the numeral ένας',
      backLabel: 'Back to κανένας',
      lexeme: 'numeral',
      slot: { pos: 'numeral', value: 1, gender: 'm', case: 'acc' },
      noun: 'kafes',
    });
    const genitive = applyControl(state, 'case', 'gen');
    expect(panelOf('kanenas', genitive).related?.slot).toMatchObject({ case: 'gen' });
  });

  it('the other quantifiers point nowhere', () => {
    for (const id of ['merikoi', 'kapoios', 'polys', 'ligos']) {
      const slot = quantifier(id === 'merikoi' ? { number: 'pl' } : {});
      expect(panelOf(id, { slot, noun: 'kafes', nounNumber: slot.number }).related).toBeUndefined();
    }
  });
});
