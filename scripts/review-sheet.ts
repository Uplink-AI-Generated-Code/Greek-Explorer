import { mkdirSync, writeFileSync } from 'node:fs';
import { DIVERGENCES } from '../src/data/divergences';
import { FORM_GROUPS } from '../src/data/form-groups';
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { READING_TEMPLATES } from '../src/data/readings';
import { REVIEW_ITEMS } from '../src/data/review';
import { reviewSheet } from '../src/validate/reviewSheet';
import { pendingCells } from '../src/validate/validate';

const sheet = reviewSheet({
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
  pending: pendingCells(LEXEMES),
});
mkdirSync('review', { recursive: true });
writeFileSync('review/content-review.md', sheet);
console.log(`Wrote review/content-review.md (${sheet.split('\n').length} lines).`);
