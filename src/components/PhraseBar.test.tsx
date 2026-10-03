import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import type { Token } from '../types';
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

describe('PhraseBar: verb groups', () => {
  const group: Token[] = [
    {
      text: 'Θα έχω φάει',
      lexeme: 'troo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'futurePerfect', voice: 'active' },
    },
    {
      text: 'Θέλω',
      lexeme: 'thelo',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' },
    },
  ];

  it('is one chip for the whole group, named by its written words', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Θα έχω φάει' })).toBeInTheDocument();
  });

  it('colours the pieces: particle, auxiliary, verb', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const chip = screen.getByRole('button', { name: 'Θα έχω φάει' });
    const pieces = Array.from(chip.querySelectorAll('.piece'));
    expect(pieces.map((p) => p.textContent)).toEqual(['Θα', 'έχω', 'φάει']);
    expect(pieces.map((p) => p.className)).toEqual([
      'piece piece-particle',
      'piece piece-auxiliary',
      'piece piece-verb',
    ]);
  });

  it('a single-word verb is a plain chip', () => {
    render(<PhraseBar tokens={group} selected={1} onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Θέλω' }).querySelector('.piece')).toBeNull();
  });
});
