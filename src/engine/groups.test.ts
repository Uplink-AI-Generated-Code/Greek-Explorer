import { describe, expect, it } from 'vitest';
import { FORM_GROUPS } from '../data/form-groups';
import type { GroupMember, SlotOf } from '../types';
import { groupFor, memberKind, memberText } from './groups';
import { richText } from './segments';

const group = (id: string) => {
  const g = FORM_GROUPS.find((x) => x.id === id);
  if (!g) throw new Error(`no group ${id}`);
  return g;
};
const text = (m: GroupMember) => {
  const t = memberText(m);
  return [richText(t.el), t.ro, t.en];
};

describe('the form groups (spec 6.5)', () => {
  it('there are four, each unverified, with at least two members and a close-but-not-the-same row', () => {
    expect(FORM_GROUPS.map((g) => g.id)).toEqual(['eat-the-bread', 'wash-the-child', 'give-me-the-bread', 'dont-eat-the-bread']);
    for (const g of FORM_GROUPS) {
      expect(g.verified).toBe(false);
      expect(g.members.length).toBeGreaterThanOrEqual(2);
      expect(g.closeNotSame).toBeDefined();
    }
  });

  it('Eat the bread!: with a noun, with a pronoun, and the short form', () => {
    const g = group('eat-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic', 'short-form']);
    expect(text(g.members[0])).toEqual(['φάε το ψωμί', 'mănâncă pâinea', 'eat the bread']);
    expect(text(g.members[1])).toEqual(['φάε το', 'mănâncă-o', 'eat it']);
    expect(text(g.members[2])).toEqual(['φάτο', 'mănâncă-o', 'eat it']);
    expect(g.closeNotSame && text({ verb: g.closeNotSame.verb })).toEqual(['φάε', 'mănâncă', 'eat']);
  });

  it('Wash the child!: no short form; the Romanian pronoun is -l', () => {
    const g = group('wash-the-child');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic']);
    expect(text(g.members[0])).toEqual(['πλύνε το παιδί', 'spală copilul', 'wash the child']);
    expect(text(g.members[1])).toEqual(['πλύνε το', 'spală-l', 'wash him / her / it']);
  });

  it('Give me the bread!: two pronouns and the stress rule; the short form needs none', () => {
    const g = group('give-me-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic', 'short-form']);
    expect(text(g.members[0])).toEqual(['δώσε μου το ψωμί', 'dă-mi pâinea', 'give me the bread']);
    expect(text(g.members[1])).toEqual(['δώσε μού το', 'dă-mi-o', 'give it to me']);
    expect(text(g.members[2])).toEqual(['δως μου το', 'dă-mi-o', 'give it to me']);
    expect(memberText(g.members[1]).irregular).toContain('second accent');
    expect(memberText(g.members[2]).irregular).toContain('short form');
  });

  it("Don't eat the bread!: the pronoun moves in front of the verb", () => {
    const g = group('dont-eat-the-bread');
    expect(g.members.map(memberKind)).toEqual(['with-noun', 'with-clitic']);
    expect(text(g.members[0])).toEqual(['μην φας το ψωμί', 'nu mânca pâinea', "don't eat the bread"]);
    expect(text(g.members[1])).toEqual(['μην το φας', 'nu o mânca', "don't eat it"]);
    expect(g.members[1].note).toContain('in front of the verb');
  });

  it('a bare verb is not a member', () => {
    const bare: GroupMember = { verb: { lexeme: 'troo', slot: { pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active' } } };
    expect(() => memberKind(bare)).toThrow(/not a member/);
  });

  it('with-noun wins over the other kinds (spec 4.6)', () => {
    const g = group('give-me-the-bread');
    expect(g.members[0].verb.slot.clitics).toHaveLength(1);
    expect(memberKind(g.members[0])).toBe('with-noun');
  });
});

describe('groupFor: which group a panel belongs to, and which member is in use', () => {
  const slot = (extra: Partial<SlotOf<'verb'>> = {}): SlotOf<'verb'> => ({
    pos: 'verb', person: 2, number: 'sg', mood: 'imperative', tense: 'aorist', voice: 'active', ...extra,
  });
  const it_ = { role: 'object' as const, person: 3 as const, number: 'sg' as const, gender: 'n' as const, roGender: 'f' as const };

  it('the bare verb with no noun is the close row; with the bread it is the with-noun member', () => {
    expect(groupFor('troo', slot(), null)).toMatchObject({ group: { id: 'eat-the-bread' }, current: 'close' });
    expect(groupFor('troo', slot(), 'psomi')).toMatchObject({ group: { id: 'eat-the-bread' }, current: 0 });
  });

  it('a pronoun or a short form is its member, whatever noun the panel holds', () => {
    expect(groupFor('troo', slot({ clitics: [it_] }), 'psomi')).toMatchObject({ current: 1 });
    expect(groupFor('troo', slot({ clitics: [it_], shortForm: true }), 'psomi')).toMatchObject({ current: 2 });
  });

  it('the same command with another pronoun is in the family but not a member', () => {
    const other = { ...it_, roGender: 'm' as const };
    expect(groupFor('troo', slot({ clitics: [other] }), 'paidi')).toMatchObject({ group: { id: 'eat-the-bread' }, current: null });
  });

  it('the negative command and the other verbs find their own groups', () => {
    expect(groupFor('troo', slot({ polarity: 'negative', clitics: [it_] }), 'psomi')).toMatchObject({
      group: { id: 'dont-eat-the-bread' }, current: 1,
    });
    expect(groupFor('pleno', slot(), 'paidi')).toMatchObject({ group: { id: 'wash-the-child' }, current: 0 });
    expect(groupFor('dino', slot(), null)).toMatchObject({ group: { id: 'give-me-the-bread' }, current: 'close' });
  });

  it('a command with no group, and anything that is not a command, has none', () => {
    expect(groupFor('troo', slot({ tense: 'present' }), null)).toBeNull();
    expect(groupFor('troo', slot({ number: 'pl' }), null)).toBeNull();
    expect(groupFor('troo', slot({ mood: 'indicative', tense: 'present' }), null)).toBeNull();
  });
});
