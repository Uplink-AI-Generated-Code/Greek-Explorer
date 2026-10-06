import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

/** The Romanian and English cells are the same in both rows (που and ο οποίος), so a cell may appear twice. */
const cell = (name: string) => screen.getAllByRole('cell', { name })[0];

describe('relative pronouns in the app', () => {
  it('opens που from its chip with the pronoun in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The dog that jumps');
    await user.click(screen.getByRole('button', { name: 'που' }));
    expect(screen.getByRole('heading', { level: 2, name: 'που' })).toBeInTheDocument();
    expect(cell('care')).toBeInTheDocument();
    expect(cell('who')).toBeInTheDocument();
    expect(cell('ο οποίος')).toBeInTheDocument();
  });

  it('the role control changes the job in all three languages, and choosing the phrase’s own job again is no change', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child I gave it to');
    await user.click(screen.getByRole('button', { name: 'που' }));
    expect(cell('που του …')).toBeInTheDocument();
    expect(cell('căruia')).toBeInTheDocument();
    expect(cell('to whom')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in its clause'), 'object');
    expect(cell('pe care')).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in its clause'), 'indirect');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('"whose" has a Noun owned control', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child whose dog jumps');
    await user.click(screen.getByRole('button', { name: 'του οποίου' }));
    expect(cell('του οποίου ο σκύλος')).toBeInTheDocument();
    expect(cell('al cărui câine')).toBeInTheDocument();
    expect(cell('whose dog')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun owned'), 'spiti');
    expect(cell('του οποίου το σπίτι')).toBeInTheDocument();
    expect(cell('a cărui casă')).toBeInTheDocument();
  });

  it('after a preposition, the Preposition control changes the chip', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The house I am going to');
    await user.click(screen.getByRole('button', { name: 'στο οποίο' }));
    expect(cell('la care')).toBeInTheDocument();
    expect(cell('to which')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Preposition'), 'me');
    expect(cell('με το οποίο')).toBeInTheDocument();
    expect(cell('cu care')).toBeInTheDocument();
  });
});
