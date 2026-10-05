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
    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'alepou');
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

describe('how to read this', () => {
  it('shows the reading under the form, in Beginner and then Improver wording', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(
      within(reading).getByText(
        'θα έχω φάει: θα = will, έχω = I have, φά- = eat, -ει = never changes after έχω. Only έχω changes with the person.',
      ),
    ).toBeInTheDocument();
    expect(within(reading).getByText(/^voi fi mâncat: voi = will, fi = be/)).toBeInTheDocument();
    expect(within(reading).getByText(/^I will have eaten: will = will \(the future\)/)).toBeInTheDocument();

    await user.click(screen.getByLabelText('Improver'));
    expect(
      within(screen.getByRole('region', { name: 'How to read this' })).getByText(
        'Future perfect: θα + έχω (present 1sg of έχω) + invariable base form (stem φά- + ending -ει). The auxiliary carries the person.',
      ),
    ).toBeInTheDocument();
  });

  it('a particle part opens that piece\'s panel, and the way back returns to the verb', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    await user.click(within(reading).getByRole('button', { name: 'έχω: I have' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('έχω');
    await user.click(within(panel).getByRole('button', { name: /Back to the verb/ }));
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('τρώω');
  });

  it('the έχω chip stays pressed after the learner changes the auxiliary', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    await user.selectOptions(screen.getByLabelText('Who?'), 'we');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    await user.click(within(reading).getByRole('button', { name: /^έχουμε: / }));
    const group = screen.getByRole('group', { name: 'Θα έχω φάει' });
    expect(within(group).getByRole('button', { name: 'έχω' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'φάει' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('the reading follows the learner\'s variation, not the phrase', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I have eaten');
    await user.selectOptions(screen.getByLabelText('Negated?'), 'Yes');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText(/^δεν έχω φάει: δεν = not, έχω = I have/)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Έχω φάει' })).toBeInTheDocument();
  });

  it('a reading part presses the matching chip piece, or none when the phrase lacks it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    await user.click(within(screen.getByRole('region', { name: 'How to read this' })).getByRole('button', { name: 'θα: will' }));
    expect(within(screen.getByRole('group', { name: 'Θα έχω φάει' })).getByRole('button', { name: 'Θα' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('a reading part the phrase does not have presses no chip piece', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I have eaten');
    await user.selectOptions(screen.getByLabelText('Negated?'), 'Yes');
    await user.click(within(screen.getByRole('region', { name: 'How to read this' })).getByRole('button', { name: 'δεν: not' }));
    const panel = screen.getByRole('region', { name: 'Word panel' });
    expect(within(panel).getByRole('heading', { level: 2 })).toHaveTextContent('δεν');
    const group = screen.getByRole('group', { name: 'Έχω φάει' });
    for (const chip of within(group).getAllByRole('button')) expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('the reading sentence is not marked as Greek', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I will have eaten');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    const sentence = within(reading).getByText(/^θα έχω φάει: θα = will/);
    expect(sentence.closest('[lang="el"]')).toBeNull();
  });

  it('an irregular form uses its authored reading', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Keep eating the bread!');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(
      within(reading).getByText(
        'τρώγε: τρώγ- = eat, -ε = a command to you: keep doing. This command keeps the older stem τρώγ- (with γ).',
      ),
    ).toBeInTheDocument();
  });
  it('opens a quantifier, shows the Romanian genitive and switches the degree', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'I want a little water');
    await user.click(screen.getByRole('button', { name: 'λίγο' }));
    expect(screen.getByRole('heading', { level: 2, name: 'λίγος / λίγη / λίγο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'λίγο νερό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'puțină apă' })).toBeInTheDocument();
    expect(screen.getByText('mass reading')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(screen.getByRole('cell', { name: 'puținei ape' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Role in sentence'), 'acc');
    await user.selectOptions(screen.getByLabelText('Degree'), 'comparative');
    expect(screen.getByRole('cell', { name: 'λιγότερο νερό' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'mai puțină apă' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(screen.getByRole('cell', { name: 'λίγο νερό' })).toBeInTheDocument();
  });

  it('κανένας shows the negative concord in its own row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I don't want any coffee");
    await user.click(screen.getByRole('button', { name: 'κανέναν' }));
    expect(screen.getByRole('cell', { name: 'κανέναν καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'δεν θέλω κανέναν καφέ' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'nu vreau nicio cafea' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "I don't want any coffee" })).toBeInTheDocument();
  });

  it('κανένας links to the numeral ένας and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "I don't want any coffee");
    await user.click(screen.getByRole('button', { name: 'κανέναν' }));
    expect(document.querySelector('.related')).toHaveTextContent(/^κανένας follows the numeral ένας\.\s*Open the numeral ένας$/);
    await user.click(screen.getByRole('button', { name: 'Open the numeral ένας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ένας / μία / ένα' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'έναν' })).toBeInTheDocument();
    expect(screen.queryByText('Differs from the phrase.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to κανένας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'κανένας / καμία / κανένα' })).toBeInTheDocument();
  });

  it('a participle shows how to read it, links to its verb and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The child is washed');
    await user.click(screen.getByRole('button', { name: 'πλυμένο' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλυμένος / πλυμένη / πλυμένο' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'copilul spălat' })).toBeInTheDocument();
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText('πλυ-')).toBeInTheDocument();
    expect(within(reading).getByText(/a describing word \(washed\) that matches το παιδί/)).toBeInTheDocument();
    expect(document.querySelector('.related')).toHaveTextContent(/^Derived from πλένω \(πλυ- \+ -μένος\)\.\s*Open πλένω$/);
    await user.click(screen.getByRole('button', { name: 'Open πλένω' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλένω' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the participle' }));
    expect(screen.getByRole('heading', { level: 2, name: 'πλυμένος / πλυμένη / πλυμένο' })).toBeInTheDocument();
  });

  it('the copula opens its own panel with an irregularity message and reading', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'The bread is baked');
    await user.click(screen.getByRole('button', { name: 'είναι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'είμαι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(αυτός/ή) είναι' })).toBeInTheDocument();
    expect(screen.getByText(/learn its six forms together/, { selector: '.warn' })).toBeInTheDocument();
    const reading = screen.getByRole('region', { name: 'How to read this' });
    expect(within(reading).getByText(/the verb "to be" is irregular/)).toBeInTheDocument();
  });

  it('a pronoun part of the reading opens the pronoun panel and comes back', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat the bread!');
    await user.click(screen.getByRole('button', { name: 'Φάε' }));
    await user.selectOptions(screen.getByLabelText('Object'), 'pronoun');
    const reading = screen.getByRole('region', { name: 'How to read this' });
    await user.click(within(reading).getByRole('button', { name: /^το: it/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'το / του' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the verb' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τρώω' })).toBeInTheDocument();
  });

  it('Eat it! has two pieces; the pronoun opens its own panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat it!');
    const group = screen.getByRole('group', { name: 'Φάε το!' });
    expect(within(group).getAllByRole('button')).toHaveLength(2);
    const form = within(screen.getAllByRole('table')[0]);
    expect(form.getByRole('cell', { name: 'φάε το' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'mănâncă-o' })).toBeInTheDocument();
    // The verb is the first piece here: it is pressed, the pronoun is not.
    expect(within(group).getByRole('button', { name: 'Φάε' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'το!' })).toHaveAttribute('aria-pressed', 'false');
    await user.click(within(group).getByRole('button', { name: 'το!' }));
    expect(within(group).getByRole('button', { name: 'το!' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'Φάε' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { level: 2, name: 'το / του' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'o' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Gender of the noun'), 'm');
    expect(screen.getByRole('cell', { name: 'τον' })).toBeInTheDocument();
    // A masculine noun's pronoun is îl in Romanian and him in English, not o and it.
    expect(screen.getByRole('cell', { name: 'îl' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'him' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Back to the verb' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τρώω' })).toBeInTheDocument();
  });

  it('Give it to me!: the verb chip is pressed, the pronoun chips are not', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Give it to me!');
    const group = screen.getByRole('group', { name: 'Δώσε μού το!' });
    expect(within(group).getByRole('button', { name: 'Δώσε' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(group).getByRole('button', { name: 'μού' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(group).getByRole('button', { name: 'το!' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('Eat it! as a short form, then Who = we, does not blank the app', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Improver'));
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat it!');
    await user.click(within(screen.getByRole('region', { name: 'Same meaning' })).getByRole('button', { name: 'short form' }));
    await user.selectOptions(screen.getByLabelText('Who?'), '2pl');
    expect(screen.getAllByRole('cell', { name: 'φάτε το' }).length).toBeGreaterThan(0);
  });

  it('Give it to me! shows the second accent and its explanation', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Give it to me!');
    const form = within(screen.getAllByRole('table')[0]);
    expect(form.getByRole('cell', { name: 'δώσε μού το' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'dă-mi-o' })).toBeInTheDocument();
    expect(form.getByRole('cell', { name: 'give it to me' })).toBeInTheDocument();
    expect(screen.getByText(/second accent/, { selector: '.warn' })).toBeInTheDocument();
  });

  it('Eat the bread!: the strip shows the forms that mean the same, and a click changes the panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat the bread!');
    await user.click(screen.getByRole('button', { name: 'Φάε' }));
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('button', { name: 'with noun' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(strip).queryByRole('button', { name: 'short form' })).not.toBeInTheDocument();
    await user.click(within(strip).getByRole('button', { name: 'with clitic' }));
    expect(within(strip).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'φάε το' }).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Reset to phrase' }));
    expect(within(screen.getByRole('region', { name: 'Same meaning' })).getByRole('button', { name: 'with noun' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Improver: the short form is a member and Romanian and English have none', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Improver'));
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Eat it!');
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(strip).getByRole('button', { name: 'short form' }));
    expect(screen.getAllByRole('cell', { name: 'φάτο' }).length).toBeGreaterThan(0);
    expect(within(strip).getAllByText('none')).toHaveLength(2);
    const bare = within(strip).getByRole('button', { name: 'bare verb' });
    await user.click(bare);
    expect(within(screen.getByRole('region', { name: 'Same meaning' })).getByRole('button', { name: 'bare verb' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('Give it to me!: the strip lists the pair, the short form and the close row', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Improver'));
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Give it to me!');
    const strip = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(strip).getByRole('cell', { name: 'δως μου το' })).toBeInTheDocument();
    expect(within(strip).getByRole('cell', { name: 'δώσε μου το ψωμί' })).toBeInTheDocument();
    expect(within(strip).getByText('Two pronouns: the genitive comes before the accusative.')).toBeInTheDocument();
    expect(within(strip).getByText('no object: what to give is not said')).toBeInTheDocument();
  });
});
