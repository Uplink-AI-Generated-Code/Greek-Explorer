import { enClitic, greekClitic, greekStrong, roClitic } from '../engine/clitics';
import { GENDER_NAME, whoOptions } from '../engine/labels';
import { plain } from '../engine/segments';
import type { Gender, Level, Num, Person, SlotOf } from '../types';
import { ALL } from './shared';
import type { Control, Panel, PanelRow } from './types';

const WHO = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
const GENDERS: Gender[] = ['m', 'f', 'n'];

/** The same pronoun for another person; the gender only matters in the third person. */
export function withWho(slot: SlotOf<'clitic'>, who: string): SlotOf<'clitic'> {
  const next: SlotOf<'clitic'> = { ...slot, person: Number(who[0]) as Person, number: who.slice(1) as Num };
  if (next.person === 3) next.gender = slot.gender ?? 'n';
  else {
    delete next.gender;
    delete next.roGender;
  }
  // The English word was for the old person and number.
  delete next.enPronoun;
  return next;
}

const row = (label: string, c: SlotOf<'clitic'>): PanelRow => ({
  label,
  el: plain(greekClitic(c)),
  ro: plain(roClitic(c).free),
  en: plain(enClitic(c)),
});

function controls(slot: SlotOf<'clitic'>, level: Level): Control[] {
  const list: Control[] = [
    { key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` },
  ];
  if (slot.person === 3) {
    list.push({
      key: 'gender',
      label: 'Gender of the noun',
      options: GENDERS.map((g) => ({ value: g, label: GENDER_NAME[g] })),
      value: slot.gender ?? 'n',
    });
  }
  list.push({
    key: 'role',
    label: 'Role',
    options:
      level === 'beginner'
        ? [
            { value: 'object', label: 'it, him, me (the thing acted on)' },
            { value: 'indirect', label: 'to me, to him (who receives it)' },
          ]
        : [
            { value: 'object', label: 'accusative (direct object)' },
            { value: 'indirect', label: 'genitive (indirect object)' },
          ],
    value: slot.role,
  });
  return list;
}

/** The weak pronoun on its own (spec 5.3): the form in each language, and the table of persons in Improver. */
export function cliticPanel(slot: SlotOf<'clitic'>, level: Level): Panel {
  const both = (role: SlotOf<'clitic'>['role']) => greekClitic({ ...slot, role });
  return {
    lemma: `${both('object')} / ${both('indirect')}`,
    posLabel:
      level === 'beginner'
        ? `small word for "${enClitic(slot)}"`
        : `weak pronoun · ${slot.role === 'object' ? 'accusative' : 'genitive'}`,
    controls: controls(slot, level),
    rows: [row('weak form', slot)],
    full:
      level === 'improver'
        ? WHO.map((who) => ({
            ...row(whoOptions.find((o) => o.value === who)?.label ?? who, withWho(slot, who)),
            hl: who === `${slot.person}${slot.number}` ? ALL : undefined,
          }))
        : [],
    plain:
      `Weak pronouns are short and unstressed. Greek puts them after a command (φάε το) and before a negative one (μην το φας); Romanian attaches them with a hyphen after a command (mănâncă-l). The strong form, used for emphasis, is ${greekStrong(slot)}.`,
    irregular: '',
    note: '',
  };
}
