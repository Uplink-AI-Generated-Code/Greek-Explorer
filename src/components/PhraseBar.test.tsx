import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { PhraseBar } from './PhraseBar';

describe('PhraseBar', () => {
  it('renders one button per token and marks the selected one', () => {
    render(<PhraseBar tokens={PHRASES[0].tokens} selected={2} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'ζεστό' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Θέλω' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the token index', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={PHRASES[0].tokens} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'καφέ' }));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
