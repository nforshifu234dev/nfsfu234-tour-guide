'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface TourStep {
  target: string;
  content: string;
  contentMobile?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offset?: { x?: number; y?: number };
  device?: 'desktop' | 'mobile' | 'both';
}

export interface TourProps {
  tourId?: string;
  steps: TourStep[];
  isActive?: boolean;
  theme?: 'light' | 'dark';
  accentColor?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onStart?: () => void;
  onStepChange?: (index: number) => void;
  welcomeScreen?: {
    enabled: boolean;
    title?: string;
    message?: string;
    startButtonText?: string;
  };
  buttonLabels?: {
    next?: string;
    previous?: string;
    skip?: string;
    finish?: string;
    start?: string;
  };
  showProgress?: boolean;
  className?: string;
  overlayClassName?: string;
  tooltipClassName?: string;
  highlightClassName?: string;
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────

export default function Tour({
  tourId = 'tour-guide',
  steps,
  isActive = true,
  theme = 'dark',
  accentColor = '#10b981',
  onComplete,
  onSkip,
  onStart,
  onStepChange,
  welcomeScreen = { enabled: false },
  buttonLabels = {},
  showProgress = true,
  className = '',
  overlayClassName = '',
  tooltipClassName = '',
  highlightClassName = 'tour-highlight',
}: TourProps) {
  const [phase, setPhase] = useState<'welcome' | 'step' | 'done'>(
    welcomeScreen.enabled ? 'welcome' : steps.length > 0 ? 'step' : 'done'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(isActive);
  const [mounted, setMounted] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
  });

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup highlights
  useEffect(() => {
    return () => {
      document.querySelectorAll(`.${highlightClassName}`).forEach(el => {
        el.classList.remove(highlightClassName);
      });
    };
  }, [highlightClassName]);

  // Position tooltip when step changes or window resizes
  useEffect(() => {
    if (!visible || !mounted || phase !== 'step') return;

    const step = steps[currentStep];
    if (!step) return;

    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) {
      console.warn(`Tour: Target "${step.target}" not found in DOM`);
      return;
    }

    target.classList.add(highlightClassName);
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    const updatePosition = () => {
      // Wait for tooltip ref to be ready
      if (!tooltipRef.current) {
        console.log('Tour: Tooltip ref not ready, retrying...');
        requestAnimationFrame(updatePosition);
        return;
      }

      const rect = target.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Get actual tooltip dimensions
      const tw = tooltipRef.current.offsetWidth;
      const th = tooltipRef.current.offsetHeight;

      // If dimensions are still 0, retry on next frame
      if (tw === 0 || th === 0) {
        console.log('Tour: Tooltip dimensions not ready, retrying...');
        requestAnimationFrame(updatePosition);
        return;
      }

      console.log('Tour: Target rect:', rect);
      console.log('Tour: Tooltip size:', { width: tw, height: th });

      let top = 0;
      let left = 0;
      let transform = '';

      const pos = step.position || 'bottom';
      const ox = step.offset?.x ?? 0;
      const oy = step.offset?.y ?? 16;

      switch (pos) {
        case 'top':
          top = rect.top - th - oy;
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
          left = rect.left - tw - 24 + ox;
          transform = 'translateY(-50%)';
          break;
        case 'right':
          top = rect.top + rect.height / 2 + oy;
          left = rect.right + 24 + ox;
          transform = 'translateY(-50%)';
          break;
        case 'center':
          top = rect.top + rect.height / 2;
          left = rect.left + rect.width / 2;
          transform = 'translate(-50%, -50%)';
          break;
      }

      // Keep tooltip in viewport
      top = Math.max(16, Math.min(top, vh - th - 16));
      left = Math.max(16, Math.min(left, vw - tw - 16));

      console.log('Tour: Calculated position:', { top, left, transform });

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform,
        opacity: 1,
        transition: 'top 0.3s ease, left 0.3s ease, opacity 0.3s ease',
      });
    };

    // Start with invisible tooltip
    setTooltipStyle(prev => ({ ...prev, opacity: 0 }));

    // Start positioning after scroll completes
    const scrollTimer = setTimeout(() => {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(updatePosition);
    }, 600);

    // Handle window resize
    const handleResize = () => {
      requestAnimationFrame(updatePosition);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('resize', handleResize);
      target.classList.remove(highlightClassName);
    };
  }, [currentStep, visible, mounted, phase, steps, highlightClassName]);

  // Navigation
  const handleStart = () => {
    setPhase('step');
    setCurrentStep(0);
    onStart?.();
    onStepChange?.(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    } else {
      setVisible(false);
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
    setVisible(false);
    setPhase('done');
    onSkip?.();
  };

  if (!mounted || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/60 z-[9998] ${overlayClassName}`} onClick={handleSkip} aria-hidden="true" />

      {/* Welcome */}
      {phase === 'welcome' && welcomeScreen.enabled && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div
            className={`
              pointer-events-auto p-6 sm:p-8 rounded-2xl shadow-2xl border max-w-md w-[90%]
              ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
            `}
          >
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-2xl font-bold">{welcomeScreen.title || 'Welcome'}</h2>
              <button onClick={handleSkip} aria-label="Skip tour" className="p-2 hover:opacity-80 text-2xl leading-none">
                ×
              </button>
            </div>
            <p className="mb-6 whitespace-pre-line text-base leading-relaxed">
              {welcomeScreen.message || 'Let me guide you through the key parts.'}
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={handleSkip} className="text-sm opacity-80 hover:opacity-100">
                {buttonLabels.skip || 'Skip Tour'}
              </button>
              <button
                onClick={handleStart}
                className={`px-6 py-3 rounded-xl font-medium text-white shadow-md`}
                style={{ backgroundColor: accentColor }}
              >
                {welcomeScreen.startButtonText || buttonLabels.start || 'Start Tour 🔥'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step tooltip - remount on step change */}
      {phase === 'step' && (
        <div
          key={`tooltip-${currentStep}`}
          ref={tooltipRef}
          className={`
            fixed z-[9999] p-5 sm:p-6 rounded-xl shadow-xl border max-w-sm w-[90%]
            pointer-events-auto
            ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
            ${tooltipClassName}
          `}
          style={tooltipStyle}
        >
          <p className="mb-4 text-base leading-relaxed">{steps[currentStep]?.content}</p>

          {showProgress && (
            <div className="h-1 bg-zinc-700 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, backgroundColor: accentColor }}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <button onClick={handleSkip} className="text-sm opacity-80 hover:opacity-100">
              {buttonLabels.skip || 'Skip'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded text-sm ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
              >
                {buttonLabels.previous || 'Back'}
              </button>
              <button
                onClick={handleNext}
                className={`px-5 py-2 rounded text-sm font-medium text-white`}
                style={{ backgroundColor: accentColor }}
              >
                {currentStep < steps.length - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
              </button>
            </div>
          </div>

          {/* Arrow */}
          <div
            className="absolute w-0 h-0 border-8 border-transparent"
            style={{
              ...getArrowStyle(steps[currentStep]?.position),
              borderColor: theme === 'dark' ? '#27272a' : '#f4f4f5',
            }}
          />
        </div>
      )}
    </>
  );
}

// Arrow helper
function getArrowStyle(position?: string) {
  switch (position) {
    case 'top':
      return {
        bottom: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: 'currentColor',
      };
    case 'bottom':
      return {
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: 'currentColor',
      };
    case 'left':
      return {
        right: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderLeftColor: 'currentColor',
      };
    case 'right':
      return {
        left: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRightColor: 'currentColor',
      };
    default:
      return { display: 'none' };
  }
}
