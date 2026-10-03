import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('App', () => {
  it('opens on the first word of phrase 1 with its panel', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Greek Grammar Explorer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'θέλω' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(εγώ) θέλω' })).toBeInTheDocument();
  });

  it('shows the adjective panel after clicking the Greek word', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ζεστός / ζεστή / ζεστό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
  });

  it('changing the role updates the forms in all three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByRole('cell', { name: 'του ζεστού καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'cafelei calde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'of the hot coffee' })).toBeInTheDocument();
  });

  it('leaves the phrase unchanged, flags the difference, and resets on request', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ζεστό' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'hot' })).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
    expect(screen.getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
  });

  it('clicking a gloss unit selects the linked Greek word', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole('button', { name: 'cafea' })[0]);
    expect(screen.getByRole('heading', { level: 2, name: 'καφές' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'καφέ' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps each word’s own choices when switching between words', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    await user.selectOptions(screen.getByLabelText('How many?'), 'many');
    await user.click(screen.getByRole('button', { name: 'Θέλω' }));
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.getByLabelText('How many?')).toHaveValue('many');
  });

  it('switches to technical labels in Improver and remembers the choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.getByRole('option', { name: 'object' })).toBeInTheDocument();
    await user.click(screen.getByLabelText('Improver'));
    expect(screen.getByRole('option', { name: 'accusative' })).toBeInTheDocument();
    unmount();
    render(<App />);
    expect(screen.getByLabelText('Improver')).toBeChecked();
  });

  it('shows comparison rows for the selected word and more of them in Improver', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    const comparison = screen.getByRole('region', { name: 'Comparison' });
    expect(within(comparison).getAllByRole('row')).toHaveLength(3);
    await user.click(screen.getByLabelText('Improver'));
    expect(within(screen.getByRole('region', { name: 'Comparison' })).getAllByRole('row')).toHaveLength(4);
  });

  it('switches phrase from the picker', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    expect(screen.getByRole('button', { name: 'πηδάει' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'ο / η / το' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering three coffees');
    expect(screen.getByRole('button', { name: 'τρεις' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'πηδάει' })).not.toBeInTheDocument();
  });

  it('forgets the learner’s choices when the phrase changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering three coffees');
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Ordering a hot coffee');
    await user.click(screen.getByRole('button', { name: 'καφέ' }));
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
  });

  it('in the fox sentence, selecting the article highlights only the Romanian suffix', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    await user.click(screen.getByRole('button', { name: 'τον' }));
    for (const b of screen.getAllByRole('button', { name: 'le' })) expect(b).toHaveAttribute('aria-pressed', 'true');
    for (const b of screen.getAllByRole('button', { name: 'câine' })) {
      expect(b).toHaveAttribute('aria-pressed', 'false');
    }
  });

  it('opens the preposition panel and follows the noun after it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The quick brown fox jumps over the lazy dog');
    await user.click(screen.getByRole('button', { name: 'πάνω από' }));
    expect(screen.getByRole('cell', { name: 'πάνω από τον σκύλο' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun after it'), 'alepou');
    expect(screen.getByRole('cell', { name: 'πάνω από την αλεπού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'peste vulpea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'over the fox' })).toBeInTheDocument();
  });

  it('shows the full paradigm in Improver', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'ζεστό' }));
    await user.click(screen.getByLabelText('Improver'));
    expect(screen.getByText(/Full paradigm/)).toBeInTheDocument();
    expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(3);
  });
});
