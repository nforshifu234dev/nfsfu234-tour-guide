'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

import Branding from './Branding';
import { useTourConfig } from './TourProvider';

import type {
  ThemeConfig,
  ButtonLabels,
  WelcomeScreenConfig,
  TourStep,
  TourProps,
} from './types';

// ────────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIGURATIONS
// ────────────────────────────────────────────────────────────────────────────────

const THEME_PRESETS: Record<'light' | 'dark', ThemeConfig> = {
  dark: {
    backdrop: 'rgba(0, 0, 0, 0.75)',
    tooltipBg: '#18181b',
    tooltipText: '#ffffff',
    tooltipBorder: '#3f3f46',
    buttonBg: '#27272a',
    buttonText: '#ffffff',
    progressBar: '#3f3f46',
    highlightRing: 'rgba(16, 185, 129, 0.5)',
  },
  light: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    tooltipBg: '#ffffff',
    tooltipText: '#18181b',
    tooltipBorder: '#e4e4e7',
    buttonBg: '#f4f4f5',
    buttonText: '#18181b',
    progressBar: '#e4e4e7',
    highlightRing: 'rgba(59, 130, 246, 0.5)',
  },
};

const DEFAULT_BUTTON_LABELS: Required<ButtonLabels> = {
  next: 'Next',
  previous: 'Back',
  skip: 'Skip',
  finish: 'Finish',
  start: 'Start Tour',
};

const DEFAULT_WELCOME_SCREEN: Required<WelcomeScreenConfig> = {
  enabled: false,
  title: 'Welcome',
  message: "Let's guide you through the key features.",
  startButtonText: 'Start Tour',
};

/**
 * Detects if the current viewport width qualifies as mobile (< 768px).
 */
function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

/**
 * Checks whether a given tour step should be displayed based on its device targeting
 * and the currently detected device type.
 */
function shouldShowStep(step: TourStep, currentDevice: 'mobile' | 'desktop'): boolean {
  if (!step.device || step.device === 'both') return true;
  return currentDevice === 'mobile' ? step.device === 'mobile' : step.device === 'desktop';
}

/**
 * Returns the CSS object for a tooltip arrow pointing in the specified direction.
 */
