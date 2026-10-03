import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PHRASES } from '../data/phrases';
import { PhrasePicker } from './PhrasePicker';

describe('PhrasePicker', () => {
  it('groups the phrases by theme', () => {
    render(<PhrasePicker phrases={PHRASES} value={0} onChange={() => {}} />);
    const ordering = screen.getByRole('group', { name: 'Ordering' });
    expect(within(ordering).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Ordering a hot coffee',
      'Ordering three coffees',
      "I'd like a coffee",
      'I would like a coffee',
    ]);
    const fox = screen.getByRole('group', { name: 'The fox sentence' });
    expect(within(fox).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'The quick brown fox jumps over the lazy dog',
      'The fox has jumped over the dog',
      'The fox was jumping over the dog',
    ]);
  });

  it('shows the selected phrase and reports a change with its index', async () => {
    const onChange = vi.fn();
    render(<PhrasePicker phrases={PHRASES} value={1} onChange={onChange} />);
    const select = screen.getByLabelText('Phrase');
    expect(select).toHaveValue('1');
    await userEvent.setup().selectOptions(select, 'The quick brown fox jumps over the lazy dog');
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
