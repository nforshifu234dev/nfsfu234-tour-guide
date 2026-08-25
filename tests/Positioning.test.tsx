import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import Tour from '../src/Tour';

/**
 * Regression tests for the bug where a tooltip positioned e.g. `right`
 * would visually appear on the left (or displaced) whenever its target was
 * near a viewport edge. The old code computed top/left for the chosen side,
 * then unconditionally clamped BOTH axes into the viewport - which silently
 * overrode the chosen side's horizontal position for `left`/`right`
 * tooltips (or vertical position for `top`/`bottom`), regardless of whether
 * the flip logic had already decided that side was the right call.
 */

const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 768;
const TOOLTIP_WIDTH = 400;
const TOOLTIP_HEIGHT = 150;

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: VIEWPORT_WIDTH });
  Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: VIEWPORT_HEIGHT });
});

afterEach(() => {
  cleanup();
});

function placeTarget(id: string, rect: { top: number; left: number; width: number; height: number }) {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  el.getBoundingClientRect = () =>
    ({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON() {},
    }) as DOMRect;
  return el;
}

async function mountAndStubTooltip(): Promise<HTMLElement> {
  await waitFor(() => {
    if (!document.querySelector('.nfsfu234-tour-tooltip')) {
      throw new Error('tooltip not mounted yet');
    }
  });

  const el = document.querySelector('.nfsfu234-tour-tooltip') as HTMLElement;

  el.getBoundingClientRect = () =>
    ({
      top: 0,
      left: 0,
      width: TOOLTIP_WIDTH,
      height: TOOLTIP_HEIGHT,
      right: TOOLTIP_WIDTH,
      bottom: TOOLTIP_HEIGHT,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect;

  window.dispatchEvent(new Event('resize'));

  return el;
}

describe('tooltip positioning near viewport edges', () => {
  it('keeps a "right"-positioned tooltip actually to the right when there is genuinely enough room', async () => {
    placeTarget('edge-target', { top: 300, left: 100, width: 50, height: 50 });

    render(
      <Tour
        steps={[{ target: '#edge-target', content: 'Hi', position: 'right' }]}
        isActive
        showBranding={false}
      />
    );

    const tooltip = await mountAndStubTooltip();

    await waitFor(() => {
      const left = parseFloat(tooltip.style.left);
      expect(left).toBeGreaterThanOrEqual(150);
    });
  });

  it('flips to "left" (and stays there) when the target is genuinely near the right edge', async () => {
    placeTarget('edge-target-2', { top: 300, left: 900, width: 50, height: 50 });

    render(
      <Tour
        steps={[{ target: '#edge-target-2', content: 'Hi', position: 'right' }]}
        isActive
        showBranding={false}
      />
    );

    const tooltip = await mountAndStubTooltip();

    await waitFor(() => {
      const left = parseFloat(tooltip.style.left);
      expect(left).toBeLessThan(900);
    });
  });
});

describe('arrow direction matches the resolved (post-flip) position', () => {
  it('does not point "right" when the tooltip actually flipped to the left', async () => {
    placeTarget('edge-target-3', { top: 300, left: 900, width: 50, height: 50 });

    render(
      <Tour
        steps={[{ target: '#edge-target-3', content: 'Hi', position: 'right' }]}
        isActive
        showBranding={false}
      />
    );

    const tooltip = await mountAndStubTooltip();

    await waitFor(() => {
      const arrow = tooltip.lastElementChild as HTMLElement;
      expect(arrow.style.borderLeft).not.toBe('');
      expect(arrow.style.borderRight).toBe('');
    });
  });
});