import type { ReviewItem } from '../types';

/** Ending tables awaiting the content review (spec section 9). Lexemes, phrases and divergence notes carry their own flags. */
export const REVIEW_ITEMS: ReviewItem[] = [
  { id: 'ending-table:masc-es', kind: 'ending-table', verified: false },
  { id: 'ending-table:ro-article-suffix', kind: 'ending-table', verified: false },
  { id: 'ending-table:masc-os', kind: 'ending-table', verified: false },
  { id: 'ending-table:fem-ou', kind: 'ending-table', verified: false },
  { id: 'ending-table:neut-i', kind: 'ending-table', verified: false },
  { id: 'ending-table:adj-stressed', kind: 'ending-table', verified: false },
  { id: 'ending-table:adj-unstressed', kind: 'ending-table', verified: false },
  { id: 'ending-table:article-def', kind: 'ending-table', verified: false },
  { id: 'ending-table:numeral-forms', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-present', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-contracted-ao-present', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-imperfect', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-aorist', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-subj-aorist', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-imperative', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-base', kind: 'ending-table', verified: false },
];
