import type { Form } from '../types';

export type Role = 'plain' | 'stem' | 'ending' | 'article' | 'pronoun' | 'dim';
export interface Segment {
  text: string;
  role: Role;
}
export type Rich = Segment[];

export const plain = (text: string): Rich => [{ text, role: 'plain' }];
export const dim = (text: string): Rich => [{ text, role: 'dim' }];
export const richText = (r: Rich): string => r.map((s) => s.text).join('');

export function joinRich(parts: Rich[]): Rich {
  return parts.flatMap((part, i) => (i === 0 ? part : [{ text: ' ', role: 'plain' as const }, ...part]));
}

export function formRich(f: Form): Rich {
  const out: Rich = [{ text: f.stem, role: 'stem' }];
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}

export const articleRich = (f: Form): Rich => [{ text: f.stem, role: 'article' }];

export function numeralRich(f: Form): Rich {
  const out: Rich = [{ text: f.stem, role: 'article' }];
  if (f.ending) out.push({ text: f.ending, role: 'ending' });
  return out;
}
