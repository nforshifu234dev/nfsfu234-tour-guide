import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tour from '../src/Tour';
import { TourProvider } from '../src/TourProvider';

/**
 * These tests target the one thing that's new and completely untested in
 * 1.1.0: does <TourProvider config={...}> actually apply as a default, and
 * does an explicit prop on <Tour> still win over it?
 *
 * Scoped to the welcome screen only, to avoid needing an IntersectionObserver
 * polyfill for step-target highlighting in jsdom — the accent color is
 * visible on the "Start Tour" button before any step ever renders.
 */

const steps = [{ target: '#does-not-need-to-exist', content: 'Step one' }];

describe('TourProvider config precedence', () => {
  it('applies a config value when no matching prop is passed', () => {
    render(
      <TourProvider config={{ accentColor: '#123456' }}>
        <Tour
          steps={steps}
          isActive
          welcomeScreen={{ enabled: true, title: 'Welcome' }}
        />
      </TourProvider>
    );

    const startButton = screen.getByRole('button', { name: /start tour/i });
    expect(startButton).toHaveStyle({ '--nfsfu234-tour-accent': '#123456' });
  });

  it('lets an explicit prop on <Tour> override the provider config', () => {
    render(
      <TourProvider config={{ accentColor: '#123456' }}>
        <Tour
          steps={steps}
          isActive
          accentColor="#abcdef"
          welcomeScreen={{ enabled: true, title: 'Welcome' }}
        />
      </TourProvider>
    );

    const startButton = screen.getByRole('button', { name: /start tour/i });
    expect(startButton).toHaveStyle({ '--nfsfu234-tour-accent': '#abcdef' });
  });

  it('falls back to the built-in default when neither prop nor config set it', () => {
    render(
      <Tour
        steps={steps}
        isActive
        welcomeScreen={{ enabled: true, title: 'Welcome' }}
      />
    );

    const startButton = screen.getByRole('button', { name: /start tour/i });
    // Built-in default from Tour.tsx's own fallback chain.
    expect(startButton).toHaveStyle({ '--nfsfu234-tour-accent': '#10b981' });
  });

  it('merges buttonLabels instead of replacing them wholesale', () => {
    render(
      <TourProvider config={{ buttonLabels: { skip: 'No thanks' } }}>
        <Tour
          steps={steps}
          isActive
          welcomeScreen={{ enabled: true, title: 'Welcome' }}
        />
      </TourProvider>
    );

    // The config only overrode `skip` — `start` should still fall back to
    // the library default rather than becoming undefined.
    expect(screen.getByRole('button', { name: /no thanks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start tour/i })).toBeInTheDocument();
  });
});