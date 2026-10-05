import { describe, expect, it } from 'vitest';
import { getLexeme } from '../data/lexemes';
import { inflect } from '../engine/greek';
import { richText } from '../engine/segments';
import type { GreekInterrogative } from '../types';
import { applyControl, buildPanel } from './panels';
import { interrogativePanel } from './interrogative';

const word = (id: string) => getLexeme(id) as GreekInterrogative;
const cells = (id: string) =>
  interrogativePanel(word(id), 'beginner').rows.map((r) => [r.label, richText(r.el), richText(r.ro), richText(r.en)]);

describe('the question words', () => {
  it('never change: one form for the one slot', () => {
    expect(inflect(word('pou'), { pos: 'interrogative' })).toEqual({ stem: 'πού', ending: '' });
  });

  it('τι: the word on its own and in a question', () => {
    expect(cells('ti')).toEqual([
      ['on its own', 'τι', 'ce', 'what'],
      ['in a question', 'Τι θέλεις;', 'Ce vrei?', 'What do you want?'],
    ]);
  });

  it('γιατί has a third row, "as an answer"', () => {
    expect(cells('giati')).toEqual([
      ['on its own', 'γιατί', 'de ce', 'why'],
      ['in a question', 'Γιατί δεν τρως;', 'De ce nu mănânci?', "Why aren't you eating?"],
      ['as an answer', 'γιατί δεν θέλω', 'pentru că nu vreau', "because I don't want to"],
    ]);
  });

  it('has no controls and no paradigm, and labels the part of speech at both levels', () => {
    const beginner = interrogativePanel(word('pote'), 'beginner');
    expect(beginner.controls).toEqual([]);
    expect(beginner.full).toEqual([]);
    expect(beginner.posLabel).toBe('question word: when');
    expect(interrogativePanel(word('pote'), 'improver').posLabel).toBe('interrogative · never changes');
    expect(beginner.plain).toContain('μέχρι');
  });

  it('opens through buildPanel and ignores the role control', () => {
    const token = { text: 'Πού', lexeme: 'pou', slot: { pos: 'interrogative' as const } };
    const state = { slot: token.slot, noun: null, nounNumber: 'sg' as const };
    expect(buildPanel(state, token, 'beginner').lemma).toBe('πού');
    expect(applyControl(state, 'case', 'gen')).toBe(state);
  });
});
