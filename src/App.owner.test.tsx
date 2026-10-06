import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('a noun possessor in the app', () => {
  it('the possessed noun shows its owner, and the owner control can change it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "The child's house");
    await user.click(screen.getByRole('button', { name: 'σπίτι' }));
    expect(screen.getByRole('cell', { name: 'το σπίτι του παιδιού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa copilului' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "the child's house" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'thalassa');
    expect(screen.getByRole('cell', { name: 'το σπίτι της θάλασσας' })).toBeInTheDocument();
  });

  it('nobody, then the phrase’s own owner again, is the phrase again', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "The child's dog");
    await user.click(screen.getByRole('button', { name: 'σκύλος' }));
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'none');
    expect(screen.queryByRole('cell', { name: 'ο σκύλος του παιδιού' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Owned by a noun?'), 'paidi');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });
});
