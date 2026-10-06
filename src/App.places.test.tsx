import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('σε in the app', () => {
  it('shows στο as one chip with two parts, and opens the σε panel on the first', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I'm at home");
    expect(screen.getByRole('group', { name: 'στο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'σ' }));
    expect(screen.getByRole('heading', { level: 2, name: 'σε' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'στο σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'la casa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'at the house' })).toBeInTheDocument();
  });

  it('the Meaning control changes the Romanian and English word, and the example', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I'm at home");
    await user.click(screen.getByRole('button', { name: 'σ' }));
    await user.selectOptions(screen.getByLabelText('Meaning'), 'in');
    expect(screen.getByRole('cell', { name: 'în casa' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'in the house' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'sare în apă' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('opens the article from the second part, and goes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The dog is on the road');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον δρόμο' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Back to σε/ }));
    expect(screen.getByRole('cell', { name: 'pe drumul' })).toBeInTheDocument();
  });

  it('writes στη before θάλασσα, while the article panel shows the full την', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Shall we go to the sea?');
    expect(screen.getByRole('group', { name: 'στη' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'τη' }));
    expect(screen.getByRole('cell', { name: 'την θάλασσα' })).toBeInTheDocument();
  });
});
