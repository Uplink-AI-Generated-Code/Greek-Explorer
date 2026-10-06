import { nounPhrase } from '../engine/agree';
import { RO_POSSESSIVES } from '../data/possessives';
import { greekPossessive, enPossessive, possessorValue, POSSESSORS, roPossessive, possessorKey } from '../engine/possessive';
import { secondAccent } from '../engine/stress';
import { formText, plain } from '../engine/segments';
import { inflectNoun } from '../engine/greek';
import type { GreekPossessive, Level, SlotOf } from '../types';
import { ALL, caseControl, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Panel, PanelRow, PanelState } from './types';

/** All the Romanian forms of a possessor, for the "on its own" row: meu · mei · mea · mele, or the one invariable word. */
function roForms(slot: SlotOf<'possessive'>): string {
  const entry = RO_POSSESSIVES[possessorKey(slot)];
  return typeof entry === 'string' ? entry : `m.sg ${entry.m.sg} · m.pl ${entry.m.pl} · f.sg ${entry.f.sg} · f.pl ${entry.f.pl}`;
}

/** μου, σου, του …: the weak genitive pronoun after a noun; the Romanian possessive agrees with the possessed noun (spec 4.3, 5.3). */
export function possessivePanel(_l: GreekPossessive, slot: SlotOf<'possessive'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const number = state.nounNumber;
  const c = state.nounCase ?? 'nom';
  const here = nounPhrase(noun, number, c, { article: 'definite', possessor: slot });
  const pronoun = greekPossessive(slot);
  const accent = secondAccent([formText(inflectNoun(noun, { pos: 'noun', number, case: c })), pronoun]);
  const alone: PanelRow = {
    label: 'on its own',
    el: [{ text: pronoun, role: 'clitic' }],
    ro: plain(roForms(slot)),
    en: plain(enPossessive(slot)),
  };
  return {
    lemma: 'μου, σου, του / της, μας, σας, τους',
    posLabel:
      level === 'beginner' ? `possessive: ${enPossessive(slot)}` : 'possessive · weak genitive pronoun after the noun',
    controls: [
      {
        key: 'possessor',
        label: 'Whose?',
        options: POSSESSORS.map(({ value, label }) => ({ value, label })),
        value: possessorValue(slot),
      },
      nounControl('Noun it goes with', state),
      numberControl(number),
      caseControl({ case: c }, level),
    ],
    rows: [npRow('with a noun', here), alone],
    full:
      level === 'improver'
        ? POSSESSORS.map(({ value, label, slot: p }) => ({
            label,
            el: [{ text: greekPossessive(p), role: 'clitic' as const }],
            ro: plain(roPossessive(p, noun, number, c)),
            en: plain(enPossessive(p)),
            hl: value === possessorValue(slot) ? ALL : undefined,
          }))
        : [],
    plain:
      'Greek puts the weak genitive pronoun after the noun and keeps the article (το σπίτι μου); it changes with the possessor. English puts it before the noun and drops the article (my house). Romanian puts it after the noun and changes it with the possessed noun, not with the possessor (casa mea, câinele meu).',
    irregular: accent?.word === 0
      ? 'The noun’s stress is too far back for the whole unit, so it takes a second accent two syllables after its own: θάλασσα → θάλασσά μου.'
      : '',
    note: noun.note,
  };
}
