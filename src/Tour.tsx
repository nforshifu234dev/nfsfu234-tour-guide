'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export interface TourStep {
  target: string;
  content: string;
  contentMobile?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
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
  highlightClassName?: string;
}

// ────────────────────────────────────────────────
// Tooltip Component (renders relative to target)
// ────────────────────────────────────────────────

function Tooltip({
  step,
  stepIndex,
  totalSteps,
  theme,
  accentColor,
  showProgress,
  buttonLabels,
  onNext,
  onPrevious,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  theme: 'light' | 'dark';
  accentColor: string;
  showProgress: boolean;
  buttonLabels: any;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and observe target element
  useEffect(() => {
    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) {
      console.warn(`Tour: Target "${step.target}" not found`);
      return;
    }

    setTargetElement(target);

    // Scroll target into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight class
    target.style.position = 'relative';
    target.style.zIndex = '9999';
    target.classList.add('tour-active-target');

    // Intersection observer to keep tooltip visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Target is out of view, scroll it back
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      target.classList.remove('tour-active-target');
      target.style.zIndex = '';
    };
  }, [step.target]);

  // Calculate tooltip position relative to target
  useEffect(() => {
    if (!targetElement || !tooltipRef.current) return;

    const updatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current!.getBoundingClientRect();
      
      const position = step.position || 'bottom';
      const offsetX = step.offset?.x ?? 0;
      const offsetY = step.offset?.y ?? 16;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - offsetY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + offsetX;
          break;
        case 'bottom':
          top = targetRect.bottom + offsetY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + offsetX;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + offsetY;
          left = targetRect.left - tooltipRect.width - offsetY;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + offsetY;
          left = targetRect.right + offsetY;
          break;
      }

      // Keep in viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      top = Math.max(16, Math.min(top, vh - tooltipRect.height - 16));
      left = Math.max(16, Math.min(left, vw - tooltipRect.width - 16));

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10000,
      });
    };

    // Initial position
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });

    // Update on scroll and resize
    const handleUpdate = () => requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [targetElement, step.position, step.offset]);

  if (!targetElement) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={`
        p-5 sm:p-6 rounded-xl shadow-2xl border max-w-sm w-[90%] sm:w-auto
        ${theme === 'dark' ? 'bg-zinc-900/98 text-white border-zinc-700' : 'bg-white/98 text-zinc-900 border-zinc-200'}
      `}
      style={tooltipStyle}
    >
      <p className="mb-4 text-base leading-relaxed">{step.content}</p>

      {showProgress && (
        <div className="h-1 bg-zinc-700 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <button onClick={onSkip} className="text-sm opacity-80 hover:opacity-100">
          {buttonLabels.skip || 'Skip'}
        </button>
        <div className="flex gap-3">
          <button
            onClick={onPrevious}
            disabled={stepIndex === 0}
            className={`px-4 py-2 rounded text-sm ${
              stepIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800'
            }`}
          >
            {buttonLabels.previous || 'Back'}
          </button>
          <button
            onClick={onNext}
            className="px-5 py-2 rounded text-sm font-medium text-white"
            style={{ backgroundColor: accentColor }}
          >
            {stepIndex < totalSteps - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
          </button>
        </div>
      </div>

      {/* Arrow pointing to target */}
      <div
        className="absolute w-0 h-0 border-8 border-transparent"
        style={getArrowStyle(step.position, theme)}
      />
    </div>,
    document.body
  );
}

// ────────────────────────────────────────────────
// Main Tour Component
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
  highlightClassName = 'tour-highlight',
}: TourProps) {
  const [phase, setPhase] = useState<'welcome' | 'active' | 'done'>(
    welcomeScreen.enabled ? 'welcome' : steps.length > 0 ? 'active' : 'done'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    setPhase('active');
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

  if (!mounted || !isActive || phase === 'done') return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[9998]"
        onClick={handleSkip}
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* Welcome Screen */}
      {phase === 'welcome' && welcomeScreen.enabled && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ width: '100vw', height: '100vh' }}
        >
          <div
            className={`
              p-6 sm:p-8 rounded-2xl shadow-2xl border max-w-md w-[90%]
              ${theme === 'dark' ? 'bg-zinc-900/98 text-white border-zinc-700' : 'bg-white/98 text-zinc-900 border-zinc-200'}
            `}
          >
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-2xl font-bold">{welcomeScreen.title || 'Welcome'}</h2>
              <button
                onClick={handleSkip}
                aria-label="Skip tour"
                className="p-2 hover:opacity-80 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="mb-6 whitespace-pre-line text-base leading-relaxed">
              {welcomeScreen.message || 'Let me guide you through the key features.'}
            </p>
            <div className="flex justify-end gap-4">
              <button onClick={handleSkip} className="text-sm opacity-80 hover:opacity-100">
                {buttonLabels.skip || 'Skip Tour'}
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-xl font-medium text-white shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {welcomeScreen.startButtonText || buttonLabels.start || 'Start Tour'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Tour Tooltip */}
      {phase === 'active' && (
        <Tooltip
          key={currentStep}
          step={steps[currentStep]}
          stepIndex={currentStep}
          totalSteps={steps.length}
          theme={theme}
          accentColor={accentColor}
          showProgress={showProgress}
          buttonLabels={buttonLabels}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────
// Arrow Helper
// ────────────────────────────────────────────────

function getArrowStyle(position?: string, theme?: string) {
  const color = theme === 'dark' ? '#27272a' : '#f4f4f5';

  switch (position) {
    case 'top':
      return {
        bottom: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: color,
      };
    case 'bottom':
      return {
        top: '-16px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: color,
      };
    case 'left':
      return {
        right: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderLeftColor: color,
      };
    case 'right':
      return {
        left: '-16px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRightColor: color,
      };
    default:
      return { display: 'none' };
  }
}
