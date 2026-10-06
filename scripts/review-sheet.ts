import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DIVERGENCES } from '../src/data/divergences';
import { FORM_GROUPS } from '../src/data/form-groups';
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { READING_TEMPLATES } from '../src/data/readings';
import { REVIEW_ITEMS } from '../src/data/review';
import { reviewFiles } from '../src/validate/reviewFiles';
import { pendingCells } from '../src/validate/validate';

const files = reviewFiles({
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
  pending: pendingCells(LEXEMES),
});
// The sheets are generated: start from an empty folder, and drop the single file an earlier version wrote.
rmSync('review/sheets', { recursive: true, force: true });
rmSync('review/content-review.md', { force: true });
for (const file of files) {
  const path = join('review/sheets', file.path);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, file.content);
}
console.log(`Wrote ${files.length} files to review/sheets/ (start with index.md).`);
if (files.some((f) => f.path === 'general.md')) console.log('Some records belong to no feature: see general.md and add them to src/data/review-features.ts.');
