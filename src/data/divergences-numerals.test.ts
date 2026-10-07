import { describe, expect, it } from 'vitest';
import { DIVERGENCES } from './divergences';

describe('the note on which numbers change', () => {
  const note = DIVERGENCES.find((d) => d.id === 'numeral-agreement-3-4')!;

  it('says that 13 and 14 change in Greek like 3 and 4, and that 12 and 20 do not', () => {
    expect(note.el).toContain('13 and 14 (δεκατρείς / δεκατρία, δεκατέσσερις / δεκατέσσερα)');
    expect(note.el).toContain('12 (δώδεκα) and 20 (είκοσι) never do');
  });

  it('says how 12 and 20 behave in Romanian, although the app does not have them yet', () => {
    expect(note.ro).toContain('12 (doisprezece / douăsprezece)');
    expect(note.ro).toContain('13 and 14 (treisprezece, paisprezece) never change');
    expect(note.ro).toContain('from 20 the noun takes de (douăzeci de cafele)');
  });

  it('stays an unverified Improver note', () => {
    expect(note.verified).toBe(false);
    expect(note.level).toBe('extra');
  });
});
