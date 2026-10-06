import { ownAlone, ownPhrase } from '../engine/agree';
import { inflectAdjective, inflectArticle } from '../engine/greek';
import { DEF_ARTICLE } from '../data/lexemes';
import { caseOptions } from '../engine/labels';
import { POSSESSORS, enAlone, greekPossessive, possessorValue, roAloneFor } from '../engine/possessive';
import { articleRich, formRich, joinRich, plain, richText } from '../engine/segments';
import type { Case, GreekAdjective, GreekNoun, Level, SlotOf } from '../types';
import { GENDERS, GENDER_ROW, caseName, nounControl, nounOf, npRow, numberControl } from './shared';
import type { Control, Panel, PanelRow, PanelState } from './types';

/** δικός offers the nominative and the accusative only: Romanian has no short form of the genitive (propriului meu, al celui …). */
const ROLES: Case[] = ['nom', 'acc'];

function dikosFull(adj: GreekAdjective, slot: SlotOf<'adjective'>, noun: GreekNoun, possessor: SlotOf<'possessive'>): PanelRow[] {
  return GENDERS.flatMap((g) =>
    ROLES.map((c) => ({
      label: `${GENDER_ROW[g]} ${caseName(c)}`,
      el: joinRich([
        articleRich(inflectArticle(DEF_ARTICLE, { pos: 'article', gender: g, number: slot.number, case: c })),
        formRich(inflectAdjective(adj, { pos: 'adjective', gender: g, number: slot.number, case: c })),
        [{ text: greekPossessive(possessor), role: 'clitic' as const }],
      ]),
      ro: plain(roAloneFor(possessor, g, slot.number)),
      en: plain(enAlone(possessor)),
      hl: { el: g === noun.gender && c === slot.case, ro: g === noun.ro.gender && c === slot.case, en: false },
    })),
  );
}

/** δικός (δική, δικό): "own" beside a noun, "mine" on its own, always followed by the weak possessive (spec 5.3, 24). */
export function dikosPanel(adj: GreekAdjective, slot: SlotOf<'adjective'>, state: PanelState, level: Level): Panel {
  const noun = nounOf(state);
  const possessor = state.possessor ?? POSSESSORS[0].slot;
  const forms = GENDERS.map((gender) =>
    richText(formRich(inflectAdjective(adj, { pos: 'adjective', gender, number: 'sg', case: 'nom' }))),
  );
  const roleControl: Control = {
    key: 'case',
    label: 'Role in sentence',
    options: caseOptions(level).filter((o) => ROLES.includes(o.value as Case)),
    value: slot.case,
  };
  return {
    lemma: forms.join(' / '),
    posLabel: level === 'beginner' ? 'adjective: own (mine)' : 'adjective · 3-ending (stressed) · emphatic possessive',
    controls: [
      nounControl('Noun it describes', state),
      numberControl(slot.number),
      roleControl,
      { key: 'possessor', label: 'Whose?', options: POSSESSORS.map(({ value, label }) => ({ value, label })), value: possessorValue(possessor) },
    ],
    rows: [
      npRow('before the noun', ownPhrase(adj, noun, slot.number, slot.case, possessor)),
      npRow('on its own', ownAlone(adj, noun, slot.number, slot.case, possessor)),
    ],
    full: level === 'improver' ? dikosFull(adj, slot, noun, possessor) : [],
    plain:
      'Greek δικός copies gender, number and role from the thing possessed, and the weak possessive follows it: το δικό μου σπίτι. Romanian puts propriu after the article and before the noun (propria mea casă) and says al meu, a mea, ai mei, ale mele on its own. English says "my own" beside a noun and "mine" on its own.',
    irregular: inflectAdjective(adj, slot).irregular?.plain ?? '',
    note: noun.note,
  };
}
