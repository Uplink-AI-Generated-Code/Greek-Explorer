import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { buildPanel } from '../panels/panels';
import { WordPanel } from './WordPanel';

const phrase = PHRASES[0];
const panelFor = (i: number) => buildPanel(phrase.tokens[i].slot, phrase.tokens[i], phrase, 'beginner');

describe('WordPanel', () => {
  it('renders the lemma, part-of-speech label and a labelled control', () => {
    render(<WordPanel panel={panelFor(3)} onChange={() => {}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'καφές' })).toBeInTheDocument();
    expect(screen.getByText('noun: coffee (masculine)')).toBeInTheDocument();
    expect(screen.getByLabelText('Role in sentence')).toHaveValue('acc');
    expect(screen.getByLabelText('How many?')).toHaveValue('sg');
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
});
