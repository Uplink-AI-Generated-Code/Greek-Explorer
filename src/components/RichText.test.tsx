import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { notice } from '../engine/segments';
import { RichText } from './RichText';

describe('RichText', () => {
  it('marks a notice as English so it is not read as Greek or Romanian', () => {
    const { container } = render(
      <p lang="ro">
        <RichText rich={notice('not yet added')} />
      </p>,
    );
    const span = container.querySelector('[lang="en"]');
    expect(span).toHaveTextContent('not yet added');
    expect(span).toHaveClass('role-notice');
  });
});
