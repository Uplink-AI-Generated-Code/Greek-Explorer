import { enVerb } from '../engine/english';
import { inflectVerb } from '../engine/greek';
import { EN_PRONOUNS, GREEK_PRONOUNS, RO_PRONOUNS, whoOptions } from '../engine/labels';
import { voiceOf } from '../engine/offers';
import { roVerb } from '../engine/romanian';
import { formRich } from '../engine/segments';
import { whoIndex } from '../engine/tenses';
import type { GreekVerb, Level, Person, SlotOf, VerbClass } from '../types';
import { ALL } from './shared';
import type { Panel, PanelRow } from './types';

const CLASS_LABEL: Record<VerbClass, string> = {
  omega: '-ω class',
  'contracted-ao': 'contracted -άω class',
  athematic: 'athematic class',
  mediopassive: 'mediopassive -ομαι class',
  deponent: 'deponent -άμαι class',
  impersonal: 'impersonal',
};

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
      { text: enVerb(verb, slot).verb, role: 'plain' },
    ],
  };
}

const whoSlot = (slot: SlotOf<'verb'>, i: number): SlotOf<'verb'> => ({
  ...slot,
  person: ((i % 3) + 1) as Person,
  number: i < 3 ? 'sg' : 'pl',
});

export function verbPanel(verb: GreekVerb, slot: SlotOf<'verb'>, level: Level): Panel {
  const data = voiceOf(verb, slot.voice);
  return {
    lemma: data.lemma,
    posLabel:
      level === 'beginner' ? `verb: to ${data.en.gloss}` : `verb · ${CLASS_LABEL[data.class]} · ${slot.voice}`,
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
      data.class === 'contracted-ao'
        ? 'Contracted -άω verbs: the stressed ending (-άς, -άει) replaces the -ω endings.'
        : '',
    note: '',
  };
}
