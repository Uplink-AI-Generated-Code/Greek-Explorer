import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { ComparisonTable, selectDivergences } from './ComparisonTable';
import type { Slot } from '../types';

describe('selectDivergences', () => {
  it('selects rows for the part of speech', () => {
    const ids = selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'improver').map((d) => d.id);
    expect(ids).toEqual(['adjective-position', 'adjective-agreement', 'adjective-with-the']);
  });
  it('hides extra rows for Beginner', () => {
    const ids = selectDivergences(DIVERGENCES, 'adjective', 'zestos', 'beginner').map((d) => d.id);
    expect(ids).toEqual(['adjective-position', 'adjective-agreement']);
  });
  it('includes lexeme-specific rows only for that lexeme', () => {
    expect(selectDivergences(DIVERGENCES, 'verb', 'thelo', 'beginner').map((d) => d.id)).toEqual([
      'verb-subject',
      'thelo-politeness',
    ]);
    expect(selectDivergences(DIVERGENCES, 'verb', 'other', 'beginner').map((d) => d.id)).toEqual(['verb-subject']);
  });
});

describe('selectDivergences by mood, tense and voice', () => {
  const verb = (mood: string, tense: string, voice = 'active'): Slot =>
    ({ pos: 'verb', person: 1, number: 'sg', mood, tense, voice }) as Slot;
  const ids = (lexeme: string, slot: Slot, level: 'beginner' | 'improver' = 'improver') =>
    selectDivergences(DIVERGENCES, 'verb', lexeme, level, slot).map((d) => d.id);

  it('without a slot, rows with a condition never show (the old call keeps its old result)', () => {
    expect(selectDivergences(DIVERGENCES, 'verb', 'troo', 'improver').map((d) => d.id)).toEqual(['verb-subject']);
  });

  it('the perfect shows the aorist contrast and the unchanging participle', () => {
    const shown = ids('troo', verb('indicative', 'perfect'));
    expect(shown).toContain('perfect-vs-aorist');
    expect(shown).toContain('invariable-participle');
    expect(shown).not.toContain('imperative-aspect');
  });

  it('the conditional pluperfect shows the unchanging participle', () => {
    expect(ids('troo', verb('conditional', 'pluperfect'))).toContain('invariable-participle');
  });

  it('the aorist subjunctive shows the infinitive and aspect notes', () => {
    const shown = ids('troo', verb('subjunctive', 'aorist'));
    expect(shown).toEqual(expect.arrayContaining(['subjunctive-for-infinitive', 'aspect']));
    expect(shown).not.toContain('perfect-subjunctive');
  });

  it('the perfect subjunctive shows its own note', () => {
    expect(ids('troo', verb('subjunctive', 'perfect'))).toContain('perfect-subjunctive');
  });

  it('the imperative shows aspect and forms; the forms note is Improver only', () => {
    expect(ids('troo', verb('imperative', 'aorist'), 'beginner')).toContain('imperative-aspect');
    expect(ids('troo', verb('imperative', 'aorist'), 'beginner')).not.toContain('imperative-forms');
    expect(ids('troo', verb('imperative', 'aorist'))).toContain('imperative-forms');
  });

  it('the polite imperfect is attached to θέλω', () => {
    expect(ids('thelo', verb('indicative', 'imperfect'))).toContain('polite-imperfect');
    expect(ids('troo', verb('indicative', 'imperfect'))).not.toContain('polite-imperfect');
  });

  it('the conditional shows how Greek builds it', () => {
    expect(ids('thelo', verb('conditional', 'imperfect'))).toContain('conditional-construction');
  });

  it('the reflexive and deponent notes follow the voice and the lexeme', () => {
    expect(ids('pleno', verb('indicative', 'present', 'mediopassive'))).toContain('reflexive');
    expect(ids('pleno', verb('indicative', 'present', 'active'))).not.toContain('reflexive');
    expect(ids('koimamai', verb('indicative', 'present', 'mediopassive'))).toContain('deponent');
  });

  it('the modal note is attached to μπορεί', () => {
    expect(ids('mporei', verb('indicative', 'present'))).toContain('impersonal-modal');
  });
});

describe('ComparisonTable', () => {
  it('renders one row per divergence with three language columns', () => {
    const rows = selectDivergences(DIVERGENCES, 'verb', 'thelo', 'beginner');
    render(<ComparisonTable rows={rows} word="Θέλω" />);
    expect(screen.getByText(/Compare:/)).toHaveTextContent('Compare: Θέλω');
    expect(screen.getAllByRole('cell', { name: 'dropped: the ending shows the person' })).toHaveLength(2);
    expect(screen.getAllByText('differs')).toHaveLength(2);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});
