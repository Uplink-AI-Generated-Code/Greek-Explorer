import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('δικός in the app', () => {
  it('opens from its chip with the possessor of the phrase and shows both uses in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My own house');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'δικός / δική / δικό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'το δικό μου σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'propria mea casă' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'my own house' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'a mea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'mine' })).toBeInTheDocument();
  });

  it('Whose? changes the possessor in all three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The house is mine');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    await user.selectOptions(screen.getByLabelText('Whose?'), '1pl');
    expect(screen.getByRole('cell', { name: 'το δικό μας σπίτι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'a noastră' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ours' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('offers the subject and the object roles, not the possessor role', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My own house');
    await user.click(screen.getByRole('button', { name: 'δικό' }));
    const options = screen.getByLabelText('Role in sentence').querySelectorAll('option');
    expect([...options].map((o) => o.getAttribute('value'))).toEqual(['nom', 'acc']);
  });
});
