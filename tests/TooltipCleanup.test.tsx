import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import Tour from '../src/Tour';

/**
 * Regression test for the bug fixed in this release: a highlighted target
 * element's inline `position` style was never reverted on cleanup (only
 * `z-index` was), leaving `position: relative` permanently stuck on the
 * target after the tour ended.
 */

const steps = [{ target: '#tour-target', content: 'Look here' }];

describe('target highlight cleanup', () => {
  it('restores the target\'s original inline position and z-index after the tour unmounts', async () => {
    const target = document.createElement('div');
    target.id = 'tour-target';
    // Simulate a target that already had its own inline position set before
    // the tour ever touched it - the fix needs to restore *this*, not blank.
    target.style.position = 'absolute';
    document.body.appendChild(target);

    const { unmount } = render(
      <Tour steps={steps} isActive showBranding={false} />
    );

    await waitFor(() => {
      expect(target.style.position).toBe('relative');
      expect(target.style.zIndex).toBe('9999');
    });

    unmount();

    expect(target.style.position).toBe('absolute');
    expect(target.style.zIndex).toBe('');

    document.body.removeChild(target);
  });

  it('restores to blank (not "relative") when the target had no inline position beforehand', async () => {
    const target = document.createElement('div');
    target.id = 'tour-target';
    document.body.appendChild(target);

    const { unmount } = render(
      <Tour steps={steps} isActive showBranding={false} />
    );

    await waitFor(() => {
      expect(target.style.position).toBe('relative');
    });

    unmount();

    // This is the exact case the bug produced: previously this assertion
    // would fail because position stayed 'relative' forever.
    expect(target.style.position).toBe('');

    document.body.removeChild(target);
  });
});