'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './index.css'; // Replace './styles.css'

// Interface for predefined welcome screen configuration
export interface PredefinedWelcomeConfig {
  title: string;
  message: string;
  startButtonText?: string;
}

// Interface for TourStep with offset for fine-tuning
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
  customPosition?: {
    top?: number | string;
    left?: number | string;
    transform?: string;
  };
  offset?: {
    x?: number;
    y?: number;
  };
  device?: 'desktop' | 'mobile' | 'both';
}

// Interface for TourProps
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
  welcomeScreen?: {
    enabled: boolean;
    content?: React.ReactNode | PredefinedWelcomeConfig;
  };
  buttonLabels?: {
    next?: string;
    previous?: string;
    skip?: string;
    finish?: string;
    start?: string;
  };
  showProgressDots?: boolean;
}

/**
 * A React component that renders an interactive guided tour.
 *
 * Props:
 * - tourId: A unique identifier for the tour.
 * - steps: An array of TourStep objects, each defining a step in the tour.
 * - theme: The theme of the tour, either 'light' or 'dark'.
 * - deviceMode: The device mode, can be 'desktop', 'tablet', or 'mobile'.
 * - isActive: A boolean to indicate whether the tour is currently active.
 * - onComplete: A callback function to be called when the tour is completed.
 * - onSkip: A callback function to be called when the tour is skipped.
 * - onStart: A callback function to be called when the tour is started.
 * - onStepChange: A callback function to be called when the tour step changes.
 * - welcomeScreen: An object containing welcome screen settings.
 * - buttonLabels: An object defining custom labels for navigation buttons.
 * - showProgressDots: A boolean to show or hide progress dots.
 *
 * The component manages the current step, visibility, and positioning of
 * tooltips. It also supports keyboard navigation and filters steps based on
 * the device mode. The tour can include a welcome screen, and it handles
 * transitions between steps with animations.
 */

