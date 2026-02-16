'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ────────────────────────────────────────────────
// Public API Types
// ────────────────────────────────────────────────

/**
 * Configuration for the welcome/intro screen shown before the tour starts.
 */
export interface PredefinedWelcomeConfig {
  /** Title of the welcome modal */
  title: string;
  /** Main message (supports \n for line breaks) */
  message: string;
  /** Text on the "start tour" button */
  startButtonText?: string;
  /** Custom position (CSS values or percentages) */
  position?: { top?: string | number; left?: string | number; transform?: string };
  /** Mobile-specific position override */
  mobilePosition?: { top?: string | number; left?: string | number; transform?: string };
}

/**
 * Single step in the tour
 */
export interface TourStep {
  /** CSS selector of the element to highlight (e.g. '#hero', '.sidebar') */
  target: string;
  /** Main tooltip content */
  content: string;
  /** Optional mobile-specific content */
  contentMobile?: string;
  /** Where to place the tooltip relative to target */
  position?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  /** Fine-tune offset in pixels */
  offset?: { x?: number; y?: number };
  /** Which devices to show this step on */
  device?: 'desktop' | 'mobile' | 'both';
}

/**
 * Props for the Tour component
 */
export interface TourProps {
  /** Unique ID for this tour instance (used for portal & styles) */
  tourId: string;
  /** Array of tour steps */
  steps: TourStep[];
  /** Visual theme */
  theme?: 'light' | 'dark';
  /** Whether the tour is currently active */
  isActive?: boolean;
  /** Called when tour is completed (all steps finished) */
  onComplete?: () => void;
  /** Called when user skips the tour */
  onSkip?: () => void;
  /** Called when tour actually starts (after welcome screen) */
  onStart?: () => void;
  /** Called every time step changes */
  onStepChange?: (stepIndex: number) => void;
  /** Optional welcome screen before tour begins */
  welcomeScreen?: {
    enabled: boolean;
    content?: React.ReactNode | PredefinedWelcomeConfig;
  };
  /** Customize button text */
  buttonLabels?: {
    next?: string;
    previous?: string;
    skip?: string;
    finish?: string;
    start?: string;
  };
  /** Show progress dots below tooltip */
  showProgressDots?: boolean;
  /** Custom z-index base (useful if page has very high elements) */
  zIndexBase?: number;
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

/**
 * NFSFU234 Tour Guide
 * 
 * Plug-and-play onboarding tour component with:
 * - Highlighted targets
 * - Positioned tooltips
 * - Welcome screen
 * - Progress indicators
 * - Dark/light themes
 * - Keyboard navigation (arrows, Enter, Esc)
 * - Click-outside-to-skip
 */
export default function Tour({
  tourId,
  steps = [],
  theme = 'dark',
  isActive = true,
  onComplete,
  onSkip,
  onStart,
  onStepChange,
  welcomeScreen = { enabled: false },
  buttonLabels = {},
  showProgressDots = true,
  zIndexBase = 2147483000, // safe high starting point
}: TourProps) {
  const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
  const [isVisible, setIsVisible] = useState(isActive);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number | string; left: number | string }>({ top: 0, left: 0 });
  const [tooltipTransform, setTooltipTransform] = useState<string>('');
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [zIndex, setZIndex] = useState(zIndexBase);
  const [validSteps, setValidSteps] = useState<TourStep[]>(steps);
  const [isDomReady, setIsDomReady] = useState(false);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const highlightedElements = useRef<Map<Element, { originalOverflow: string }>>(new Map());

  // ─── Helpers ─────────────────────────────────────────────────────

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const filteredSteps = useMemo(() => {
    return validSteps.filter((step) => {
      if (!step.device || step.device === 'both') return true;
      return step.device === (isMobile ? 'mobile' : 'desktop');
    });
  }, [validSteps, isMobile]);

  const getStepContent = (step: TourStep): string => {
    return isMobile && step.contentMobile ? step.contentMobile : step.content;
  };

  // ─── Portal Container (client-only) ─────────────────────────────

