import { describe, expect, it } from 'vitest';
import { richText } from '../engine/segments';
import type { Level, SlotOf } from '../types';
import { applyControl, buildPanel, type PanelState } from './panels';

const slotOf = (patch: Partial<SlotOf<'clitic'>> = {}): SlotOf<'clitic'> => ({
  pos: 'clitic',
  person: 3,
  number: 'sg',
  gender: 'n',
  role: 'object',
  ...patch,
});
const stateOf = (slot: SlotOf<'clitic'>): PanelState => ({ slot, noun: null, nounNumber: 'sg' });
const panelFor = (slot: SlotOf<'clitic'>, level: Level = 'beginner') =>
  buildPanel(stateOf(slot), { text: 'το', lexeme: 'clitic', slot }, level);
const cells = (p: ReturnType<typeof panelFor>, i = 0) => ({
  el: richText(p.rows[i].el),
  ro: richText(p.rows[i].ro),
  en: richText(p.rows[i].en),
});

describe('clitic panel', () => {
  it('says where the pronoun goes in a command and in every other form', () => {
    const plain = panelFor(slotOf()).plain;
    expect(plain).toContain('φάε το');
    expect(plain).toContain('μην το φας');
    expect(plain).toContain('το τρώω');
    expect(plain).toContain('θα το φάω');
    expect(plain).toContain('το έχω φάει');
  });

  it('shows the weak form in the three languages', () => {
    const p = panelFor(slotOf({ roGender: 'f' }));
    expect(p.lemma).toBe('το / του');
    expect(p.rows).toHaveLength(1);
    expect(p.rows[0].label).toBe('weak form');
    expect(cells(p)).toEqual({ el: 'το', ro: 'o', en: 'it' });
  });

  it('the first person: με / mă / me, and the indirect role: μου / îmi / me', () => {
    expect(cells(panelFor(slotOf({ person: 1, gender: undefined })))).toEqual({ el: 'με', ro: 'mă', en: 'me' });
    expect(cells(panelFor(slotOf({ person: 1, gender: undefined, role: 'indirect' })))).toEqual({
      el: 'μου',
      ro: 'îmi',
      en: 'me',
    });
  });

  it('names the strong form in the plain-language line', () => {
    expect(panelFor(slotOf({ person: 1, gender: undefined })).plain).toContain('εμένα');
  });

  it('controls: who, gender for the third person only, and role', () => {
    expect(panelFor(slotOf()).controls.map((x) => x.key)).toEqual(['who', 'gender', 'role']);
    expect(panelFor(slotOf({ person: 2, gender: undefined })).controls.map((x) => x.key)).toEqual(['who', 'role']);
    expect(panelFor(slotOf()).controls.find((x) => x.key === 'who')?.value).toBe('3sg');
  });

  it('the role labels are plain for Beginner and technical for Improver', () => {
    const labels = (level: Level) => panelFor(slotOf(), level).controls.find((x) => x.key === 'role')?.options.map((o) => o.label);
    expect(labels('beginner')).toEqual(['it, him, me (the thing acted on)', 'to me, to him (who receives it)']);
    expect(labels('improver')).toEqual(['accusative (direct object)', 'genitive (indirect object)']);
  });

  it('Improver: person × number for the role, with the current one outlined', () => {
    const p = panelFor(slotOf(), 'improver');
    expect(p.full).toHaveLength(6);
    expect(p.full.find((r) => r.hl?.el)?.label).toBe('he / she');
    expect(richText(p.full[0].el)).toBe('με');
    expect(richText(p.full[2].el)).toBe('το');
    expect(panelFor(slotOf(), 'beginner').full).toEqual([]);
  });
});

describe('applyControl for a clitic', () => {
  const start = stateOf(slotOf({ roGender: 'f' }));
  it('who changes the person and number, and drops the genders outside the third person', () => {
    const next = applyControl(start, 'who', '1pl').slot;
    expect(next).toEqual({ pos: 'clitic', person: 1, number: 'pl', role: 'object' });
  });
  it('who back to the third person defaults the gender to neuter', () => {
    const first = applyControl(start, 'who', '2sg');
    expect(applyControl(first, 'who', '3pl').slot).toMatchObject({ person: 3, number: 'pl', gender: 'n' });
  });
  it('gender and role change the pronoun', () => {
    expect(applyControl(start, 'gender', 'f').slot).toMatchObject({ gender: 'f' });
    expect(applyControl(start, 'role', 'indirect').slot).toMatchObject({ role: 'indirect' });
  });
});