export default function Tour({
  tourId, // eslint-disable-line @typescript-eslint/no-unused-vars
  steps = [],
  theme,
  deviceMode,
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

  // Detect if we’re on mobile
  const isMobile =
    deviceMode === 'mobile' ||
    (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

  // Filter steps based on device to prevent skipping irrelevant steps
  const filteredSteps = useMemo(() => {
    return steps.filter((step) => {
      if (!step.device || step.device === 'both') return true;
      return step.device === (isMobile ? 'mobile' : 'desktop');
    });
  }, [steps, isMobile]);

  // Sync isVisible with isActive prop
  useEffect(() => {
    setIsVisible(isActive);
    if (isActive && welcomeScreen.enabled && currentStep === -1) {
      onStart?.();
    }
  }, [isActive, welcomeScreen.enabled, currentStep, onStart]);

  // Find the target element
  const getTargetElement = (step: TourStep): Element | null => {
    const selector = step.target;
    let targetElement: Element | null = document.querySelector(selector);

    if (!targetElement && selector.startsWith('.')) {
      const elements = document.querySelectorAll(selector);
      targetElement = Array.from(elements).find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      }) || null;
    }

    return targetElement;
  };

  /**
   * Returns the content of the step based on the device mode.
   * If the `contentMobile` property is set and the device is mobile, it returns
   * `contentMobile`. If the `contentDesktop` property is set and the device is
   * desktop, it returns `contentDesktop`. Otherwise, it returns the `content`
   * property.
   * @param step The step object
   * @returns The content of the step
   */
  const getStepContent = (step: TourStep): string => {
    if (isMobile && step.contentMobile) {
      return step.contentMobile;
    } else if (!isMobile && step.contentDesktop) {
      return step.contentDesktop;
    }
    return step.content;
  };

  // Create arrow style using CSS triangles with the tip pointing toward the target
  const createArrowStyle = (
    position: string,
    rect: DOMRect,
    targetCenterX: number,
    targetCenterY: number,
    left: number,
    tooltipWidth: number,
    theme: string
  ): React.CSSProperties => {
    const baseArrow: React.CSSProperties = {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
      zIndex: -1,
    };

    const triangleColor = theme === 'dark' ? '#fff' : '#111827';
    let arrow: React.CSSProperties = { ...baseArrow };

    const borderRadiusOffset = '16px';
    const cornerVerticalOffset = '-7px';

    switch (position) {
      case 'top':
        arrow = {
          ...arrow,
          bottom: '-7px',
          left: '50%',
          borderWidth: '7px 7px 0 7px',
          borderColor: `${triangleColor} transparent transparent transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'top-left':
        arrow = {
          ...arrow,
          bottom: cornerVerticalOffset,
          left: borderRadiusOffset,
          borderWidth: '7px 7px 0 7px',
          borderColor: `${triangleColor} transparent transparent transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'top-right':
        arrow = {
          ...arrow,
          bottom: cornerVerticalOffset,
          right: borderRadiusOffset,
          borderWidth: '7px 7px 0 7px',
          borderColor: `${triangleColor} transparent transparent transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'bottom':
        arrow = {
          ...arrow,
          top: '-7px',
          left: '50%',
          borderWidth: '0 7px 7px 7px',
          borderColor: `transparent transparent ${triangleColor} transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '-1px -1px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'bottom-left':
        arrow = {
          ...arrow,
          top: '-7px',
          left: borderRadiusOffset,
          borderWidth: '0 7px 7px 7px',
          borderColor: `transparent transparent ${triangleColor} transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '-1px -1px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'bottom-right':
        arrow = {
          ...arrow,
          top: '-7px',
          right: borderRadiusOffset,
          borderWidth: '0 7px 7px 7px',
          borderColor: `transparent transparent ${triangleColor} transparent`,
          transform: 'translateX(-50%)',
          boxShadow: '-1px -1px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'left':
        arrow = {
          ...arrow,
          right: '-7px',
          top: '50%',
          borderWidth: '7px 7px 7px 0',
          borderColor: `transparent ${triangleColor} transparent transparent`,
          transform: 'translateY(-50%)',
          boxShadow: '2px -1px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'center-left':
        arrow = {
          ...arrow,
          left: '-7px',
          top: '50%',
          borderWidth: '7px 0 7px 7px',
          borderColor: `transparent transparent transparent ${triangleColor}`,
          transform: 'translateY(-50%)',
          boxShadow: '-1px 2px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'right':
        arrow = {
          ...arrow,
          left: '-7px',
          top: '50%',
          borderWidth: '7px 0 7px 7px',
          borderColor: `transparent transparent transparent ${triangleColor}`,
          transform: 'translateY(-50%)',
          boxShadow: '-1px 2px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
      case 'center-right':
        arrow = {
          ...arrow,
          right: '-7px',
          top: '50%',
          borderWidth: '7px 7px 7px 0',
          borderColor: `transparent ${triangleColor} transparent transparent`,
          transform: 'translateY(-50%)',
          boxShadow: '2px -1px 3px rgba(0, 0, 0, 0.1)',
        };
        break;
    }

    return arrow;
  };

  // Position the tooltip and scroll to the target element
  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

    const step = filteredSteps[currentStep];
    const targetElement = getTargetElement(step);

    if (!targetElement) {
      console.warn(
        `Tour target not found: ${step.target} (device: ${step.device || 'both'}, step: ${currentStep + 1}/${
          filteredSteps.length
        })`
      );
      if (navigationDirection !== 'backward' && currentStep < filteredSteps.length - 1) {
        setNavigationDirection('forward');
        setCurrentStep(currentStep + 1);
      }
      return;
    }

    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });

    const headerHeight = 64;
    const rect = targetElement.getBoundingClientRect();
    if (rect.top < headerHeight) {
      window.scrollBy({
        top: rect.top - headerHeight,
        behavior: 'smooth',
      });
    }

    if (step.customPosition) {
      setTooltipPosition({
        top: step.customPosition.top ?? '50%',
        left: step.customPosition.left ?? '50%',
      });
      setTooltipTransform(step.customPosition.transform ?? '');
      setArrowStyle({ display: 'none' });
      return;
    }

    if (step.position === 'center') {
      setArrowStyle({ display: 'none' });
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320;
    const tooltipHeight = 150;
    let top: number = 0;
    let left: number = 0;
    let transform = '';
    const position = step.position || 'bottom';
    const offsetX = step.offset?.x || 0;
    const offsetY = step.offset?.y || 0;

    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - 10 + offsetY;
        left = rect.left + rect.width / 2 + offsetX;
        transform = 'translateX(-50%)';
        break;
      case 'top-left':
        top = rect.top - tooltipHeight - 10 + offsetY;
        left = rect.left + offsetX;
        transform = '';
        break;
      case 'top-right':
        top = rect.top - tooltipHeight - 10 + offsetY;
        left = rect.right - tooltipWidth + offsetX;
        transform = '';
        break;
      case 'bottom':
        top = rect.bottom + 10 + offsetY;
        left = rect.left + rect.width / 2 + offsetX;
        transform = 'translateX(-50%)';
        break;
      case 'bottom-left':
        top = rect.bottom + 10 + offsetY;
        left = rect.left + offsetX;
        transform = '';
        break;
      case 'bottom-right':
        top = rect.bottom + 10 + offsetY;
        left = rect.right - tooltipWidth + offsetX;
        transform = '';
        break;
      case 'left':
        top = rect.top + rect.height / 2 + offsetY;
        left = rect.left - tooltipWidth - 10 + offsetX;
        transform = 'translateY(-50%)';
        break;
      case 'center-left':
        top = rect.top + rect.height / 2 + offsetY;
        left = rect.left + offsetX;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + rect.height / 2 + offsetY;
        left = rect.right + 10 + offsetX;
        transform = 'translateY(-50%)';
        break;
      case 'center-right':
        top = rect.top + rect.height / 2 + offsetY;
        left = rect.right - tooltipWidth + offsetX;
        transform = 'translateY(-50%)';
        break;
    }

    if (top < 10) top = 10;
    if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
    if (left < 10) left = 10;
    if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;

    setTooltipPosition({ top, left });
    setTooltipTransform(transform);

    const arrow = createArrowStyle(position, rect, targetCenterX, targetCenterY, left, tooltipWidth, theme);
    setArrowStyle(arrow);
  }, [currentStep, filteredSteps, isVisible, deviceMode, theme, navigationDirection]);

  // Highlight the target element
  useEffect(() => {
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

    const step = filteredSteps[currentStep];
    const targetElement = getTargetElement(step);
    if (!targetElement) return;

    targetElement.classList.add('tour-highlight');
    return () => {
      targetElement.classList.remove('tour-highlight');
    };
  }, [currentStep, filteredSteps, isVisible, deviceMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

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
  }, [currentStep, isVisible]);

  // Notify step change
  useEffect(() => {
    if (isVisible && currentStep >= 0) {
      onStepChange?.(currentStep);
    }
  }, [currentStep, isVisible, onStepChange]);

  // Navigation handlers
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
  }, [currentStep, filteredSteps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setNavigationDirection('backward');
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeTour();
    onSkip?.();
  }, [onSkip]);

  const completeTour = useCallback(() => {
    setIsVisible(false);
    setCurrentStep(welcomeScreen.enabled ? -1 : 0);
    onComplete?.();
  }, [onComplete, welcomeScreen.enabled]);

  if (!isVisible) return null;

  // Render welcome screen
  if (currentStep === -1 && welcomeScreen.enabled) {
    return (
      <AnimatePresence>
        <motion.div
          className={`fixed inset-0 z-[1000000] overflow-visible ${theme === 'dark' ? 'bg-black/50' : 'bg-black/60'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`p-6 rounded-2xl max-w-md w-full mx-auto mt-20 ${
              theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-gray-100'
            } shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 backdrop-blur-sm bg-opacity-90`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {welcomeScreen.content && typeof welcomeScreen.content === 'object' && !Array.isArray(welcomeScreen.content) &&
            'title' in welcomeScreen.content && 'message' in welcomeScreen.content ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold tracking-tight">{(welcomeScreen.content as PredefinedWelcomeConfig).title}</h3>
                  <button
                    onClick={handleSkip}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      theme === 'dark' ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-base leading-relaxed mb-6 font-medium">{(welcomeScreen.content as PredefinedWelcomeConfig).message}</p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSkip}
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                    } transition-colors duration-200`}
                  >
                    {buttonLabels.skip || 'Skip Tour'}
                  </button>
                  <button
                    onClick={handleStart}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                        : 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    {(welcomeScreen.content as PredefinedWelcomeConfig).startButtonText || buttonLabels.start || 'Start Tour'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {welcomeScreen.content}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={handleSkip}
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                    } transition-colors duration-200`}
                  >
                    {buttonLabels.skip || 'Skip Tour'}
                  </button>
                  <button
                    onClick={handleStart}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                        : 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    {buttonLabels.start || 'Start Tour'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentStep >= filteredSteps.length) return null;

  const step = filteredSteps[currentStep];
  const content = getStepContent(step);

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[1000000] overflow-visible ${theme === 'dark' ? 'bg-black/50' : 'bg-black/60'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {step.position === 'center' ? (
          <motion.div
            className={`p-6 rounded-2xl max-w-md w-full mx-auto mt-20 ${
              theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-gray-100'
            } shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 backdrop-blur-sm bg-opacity-90`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold tracking-tight">Welcome to the Tour!</h3>
              <button
                onClick={handleSkip}
                className={`p-2 rounded-full transition-all duration-200 ${
                  theme === 'dark' ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-base leading-relaxed mb-6 font-medium">{content}</p>
            <div className="mb-4">
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
                />
              </div>
              {showProgressDots && (
                <div className="flex justify-center gap-2 mt-2">
                  {filteredSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleSkip}
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                } transition-colors duration-200`}
              >
                {buttonLabels.skip || 'Skip Tour'}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentStep === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {buttonLabels.previous || 'Previous'}
                </button>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {currentStep + 1} / {filteredSteps.length}
                </span>
                <button
                  onClick={handleNext}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                      : 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {currentStep < filteredSteps.length - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className={`absolute p-5 rounded-xl max-w-sm min-w-[200px] ${
              theme === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-gray-100'
            } shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 backdrop-blur-sm bg-opacity-90`}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: tooltipTransform,
              margin: '0 10px',
            }}
            initial={{
              opacity: 0,
              y: step.position && (step.position as string).includes('top') ? 10 : step.position && (step.position as string).includes('bottom') ? -10 : 0,
              x: step.position && (step.position as string).includes('left') ? 10 : step.position && (step.position as string).includes('right') ? -10 : 0,
            }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{
              opacity: 0,
              y: step.position && (step.position as string).includes('top') ? 10 : step.position && (step.position as string).includes('bottom') ? -10 : 0,
              x: step.position && (step.position as string).includes('left') ? 10 : step.position && (step.position as string).includes('right') ? -10 : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="arrow" style={arrowStyle} />
            <p className="text-base leading-relaxed mb-4 font-medium">{content}</p>
            <div className="mb-3">
              <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="absolute h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
                />
              </div>
              {showProgressDots && (
                <div className="flex justify-center gap-1.5 mt-2">
                  {filteredSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleSkip}
                className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
                } transition-colors duration-200`}
              >
                {buttonLabels.skip || 'Skip'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentStep === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {buttonLabels.previous || 'Previous'}
                </button>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {currentStep + 1} / {filteredSteps.length}
                </span>
                <button
                  onClick={handleNext}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                      : 'bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}
                >
                  {currentStep < filteredSteps.length - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}