import { render, screen, within } from '@testing-library/react';
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

  it('is one group named by its written words, with a button for each piece', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.textContent)).toEqual(['Θα', 'έχω', 'φάει']);
    expect(pieces.map((b) => b.className)).toEqual([
      'chip piece piece-particle',
      'chip piece piece-auxiliary',
      'chip piece piece-verb',
    ]);
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('presses the verb piece by default', () => {
    render(<PhraseBar tokens={group} selected={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
  });

  it('presses only the selected piece when one is selected', () => {
    render(<PhraseBar tokens={group} selected={0} selectedPiece={0} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
  });

  it('presses nothing in a group that is not selected', () => {
    render(<PhraseBar tokens={group} selected={1} onSelect={() => {}} />);
    const pieces = within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getAllByRole('button');
    expect(pieces.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'false']);
  });

  it('reports the token and the piece that was clicked', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={group} selected={1} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'έχω' }));
    expect(onSelect).toHaveBeenCalledWith(0, 1);
  });

  it('a single-word verb is a plain button', async () => {
    const onSelect = vi.fn();
    render(<PhraseBar tokens={group} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'Θέλω' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Θέλω' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
