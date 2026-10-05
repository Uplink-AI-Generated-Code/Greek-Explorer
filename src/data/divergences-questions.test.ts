import { describe, expect, it } from 'vitest';
import { selectDivergences } from '../components/ComparisonTable';
import type { Level, Pos, Slot } from '../types';
import { DIVERGENCES } from './divergences';

const ids = (pos: Pos, lexeme: string, slot?: Slot, level: Level = 'improver') =>
  selectDivergences(DIVERGENCES, pos, lexeme, level, slot).map((d) => d.id);
const verb = (mood: string, tense: string, polarity?: 'negative'): Slot =>
  ({ pos: 'verb', person: 1, number: 'pl', mood, tense, voice: 'active', ...(polarity ? { polarity } : {}) }) as Slot;

describe('the comparison notes for question words', () => {
  it('every question word shows the word order and the question mark', () => {
    expect(ids('interrogative', 'pou')).toEqual(['question-order', 'question-mark']);
    expect(ids('interrogative', 'ti')).toEqual(['question-order', 'question-mark', 'question-words']);
    expect(ids('interrogative', 'giati')).toEqual(['question-order', 'question-mark', 'why-because']);
  });

  it('ποιος and πόσος show the declension; only ποιος shows who / which / what', () => {
    expect(ids('quantifier', 'poios')).toEqual(expect.arrayContaining(['question-words-who', 'question-declension']));
    expect(ids('quantifier', 'posos')).toContain('question-declension');
    expect(ids('quantifier', 'posos')).not.toContain('question-words-who');
    expect(ids('quantifier', 'polys')).not.toContain('question-declension');
  });

  it('από and μέχρι show the fused Romanian words, and ώρα shows "what time"', () => {
    expect(ids('preposition', 'apo')).toContain('question-compounds');
    expect(ids('preposition', 'mexri')).toContain('question-compounds');
    expect(ids('preposition', 'pano')).not.toContain('question-compounds');
    expect(ids('noun', 'ora')).toContain('question-compounds-hour');
  });

  it('κάνω in the present shows the price idiom, and no other verb or tense does', () => {
    expect(ids('verb', 'kano', verb('indicative', 'present'))).toContain('price-idiom');
    expect(ids('verb', 'kano', verb('indicative', 'aorist'))).not.toContain('price-idiom');
    expect(ids('verb', 'troo', verb('indicative', 'present'))).not.toContain('price-idiom');
  });
});

describe('the comparison notes for the hortative', () => {
  it('show only in the hortative, and the negation note only when negated', () => {
    expect(ids('verb', 'troo', verb('hortative', 'aorist'))).toEqual([
      'verb-subject', 'hortative-construction', 'hortative-vs-subjunctive', 'hortative-persons',
    ]);
    expect(ids('verb', 'troo', verb('hortative', 'aorist', 'negative'))).toContain('hortative-negation');
    expect(ids('verb', 'troo', verb('subjunctive', 'aorist'))).not.toContain('hortative-construction');
  });

  it('Beginner leaves out the extra note about ας and να', () => {
    expect(ids('verb', 'troo', verb('hortative', 'aorist'), 'beginner')).toEqual([
      'verb-subject', 'hortative-construction', 'hortative-persons',
    ]);
  });
});