function getArrowStyle(position?: string, color?: string) {
  const borderColor = color || '#18181b';

  switch (position) {
    case 'top':
      return {
        content: '',
        position: 'absolute' as const,
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${borderColor}`,
      };
    case 'bottom':
      return {
        content: '',
        position: 'absolute' as const,
        top: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: `8px solid ${borderColor}`,
      };
    case 'left':
      return {
        content: '',
        position: 'absolute' as const,
        right: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: `8px solid ${borderColor}`,
      };
    case 'right':
      return {
        content: '',
        position: 'absolute' as const,
        left: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: `8px solid ${borderColor}`,
      };
    default:
      return { display: 'none' };
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// TOOLTIP SUB-COMPONENT
// ────────────────────────────────────────────────────────────────────────────────

interface TooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  themeConfig: ThemeConfig;
  accentColor: string;
  showProgress: boolean;
  buttonLabels: Required<ButtonLabels>;
  tooltipClassName?: string;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

/**
 * Displays a single tour step tooltip anchored to a DOM target.
 * Handles:
 * - Dynamic positioning with automatic side flipping when space is insufficient
 * - Viewport edge clamping
 * - Target highlighting and scroll-into-view behavior
 * - Device-specific content selection
 */
function Tooltip({
  step,
  stepIndex,
  totalSteps,
  themeConfig,
  accentColor,
  showProgress,
  buttonLabels,
  tooltipClassName,
  onNext,
  onPrevious,
  onSkip,
}: TooltipProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  // The position actually used after flip-resolution, which can differ from
  // step.position if the requested side didn't fit. The arrow needs this,
  // not the originally-requested side, or it points the wrong way whenever
  // a flip happens.
  const [resolvedPosition, setResolvedPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    step.position || 'bottom'
  );
  const tooltipRef = useRef<HTMLDivElement>(null);
  // First/last focusable elements inside the tooltip - used to wrap Tab/Shift+Tab
  // so focus can't escape to the page behind an open tour step.
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  const content = isMobile() && step.contentMobile ? step.contentMobile : step.content;

  /**
   * Escape closes the tour (same as clicking Skip). Tab/Shift+Tab wrap
   * between the first and last focusable button instead of escaping to
   * whatever's behind the backdrop.
   */
  const handleTooltipKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onSkip();
      return;
    }

    if (e.key !== 'Tab') return;

    const first = firstFocusableRef.current;
    const last = lastFocusableRef.current;
    if (!first || !last) return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Move focus into the tooltip as soon as it mounts, so keyboard users
  // land somewhere sensible (and Tab/Escape work immediately) without
  // needing to click first.
  useEffect(() => {
    firstFocusableRef.current?.focus();
  }, [step.target]);

  // ── Target attachment, highlighting & visibility observer ───────────────────
  useEffect(() => {
    const target = document.querySelector(step.target) as HTMLElement | null;
    if (!target) {
      console.warn(`[NFSFU234TourGuide] Target "${step.target}" not found`);
      return;
    }

    setTargetElement(target);

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Snapshot whatever inline position/z-index the target already had, so
    // cleanup can restore it exactly rather than assuming it started blank.
    const previousInlinePosition = target.style.position;
    const previousInlineZIndex = target.style.zIndex;

    target.style.position = 'relative';
    target.style.zIndex = '9999';
    target.classList.add('nfsfu234-tour-active-target');

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      target.classList.remove('nfsfu234-tour-active-target');
      // Restore both properties to their pre-tour values (previously only
      // z-index was reset here, leaving `position: relative` stuck on the
      // target indefinitely after the tour ended).
      target.style.position = previousInlinePosition;
      target.style.zIndex = previousInlineZIndex;
    };
  }, [step.target]);

  // ── Adaptive positioning with smart flipping & resize handling ──────────────
  useEffect(() => {
    if (!targetElement || !tooltipRef.current) return;

    let rafId: number;
    let initialRafId: number;
    let secondPassRafId: number;
    const EDGE_PADDING = 16;

    const updatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const offsetX = step.offset?.x ?? 0;
      const offsetY = step.offset?.y ?? (isMobile() ? 12 : 16);

      const coordsFor = (pos: 'top' | 'bottom' | 'left' | 'right') => {
        switch (pos) {
          case 'top':
            return {
              top: targetRect.top - tooltipRect.height - offsetY,
              left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + offsetX,
            };
          case 'bottom':
            return {
              top: targetRect.bottom + offsetY,
              left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + offsetX,
            };
          case 'left':
            return {
              top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + offsetY,
              left: targetRect.left - tooltipRect.width - offsetY,
            };
          case 'right':
            return {
              top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + offsetY,
              left: targetRect.right + offsetY,
            };
        }
      };

      let position = step.position || 'bottom';
      let coords = coordsFor(position);
      const isVertical = position === 'top' || position === 'bottom';

      // Does the CHOSEN side's coordinates actually fit on its primary axis
      // (the axis that determines which side it visually reads as)?
      const overflows = (p: { top: number; left: number }, vertical: boolean) =>
        vertical
          ? p.top < EDGE_PADDING || p.top + tooltipRect.height > vh - EDGE_PADDING
          : p.left < EDGE_PADDING || p.left + tooltipRect.width > vw - EDGE_PADDING;

      if (overflows(coords, isVertical)) {
        const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const;
        const flippedPosition = opposite[position];
        const flippedCoords = coordsFor(flippedPosition)!;

        // Only actually flip if the opposite side genuinely fits better -
        // previously this decision was made from a coarse "estimated space"
        // heuristic computed BEFORE knowing the real coordinates, then a
        // separate, unconditional clamp silently overrode whichever side
        // had been chosen, dragging a "right"-positioned tooltip back
        // toward (or past) the target whenever it was near a screen edge -
        // which is exactly what looked like landing on the wrong side.
        if (!overflows(flippedCoords, isVertical)) {
          position = flippedPosition;
          coords = flippedCoords;
        }
      }

      let { top, left } = coords;

      // Clamp only the SECONDARY (cross) axis for viewport safety - e.g. a
      // left/right tooltip whose vertical center would push it off the top
      // or bottom of the screen gets nudged without changing which side
      // it's on.
      if (isVertical) {
        left = Math.max(EDGE_PADDING, Math.min(left, vw - tooltipRect.width - EDGE_PADDING));
      } else {
        top = Math.max(EDGE_PADDING, Math.min(top, vh - tooltipRect.height - EDGE_PADDING));
      }

      // Last-resort safety clamp on the primary axis too, only for the
      // genuinely-impossible case where neither the chosen nor flipped side
      // fits at all (e.g. a viewport smaller than the tooltip itself) -
      // prevents fully off-screen rendering without routinely overriding a
      // choice that already fits, unlike before.
      top = Math.max(EDGE_PADDING, Math.min(top, vh - tooltipRect.height - EDGE_PADDING));
      left = Math.max(EDGE_PADDING, Math.min(left, vw - tooltipRect.width - EDGE_PADDING));

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10000,
      });
      setResolvedPosition(position);
    };

    const debouncedUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updatePosition);
    };

    // First pass: gets `position: fixed` applied at all (starting from the
    // default in-flow state). Second pass, scheduled only after the first
    // has actually committed: re-measures now that fixed positioning is in
    // effect, since `width: auto` resolves very differently in-flow
    // (fills available width, up to max-width) versus once fixed
    // (shrink-wraps to content) - without this second pass, whatever width
    // the first measurement happened to produce is what the flip/clamp
    // decision is permanently based on for that step.
    initialRafId = requestAnimationFrame(() => {
      updatePosition();
      secondPassRafId = requestAnimationFrame(updatePosition);
    });

    window.addEventListener('scroll', debouncedUpdate, true);
    window.addEventListener('resize', debouncedUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(initialRafId);
      cancelAnimationFrame(secondPassRafId);
      window.removeEventListener('scroll', debouncedUpdate, true);
      window.removeEventListener('resize', debouncedUpdate);
    };
  }, [targetElement, step.position, step.offset, step.target]);

  if (!targetElement) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`nfsfu234-tour-tooltip ${tooltipClassName}`.trim()}
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-label={`Tour step ${stepIndex + 1} of ${totalSteps}`}
      tabIndex={-1}
      onKeyDown={handleTooltipKeyDown}
      style={{
        ...tooltipStyle,
        width: isMobile() ? '90%' : 'auto',
        ['--nfsfu234-tour-tooltip-bg' as string]: themeConfig.tooltipBg,
        ['--nfsfu234-tour-tooltip-text' as string]: themeConfig.tooltipText,
        ['--nfsfu234-tour-tooltip-border' as string]: themeConfig.tooltipBorder,
      }}
    >
      <p className="nfsfu234-tour-content">
        {content}
      </p>

      {showProgress && (
        <div
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          className="nfsfu234-tour-progress-track"
          style={{ ['--nfsfu234-tour-progress-bg' as string]: themeConfig.progressBar }}
        >
          <div
            className="nfsfu234-tour-progress-fill"
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              ['--nfsfu234-tour-accent' as string]: accentColor,
            }}
          />
        </div>
      )}

      <div className="nfsfu234-tour-actions">
        <button
          ref={firstFocusableRef}
          onClick={onSkip}
          aria-label="Skip tour"
          className="nfsfu234-tour-btn nfsfu234-tour-btn-skip"
          style={{ ['--nfsfu234-tour-tooltip-text' as string]: themeConfig.tooltipText }}
        >
          {buttonLabels.skip}
        </button>

        <div className="nfsfu234-tour-actions-right">
          <button
            onClick={onPrevious}
            disabled={stepIndex === 0}
            aria-label="Previous step"
            className="nfsfu234-tour-btn nfsfu234-tour-btn-secondary"
            style={{
              opacity: stepIndex === 0 ? 0.5 : 1,
              cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
              ['--nfsfu234-tour-button-bg' as string]: themeConfig.buttonBg,
              ['--nfsfu234-tour-button-text' as string]: themeConfig.buttonText,
            }}
          >
            {buttonLabels.previous}
          </button>

          <button
            ref={lastFocusableRef}
            onClick={onNext}
            aria-label={stepIndex < totalSteps - 1 ? 'Next step' : 'Finish tour'}
            className="nfsfu234-tour-btn nfsfu234-tour-btn-primary"
            style={{ ['--nfsfu234-tour-accent' as string]: accentColor }}
          >
            {stepIndex < totalSteps - 1 ? buttonLabels.next : buttonLabels.finish}
          </button>
        </div>
      </div>

      <div style={getArrowStyle(resolvedPosition, themeConfig.tooltipBg)} />
    </div>,
    document.body
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN TOUR COMPONENT
// ────────────────────────────────────────────────────────────────────────────────

/**
 * Lightweight, zero-dependency React product tour / onboarding component.
 *
 * Features:
 * - Optional welcome screen with scroll lock
 * - Step-by-step tooltips with target highlighting & progress bar
 * - Device-specific steps (mobile / desktop / both)
 * - Smart adaptive tooltip positioning (auto-flips when space is limited)
 * - Reactive to browser resize and orientation changes
 * - Clean unmount: removes backdrop & unlocks body scroll when finished
 * - Optional "Built with NFSFU234TourGuide" branding badge (showBranding prop)
 *
 * @example
 * <Tour
 *   steps={[{ target: '#hero', content: 'Welcome!' }]}
 *   isActive={true}
 *   welcomeScreen={{ enabled: true, title: 'Hello!' }}
 *   showBranding={false} // opt out of the badge
 * />
 */
export default function Tour({
  tourId = 'nfsfu234-tour-guide',
  steps,
  isActive = true,
  theme: themeProp,
  customTheme: customThemeProp,
  accentColor: accentColorProp,
  onComplete,
  onSkip,
  onStart,
  onStepChange,
  welcomeScreen,
  buttonLabels: buttonLabelsProp,
  showProgress = true,
  showBranding: showBrandingProp,
  className = '',
  overlayClassName = '',
  tooltipClassName = '',
  highlightClassName = 'nfsfu234-tour-highlight',
}: TourProps) {
  // ── Configuration ────────────────────────────────────────────────────────────

  const globalConfig = useTourConfig();

  const theme = themeProp ?? globalConfig.theme ?? 'dark';
  const customTheme = customThemeProp ?? globalConfig.customTheme;
  const accentColor = accentColorProp ?? globalConfig.accentColor ?? '#10b981';
  const showBranding = showBrandingProp ?? globalConfig.showBranding ?? true;

  const welcomeConfig = useMemo(() => ({ ...DEFAULT_WELCOME_SCREEN, ...welcomeScreen }), [welcomeScreen]);
  const labels = { ...DEFAULT_BUTTON_LABELS, ...globalConfig.buttonLabels, ...buttonLabelsProp };
  const themeConfig = customTheme || (theme !== 'custom' ? THEME_PRESETS[theme] : THEME_PRESETS.dark);

  // ── Reactive device detection ───────────────────────────────────────────────

  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'desktop'>(isMobile() ? 'mobile' : 'desktop');

  useEffect(() => {
    const checkDevice = () => {
      setCurrentDevice(isMobile() ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', checkDevice);
    checkDevice();

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ── Filtered steps (updates when device changes) ─────────────────────────────

  const filteredSteps = useMemo(
    () => steps.filter((step) => shouldShowStep(step, currentDevice)),
    [steps, currentDevice]
  );

  // ── Phase & step state ───────────────────────────────────────────────────────

  const [phase, setPhase] = useState<'welcome' | 'active' | 'done'>(
    welcomeConfig.enabled ? 'welcome' : filteredSteps.length > 0 ? 'active' : 'done'
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  const welcomeContainerRef = useRef<HTMLDivElement>(null);
  const welcomeFirstFocusableRef = useRef<HTMLButtonElement>(null);
  const welcomeLastFocusableRef = useRef<HTMLButtonElement>(null);

  /** Same Escape-to-skip + Tab-wrap pattern as the step Tooltip, for the welcome dialog. */
  const handleWelcomeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleSkip();
      return;
    }

    if (e.key !== 'Tab') return;

    const first = welcomeFirstFocusableRef.current;
    const last = welcomeLastFocusableRef.current;
    if (!first || !last) return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // ── Lifecycle & reset ────────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      setPhase(welcomeConfig.enabled ? 'welcome' : filteredSteps.length > 0 ? 'active' : 'done');
      setCurrentStep(0);
    }
  }, [isActive, welcomeConfig.enabled, filteredSteps.length]);

  // ── Auto-skip to next valid step if current becomes invalid after resize ─────

  useEffect(() => {
    if (phase !== 'active') return;

    const current = filteredSteps[currentStep];
    if (!current || !shouldShowStep(current, currentDevice)) {
      const nextValidIndex = filteredSteps.findIndex(
        (s, i) => i > currentStep && shouldShowStep(s, currentDevice)
      );

      if (nextValidIndex !== -1) {
        setCurrentStep(nextValidIndex);
        onStepChange?.(nextValidIndex);
      } else {
        setPhase('done');
        onComplete?.();
      }
    }
  }, [currentDevice, filteredSteps, currentStep, phase, onStepChange, onComplete]);

  // ── Scroll lock when welcome screen is active ────────────────────────────────
  useEffect(() => {
    if (!mounted || !isActive || phase !== 'welcome') return;

    const scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    };
  }, [mounted, isActive, phase]);

  // Move focus into the welcome dialog as soon as it opens, matching the
  // Tooltip's same behavior for step-by-step focus management.
  useEffect(() => {
    if (isActive && phase === 'welcome') {
      welcomeFirstFocusableRef.current?.focus();
    }
  }, [isActive, phase]);

  // ── Navigation handlers ──────────────────────────────────────────────────────

  const handleStart = () => {
    setPhase('active');
    setCurrentStep(0);
    onStart?.();
    onStepChange?.(0);
  };

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    } else {
      setPhase('done');
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev);
    }
  };

  const handleSkip = () => {
    setPhase('done');
    onSkip?.();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop: hidden during welcome (welcome has its own overlay effect) */}
      {isActive && phase === 'active' && (
        <div
          className={`nfsfu234-tour-backdrop ${overlayClassName}`.trim()}
          onClick={handleSkip}
          style={{ ['--nfsfu234-tour-backdrop' as string]: themeConfig.backdrop }}
          aria-hidden="true"
        />
      )}

      {/* Welcome Screen */}
      {isActive && phase === 'welcome' && welcomeConfig.enabled && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="nfsfu234-tour-welcome-title"
          className="nfsfu234-tour-welcome-backdrop"
          onKeyDown={handleWelcomeKeyDown}
          style={{ ['--nfsfu234-tour-backdrop' as string]: themeConfig.backdrop }}
        >
          <div
            ref={welcomeContainerRef}
            className={`nfsfu234-tour-tooltip nfsfu234-tour-welcome-card ${tooltipClassName}`.trim()}
            style={{
              padding: isMobile() ? '24px' : '32px',
              ['--nfsfu234-tour-tooltip-bg' as string]: themeConfig.tooltipBg,
              ['--nfsfu234-tour-tooltip-text' as string]: themeConfig.tooltipText,
              ['--nfsfu234-tour-tooltip-border' as string]: themeConfig.tooltipBorder,
            }}
          >
            <div className="nfsfu234-tour-welcome-header">
              <h2 id="nfsfu234-tour-welcome-title" className="nfsfu234-tour-welcome-title">
                {welcomeConfig.title}
              </h2>
              <button
                ref={welcomeFirstFocusableRef}
                onClick={handleSkip}
                aria-label="Close welcome screen"
                className="nfsfu234-tour-btn nfsfu234-tour-welcome-close"
                style={{ ['--nfsfu234-tour-tooltip-text' as string]: themeConfig.tooltipText }}
              >
                ×
              </button>
            </div>

            <p className="nfsfu234-tour-welcome-message">
              {welcomeConfig.message}
            </p>

            <div className="nfsfu234-tour-welcome-actions">
              <button
                onClick={handleSkip}
                className="nfsfu234-tour-btn nfsfu234-tour-btn-skip"
                style={{ ['--nfsfu234-tour-tooltip-text' as string]: themeConfig.tooltipText }}
              >
                {labels.skip}
              </button>
              <button
                ref={welcomeLastFocusableRef}
                onClick={handleStart}
                className="nfsfu234-tour-btn nfsfu234-tour-welcome-start"
                style={{ ['--nfsfu234-tour-accent' as string]: accentColor }}
              >
                {welcomeConfig.startButtonText || labels.start}
              </button>
            </div>

            {/* ── Branding badge — opt out with showBranding={false} ── */}
            {showBranding && (
              <Branding color={themeConfig.tooltipText} />
            )}
          </div>
        </div>
      )}

      {/* Active tour tooltip */}
      {isActive && phase === 'active' && filteredSteps[currentStep] && (
        <Tooltip
          key={currentStep}
          step={filteredSteps[currentStep]}
          stepIndex={currentStep}
          totalSteps={filteredSteps.length}
          themeConfig={themeConfig}
          accentColor={accentColor}
          showProgress={showProgress}
          buttonLabels={labels}
          tooltipClassName={tooltipClassName}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )}

      {/* Styles — only injected while tour is active */}
      {isActive && phase !== 'done' && (
        <style>{`
          /* :where() keeps every rule below at zero specificity, so a
             consumer's own class (via tooltipClassName/overlayClassName)
             always wins on the cascade regardless of whether their
             stylesheet loads before or after this injected <style> tag. */

          :where(.nfsfu234-tour-backdrop) {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--nfsfu234-tour-backdrop, rgba(0, 0, 0, 0.75));
            z-index: 9998;
          }

          :where(.nfsfu234-tour-welcome-backdrop) {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--nfsfu234-tour-backdrop, rgba(0, 0, 0, 0.75));
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          :where(.nfsfu234-tour-tooltip) {
            background-color: var(--nfsfu234-tour-tooltip-bg, #18181b);
            color: var(--nfsfu234-tour-tooltip-text, #ffffff);
            border: 1px solid var(--nfsfu234-tour-tooltip-border, #3f3f46);
            border-radius: 12px;
            padding: 20px 24px;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            outline: none;
          }

          :where(.nfsfu234-tour-welcome-card) {
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
          }

          :where(.nfsfu234-tour-content) {
            margin-bottom: 16px;
            font-size: 15px;
            line-height: 1.6;
          }

          :where(.nfsfu234-tour-progress-track) {
            height: 4px;
            background-color: var(--nfsfu234-tour-progress-bg, #3f3f46);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 20px;
          }

          :where(.nfsfu234-tour-progress-fill) {
            height: 100%;
            background-color: var(--nfsfu234-tour-accent, #10b981);
            transition: width 0.3s ease;
          }

          :where(.nfsfu234-tour-actions) {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          :where(.nfsfu234-tour-actions-right) {
            display: flex;
            gap: 12px;
          }

          :where(.nfsfu234-tour-btn) {
            cursor: pointer;
            font-size: 14px;
          }

          :where(.nfsfu234-tour-btn-skip) {
            background: none;
            border: none;
            color: var(--nfsfu234-tour-tooltip-text, #ffffff);
            opacity: 0.7;
            padding: 8px 0;
            transition: opacity 0.15s ease;
          }
          :where(.nfsfu234-tour-btn-skip:hover) {
            opacity: 1;
          }

          :where(.nfsfu234-tour-btn-secondary) {
            padding: 8px 16px;
            border-radius: 8px;
            border: none;
            background-color: var(--nfsfu234-tour-button-bg, #27272a);
            color: var(--nfsfu234-tour-button-text, #ffffff);
          }

          :where(.nfsfu234-tour-btn-primary) {
            padding: 8px 20px;
            border-radius: 8px;
            border: none;
            background-color: var(--nfsfu234-tour-accent, #10b981);
            color: #ffffff;
            font-weight: 500;
          }

          :where(.nfsfu234-tour-welcome-header) {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }

          :where(.nfsfu234-tour-welcome-title) {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }

          :where(.nfsfu234-tour-welcome-close) {
            background: none;
            border: none;
            font-size: 28px;
            line-height: 1;
            color: var(--nfsfu234-tour-tooltip-text, #ffffff);
            opacity: 0.7;
            padding: 4px 8px;
            transition: opacity 0.15s ease;
          }
          :where(.nfsfu234-tour-welcome-close:hover) {
            opacity: 1;
          }

          :where(.nfsfu234-tour-welcome-message) {
            margin-bottom: 24px;
            font-size: 15px;
            line-height: 1.6;
            white-space: pre-line;
          }

          :where(.nfsfu234-tour-welcome-actions) {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
          }

          :where(.nfsfu234-tour-welcome-start) {
            padding: 12px 24px;
            border-radius: 12px;
            border: none;
            background-color: var(--nfsfu234-tour-accent, #10b981);
            color: #ffffff;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .nfsfu234-tour-active-target {
            position: relative !important;
            z-index: 9999 !important;
            box-shadow: 0 0 0 4px ${themeConfig.highlightRing || 'rgba(16, 185, 129, 0.5)'},
                        0 0 0 8px ${themeConfig.highlightRing ? themeConfig.highlightRing.replace('0.5', '0.2') : 'rgba(16, 185, 129, 0.2)'},
                        0 20px 40px rgba(0, 0, 0, 0.4) !important;
            border-radius: 12px;
            transition: box-shadow 0.3s ease;
            animation: nfsfu234-tour-pulse 2s ease-in-out infinite;
          }
          @keyframes nfsfu234-tour-pulse {
            0%, 100% {
              box-shadow: 0 0 0 4px ${themeConfig.highlightRing || 'rgba(16, 185, 129, 0.5)'},
                          0 0 0 8px ${themeConfig.highlightRing ? themeConfig.highlightRing.replace('0.5', '0.2') : 'rgba(16, 185, 129, 0.2)'},
                          0 20px 40px rgba(0, 0, 0, 0.4);
            }
            50% {
              box-shadow: 0 0 0 4px ${themeConfig.highlightRing || 'rgba(16, 185, 129, 0.7)'},
                          0 0 0 12px ${themeConfig.highlightRing ? themeConfig.highlightRing.replace('0.5', '0.3') : 'rgba(16, 185, 129, 0.3)'},
                          0 20px 40px rgba(0, 0, 0, 0.4);
            }
          }
        `}</style>
      )}
    </>
  );
}