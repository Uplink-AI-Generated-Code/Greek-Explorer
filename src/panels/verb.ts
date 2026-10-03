import { enVerb } from '../engine/english';
import { inflectVerb } from '../engine/greek';
import { EN_PRONOUNS, GREEK_PRONOUNS, RO_PRONOUNS, whoOptions } from '../engine/labels';
import { roVerb } from '../engine/romanian';
import { formRich } from '../engine/segments';
import type { GreekVerb, Level, Person, SlotOf, VerbClass } from '../types';
import { ALL } from './shared';
import type { Panel, PanelRow } from './types';

const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
};

export const whoIndex = (slot: SlotOf<'verb'>): number => slot.person - 1 + (slot.number === 'pl' ? 3 : 0);

export function verbRow(verb: GreekVerb, slot: SlotOf<'verb'>): PanelRow {
  const index = whoIndex(slot);
  return {
    label: whoOptions[index].label,
    el: [
      { text: `(${GREEK_PRONOUNS[index]})`, role: 'dim' },
      { text: ' ', role: 'plain' },
      ...formRich(inflectVerb(verb, slot)),
    ],
    ro: [
      { text: `(${RO_PRONOUNS[index]})`, role: 'dim' },
      { text: ' ', role: 'plain' },
      { text: roVerb(verb, slot), role: 'plain' },
    ],
    en: [
      { text: EN_PRONOUNS[index], role: 'pronoun' },
      { text: ' ', role: 'plain' },
      { text: enVerb(verb, slot), role: 'plain' },
    ],
  };
}

const whoSlot = (slot: SlotOf<'verb'>, i: number): SlotOf<'verb'> => ({
  ...slot,
  person: ((i % 3) + 1) as Person,
  number: i < 3 ? 'sg' : 'pl',
});

export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  return {
    lemma: verb.lemma,
    posLabel: level === 'beginner' ? `verb: to ${verb.en.gloss}` : `verb · ${CLASS_LABEL[verb.class]} · active`,
    controls: [{ key: 'who', label: 'Who?', options: whoOptions, value: `${slot.person}${slot.number}` }],
    rows: [verbRow(verb, slot)],
    full:
      level === 'improver'
        ? [0, 1, 2, 3, 4, 5].map((i) => ({
            ...verbRow(verb, whoSlot(slot, i)),
            hl: i === whoIndex(slot) ? ALL : undefined,
          }))
        : [],
    plain:
      'Greek and Romanian let the ending carry the person, so the pronoun is optional (dashed). English needs it (solid).',
    irregular:
      verb.class === 'contracted-ao'
        ? 'Contracted -άω verbs: the stressed ending (-άς, -άει) replaces the -ω endings.'
        : '',
    note: '',
  };
}
