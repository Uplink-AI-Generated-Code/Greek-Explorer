import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import type { GlossRow } from '../types';
import { GlossGrid } from './GlossGrid';

const glosses = PHRASES[0].glosses;

describe('GlossGrid', () => {
  it('shows all four rows with language and kind labels', () => {
    render(<GlossGrid glosses={glosses} selected={0} onSelect={() => {}} />);
    expect(screen.getAllByText('natural')).toHaveLength(2);
    expect(screen.getAllByText('literal')).toHaveLength(2);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Română')).toBeInTheDocument();
  });

  it('highlights every unit linked to the selected token', () => {
    render(<GlossGrid glosses={glosses} selected={2} onSelect={() => {}} />);
    const hot = screen.getAllByRole('button', { name: 'hot' });
    expect(hot).toHaveLength(2);
    for (const b of hot) expect(b).toHaveAttribute('aria-pressed', 'true');
    const calda = screen.getAllByRole('button', { name: 'caldă' });
    expect(calda).toHaveLength(2);
    for (const b of calda) expect(b).toHaveAttribute('aria-pressed', 'true');
    const coffee = screen.getAllByRole('button', { name: 'coffee' });
    expect(coffee).toHaveLength(2);
    for (const b of coffee) expect(b).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects the linked token when a unit is clicked', async () => {
    const onSelect = vi.fn();
    render(<GlossGrid glosses={glosses} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getAllByRole('button', { name: 'cafea' })[0]);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('highlights and selects through a link that names a piece of a token', async () => {
    const pieceGlosses: GlossRow[] = [
      {
        language: 'en',
        kind: 'natural',
        units: [
          { text: "don't", link: { token: 1, piece: 0 } },
          { text: 'want', link: { token: 1, piece: 1 } },
        ],
      },
    ];
    const onSelect = vi.fn();
    render(<GlossGrid glosses={pieceGlosses} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: "don't" })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'want' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('shows units with no Greek counterpart as dashed, non-interactive text', () => {
    render(<GlossGrid glosses={glosses} selected={0} onSelect={() => {}} />);
    expect(screen.queryByRole('button', { name: '(I)' })).not.toBeInTheDocument();
    expect(screen.getByText('(I)')).toHaveClass('gloss-unit', 'is-gap');
  });
});
