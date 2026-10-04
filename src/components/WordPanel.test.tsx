import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { buildPanel, initialState } from '../panels/panels';
import { WordPanel } from './WordPanel';

const phrase = PHRASES[0];
const panelFor = (i: number) => buildPanel(initialState(phrase.tokens[i], phrase), phrase.tokens[i], 'beginner');

describe('WordPanel', () => {
  it('shows the irregularity message when there is one', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getByText(/final ς drops/)).toBeInTheDocument();
  });

  it('renders the lemma, part-of-speech label and a labelled control', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'καφές' })).toBeInTheDocument();
    expect(screen.getByText('noun: coffee (masculine)')).toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
    expect(screen.getByLabelText('How many?')).toHaveValue('1');
  });

  it('renders the three-language form table', () => {
    render(<WordPanel panel={panelFor(2)} onChange={() => {}} />);
    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Ελληνικά' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'Română' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'English' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'τον ζεστό καφέ' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'cafeaua caldă' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: 'the hot coffee' })).toBeInTheDocument();
  });

  it('reports a control change with its key and value', async () => {
    const onChange = vi.fn();
    render(<WordPanel panel={panelFor(3)} onChange={onChange} />);
    await userEvent.setup().selectOptions(screen.getByLabelText('Role in sentence'), 'gen');
    expect(onChange).toHaveBeenCalledWith('case', 'gen');
  });

  it('marks roles with classes so colours can be styled and labelled', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    const cell = screen.getByRole('cell', { name: 'τον καφέ' });
    expect(cell.querySelector('.role-article')).toHaveTextContent('τον');
    expect(cell.querySelector('.role-ending')).toHaveTextContent('έ');
  });
  it('shows the full paradigm table in Improver, with the form in use outlined', () => {
    const improver = buildPanel(initialState(phrase.tokens[3], phrase), phrase.tokens[3], 'improver');
    render(<WordPanel panel={improver} onChange={() => {}} />);
    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getByText(/Full paradigm/)).toBeInTheDocument();
    expect(document.querySelectorAll('td.cur')).toHaveLength(3);
    const current = document.querySelectorAll('td[aria-current="true"]');
    expect(current).toHaveLength(3);
    expect([...current].map((c) => c.getAttribute('lang'))).toEqual(['el', 'ro', 'en']);
    expect(document.querySelectorAll('td[aria-current]')).toHaveLength(3);
  });

  it('shows no full paradigm table in Beginner', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.queryByText(/Full paradigm/)).not.toBeInTheDocument();
  });

  it('shows a badge next to the part-of-speech label when the panel has one', () => {
    const panel = { ...panelFor(3), badge: 'mass reading' };
    render(<WordPanel panel={panel} onChange={() => {}} />);
    expect(screen.getByText('mass reading')).toBeInTheDocument();
  });

  it('offers a related panel and names the way back', async () => {
    const user = userEvent.setup();
    const onRelated = vi.fn();
    const related = {
      text: 'Derived from πλένω.',
      button: 'Open πλένω',
      backLabel: 'Back to the participle',
      lexeme: 'pleno',
      slot: { pos: 'particle' as const },
      noun: null,
    };
    render(<WordPanel panel={{ ...panelFor(3), related }} onChange={() => {}} onRelated={onRelated} onBack={() => {}} backLabel="Back to the participle" />);
    expect(document.querySelector('.related')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open πλένω' }));
    expect(onRelated).toHaveBeenCalledWith(related);
    expect(screen.getByRole('button', { name: '← Back to the participle' })).toBeInTheDocument();
  });

  it('shows no related line without a handler, and the default back label is "Back to the verb"', () => {
    const related = { text: 'Derived from πλένω.', button: 'Open πλένω', backLabel: 'x', lexeme: 'pleno', slot: { pos: 'particle' as const }, noun: null };
    render(<WordPanel panel={{ ...panelFor(3), related }} onChange={() => {}} onBack={() => {}} />);
    expect(screen.queryByText(/Derived from/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to the verb' })).toBeInTheDocument();
  });

  it('separates the badge from the part-of-speech label for screen readers', () => {
    const panel = { ...panelFor(3), posLabel: 'quantifier: little', badge: 'mass reading' };
    render(<WordPanel panel={panel} onChange={() => {}} />);
    expect(document.querySelector('.pos-label')?.textContent).toBe('quantifier: little mass reading');
  });

  it('tags the Greek words of the related line, the related button and the back button', async () => {
    const related = {
      text: 'Derived from πλένω (πλυ- + -μένος).',
      button: 'Open πλένω',
      backLabel: 'Back to κανένας',
      lexeme: 'x',
      slot: { pos: 'verb', person: 1, number: 'sg', mood: 'indicative', tense: 'present', voice: 'active' } as const,
      noun: null,
    };
    render(<WordPanel panel={{ ...panelFor(3), related }} onChange={() => {}} onRelated={() => {}} onBack={() => {}} backLabel="Back to κανένας" />);
    const greek = [...document.querySelectorAll('[lang="el"]')].map((e) => e.textContent);
    expect(greek).toEqual(expect.arrayContaining(['πλένω', 'πλυ', 'μένος', 'κανένας']));
    expect(screen.getByRole('button', { name: 'Open πλένω' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Back to κανένας' })).toBeInTheDocument();
    expect(document.querySelector('.related')?.textContent).toContain('Derived from πλένω (πλυ- + -μένος).');
  });
});
