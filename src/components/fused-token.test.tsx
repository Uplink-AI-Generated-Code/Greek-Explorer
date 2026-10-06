import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Explorer } from '../Explorer';
import type { GlossRow, Phrase, Token } from '../types';
import { PhraseBar } from './PhraseBar';

const tokens: Token[] = [
  { text: 'στον', lexeme: 'se', slot: { pos: 'preposition', sense: 'on' }, agreesWith: 1 },
  { text: 'σκύλο', lexeme: 'skylos', slot: { pos: 'noun', number: 'sg', case: 'acc' } },
];
const rows = (...units: GlossRow['units']): GlossRow[] => [
  { language: 'en', kind: 'natural', units },
  { language: 'en', kind: 'literal', units },
  { language: 'ro', kind: 'natural', units },
  { language: 'ro', kind: 'literal', units },
];
const phrase: Phrase = {
  id: 'on-the-dog',
  title: 'On the dog',
  theme: 'Places',
  level: 'beginner',
  tokens,
  glosses: rows(
    { text: 'on', link: { token: 0, piece: 0 } },
    { text: 'the', link: { token: 0, piece: 1 } },
    { text: 'dog', link: 1 },
  ),
  verified: false,
};

describe('PhraseBar: a fused preposition', () => {
  it('shows στον as one chip made of two parts, σ and τον', () => {
    render(<PhraseBar tokens={tokens} selected={0} onSelect={() => {}} />);
    expect(screen.getByRole('group', { name: 'στον' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'σ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'τον' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'σκύλο' })).toBeInTheDocument();
  });

  it('reports the part that was clicked', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={tokens} selected={0} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'τον' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });
});

describe('Explorer: a fused preposition', () => {
  it('opens the σε panel for the first part, and the article for the second, with a way back', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον σκύλο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to σε/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
  });

  it('a gloss unit linked to a part opens that part', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    await user.click(screen.getAllByRole('button', { name: 'the' })[0]);
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
  });

  it('the article follows the noun the σε panel holds', async () => {
    const user = userEvent.setup();
    render(<Explorer phrase={phrase} level="beginner" />);
    await user.selectOptions(screen.getByLabelText('Noun after it'), 'psomi');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('cell', { name: 'το ψωμί' })).toBeInTheDocument();
  });
});
