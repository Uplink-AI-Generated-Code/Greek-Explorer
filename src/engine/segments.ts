import type { Form } from '../types';

export type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim' | 'notice' | 'sub' | 'augment' | 'aux' | 'neg';
export interface Segment {
  text: string;
  role: Role;
}
export type Rich = Segment[];

export const plain = (text: string): Rich => [{ text, role: 'plain' }];
export const dim = (text: string): Rich => [{ text, role: 'dim' }];
/** An English remark that sits in a Greek or Romanian cell ("not yet added"); rendered as lang="en". */
export const notice = (text: string): Rich => [{ text, role: 'notice' }];
export const richText = (r: Rich): string => r.map((s) => s.text).join('');

export function joinRich(parts: Rich[]): Rich {
  return parts.flatMap((part, i) => (i === 0 ? part : [{ text: ' ', role: 'plain' as const }, ...part]));
}

export const formText = (f: Form): string => `${f.augment ?? ''}${f.stem}${f.ending}`;

export function formRich(f: Form): Rich {
  const out: Rich = [];
  if (f.augment) out.push({ text: f.augment, role: 'augment' });
  out.push({ text: f.stem, role: 'stem' });
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}

export const articleRich = (f: Form): Rich => [{ text: f.stem, role: 'article' }];

export function numeralRich(f: Form): Rich {
  const out: Rich = [{ text: f.stem, role: 'article' }];
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}
