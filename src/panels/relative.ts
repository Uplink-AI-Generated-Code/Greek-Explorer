import { PREPOSITIONS, getNoun } from '../data/lexemes';
import { RELATIVE_PREPOSITIONS, RELATIVE_ROLES } from '../data/relatives';
import { relativeGroup } from '../engine/relativeGroup';
import { joinRich, plain } from '../engine/segments';
import type { GreekRelative, Level, RelativeRole, SlotOf } from '../types';
import { ALL, nounControl, nounOf, nounOptions, numberControl } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** The noun a "whose" shows when the learner has not chosen one: a house, or a dog when the antecedent is the house. */
const defaultOwned = (antecedent: string): string => (antecedent === 'spiti' ? 'skylos' : 'spiti');

const ROLE_ROW: Record<RelativeRole, string> = {
  subject: 'subject',
  object: 'object',
  indirect: 'to whom',
  whose: 'whose',
  preposition: 'after a preposition',
};

/** The relative pronoun as a word of its own: the pronoun group for the job, in three languages (spec 5.3, 26). */
export function relativePanel(word: GreekRelative, slot: SlotOf<'relative'>, state: PanelState, level: Level): Panel {
  const antecedent = nounOf(state);
  const owned = getNoun(state.owned ?? defaultOwned(antecedent.id));
  const preposition = slot.preposition ?? 'me';
  const withPreposition = (role: RelativeRole): SlotOf<'relative'> => {
    const rest = { ...slot };
    delete rest.preposition;
    return role === 'preposition' ? { ...rest, role, preposition } : { ...rest, role };
  };
  const row = (kind: 'pou' | 'opoios', label: string, role: RelativeRole = slot.role): PanelRow => {
    const g = relativeGroup(kind, withPreposition(role), antecedent, owned);
    return { label, el: g.el, ro: plain(g.ro), en: plain(g.en) };
  };
  const rows = word.kind === 'pou' ? [row('pou', 'with που'), row('opoios', 'with ο οποίος')] : [row('opoios', 'with ο οποίος'), row('pou', 'with που')];

  const controls: Control[] = [
    nounControl('Noun it refers to', state),
    numberControl(slot.number),
    { key: 'role', label: 'Role in its clause', options: RELATIVE_ROLES, value: slot.role },
  ];
  if (slot.role === 'preposition') {
    controls.push({
      key: 'preposition',
      label: 'Preposition',
      options: PREPOSITIONS.filter((p) => (RELATIVE_PREPOSITIONS as readonly string[]).includes(p.id)).map((p) => ({ value: p.id, label: `${p.lemma} (${p.en})` })),
      value: preposition,
    });
  }
  if (slot.role === 'whose') {
    controls.push({ key: 'owned', label: 'Noun owned', options: nounOptions(), value: owned.id });
  }

  const separator = [{ text: '·', role: 'plain' as const }];
  const full: PanelRow[] =
    level === 'improver'
      ? RELATIVE_ROLES.map(({ value: role }) => {
          const pou = relativeGroup('pou', withPreposition(role), antecedent, owned);
          const opoios = relativeGroup('opoios', withPreposition(role), antecedent, owned);
          return {
            label: ROLE_ROW[role],
            el: joinRich([pou.el, separator, opoios.el]),
            ro: plain(pou.ro),
            en: plain(pou.en),
            ...(role === slot.role ? { hl: ALL } : {}),
          };
        })
      : [];

  return {
    lemma: word.kind === 'pou' ? 'που' : 'ο οποίος / η οποία / το οποίο',
    posLabel:
      level === 'beginner'
        ? 'relative: who / which / that'
        : word.kind === 'pou'
          ? 'relative pronoun · never changes'
          : 'relative pronoun · agrees with its noun',
    controls,
    rows,
    full,
    plain: word.meaning,
    irregular: '',
    note: '',
  };
}