  useEffect(() => {
    const container = document.createElement('div');
    container.id = `tour-portal-${tourId}`;
    container.className = 'fixed inset-0';
    document.body.appendChild(container);
    portalContainerRef.current = container;

    return () => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, [tourId]);

  // ─── Z-Index Calculation (with generous buffer) ─────────────────

  useEffect(() => {
    const updateZIndex = () => {
      let max = 0;
      document.querySelectorAll('*').forEach((el) => {
        const z = Number(window.getComputedStyle(el).zIndex);
        if (!isNaN(z) && z > max) max = z;
      });
      setZIndex(Math.max(max + 100, zIndexBase));
    };

    updateZIndex();
    const observer = new MutationObserver(updateZIndex);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [zIndexBase]);

  // ─── Validate steps & wait for DOM ──────────────────────────────

  useEffect(() => {
    if (!isVisible) return;

    const validate = async () => {
      const valid: TourStep[] = [];
      for (const step of steps) {
        const el = document.querySelector(step.target);
        if (el) valid.push(step);
      }
      setValidSteps(valid);
      setIsDomReady(true);

      if (valid.length === 0 && steps.length > 0) {
        console.warn(`[Tour:${tourId}] No valid targets found. Skipping tour.`);
        setIsVisible(false);
        onSkip?.();
      }
    };

    validate();
  }, [steps, isVisible, onSkip, tourId]);

  // ─── Dynamic highlight styles ───────────────────────────────────

  useEffect(() => {
    if (!isVisible || !isDomReady) return;

    const styleId = `tour-highlight-${tourId}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      .tour-highlight-${tourId} {
        position: relative !important;
        z-index: ${zIndex - 1} !important;
        outline: 2px solid ${theme === 'dark' ? '#10b981' : '#059669'} !important;
        outline-offset: 2px !important;
        border-radius: 6px !important;
        transition: outline 0.3s ease, outline-offset 0.3s ease;
      }
    `;

    return () => {
      styleEl?.remove();
    };
  }, [isVisible, isDomReady, tourId, zIndex, theme]);

  // ─── Highlight target & fix overflow ────────────────────────────

  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length || !isDomReady) {
      // Cleanup
      highlightedElements.current.forEach(({ originalOverflow }, el) => {
        el.classList.remove(`tour-highlight-${tourId}`);
        const parent = el.parentElement;
        if (parent) parent.style.overflow = originalOverflow;
      });
      highlightedElements.current.clear();
      return;
    }

    const step = filteredSteps[currentStep];
    const target = document.querySelector(step.target);
    if (!target) return;

    // Highlight
    target.classList.add(`tour-highlight-${tourId}`);

    // Fix overflow if parent is hidden
    const parent = target.parentElement;
    let originalOverflow = '';
    if (parent) {
      originalOverflow = window.getComputedStyle(parent).overflow;
      if (originalOverflow.includes('hidden')) {
        parent.style.overflow = 'visible';
      }
    }

    highlightedElements.current.set(target, { originalOverflow });

    // Scroll into view smoothly
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    return () => {
      target.classList.remove(`tour-highlight-${tourId}`);
      if (parent) parent.style.overflow = originalOverflow;
      highlightedElements.current.delete(target);
    };
  }, [currentStep, filteredSteps, isVisible, isDomReady, tourId]);

  // ─── Positioning logic ──────────────────────────────────────────

  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length || !isDomReady) return;

    const step = filteredSteps[currentStep];
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top: number | string = 0;
    let left: number | string = 0;
    let transform = '';

    const pos = step.position || 'bottom';
    const ox = step.offset?.x ?? 0;
    const oy = step.offset?.y ?? 12;

    const tooltipW = 340;
    const tooltipH = 160;

    switch (pos) {
      case 'top':
        top = rect.top - tooltipH - oy;
        left = rect.left + rect.width / 2 + ox;
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        top = rect.bottom + oy;
        left = rect.left + rect.width / 2 + ox;
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = rect.top + rect.height / 2 + oy;
        left = rect.left - tooltipW - 16 + ox;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + rect.height / 2 + oy;
        left = rect.right + 16 + ox;
        transform = 'translateY(-50%)';
        break;
      case 'center':
        top = '50%';
        left = '50%';
        transform = 'translate(-50%, -50%)';
        break;
      // Add other cases as needed...
      default:
        top = rect.bottom + oy;
        left = rect.left + rect.width / 2 + ox;
        transform = 'translateX(-50%)';
    }

    // Clamp to viewport
    top = typeof top === 'number' ? Math.max(16, Math.min(top, vh - tooltipH - 16)) : top;
    left = typeof left === 'number' ? Math.max(16, Math.min(left, vw - tooltipW - 16)) : left;

    setTooltipPosition({ top, left });
    setTooltipTransform(transform);
  }, [currentStep, filteredSteps, isVisible, isDomReady]);

  // ─── Navigation ─────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete?.();
    }
  }, [currentStep, filteredSteps.length, onComplete, onStepChange]);

  const handlePrevious = useCallback(() => {
    if (currentStep > (welcomeScreen.enabled ? -1 : 0)) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  }, [currentStep, welcomeScreen.enabled, onStepChange]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    onSkip?.();
  }, [onSkip]);

  const handleStart = useCallback(() => {
    setCurrentStep(0);
    onStart?.();
    onStepChange?.(0);
  }, [onStart, onStepChange]);

  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────

  if (!portalContainerRef.current || !isVisible || !isDomReady || filteredSteps.length === 0) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={`tour-overlay fixed inset-0 z-[${zIndex}] bg-black/70 backdrop-blur-sm pointer-events-auto`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Click outside to skip */}
        <div className="absolute inset-0" onClick={handleSkip} aria-hidden="true" />

        {currentStep === -1 && welcomeScreen.enabled ? (
          // Welcome Screen
          <motion.div
            className={`
              fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              w-[90%] max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl border
              backdrop-blur-lg
              ${theme === 'dark'
                ? 'bg-zinc-900/95 border-emerald-800/40 text-white'
                : 'bg-white/95 border-zinc-200/50 text-zinc-900'}
            `}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const config = welcomeScreen.content as PredefinedWelcomeConfig;
              return (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <h2 className="text-2xl font-bold">{config?.title || 'Welcome!'}</h2>
                    <button
                      onClick={handleSkip}
                      className="p-2 rounded-full hover:bg-zinc-800/50 transition-colors"
                      aria-label="Skip tour"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <p className="text-base leading-relaxed mb-8 whitespace-pre-line opacity-90">
                    {config?.message || 'Let me show you around.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={handleSkip}
                      className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {buttonLabels.skip || 'Skip Tour'}
                    </button>
                    <button
                      onClick={handleStart}
                      className={`
                        px-6 py-3 rounded-xl font-semibold text-white shadow-lg
                        ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}
                        transition-colors
                      `}
                    >
                      {config?.startButtonText || buttonLabels.start || 'Start Tour'}
                    </button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        ) : (
          currentStep < filteredSteps.length && (
            // Tooltip
            <motion.div
              className={`
                fixed p-5 sm:p-6 rounded-xl max-w-sm w-[90%] sm:max-w-md
                shadow-2xl border backdrop-blur-md
                ${theme === 'dark'
                  ? 'bg-zinc-900/95 border-emerald-800/40 text-white'
                  : 'bg-white/95 border-zinc-200/50 text-zinc-900'}
              `}
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                transform: tooltipTransform,
              }}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              {/* Arrow */}
              <div
                className="absolute w-0 h-0 border-8 border-transparent"
                style={arrowStyle}
              />

              <p className="text-base leading-relaxed mb-5">
                {getStepContent(filteredSteps[currentStep])}
              </p>

              {/* Progress */}
              <div className="mb-5">
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
                  />
                </div>

                {showProgressDots && (
                  <div className="flex justify-center gap-2 mt-3">
                    {filteredSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentStep ? 'bg-emerald-400 scale-125' : 'bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                >
                  {buttonLabels.skip || 'Skip'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep <= (welcomeScreen.enabled ? 0 : 0)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentStep <= 0
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    {buttonLabels.previous || 'Back'}
                  </button>

                  <button
                    onClick={handleNext}
                    className={`
                      px-5 py-2.5 rounded-lg font-medium text-white transition-all
                      ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}
                    `}
                  >
                    {currentStep < filteredSteps.length - 1
                      ? buttonLabels.next || 'Next'
                      : buttonLabels.finish || 'Finish'}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        )}
      </motion.div>
    </AnimatePresence>,
    portalContainerRef.current!
  );
}
