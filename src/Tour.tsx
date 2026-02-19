'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeConfig, ButtonLabels, WelcomeScreenConfig, TourStep, TourProps } from './types';

// ════════════════════════════════════════════════════════════════════════════════
// THEME PRESETS
// ════════════════════════════════════════════════════════════════════════════════

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
  message: 'Let\'s guide you through the key features.',
  startButtonText: 'Start Tour',
};

// ════════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════════════════════

function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

function shouldShowStep(step: TourStep): boolean {
  if (!step.device || step.device === 'both') return true;
  return isMobile() ? step.device === 'mobile' : step.device === 'desktop';
}

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

// ════════════════════════════════════════════════════════════════════════════════
// TOOLTIP COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

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
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get content based on device
  const content = isMobile() && step.contentMobile ? step.contentMobile : step.content;

  // Find and observe target element
  useEffect(() => {
    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) {
      console.warn(`[NFSFU234TourGuide] Target "${step.target}" not found in DOM`);
      return;
    }

    setTargetElement(target);

    // Scroll target into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight
    target.style.position = 'relative';
    target.style.zIndex = '9999';
    target.classList.add('nfsfu234-tour-active-target');

    // Watch if target goes out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      target.classList.remove('nfsfu234-tour-active-target');
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
      className={tooltipClassName}
      style={{
        ...tooltipStyle,
        backgroundColor: themeConfig.tooltipBg,
        color: themeConfig.tooltipText,
        border: `1px solid ${themeConfig.tooltipBorder}`,
        borderRadius: '12px',
        padding: '20px 24px',
        maxWidth: '400px',
        width: isMobile() ? '90%' : 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Content */}
      <p style={{ marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }}>
        {content}
      </p>

      {/* Progress Bar */}
      {showProgress && (
        <div
          style={{
            height: '4px',
            backgroundColor: themeConfig.progressBar,
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: accentColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            color: themeConfig.tooltipText,
            opacity: 0.7,
            cursor: 'pointer',
            fontSize: '14px',
            padding: '8px 0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
        >
          {buttonLabels.skip}
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onPrevious}
            disabled={stepIndex === 0}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: themeConfig.buttonBg,
              color: themeConfig.buttonText,
              cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: stepIndex === 0 ? 0.5 : 1,
              fontSize: '14px',
            }}
          >
            {buttonLabels.previous}
          </button>

          <button
            onClick={onNext}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: accentColor,
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {stepIndex < totalSteps - 1 ? buttonLabels.next : buttonLabels.finish}
          </button>
        </div>
      </div>

      {/* Arrow */}
      <div style={getArrowStyle(step.position, themeConfig.tooltipBg)} />
    </div>,
    document.body
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN TOUR COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export default function Tour({
  tourId = 'nfsfu234-tour-guide',
  steps,
  isActive = true,
  theme = 'dark',
  customTheme,
  accentColor = '#10b981',
  onComplete,
  onSkip,
  onStart,
  onStepChange,
  welcomeScreen,
  buttonLabels,
  showProgress = true,
  className = '',
  overlayClassName = '',
  tooltipClassName = '',
  highlightClassName = 'nfsfu234-tour-highlight',
}: TourProps) {
  // Merge configs
  const welcomeConfig = useMemo(() => ({ ...DEFAULT_WELCOME_SCREEN, ...welcomeScreen }), [welcomeScreen]);

  const labels = { ...DEFAULT_BUTTON_LABELS, ...buttonLabels };
  const themeConfig = customTheme || (theme !== 'custom' ? THEME_PRESETS[theme] : THEME_PRESETS.dark);

  // Filter steps by device
  const filteredSteps = useMemo(() => steps.filter(shouldShowStep), [steps]);

  const [phase, setPhase] = useState<'welcome' | 'active' | 'done'>(
    welcomeConfig.enabled ? 'welcome' : filteredSteps.length > 0 ? 'active' : 'done'
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Ref for welcome container so we can clean it up manually if needed
  const welcomeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isActive) {
      setPhase(welcomeConfig.enabled ? 'welcome' : filteredSteps.length > 0 ? 'active' : 'done');
      setCurrentStep(0);
    }
  }, [isActive, welcomeConfig.enabled, filteredSteps.length]);

  // Lock body scroll when welcome screen is active + cleanup welcome DOM node
  useEffect(() => {
    if (phase === 'welcome' && mounted) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Reset body scroll lock
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);

        // Force-remove welcome screen container if React didn't unmount it
        if (welcomeRef.current && welcomeRef.current.parentNode) {
          welcomeRef.current.parentNode.removeChild(welcomeRef.current);
        } else {
          // Fallback: find by characteristic styles (very specific to your welcome div)
          const staleWelcome = document.querySelector(
            'div[style*="position: fixed"][style*="inset: 0px"][style*="z-index: 9999"]'
          );
          if (staleWelcome && staleWelcome.parentNode) {
            staleWelcome.parentNode.removeChild(staleWelcome);
          }
        }
      };
    }
  }, [phase, mounted]);

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

  if (!mounted || !isActive || phase === 'done' || filteredSteps.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop - remains during active tour */}
      <div
        className={overlayClassName}
        onClick={handleSkip}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: themeConfig.backdrop,
          zIndex: 9998,
        }}
        aria-hidden="true"
      />

      {/* Welcome Screen */}
      {phase === 'welcome' && welcomeConfig.enabled && (
        <div
          ref={welcomeRef}
          key="welcome-screen"  // Helps React unmount correctly
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className={tooltipClassName}
            style={{
              backgroundColor: themeConfig.tooltipBg,
              color: themeConfig.tooltipText,
              border: `1px solid ${themeConfig.tooltipBorder}`,
              borderRadius: '16px',
              padding: isMobile() ? '24px' : '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {welcomeConfig.title}
              </h2>
              <button
                onClick={handleSkip}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: themeConfig.tooltipText,
                  opacity: 0.7,
                  padding: '4px 8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
              >
                ×
              </button>
            </div>

            {/* Message */}
            <p style={{ marginBottom: '24px', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {welcomeConfig.message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button
                onClick={handleSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: themeConfig.tooltipText,
                  opacity: 0.8,
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '12px 0',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
              >
                {labels.skip}
              </button>
              <button
                onClick={handleStart}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: accentColor,
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {welcomeConfig.startButtonText || labels.start}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Tour Tooltip */}
      {phase === 'active' && (
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

      {/* Inject highlight styles */}
      <style>{`
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
    </>
  );
}