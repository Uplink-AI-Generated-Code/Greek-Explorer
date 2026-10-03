import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from '../data/divergences';
import { ComparisonTable, selectDivergences } from './ComparisonTable';

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
