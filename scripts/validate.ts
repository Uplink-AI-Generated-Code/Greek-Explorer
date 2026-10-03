import { DIVERGENCES } from '../src/data/divergences';
import { LEXEMES } from '../src/data/lexemes';
import { PHRASES } from '../src/data/phrases';
import { REVIEW_ITEMS } from '../src/data/review';
import { validate, warnings } from '../src/validate/validate';

const errors = validate({ lexemes: LEXEMES, phrases: PHRASES });
const release = process.argv.includes('--release');

const unverified = [
  ...Object.values(LEXEMES).flatMap((l) =>
    (['el', 'ro', 'en'] as const).filter((lang) => !l.verified[lang]).map((lang) => `lexeme ${l.id} (${lang})`),
  ),
  ...REVIEW_ITEMS.filter((r) => !r.verified).map((r) => r.id),
  ...PHRASES.filter((p) => !p.verified).map((p) => `phrase ${p.id}`),
  ...DIVERGENCES.filter((d) => !d.verified).map((d) => `divergence ${d.id}`),
];

if (unverified.length > 0) {
  console.log(`Unverified (${unverified.length}):\n  ${unverified.join('\n  ')}`);
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

if (release && unverified.length > 0) {
  console.error(`\n--release: ${unverified.length} record(s) are not verified.`);
  process.exit(1);
}

console.log('Data is valid.');
