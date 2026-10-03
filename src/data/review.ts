import type { ReviewItem } from '../types';

/** Ending tables awaiting the content review (spec section 9). Lexemes, phrases and divergence notes carry their own flags. */
export const REVIEW_ITEMS: ReviewItem[] = [
  { id: 'ending-table:masc-es', kind: 'ending-table', verified: false },
  { id: 'ending-table:adj-stressed', kind: 'ending-table', verified: false },
  { id: 'ending-table:article-def', kind: 'ending-table', verified: false },
  { id: 'ending-table:numeral-one', kind: 'ending-table', verified: false },
  { id: 'ending-table:verb-omega-present', kind: 'ending-table', verified: false },
];
