import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('possessives in the app', () => {
  it('opens the possessive from its chip and shows the noun phrase in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My house');
    await user.click(screen.getByRole('button', { name: 'μου' }));
    expect(screen.getByRole('heading', { level: 2, name: 'μου, σου, του / της, μας, σας, τους' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'το σπίτι μου' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa mea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'my house' })).toBeInTheDocument();
  });

  it('Whose? changes the possessor in all three languages, and the noun follows', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'My house');
    await user.click(screen.getByRole('button', { name: 'μου' }));
    await user.selectOptions(screen.getByLabelText('Whose?'), '3sg-f');
    expect(screen.getByRole('cell', { name: 'το σπίτι της' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'casa ei' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'her house' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun it goes with'), 'thalassa');
    expect(screen.getByRole('cell', { name: 'η θάλασσά της' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('the noun of the phrase shows the possessive too, and has its own Whose? control', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Our sea');
    await user.click(screen.getByRole('button', { name: 'θάλασσά' }));
    expect(screen.getByRole('cell', { name: 'η θάλασσά μας' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Whose?'), 'none');
    expect(screen.queryByRole('cell', { name: 'η θάλασσά μας' })).not.toBeInTheDocument();
  });

  it('explains the second accent in the possessive panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Our sea');
    await user.click(screen.getByRole('button', { name: 'μας' }));
    expect(screen.getByText(/second accent/)).toBeInTheDocument();
  });
});
