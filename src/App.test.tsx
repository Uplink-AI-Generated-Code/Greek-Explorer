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

describe('verb groups in the app', () => {
  it('opens the perfect, shows its pieces, and lets the learner vary the tense without changing the phrase', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I have eaten');

    const group = screen.getByRole('group', { name: 'Έχω φάει' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    await user.click(within(group).getByRole('button', { name: 'φάει' }));

    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω φάει' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) am mâncat' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'I have eaten' })).toBeInTheDocument();

    await user.selectOptions(within(panel).getByLabelText('When?'), 'had done');
    expect(within(panel).getByRole('cell', { name: '(εγώ) είχα φάει' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) mâncasem' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Έχω φάει' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω φάει' })).toBeInTheDocument();
  });

  it('switches πλένω between its two voices', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I wash (myself)');
    await user.click(screen.getByRole('button', { name: 'Πλένομαι' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('cell', { name: '(εγώ) πλένομαι' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'I wash (myself)' })).toBeInTheDocument();
    await user.selectOptions(within(panel).getByLabelText('Voice'), 'doing it');
    expect(within(panel).getByRole('cell', { name: '(εγώ) πλένω' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: '(eu) spăl' })).toBeInTheDocument();
  });
});

describe('pieces of a verb group', () => {
  async function openPhrase(title: string) {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), title);
    return user;
  }

  it('opens the panel of θα from its chip, and goes back to the verb', async () => {
    const user = await openPhrase('I will have eaten');
    const group = screen.getByRole('group', { name: 'Θα έχω φάει' });
    await user.click(within(group).getByRole('button', { name: 'Θα' }));

    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θα');
    expect(within(panel).getByRole('cell', { name: 'θα φάω' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'Θα' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'φάει' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(within(group).getByRole('button', { name: 'φάει' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(panel).queryByRole('button', { name: /Back to the verb/ })).not.toBeInTheDocument();
  });

  it('opens the verb panel of the auxiliary, with its own controls and its own copy', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'έχω' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('έχω');
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω' })).toBeInTheDocument();

    await user.selectOptions(within(panel).getByLabelText('Who?'), 'we');
    expect(within(panel).getByRole('cell', { name: '(εμείς) έχουμε' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Θα έχω φάει' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(panel).getByRole('cell', { name: '(εγώ) έχω' })).toBeInTheDocument();

    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
  });

  it('opens the panel of the negation', async () => {
    const user = await openPhrase("I don't want to go");
    await user.click(within(screen.getByRole('group', { name: 'Δεν θέλω' })).getByRole('button', { name: 'Δεν' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('δεν');
    expect(within(panel).getByRole('cell', { name: 'δεν θέλω' })).toBeInTheDocument();
    expect(within(panel).getByRole('cell', { name: 'nu vreau' })).toBeInTheDocument();
  });

  it('the verb piece shows the verb panel', async () => {
    const user = await openPhrase("I don't want to go");
    await user.click(within(screen.getByRole('group', { name: 'Δεν θέλω' })).getByRole('button', { name: 'θέλω' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θέλω');
    expect(within(panel).getByRole('cell', { name: "(εγώ) δεν θέλω" })).toBeInTheDocument();
  });

  it('a gloss unit linked to a piece selects that piece and opens its panel', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(screen.getByRole('button', { name: 'I will' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('θα');
    expect(
      within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'Θα' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('a gloss unit linked to the whole token shows the verb panel', async () => {
    const user = await openPhrase('I had eaten');
    await user.click(screen.getAllByRole('button', { name: 'Mâncasem' })[0]);
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
    expect(
      within(screen.getByRole('group', { name: 'Είχα φάει' })).getByRole('button', { name: 'φάει' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights only the units of the selected piece in the gloss rows', async () => {
    const user = await openPhrase('I will have eaten');
    await user.click(within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'έχω' }));
    // "have" is in the natural and the literal row; "eaten" too; "I will" only in the natural row.
    for (const unit of screen.getAllByRole('button', { name: 'have' })) expect(unit).toHaveAttribute('aria-pressed', 'true');
    for (const unit of screen.getAllByRole('button', { name: 'eaten' })) expect(unit).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'I will' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'will' })).toHaveAttribute('aria-pressed', 'false');
  });
});
