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
  const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
  const [visible, setVisible] = useState(isActive);
  const [mounted, setMounted] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Highlight + scroll + tooltip positioning
  useEffect(() => {
    if (!visible || !mounted || currentStep < 0) return;

    const step = steps[currentStep];
    if (!step) return;

    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) return;

    target.classList.add(highlightClassName);
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    // Position tooltip near target
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipW = tooltipRef.current?.offsetWidth || 320;
    const tooltipH = tooltipRef.current?.offsetHeight || 160;

    let top: number = 0;
    let left: number = 0;
    let transform = '';

    const pos = step.position || 'bottom';
    const ox = step.offset?.x ?? 0;
    const oy = step.offset?.y ?? 16;

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
      default:
        top = rect.top + rect.height / 2;
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -50%)';
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, vh - tooltipH - 16));
    left = Math.max(16, Math.min(left, vw - tooltipW - 16));

    setTooltipStyle({ top, left, transform });

    return () => {
      target.classList.remove(highlightClassName);
    };
  }, [currentStep, visible, mounted, steps, highlightClassName]);

  // Navigation
  const next = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      setVisible(false);
      onComplete?.();
    }
  };

  const prev = () => {
    if (currentStep > (welcomeScreen.enabled ? -1 : 0)) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      onStepChange?.(prevIndex);
    }
  };

  const skip = () => {
    setVisible(false);
    onSkip?.();
  };

  const start = () => {
    setCurrentStep(0);
    onStart?.();
    onStepChange?.(0);
  };

  if (!mounted || !visible) return null;

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  return (
    <div className={`fixed inset-0 z-[9999] ${overlayClassName} ${className}`}>
      {/* Full-screen backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={skip} aria-hidden="true" />

      {/* Welcome screen - centered */}
      {currentStep === -1 && welcomeScreen.enabled && (
        <div
          className={`
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            p-6 sm:p-8 rounded-2xl shadow-2xl border max-w-md w-[90%]
            ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
            pointer-events-auto
          `}
        >
          <div className="flex items-start justify-between mb-5">
            <h2 className="text-2xl font-bold">{welcomeScreen.title || 'Welcome'}</h2>
            <button onClick={skip} aria-label="Skip tour" className="p-2 hover:opacity-80">
              ×
            </button>
          </div>
          <p className="mb-6 whitespace-pre-line">{welcomeScreen.message || 'Let me guide you.'}</p>
          <div className="flex justify-end gap-4">
            <button onClick={skip} className="text-sm opacity-80 hover:opacity-100">
              {buttonLabels.skip || 'Skip'}
            </button>
            <button
              onClick={start}
              className={`px-6 py-3 rounded-xl font-medium text-white shadow-md`}
              style={{ backgroundColor: accentColor }}
            >
              {welcomeScreen.startButtonText || buttonLabels.start || 'Start'}
            </button>
          </div>
        </div>
      )}

      {/* Tooltip - positioned near target */}
      {step && (
        <div
          className={`
            fixed p-5 sm:p-6 rounded-xl shadow-xl border max-w-sm w-[90%]
            ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
            pointer-events-auto
            ${tooltipClassName}
          `}
          style={tooltipStyle}
        >
          <p className="mb-4 leading-relaxed">{step.content}</p>

          {showProgress && (
            <div className="h-1 bg-zinc-700 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, backgroundColor: accentColor }}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <button onClick={skip} className="text-sm opacity-80 hover:opacity-100">
              {buttonLabels.skip || 'Skip'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={prev}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded text-sm ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800'}`}
              >
                {buttonLabels.previous || 'Back'}
              </button>
              <button
                onClick={next}
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
              ...getArrowStyle(step.position),
              borderColor: theme === 'dark' ? '#ffffff' : '#111827',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Arrow position helper
function getArrowStyle(position?: string) {
  switch (position) {
    case 'top':
      return { bottom: '-8px', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom':
      return { top: '-8px', left: '50%', transform: 'translateX(-50%)' };
    case 'left':
      return { right: '-8px', top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { left: '-8px', top: '50%', transform: 'translateY(-50%)' };
    default:
      return { display: 'none' };
  }
}
