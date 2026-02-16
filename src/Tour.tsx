'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Interface definitions
export interface PredefinedWelcomeConfig {
  title: string;
  message: string;
  startButtonText?: string;
  position?: { top?: number | string; left?: number | string; transform?: string };
  mobilePosition?: { top?: number | string; left?: number | string; transform?: string };
}

export interface TourStep {
  target: string;
  content: string;
  contentDesktop?: string;
  contentMobile?: string;
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'center-left'
    | 'right'
    | 'center-right'
    | 'center';
  customPosition?: { top?: number | string; left?: number | string; transform?: string };
  offset?: { x?: number; y?: number };
  device?: 'desktop' | 'mobile' | 'both';
}

export interface TourProps {
  tourId: string;
  steps: TourStep[];
  theme: 'light' | 'dark';
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
  isActive?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStart?: () => void;
  onStepChange?: (stepIndex: number) => void;
  welcomeScreen?: { enabled: boolean; content?: React.ReactNode | PredefinedWelcomeConfig };
  buttonLabels?: { next?: string; previous?: string; skip?: string; finish?: string; start?: string };
  showProgressDots?: boolean;
}

export default function Tour({
  tourId,
  steps = [],
  theme,
  deviceMode = 'desktop',
  isActive = true,
  onComplete,
  onSkip,
  onStart,
  onStepChange,
  welcomeScreen = { enabled: false },
  buttonLabels = {},
  showProgressDots = false,
}: TourProps) {
  const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
  const [isVisible, setIsVisible] = useState(isActive);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number | string; left: number | string }>({ top: 0, left: 0 });
  const [tooltipTransform, setTooltipTransform] = useState<string>('');
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward' | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [welcomeStyle, setWelcomeStyle] = useState<React.CSSProperties>({});
  const [zIndex, setZIndex] = useState(2147483646);
  const [validSteps, setValidSteps] = useState<TourStep[]>(steps);
  const [isDomReady, setIsDomReady] = useState(false);
  const highlightedElements = useRef<Map<Element, { originalOverflow: string }>>(new Map());

  // Wait for element with retries
  const waitForElement = useCallback((selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const check = () => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);
        if (Date.now() - startTime > timeout) return resolve(null);
        setTimeout(check, 500);
      };
      if (document.readyState === 'complete') check();
      else window.addEventListener('load', check, { once: true });
    });
  }, []);

  // Create portal container and handle z-index
  useEffect(() => {
    const container = document.createElement('div');
    container.id = `tour-portal-${tourId}`;
    container.className = 'fixed inset-0 pointer-events-none';
    document.body.appendChild(container);
    setPortalContainer(container);

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';

    const updateZIndex = () => {
      const elements = document.querySelectorAll('*');
      let maxZIndex = 2147483646;
      elements.forEach((el) => {
        const z = parseInt(window.getComputedStyle(el).zIndex, 10);
        if (!isNaN(z) && z > maxZIndex && z < 2147483647) maxZIndex = z;
      });
      setZIndex(maxZIndex + 1);
    };
    updateZIndex();

    const observer = new MutationObserver(updateZIndex);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      observer.disconnect();
    };
  }, [tourId]);

  // Validate steps and ensure DOM readiness
  useEffect(() => {
    if (!isVisible) return;

    const validateSteps = async () => {
      const valid = [];
      for (const step of steps) {
        const element = await waitForElement(step.target);
        if (element) valid.push(step);
      }
      setValidSteps(valid);
      setIsDomReady(true);
      if (valid.length === 0 && steps.length > 0) {
        console.warn('No valid tour steps found. Tour will not proceed.');
        setIsVisible(false);
        onSkip?.();
      }
    };

    validateSteps();

    const observer = new MutationObserver(() => validateSteps());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [steps, isVisible, waitForElement, onSkip]);

  // Inject dynamic highlight styles
  useEffect(() => {
    if (!isVisible || !isDomReady) return;

    const styleId = `tour-styles-${tourId}`;
    let existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .tour-highlight-${tourId} {
          position: relative !important;
          z-index: ${zIndex - 1} !important;
          box-shadow: 0 0 8px 2px rgba(29, 78, 216, 0.5) !important;
          border: 2px solid rgba(29, 78, 216, 0.7) !important;
          border-radius: 6px !important;
          transition: all 0.3s ease !important;
        }
        .tour-overlay-${tourId} {
          pointer-events: auto !important;
          z-index: ${zIndex} !important;
          isolation: isolate;
        }
        .tour-content-${tourId} {
          pointer-events: auto !important;
          z-index: ${zIndex + 1} !important;
          isolation: isolate;
        }
        .tour-arrow-${tourId} {
          z-index: ${zIndex + 2} !important;
        }
        [data-theme="dark"] .tour-highlight-${tourId}, .dark .tour-highlight-${tourId} {
          box-shadow: 0 0 8px 2px rgba(37, 99, 235, 0.5) !important;
          border: 2px solid rgba(37, 99, 235, 0.7) !important;
        }
        .tour-overlay-${tourId}:not([style*="opacity: 1"]) .tour-highlight-${tourId} {
          box-shadow: none !important;
          border: none !important;
          z-index: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isVisible, isDomReady, tourId, zIndex]);

  // Detect device mode
  const isMobile = deviceMode === 'mobile' || deviceMode === 'tablet';

  // Filter steps based on device
  const filteredSteps = useMemo(() => {
    return validSteps.filter((step) => {
      if (!step.device || step.device === 'both') return true;
      return step.device === (isMobile ? 'mobile' : 'desktop');
    });
  }, [validSteps, isMobile]);

  // Sync isVisible with isActive prop
  useEffect(() => {
    setIsVisible(isActive && isDomReady);
    if (isActive && welcomeScreen.enabled && currentStep === -1 && isDomReady) {
      onStart?.();
    }
  }, [isActive, welcomeScreen.enabled, currentStep, onStart, isDomReady]);

  // Handle welcome screen positioning
  useEffect(() => {
    if (!isVisible || currentStep !== -1 || !welcomeScreen.enabled || !isDomReady) return;

    const updateResponsiveStyles = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const config = welcomeScreen.content as PredefinedWelcomeConfig;
      const hasCustomPosition = config?.position || (isMobile && config?.mobilePosition);

      let top = viewportHeight * 0.5;
      let left = viewportWidth * 0.5;
      let transform = 'translate(-50%, -50%)';

      if (hasCustomPosition) {
        let userTop = isMobile && config.mobilePosition?.top ? config.mobilePosition.top : config.position?.top ?? 0;
        let userLeft = isMobile && config.mobilePosition?.left ? config.mobilePosition.left : config.position?.left ?? 0;
        let userTransform = isMobile && config.mobilePosition?.transform ? config.mobilePosition.transform : config.position?.transform;

        if (typeof userTop === 'string') {
          userTop = parseFloat(userTop) * (userTop.endsWith('%') ? viewportHeight / 100 : userTop.endsWith('rem') ? 16 : 1);
        }
        if (typeof userLeft === 'string') {
          userLeft = parseFloat(userLeft) * (userLeft.endsWith('%') ? viewportWidth / 100 : userLeft.endsWith('rem') ? 16 : 1);
        }

        top += typeof userTop === 'number' ? userTop : 0;
        left += typeof userLeft === 'number' ? userLeft : 0;

        const welcomeWidth = Math.min(viewportWidth * 0.9, 448);
        const welcomeHeight = 300;
        top = Math.max(10, Math.min(top, viewportHeight - welcomeHeight - 10));
        left = Math.max(10, Math.min(left, viewportWidth - welcomeWidth - 10));

        setWelcomeStyle({
          position: 'absolute',
          top,
          left,
          transform: userTransform ?? transform,
        });
      } else {
        setWelcomeStyle({ top: '50%', left: '50%', transform });
      }
    };

    updateResponsiveStyles();
    const debouncedUpdate = debounce(updateResponsiveStyles, 100);
    window.addEventListener('resize', debouncedUpdate);
    return () => window.removeEventListener('resize', debouncedUpdate);
  }, [isVisible, currentStep, welcomeScreen, isMobile, isDomReady]);

  // Debounce utility
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Find target element
  const getTargetElement = useCallback(async (step: TourStep): Promise<Element | null> => {
    let targetElement = await waitForElement(step.target);
    if (!targetElement && step.target.startsWith('.')) {
      const elements = document.querySelectorAll(step.target);
      targetElement = Array.from(elements).find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      }) || null;
    }
    return targetElement;
  }, [waitForElement]);

  // Get step content
  const getStepContent = (step: TourStep): string => {
    if (isMobile && step.contentMobile) return step.contentMobile;
    if (!isMobile && step.contentDesktop) return step.contentDesktop;
    return step.content;
  };

  // Create arrow styles
  const createArrowStyle = useCallback(
    (position: string, theme: string): React.CSSProperties => {
      const baseArrow: React.CSSProperties = {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        zIndex: zIndex + 2,
      };
      const triangleColor = theme === 'dark' ? '#ffffff' : '#111827';

      switch (position) {
        case 'top':
          return {
            ...baseArrow,
            bottom: '-7px',
            left: '50%',
            borderWidth: '7px 7px 0 7px',
            borderColor: `${triangleColor} transparent transparent transparent`,
            transform: 'translateX(-50%)',
          };
        case 'bottom':
          return {
            ...baseArrow,
            top: '-7px',
            left: '50%',
            borderWidth: '0 7px 7px 7px',
            borderColor: `transparent transparent ${triangleColor} transparent`,
            transform: 'translateX(-50%)',
          };
        case 'left':
          return {
            ...baseArrow,
            right: '-7px',
            top: '50%',
            borderWidth: '7px 7px 7px 0',
            borderColor: `transparent ${triangleColor} transparent transparent`,
            transform: 'translateY(-50%)',
          };
        case 'right':
          return {
            ...baseArrow,
            left: '-7px',
            top: '50%',
            borderWidth: '7px 0 7px 7px',
            borderColor: `transparent transparent transparent ${triangleColor}`,
            transform: 'translateY(-50%)',
          };
        default:
          return { display: 'none' };
      }
    },
    [zIndex]
  );

  // Ensure element visibility
  const ensureVisible = useCallback((element: Element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.left >= 0 && 
      rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    if (!isVisible) {
      window.scrollBy({ top: rect.top - 50, left: rect.left - 50, behavior: 'smooth' });
    }
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.overflow === 'auto' || parentStyle.overflow === 'scroll') {
        parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      parent = parent.parentElement;
    }
  }, []);

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    const highlightClass = `tour-highlight-${tourId}`;
    highlightedElements.current.forEach(({ originalOverflow }, element) => {
      element.classList.remove(highlightClass);
      const parent = element.parentElement;
      if (parent && originalOverflow) {
        parent.style.overflow = originalOverflow;
      }
    });
    highlightedElements.current.clear();
  }, [tourId]);

  // Position tooltip
  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length || !isDomReady) return;

    const step = filteredSteps[currentStep];
    let isMounted = true;

    const updatePosition = async () => {
      const targetElement = await getTargetElement(step);
      if (!targetElement || !isMounted) {
        console.warn(`Tour target not found: ${step.target}`);
        if (navigationDirection !== 'backward' && currentStep < filteredSteps.length - 1) {
          setNavigationDirection('forward');
          setCurrentStep(currentStep + 1);
        } else {
          setIsVisible(false);
          onComplete?.();
        }
        return;
      }

      ensureVisible(targetElement);
      const rect = targetElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 320;
      const tooltipHeight = 150;
      let top: number = 0;
      let left: number = 0;
      let transform = '';
      const position = step.position || 'bottom';
      const offsetX = step.offset?.x || 0;
      const offsetY = step.offset?.y || 10;

      if (step.customPosition) {
        setTooltipPosition({
          top: step.customPosition.top ?? '50%',
          left: step.customPosition.left ?? '50%',
        });
        setTooltipTransform(step.customPosition.transform ?? '');
        setArrowStyle({ display: 'none' });
        return;
      }

      if (position === 'center') {
        setTooltipPosition({ top: '50%', left: '50%' });
        setTooltipTransform('translate(-50%, -50%)');
        setArrowStyle({ display: 'none' });
        return;
      }

      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - offsetY;
          left = rect.left + rect.width / 2 + offsetX;
          transform = 'translateX(-50%)';
          break;
        case 'bottom':
          top = rect.bottom + offsetY;
          left = rect.left + rect.width / 2 + offsetX;
          transform = 'translateX(-50%)';
          break;
        case 'left':
          top = rect.top + rect.height / 2 + offsetY;
          left = rect.left - tooltipWidth - 10 + offsetX;
          transform = 'translateY(-50%)';
          break;
        case 'right':
          top = rect.top + rect.height / 2 + offsetY;
          left = rect.right + 10 + offsetX;
          transform = 'translateY(-50%)';
          break;
        case 'top-left':
          top = rect.top - tooltipHeight - offsetY;
          left = rect.left + offsetX;
          transform = 'translateX(-10%)';
          break;
        case 'top-right':
          top = rect.top - tooltipHeight - offsetY;
          left = rect.right + offsetX;
          transform = 'translateX(-90%)';
          break;
        case 'bottom-left':
          top = rect.bottom + offsetY;
          left = rect.left + offsetX;
          transform = 'translateX(-10%)';
          break;
        case 'bottom-right':
          top = rect.bottom + offsetY;
          left = rect.right + offsetX;
          transform = 'translateX(-90%)';
          break;
        case 'center-left':
          top = rect.top + rect.height / 2 + offsetY;
          left = rect.left - tooltipWidth - 10 + offsetX;
          transform = 'translateY(-50%)';
          break;
        case 'center-right':
          top = rect.top + rect.height / 2 + offsetY;
          left = rect.right + 10 + offsetX;
          transform = 'translateY(-50%)';
          break;
      }

      top = Math.max(10, Math.min(top, viewportHeight - tooltipHeight - 10));
      left = Math.max(10, Math.min(left, viewportWidth - tooltipWidth - 10));

      setTooltipPosition({ top, left });
      setTooltipTransform(transform);
      setArrowStyle(createArrowStyle(position, theme));
    };

    updatePosition();
    const debouncedUpdate = debounce(updatePosition, 100);
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('scroll', debouncedUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('scroll', debouncedUpdate);
    };
  }, [isVisible, currentStep, filteredSteps, theme, navigationDirection, createArrowStyle, getTargetElement, ensureVisible, isDomReady]);

  // Highlight target element and adjust parent overflow
  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length || !isDomReady) {
      clearAllHighlights();
      return;
    }

    const step = filteredSteps[currentStep];
    let isMounted = true;

    const highlightElement = async () => {
      const targetElement = await getTargetElement(step);
      if (!targetElement || !isMounted) return;

      clearAllHighlights();

      const highlightClass = `tour-highlight-${tourId}`;
      targetElement.classList.add(highlightClass);

      const parent = targetElement.parentElement;
      let originalOverflow = '';
      if (parent) {
        originalOverflow = window.getComputedStyle(parent).overflow;
        if (originalOverflow.includes('hidden')) {
          parent.style.overflow = 'visible';
        }
      }

      highlightedElements.current.set(targetElement, { originalOverflow });

      return () => {
        if (isMounted) {
          targetElement.classList.remove(highlightClass);
          if (parent && originalOverflow) {
            parent.style.overflow = originalOverflow;
          }
          highlightedElements.current.delete(targetElement);
        }
      };
    };

    highlightElement();

    return () => {
      isMounted = false;
    };
  }, [currentStep, filteredSteps, isVisible, tourId, getTargetElement, isDomReady, clearAllHighlights]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible || !isDomReady) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === -1) {
          handleStart();
        } else {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isVisible, isDomReady]);

  // Notify step change
  useEffect(() => {
    if (isVisible && currentStep >= 0 && isDomReady) {
      onStepChange?.(currentStep);
    }
  }, [currentStep, isVisible, onStepChange, isDomReady]);

  // Navigation handlers
  const completeTour = useCallback(() => {
    clearAllHighlights();
    setIsVisible(false);
    setCurrentStep(welcomeScreen.enabled ? -1 : 0);
    onComplete?.();
  }, [onComplete, welcomeScreen.enabled, clearAllHighlights]);

  const handleStart = useCallback(() => {
    setCurrentStep(0);
    setNavigationDirection('forward');
    onStart?.();
  }, [onStart]);

  const handleNext = useCallback(() => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setNavigationDirection('forward');
    } else {
      completeTour();
    }
  }, [currentStep, filteredSteps.length, completeTour]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setNavigationDirection('backward');
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeTour();
    onSkip?.();
  }, [onSkip, completeTour]);

  if (!isVisible || !portalContainer || !isDomReady || filteredSteps.length === 0) return null;

