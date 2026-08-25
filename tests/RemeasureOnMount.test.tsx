import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import Tour from '../src/Tour';

/**
 * jsdom doesn't run a real layout engine, so it can't reproduce the actual
 * CSS behavior this fix addresses (an auto-width element measures
 * differently in normal flow vs once `position: fixed`, which is what
 * caused the first-paint mismeasurement). What this test CAN verify is that
 * the mechanism is in place: on initial mount, the tooltip's
 * getBoundingClientRect() gets called more than once (the double-rAF
 * re-measurement), not just once - visual correctness of the resulting
 * position needs checking in a real browser, not jsdom.
 */

afterEach(() => {
  cleanup();
});

describe('tooltip re-measures on initial mount, not just once', () => {
  it('calls getBoundingClientRect on the tooltip element more than once before the first scroll/resize', async () => {
    const target = document.createElement('div');
    target.id = 'remeasure-target';
    document.body.appendChild(target);
    target.getBoundingClientRect = () =>
      ({
        top: 300, left: 300, width: 50, height: 50, right: 350, bottom: 350, x: 300, y: 300, toJSON() {},
      }) as DOMRect;

    // Patch the prototype before rendering, so calls from the very first
    // mount (before the element even exists yet in this test) get counted -
    // filtered to only the tooltip element, so we're not also counting the
    // target's own (already-stubbed) calls.
    let tooltipCallCount = 0;
    const original = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (this.classList.contains('nfsfu234-tour-tooltip')) {
        tooltipCallCount++;
      }
      return original.call(this);
    };

    try {
      render(
        <Tour
          steps={[{ target: '#remeasure-target', content: 'Hi', position: 'bottom' }]}
          isActive
          showBranding={false}
        />
      );

      await waitFor(() => {
        expect(tooltipCallCount).toBeGreaterThanOrEqual(2);
      });
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original;
      document.body.removeChild(target);
    }
  });
});