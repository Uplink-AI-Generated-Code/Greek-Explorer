import { describe, expect, it } from 'vitest';
import { RO_CLITICS, RO_CLUSTERS } from '../data/clitics';
import { roTableProblems } from './validate';

describe('the Romanian pronoun tables', () => {
  it('are valid as stored', () => {
    expect(roTableProblems(RO_CLITICS, RO_CLUSTERS)).toEqual([]);
  });

  it('refuse a blank field in a pronoun', () => {
    const bad = { ...RO_CLITICS, 'obj.2sg': { ...RO_CLITICS['obj.2sg'], afterSa: ' ' } };
    expect(roTableProblems(bad, RO_CLUSTERS)).toEqual(['lexeme clitic: obj.2sg has an empty afterSa']);
  });

  it('refuse a blank field in a pair', () => {
    const key = Object.keys(RO_CLUSTERS)[0];
    const bad = { ...RO_CLUSTERS, [key]: { ...RO_CLUSTERS[key], enclitic: '' } };
    expect(roTableProblems(RO_CLITICS, bad)).toEqual([`lexeme clitic: ${key} has an empty enclitic`]);
  });

  it('refuse an entry with neither a fusion nor a postposed form', () => {
    const bad = { ...RO_CLITICS, 'obj.2sg': { ...RO_CLITICS['obj.2sg'], fused: '', after: '' } };
    expect(roTableProblems(bad, RO_CLUSTERS)).toEqual(['lexeme clitic: obj.2sg has an empty fused and after']);
  });
});
