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
});
