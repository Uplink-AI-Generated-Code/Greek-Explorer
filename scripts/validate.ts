import { READING_TEMPLATES } from '../src/data/readings';
import { FORM_GROUPS } from '../src/data/form-groups';
import { DIVERGENCES } from '../src/data/divergences';
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { REVIEW_ITEMS } from '../src/data/review';
import { unverifiedRecords } from '../src/validate/unverified';
import { pendingCells, validate, warnings } from '../src/validate/validate';

const errors = validate({ lexemes: LEXEMES, phrases: PHRASES, groups: FORM_GROUPS });
const release = process.argv.includes('--release');

const unverified = unverifiedRecords({
  lexemes: LEXEMES,
  items: REVIEW_ITEMS,
  phrases: PHRASES,
  divergences: DIVERGENCES,
  templates: READING_TEMPLATES,
  groups: FORM_GROUPS,
});

if (unverified.length > 0) {
  console.log(`Unverified (${unverified.length}):\n  ${unverified.join('\n  ')}`);
}

const pending = pendingCells(LEXEMES);
if (pending.length > 0) {
  console.log(`Pending (${pending.length}), shown as "not yet added":\n  ${pending.join('\n  ')}`);
}

const warned = warnings({ lexemes: LEXEMES, phrases: PHRASES });
if (warned.length > 0) {
  console.log(`Warnings (${warned.length}):\n  ${warned.join('\n  ')}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

if (release && (unverified.length > 0 || pending.length > 0)) {
  console.error(`\n--release: ${unverified.length} record(s) are not verified and ${pending.length} cell(s) are pending.`);
  process.exit(1);
}

console.log('Data is valid.');
