import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Tour from '../src/Tour';

/**
 * Proves the two things fixed in this pass:
 * 1. Colors are no longer set via inline `style`, so a consumer's own
 *    className can genuinely override them (previously impossible - inline
 *    styles always won regardless of CSS specificity).
 * 2. Escape closes the tour, and Tab wraps focus within the open dialog
 *    instead of escaping to the page behind it.
 */

const steps = [{ target: '#does-not-need-to-exist', content: 'Step one' }];

describe('styling is class-based, not inline', () => {
  it('does not set backgroundColor directly via the style attribute on the welcome card', () => {
    render(
      <Tour
        steps={steps}
        isActive
        showBranding={false}
        welcomeScreen={{ enabled: true, title: 'Welcome' }}
      />
    );

    const startButton = screen.getByRole('button', { name: /start tour/i });
    // The old bug: this used to be a real inline backgroundColor value,
    // which no CSS class could ever beat. Now it should be unset -
    // only the CSS custom property is set inline, and the actual color
    // comes from the injected stylesheet rule.
    expect(startButton.style.backgroundColor).toBe('');
    expect(startButton.style.getPropertyValue('--nfsfu234-tour-accent')).toBe('#10b981');
  });

  it('applies the consumer-supplied tooltipClassName alongside the base class', () => {
    render(
      <Tour
        steps={steps}
        isActive
        showBranding={false}
        tooltipClassName="my-custom-tooltip"
        welcomeScreen={{ enabled: true, title: 'Welcome' }}
      />
    );

    const card = document.querySelector('.nfsfu234-tour-welcome-card');
    // Both classes present means a consumer's own CSS rule targeting
    // `.my-custom-tooltip { background: blue; }` will win the cascade,
    // since our base rule is wrapped in :where() (zero specificity).
    expect(card).toHaveClass('nfsfu234-tour-welcome-card', 'my-custom-tooltip');
  });
});

describe('welcome dialog keyboard behavior', () => {
  it('Escape calls onSkip', () => {
    let skipped = false;
    render(
      <Tour
        steps={steps}
        isActive
        showBranding={false}
        onSkip={() => { skipped = true; }}
        welcomeScreen={{ enabled: true, title: 'Welcome' }}
      />
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(skipped).toBe(true);
  });

  it('Shift+Tab on the first focusable element wraps to the last', () => {
    render(
      <Tour
        steps={steps}
        isActive
        showBranding={false}
        welcomeScreen={{ enabled: true, title: 'Welcome' }}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close welcome screen/i });
    const startButton = screen.getByRole('button', { name: /start tour/i });

    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(startButton);
  });
});