import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { notice, plain } from '../engine/segments';
import type { SameMeaning } from '../panels/types';
import { SameMeaningStrip } from './SameMeaningStrip';

const strip: SameMeaning = {
  meaning: 'Eat the bread!',
  rows: [
    { key: '0', tag: 'with noun', el: plain('φάε το ψωμί'), ro: plain('mănâncă pâinea'), en: plain('eat the bread'), current: true },
    { key: '1', tag: 'with clitic', el: plain('φάε το'), ro: plain('mănâncă-o'), en: plain('eat it'), current: false, note: 'το is neuter (ψωμί).' },
    { key: '2', tag: 'short form', el: plain('φάτο'), ro: notice('none'), en: notice('none'), current: false },
  ],
  close: { key: 'close', el: plain('φάε'), ro: plain('mănâncă'), en: plain('eat'), reason: 'no object: what to eat is not said', current: false },
  notes: ['short form: A short way of saying φάε το.'],
};

describe('SameMeaningStrip', () => {
  it('is a labelled region with a pressed button for the form in use', () => {
    render(<SameMeaningStrip strip={strip} onMember={() => {}} />);
    const region = screen.getByRole('region', { name: 'Same meaning' });
    expect(within(region).getByRole('button', { name: 'with noun' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(region).getByRole('button', { name: 'with clitic' })).toHaveAttribute('aria-pressed', 'false');
    expect(within(region).getByRole('cell', { name: 'φάε το ψωμί' })).toHaveAttribute('aria-current', 'true');
  });

  it('clicking a row reports its key', async () => {
    const onMember = vi.fn();
    render(<SameMeaningStrip strip={strip} onMember={onMember} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'short form' }));
    expect(onMember).toHaveBeenCalledWith('2');
    await userEvent.setup().click(screen.getByRole('button', { name: 'bare verb' }));
    expect(onMember).toHaveBeenCalledWith('close');
  });

  it('shows the notes, the "none" cells and the close row with its reason', () => {
    render(<SameMeaningStrip strip={strip} onMember={() => {}} />);
    expect(screen.getAllByText('none')).toHaveLength(2);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'with clitic: το is neuter (ψωμί).',
      'short form: A short way of saying φάε το.',
    ]);
    expect(screen.getByText('Close, not the same')).toBeInTheDocument();
    expect(screen.getByText('no object: what to eat is not said')).toBeInTheDocument();
  });

  it('without a handler the rows are not buttons you can press', () => {
    render(<SameMeaningStrip strip={strip} />);
    expect(screen.getByRole('button', { name: 'with clitic' })).toBeDisabled();
  });
});
