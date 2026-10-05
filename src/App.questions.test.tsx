import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => window.localStorage.clear());

describe('the question words and the hortative in the app', () => {
  it('opens a question word, and shows an example question in three languages', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'What do you want?');
    await user.click(screen.getByRole('button', { name: 'Τι' }));
    expect(screen.getByRole('heading', { level: 2, name: 'τι' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ce' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'What do you want?' })).toBeInTheDocument();
    expect(screen.getByText('question word: what')).toBeInTheDocument();
  });

  it('opens από before πού, switches the question word and the noun after it', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Where are you from?');
    await user.click(screen.getByRole('button', { name: 'Από' }));
    expect(screen.getByRole('heading', { level: 2, name: 'από' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'από πού' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'de unde' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'from where' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Noun or question word after it'), 'skylos');
    expect(screen.getByRole('cell', { name: 'από τον σκύλο' })).toBeInTheDocument();
    expect(screen.getByText('Differs from the phrase.')).toBeInTheDocument();
  });

  it('opens ποιος on its own (no noun in the phrase) and shows the question-word badge', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'Who is it?');
    await user.click(screen.getByRole('button', { name: 'Ποιος' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ποιος / ποια / ποιο' })).toBeInTheDocument();
    expect(screen.getByText('question word')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'cine' })).toBeInTheDocument();
    const roles = screen.getByLabelText('Role in sentence');
    expect(within(roles).getAllByRole('option').map((o) => o.textContent)).toEqual(['subject', 'object']);
  });

  it('the price idiom: πόσο on its own, κάνει literally "does"', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), 'How much is it?');
    await user.click(screen.getByRole('button', { name: 'Πόσο' }));
    expect(screen.getByRole('cell', { name: 'cât' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'κάνει;' }));
    expect(screen.getByRole('heading', { level: 2, name: 'κάνω' })).toBeInTheDocument();
  });

  it("opens ας from Let's eat! and takes the form apart", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Phrase'), "Let's eat!");
    expect(screen.getByRole('cell', { name: '(εμείς) ας φάμε' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "let's eat" })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '(noi) să mâncăm' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ας' }));
    expect(screen.getByRole('heading', { level: 2, name: 'ας' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to the verb/ })).toBeInTheDocument();
  });

  it('changes the mood of θέλω to the hortative at both levels', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Mood'), 'hortative');
    expect(screen.getByRole('cell', { name: '(εγώ) ας θέλω' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'let me want' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Who?'), '1pl');
    expect(screen.getByRole('cell', { name: "(εμείς) ας θέλουμε" })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: "let's want" })).toBeInTheDocument();
  });
});
