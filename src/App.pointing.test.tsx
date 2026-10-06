import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('demonstratives in the app', () => {
  it('opens αυτός from its chip with the article kept and both Romanian placements', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'αυτός / αυτή / αυτό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'αυτό το σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'această casă / casa aceasta' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'this house' })).toBeInTheDocument();
    expect(screen.getByText('demonstrative')).toBeInTheDocument();
  });

  it('the Romanian form control switches to the spoken forms', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    await user.selectOptions(screen.getByLabelText('Romanian form'), 'spoken');
    expect(screen.getByRole('cell', { name: 'casa asta' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Romanian form'), 'formal');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('αυτό on its own agrees with the noun in Romanian', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'This is my house');
    await user.click(screen.getByRole('button', { name: 'Αυτό' }));
    expect(screen.getByRole('cell', { name: 'aceasta' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'skylos');
    expect(screen.getByRole('cell', { name: 'acesta' })).toBeInTheDocument();
  });

  it('τέτοιος has no stand-alone row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Such a house');
    await user.click(screen.getByRole('button', { name: 'τέτοιο' }));
    expect(screen.getByRole('cell', { name: 'ένα τέτοιο σπίτι' })).toBeInTheDocument();
    expect(screen.getByText('with a noun')).toBeInTheDocument();
    expect(screen.queryByText('on its own')).not.toBeInTheDocument();
  });
});

describe('the place words in the app', () => {
  it('opens εδώ with the word and an example', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Here is the house');
    await user.click(screen.getByRole('button', { name: 'Εδώ' }));
    expect(screen.getByRole('heading', { level: 2, name: 'εδώ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'aici' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Aici este casa' })).toBeInTheDocument();
  });

  it('μέχρι before εκεί is până acolo, and the control can switch to εδώ', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'As far as there');
    await user.click(screen.getByRole('button', { name: 'Μέχρι' }));
    expect(screen.getByRole('cell', { name: 'μέχρι εκεί' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'până acolo' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun, question word or place word after it'), 'edo');
    expect(screen.getByRole('cell', { name: 'până aici' })).toBeInTheDocument();
  });
});