const tourContent = (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className={`tour-overlay-${tourId} fixed inset-0 z-[${zIndex}] bg-black/60 backdrop-blur-sm`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop click to skip (optional but good UX) */}
        <div className="absolute inset-0" onClick={handleSkip} />

        {currentStep === -1 && welcomeScreen.enabled ? (
          // ─── Welcome Screen ────────────────────────────────────────
          <motion.div
            className={`
              tour-content-${tourId}
              fixed p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-[90%]
              border backdrop-blur-md
              ${theme === 'dark'
                ? 'bg-zinc-900/95 border-zinc-700/50 text-white'
                : 'bg-white/95 border-zinc-200/50 text-zinc-900'}
            `}
            style={welcomeStyle}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {welcomeScreen.content && typeof welcomeScreen.content === 'object' && 'title' in welcomeScreen.content ? (
              <>
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-xl sm:text-2xl font-bold">
                    {(welcomeScreen.content as PredefinedWelcomeConfig).title}
                  </h3>
                  <button
                    onClick={handleSkip}
                    className="p-2 rounded-full hover:bg-zinc-800/50 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-base leading-relaxed mb-6 opacity-90 whitespace-pre-line">
                  {(welcomeScreen.content as PredefinedWelcomeConfig).message}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {buttonLabels.skip || 'Skip Tour'}
                  </button>

                  <button
                    onClick={handleStart}
                    className={`
                      px-6 py-3 rounded-xl font-semibold text-white
                      ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}
                      transition-colors shadow-lg shadow-emerald-900/20
                    `}
                  >
                    {(welcomeScreen.content as PredefinedWelcomeConfig).startButtonText ||
                      buttonLabels.start ||
                      'Start Tour'}
                  </button>
                </div>
              </>
            ) : (
              welcomeScreen.content
            )}
          </motion.div>
        ) : (
          currentStep < filteredSteps.length && (
            // ─── Normal Tooltip ────────────────────────────────────────
            <motion.div
              className={`
                tour-content-${tourId}
                fixed p-5 sm:p-6 rounded-xl max-w-sm w-[90%] sm:w-auto
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              {/* Arrow */}
              <div
                className={`tour-arrow-${tourId} absolute w-0 h-0 border-8 border-transparent`}
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

              {/* Buttons */}
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
                    disabled={currentStep === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentStep === 0
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
    )}
  </AnimatePresence>
);

  return createPortal(tourContent, portalContainer);
}
