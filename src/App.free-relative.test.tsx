import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('free relatives in the app', () => {
  it('opens ό,τι with both readings and an example of each', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Whatever you want');
    await user.click(screen.getByRole('button', { name: 'Ό,τι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ό,τι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'orice' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ce' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ce am' })).toBeInTheDocument();
  });

  it('opens όπου with wherever and where', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Wherever you go');
    await user.click(screen.getByRole('button', { name: 'Όπου' }));
    expect(screen.getByRole('cell', { name: 'oriunde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'unde' })).toBeInTheDocument();
  });

  it('opens όποιος like a quantifier: whoever on its own, whichever beside a noun', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Whoever wants');
    await user.click(screen.getByRole('button', { name: 'Όποιος' }));
    expect(screen.getByRole('heading', { level: 2, name: 'όποιος / όποια / όποιο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'oricine' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'psomi');
    expect(screen.getByRole('cell', { name: 'όποιο ψωμί' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'whichever bread' })).toBeInTheDocument();
  });
});
