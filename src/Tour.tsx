// 'use client';
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { createPortal } from 'react-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X } from 'lucide-react';

// // Interface for predefined welcome screen configuration
// export interface PredefinedWelcomeConfig {
//   title: string;
//   message: string;
//   startButtonText?: string;
//   position?: {
//     top?: number | string; // e.g., 200, '200px', '50%'
//     left?: number | string; // e.g., 300, '300px', '50%'
//     transform?: string; // e.g., 'translate(-50%, -50%)'
//   };
//   mobilePosition?: {
//     top?: number | string;
//     left?: number | string;
//     transform?: string;
//   };
// }

// // Interface for TourStep with offset for fine-tuning
// export interface TourStep {
//   target: string;
//   content: string;
//   contentDesktop?: string;
//   contentMobile?: string;
//   position?:
//     | 'top'
//     | 'top-left'
//     | 'top-right'
//     | 'bottom'
//     | 'bottom-left'
//     | 'bottom-right'
//     | 'left'
//     | 'center-left'
//     | 'right'
//     | 'center-right'
//     | 'center';
//   customPosition?: {
//     top?: number | string;
//     left?: number | string;
//     transform?: string;
//   };
//   offset?: {
//     x?: number;
//     y?: number;
//   };
//   device?: 'desktop' | 'mobile' | 'both';
// }

// // Interface for TourProps
// export interface TourProps {
//   tourId: string;
//   steps: TourStep[];
//   theme: 'light' | 'dark';
//   deviceMode?: 'desktop' | 'tablet' | 'mobile';
//   isActive?: boolean;
//   onComplete?: () => void;
//   onSkip?: () => void;
//   onStart?: () => void;
//   onStepChange?: (stepIndex: number) => void;
//   welcomeScreen?: {
//     enabled: boolean;
//     content?: React.ReactNode | PredefinedWelcomeConfig;
//   };
//   buttonLabels?: {
//     next?: string;
//     previous?: string;
//     skip?: string;
//     finish?: string;
//     start?: string;
//   };
//   showProgressDots?: boolean;
// }

// /**
//  * A React component that renders an interactive guided tour with bulletproof z-index handling.
//  * Uses React portals to render outside the normal DOM hierarchy, preventing any z-index conflicts.
//  * Styled with Tailwind CSS, with dynamic highlight styles injected for theme support.
//  */
// export default function Tour({
//   tourId,
//   steps = [],
//   theme,
//   deviceMode,
//   isActive = true,
//   onComplete,
//   onSkip,
//   onStart,
//   onStepChange,
//   welcomeScreen = { enabled: false },
//   buttonLabels = {},
//   showProgressDots = false,
// }: TourProps) {
//   const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
//   const [isVisible, setIsVisible] = useState(isActive);
//   const [tooltipPosition, setTooltipPosition] = useState<{ top: number | string; left: number | string }>({ top: 0, left: 0 });
//   const [tooltipTransform, setTooltipTransform] = useState<string>('');
//   const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
//   const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward' | null>(null);
//   const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
//   const [welcomeStyle, setWelcomeStyle] = useState<React.CSSProperties>({});

//   // Create and manage portal container
//   useEffect(() => {
//     const container = document.createElement('div');
//     container.id = `tour-portal-${tourId}`;
//     container.className = 'fixed inset-0 pointer-events-none z-[2147483647]';
//     document.body.appendChild(container);
//     setPortalContainer(container);

//     return () => {
//       if (container && container.parentNode) {
//         container.parentNode.removeChild(container);
//       }
//     };
//   }, [tourId]);

//   // Inject dynamic styles for highlight effect
//   useEffect(() => {
//     if (!isVisible) return;

//     const styleId = `tour-styles-${tourId}`;
//     let existingStyle = document.getElementById(styleId);

//     if (!existingStyle) {
//       const style = document.createElement('style');
//       style.id = styleId;
//       style.textContent = `
//         .tour-highlight-${tourId} {
//           position: relative !important;
//           z-index: 2147483646 !important;
//           box-shadow: 0 0 8px 2px rgba(29, 78, 216, 0.5) !important; /* Light theme: bg-blue-700 */
//           border: 2px solid rgba(29, 78, 216, 0.7) !important;
//           border-radius: 6px !important;
//           transition: all 0.3s ease !important;
//         }

//         .tour-overlay-${tourId} {
//           pointer-events: auto !important;
//         }

//         .tour-content-${tourId} {
//           pointer-events: auto !important;
//         }

//         [data-theme="dark"] .tour-highlight-${tourId}, .dark .tour-highlight-${tourId} {
//           box-shadow: 0 0 8px 2px rgba(37, 99, 235, 0.5) !important; /* Dark theme: bg-blue-600 */
//           border: 2px solid rgba(37, 99, 235, 0.7) !important;
//         }
//       `;
//       document.head.appendChild(style);
//     }

//     return () => {
//       const style = document.getElementById(styleId);
//       if (style && style.parentNode) {
//         style.parentNode.removeChild(style);
//       }
//     };
//   }, [isVisible, tourId]);

//   // Detect if we're on mobile
//   const isMobile =
//     deviceMode === 'mobile' ||
//     (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

//   // Filter steps based on device
//   const filteredSteps = useMemo(() => {
//     return steps.filter((step) => {
//       if (!step.device || step.device === 'both') return true;
//       return step.device === (isMobile ? 'mobile' : 'desktop');
//     });
//   }, [steps, isMobile]);

//   // Sync isVisible with isActive prop
//   useEffect(() => {
//     setIsVisible(isActive);
//     if (isActive && welcomeScreen.enabled && currentStep === -1) {
//       onStart?.();
//     }
//   }, [isActive, welcomeScreen.enabled, currentStep, onStart]);

//   // Handle responsive welcome screen positioning
//   useEffect(() => {
//     if (!isVisible || currentStep !== -1 || !welcomeScreen.enabled) return;

//     const updateResponsiveStyles = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;

//       // Welcome screen styles
//       const config = welcomeScreen.content as PredefinedWelcomeConfig;
//       const hasCustomPosition = config?.position || (isMobile && config?.mobilePosition);

//       if (hasCustomPosition) {
//         // Default center position (50% viewport)
//         let defaultTop = viewportHeight * 0.5;
//         let defaultLeft = viewportWidth * 0.5;
//         let transform = 'translate(-50%, -50%)';

//         // User-provided offsets
//         let userTop: number | string = isMobile && config.mobilePosition?.top ? config.mobilePosition.top : config.position?.top ?? 0;
//         let userLeft: number | string = isMobile && config.mobilePosition?.left ? config.mobilePosition.left : config.position?.left ?? 0;
//         let userTransform = isMobile && config.mobilePosition?.transform ? config.mobilePosition.transform : config.position?.transform;

//         // Convert userTop and userLeft to pixels
//         if (typeof userTop === 'string') {
//           if (userTop.endsWith('rem')) {
//             userTop = parseFloat(userTop) * 16;
//           } else if (userTop.endsWith('%')) {
//             userTop = (parseFloat(userTop) / 100) * viewportHeight;
//           } else if (userTop.endsWith('px')) {
//             userTop = parseFloat(userTop);
//           }
//         }
//         if (typeof userLeft === 'string') {
//           if (userLeft.endsWith('rem')) {
//             userLeft = parseFloat(userLeft) * 16;
//           } else if (userLeft.endsWith('%')) {
//             userLeft = (parseFloat(userLeft) / 100) * viewportWidth;
//           } else if (userLeft.endsWith('px')) {
//             userLeft = parseFloat(userLeft);
//           }
//         }

//         // Calculate new position: default + offset
//         let top = defaultTop + (typeof userTop === 'number' ? userTop : 0);
//         let left = defaultLeft + (typeof userLeft === 'number' ? userLeft : 0);

//         // Boundary checks
//         const welcomeWidth = Math.min(viewportWidth * 0.9, 448); // w-[90%] or max-w-md
//         const welcomeHeight = 300; // Approximate height
//         if (top < 10) top = 10;
//         if (top + welcomeHeight > viewportHeight - 10) top = viewportHeight - welcomeHeight - 10;
//         if (left < 10) left = 10;
//         if (left + welcomeWidth > viewportWidth - 10) left = viewportWidth - welcomeWidth - 10;

//         setWelcomeStyle({
//           position: 'absolute',
//           top,
//           left,
//           transform: userTransform ?? transform,
//         });
//       } else {
//         // Default: rely on Flexbox centering
//         setWelcomeStyle({});
//       }
//     };

//     updateResponsiveStyles();
//     window.addEventListener('resize', updateResponsiveStyles);
//     return () => window.removeEventListener('resize', updateResponsiveStyles);
//   }, [isVisible, currentStep, welcomeScreen, isMobile]);

//   // Find the target element
//   const getTargetElement = (step: TourStep): Element | null => {
//     const selector = step.target;
//     let targetElement: Element | null = document.querySelector(selector);

//     if (!targetElement && selector.startsWith('.')) {
//       const elements = document.querySelectorAll(selector);
//       targetElement = Array.from(elements).find((el) => {
//         const rect = el.getBoundingClientRect();
//         return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
//       }) || null;
//     }

//     return targetElement;
//   };

//   const getStepContent = (step: TourStep): string => {
//     if (isMobile && step.contentMobile) {
//       return step.contentMobile;
//     } else if (!isMobile && step.contentDesktop) {
//       return step.contentDesktop;
//     }
//     return step.content;
//   };

//   const createArrowStyle = (
//     position: string,
//     rect: DOMRect,
//     targetCenterX: number,
//     targetCenterY: number,
//     left: number,
//     tooltipWidth: number,
//     theme: string
//   ): React.CSSProperties => {
//     const baseArrow: React.CSSProperties = {
//       position: 'absolute',
//       width: '0',
//       height: '0',
//       borderStyle: 'solid',
//       zIndex: 1,
//     };

//     const triangleColor = theme === 'dark' ? '#ffffff' : '#111827';
//     let arrow: React.CSSProperties = { ...baseArrow };

//     const borderRadiusOffset = '16px';
//     const cornerVerticalOffset = '-7px';

//     switch (position) {
//       case 'top':
//         arrow = {
//           ...arrow,
//           bottom: '-7px',
//           left: '50%',
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'top-left':
//         arrow = {
//           ...arrow,
//           bottom: cornerVerticalOffset,
//           left: borderRadiusOffset,
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'top-right':
//         arrow = {
//           ...arrow,
//           bottom: cornerVerticalOffset,
//           right: borderRadiusOffset,
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           left: '50%',
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom-left':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           left: borderRadiusOffset,
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom-right':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           right: borderRadiusOffset,
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'left':
//         arrow = {
//           ...arrow,
//           right: '-7px',
//           top: '50%',
//           borderWidth: '7px 7px 7px 0',
//           borderColor: `transparent ${triangleColor} transparent transparent`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(2px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'center-left':
//         arrow = {
//           ...arrow,
//           left: '-7px',
//           top: '50%',
//           borderWidth: '7px 0 7px 7px',
//           borderColor: `transparent transparent transparent ${triangleColor}`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'right':
//         arrow = {
//           ...arrow,
//           left: '-7px',
//           top: '50%',
//           borderWidth: '7px 0 7px 7px',
//           borderColor: `transparent transparent transparent ${triangleColor}`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'center-right':
//         arrow = {
//           ...arrow,
//           right: '-7px',
//           top: '50%',
//           borderWidth: '7px 7px 7px 0',
//           borderColor: `transparent ${triangleColor} transparent transparent`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(2px -1px 2px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//     }

//     return arrow;
//   };

//   // Position tooltip and handle scroll/resize
//   useEffect(() => {
//     if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

//     const step = filteredSteps[currentStep];
//     const targetElement = getTargetElement(step);

//     if (!targetElement) {
//       console.warn(
//         `Tour target not found: ${step.target} (device: ${step.device || 'both'}, step: ${currentStep + 1}/${filteredSteps.length})`
//       );
//       if (navigationDirection !== 'backward' && currentStep < filteredSteps.length - 1) {
//         setNavigationDirection('forward');
//         setCurrentStep(currentStep + 1);
//       }
//       return;
//     }

//     const updatePosition = () => {
//       targetElement.scrollIntoView({
//         behavior: 'smooth',
//         block: 'nearest',
//         inline: 'nearest',
//       });

//       const headerHeight = 64;
//       const rect = targetElement.getBoundingClientRect();
//       if (rect.top < headerHeight) {
//         window.scrollBy({
//           top: rect.top - headerHeight,
//           behavior: 'smooth',
//         });
//       }

//       if (step.customPosition) {
//         setTooltipPosition({
//           top: step.customPosition.top ?? '50%',
//           left: step.customPosition.left ?? '50%',
//         });
//         setTooltipTransform(step.customPosition.transform ?? '');
//         setArrowStyle({ display: 'none' });
//         return;
//       }

//       if (step.position === 'center') {
//         setTooltipPosition({ top: '50%', left: '50%' });
//         setTooltipTransform('translate(-50%, -50%)');
//         setArrowStyle({ display: 'none' });
//         return;
//       }

//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const tooltipWidth = 320;
//       const tooltipHeight = 150;
//       let top: number = 0;
//       let left: number = 0;
//       let transform = '';
//       const position = step.position || 'bottom';
//       const offsetX = step.offset?.x || 0;
//       const offsetY = step.offset?.y || 10;

//       const targetCenterX = rect.left + rect.width / 2;
//       const targetCenterY = rect.top + rect.height / 2;

//       switch (position) {
//         case 'top':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.left + rect.width / 2 + offsetX;
//           transform = 'translateX(-50%)';
//           break;
//         case 'top-left':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.left + offsetX;
//           transform = '';
//           break;
//         case 'top-right':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = '';
//           break;
//         case 'bottom':
//           top = rect.bottom + offsetY;
//           left = rect.left + rect.width / 2 + offsetX;
//           transform = 'translateX(-50%)';
//           break;
//         case 'bottom-left':
//           top = rect.bottom + offsetY;
//           left = rect.left + offsetX;
//           transform = '';
//           break;
//         case 'bottom-right':
//           top = rect.bottom + offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = '';
//           break;
//         case 'left':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.left - tooltipWidth - 10 + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'center-left':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.left + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'right':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.right + 10 + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'center-right':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//       }

//       if (top < 10) top = 10;
//       if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
//       if (left < 10) left = 10;
//       if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;

//       setTooltipPosition({ top, left });
//       setTooltipTransform(transform);

//       const arrow = createArrowStyle(position, rect, targetCenterX, targetCenterY, left, tooltipWidth, theme);
//       setArrowStyle(arrow);
//     };

//     updatePosition();

//     const handleResizeOrScroll = () => updatePosition();
//     window.addEventListener('resize', handleResizeOrScroll);
//     window.addEventListener('scroll', handleResizeOrScroll);

//     return () => {
//       window.removeEventListener('resize', handleResizeOrScroll);
//       window.removeEventListener('scroll', handleResizeOrScroll);
//     };
//   }, [currentStep, filteredSteps, isVisible, deviceMode, theme, navigationDirection]);

//   // Highlight the target element
//   useEffect(() => {
//     if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

//     const step = filteredSteps[currentStep];
//     const targetElement = getTargetElement(step);
//     if (!targetElement) return;

//     const highlightClass = `tour-highlight-${tourId}`;
//     targetElement.classList.add(highlightClass);

//     return () => {
//       targetElement.classList.remove(highlightClass);
//     };
//   }, [currentStep, filteredSteps, isVisible, tourId]);

//   // Keyboard navigation
//   useEffect(() => {
//     if (!isVisible) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowRight' || e.key === 'Enter') {
//         e.preventDefault();
//         if (currentStep === -1) {
//           handleStart();
//         } else {
//           handleNext();
//         }
//       } else if (e.key === 'ArrowLeft' && currentStep > 0) {
//         e.preventDefault();
//         handlePrevious();
//       } else if (e.key === 'Escape') {
//         e.preventDefault();
//         handleSkip();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [currentStep, isVisible]);

//   // Notify step change
//   useEffect(() => {
//     if (isVisible && currentStep >= 0) {
//       onStepChange?.(currentStep);
//     }
//   }, [currentStep, isVisible, onStepChange]);

//   // Navigation handlers
//   const completeTour = useCallback(() => {
//     setIsVisible(false);
//     setCurrentStep(welcomeScreen.enabled ? -1 : 0);
//     onComplete?.();
//   }, [onComplete, welcomeScreen.enabled]);

//   const handleStart = useCallback(() => {
//     setCurrentStep(0);
//     setNavigationDirection('forward');
//     onStart?.();
//   }, [onStart]);

//   const handleNext = useCallback(() => {
//     if (currentStep < filteredSteps.length - 1) {
//       setCurrentStep(currentStep + 1);
//       setNavigationDirection('forward');
//     } else {
//       completeTour();
//     }
//   }, [currentStep, filteredSteps.length, completeTour]);

//   const handlePrevious = useCallback(() => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//       setNavigationDirection('backward');
//     }
//   }, [currentStep]);

//   const handleSkip = useCallback(() => {
//     completeTour();
//     onSkip?.();
//   }, [onSkip, completeTour]);

//   if (!isVisible || !portalContainer) return null;

//   const tourContent = (
//     <AnimatePresence>
//       <motion.div
//         className={`tour-overlay-${tourId} fixed inset-0 flex items-center justify-center ${
//           theme === 'dark' ? 'bg-black/70' : 'bg-black/60'
//         }`}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         // style={{ zIndex: 2147483647 }}
//       >
//         {currentStep === -1 && welcomeScreen.enabled ? (
//           <motion.div
//             className={`tour-content-${tourId} p-6 rounded-2xl w-[90%] max-w-md backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//               theme === 'dark'
//                 ? 'bg-white text-gray-900 ring-gray-200/50'
//                 : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//             }`}
//             style={welcomeStyle}
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             transition={{ duration: 0.3, ease: 'easeOut' }}
//             role="dialog"
//             aria-labelledby={`tour-welcome-title-${tourId}`}
//           >
//             {welcomeScreen.content &&
//             typeof welcomeScreen.content === 'object' &&
//             !Array.isArray(welcomeScreen.content) &&
//             'title' in welcomeScreen.content &&
//             'message' in welcomeScreen.content ? (
//               <>
//                 <div className="flex justify-between items-center mb-4">
//                   <h3
//                     id={`tour-welcome-title-${tourId}`}
//                     className="text-xl font-bold tracking-tight"
//                   >
//                     {(welcomeScreen.content as PredefinedWelcomeConfig).title}
//                   </h3>
//                   <button
//                     onClick={handleSkip}
//                     className={`p-2 rounded-full transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
//                         : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
//                     }`}
//                     aria-label="Skip tour"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//                 <p className="text-base leading-relaxed mb-6 font-medium">
//                   {(welcomeScreen.content as PredefinedWelcomeConfig).message}
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <button
//                     onClick={handleSkip}
//                     className={`text-sm font-medium transition-colors duration-200 ${
//                       theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                     }`}
//                   >
//                     {buttonLabels.skip || 'Skip Tour'}
//                   </button>
//                   <button
//                     onClick={handleStart}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {(welcomeScreen.content as PredefinedWelcomeConfig).startButtonText ||
//                       buttonLabels.start ||
//                       'Start Tour'}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {welcomeScreen.content}
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     onClick={handleSkip}
//                     className={`text-sm font-medium transition-colors duration-200 ${
//                       theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                     }`}
//                   >
//                     {buttonLabels.skip || 'Skip Tour'}
//                   </button>
//                   <button
//                     onClick={handleStart}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {buttonLabels.start || 'Start Tour'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </motion.div>
//         ) : (
//           currentStep < filteredSteps.length &&
//           (filteredSteps[currentStep].position === 'center' ? (
//             <motion.div
//               className={`tour-content-${tourId} p-6 rounded-2xl max-w-md w-full mx-auto mt-20 backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//                 theme === 'dark'
//                   ? 'bg-white text-gray-900 ring-gray-200/50'
//                   : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//               }`}
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//               role="dialog"
//               aria-labelledby={`tour-step-title-${tourId}-${currentStep}`}
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3
//                   id={`tour-step-title-${tourId}-${currentStep}`}
//                   className="text-xl font-bold tracking-tight"
//                 >
//                   Welcome to the Tour!
//                 </h3>
//                 <button
//                   onClick={handleSkip}
//                   className={`p-2 rounded-full transition-all duration-200 ${
//                     theme === 'dark'
//                       ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
//                       : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
//                   }`}
//                   aria-label="Skip tour"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <p className="text-base leading-relaxed mb-6 font-medium">
//                 {getStepContent(filteredSteps[currentStep])}
//               </p>
//               <div className="mb-4">
//                 <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
//                   <div
//                     className="absolute h-2 bg-blue-500 rounded-full transition-all duration-300"
//                     style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
//                   />
//                 </div>
//                 {showProgressDots && (
//                   <div className="flex justify-center gap-2 mt-2">
//                     {filteredSteps.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-2 h-2 rounded-full ${
//                           index === currentStep
//                             ? 'bg-blue-500'
//                             : theme === 'dark'
//                             ? 'bg-gray-400'
//                             : 'bg-gray-500'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handleSkip}
//                   className={`text-sm font-medium transition-colors duration-200 ${
//                     theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                   }`}
//                 >
//                   {buttonLabels.skip || 'Skip Tour'}
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentStep === 0}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       currentStep === 0
//                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         : theme === 'dark'
//                         ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
//                         : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
//                     }`}
//                   >
//                     {buttonLabels.previous || 'Previous'}
//                   </button>
//                   <span
//                     className={`text-sm font-medium ${
//                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//                     }`}
//                   >
//                     {currentStep + 1} / {filteredSteps.length}
//                   </span>
//                   <button
//                     onClick={handleNext}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {currentStep < filteredSteps.length - 1
//                       ? buttonLabels.next || 'Next'
//                       : buttonLabels.finish || 'Finish'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               className={`tour-content-${tourId} absolute p-5 rounded-xl max-w-sm min-w-[200px] backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//                 theme === 'dark'
//                   ? 'bg-white text-gray-900 ring-gray-200/50'
//                   : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//               }`}
//               style={{
//                 top: tooltipPosition.top,
//                 left: tooltipPosition.left,
//                 transform: tooltipTransform,
//                 margin: '0 10px',
//               }}
//               initial={{
//                 opacity: 0,
//                 y: filteredSteps[currentStep].position?.includes('top')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('bottom')
//                   ? -10
//                   : 0,
//                 x: filteredSteps[currentStep].position?.includes('left')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('right')
//                   ? -10
//                   : 0,
//               }}
//               animate={{ opacity: 1, y: 0, x: 0 }}
//               exit={{
//                 opacity: 0,
//                 y: filteredSteps[currentStep].position?.includes('top')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('bottom')
//                   ? -10
//                   : 0,
//                 x: filteredSteps[currentStep].position?.includes('left')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('right')
//                   ? -10
//                   : 0,
//               }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//               role="dialog"
//               aria-labelledby={`tour-step-title-${tourId}-${currentStep}`}
//             >
//               <div className="arrow" style={arrowStyle} />
//               <p
//                 id={`tour-step-title-${tourId}-${currentStep}`}
//                 className="text-base leading-relaxed mb-4 font-medium"
//               >
//                 {getStepContent(filteredSteps[currentStep])}
//               </p>
//               <div className="mb-3">
//                 <div className="relative h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
//                   <div
//                     className="absolute h-1.5 bg-blue-500 rounded-full transition-all duration-300"
//                     style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
//                   />
//                 </div>
//                 {showProgressDots && (
//                   <div className="flex justify-center gap-1.5 mt-2">
//                     {filteredSteps.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           index === currentStep
//                             ? 'bg-blue-500'
//                             : theme === 'dark'
//                             ? 'bg-gray-400'
//                             : 'bg-gray-500'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handleSkip}
//                   className={`text-sm font-medium transition-colors duration-200 ${
//                     theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                   }`}
//                 >
//                   {buttonLabels.skip || 'Skip'}
//                 </button>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentStep === 0}
//                     className={`px-3 py-1 rounded-md text-sm font-medium text-white transition-all duration-200 ${
//                       currentStep === 0
//                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         : theme === 'dark'
//                         ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
//                         : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
//                     }`}
//                   >
//                     {buttonLabels.previous || 'Previous'}
//                   </button>
//                   <span
//                     className={`text-xs font-medium ${
//                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//                     }`}
//                   >
//                     {currentStep + 1} / {filteredSteps.length}
//                   </span>
//                   <button
//                     onClick={handleNext}
//                     className={`px-3 py-1 rounded-md text-sm font-medium text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {currentStep < filteredSteps.length - 1
//                       ? buttonLabels.next || 'Next'
//                       : buttonLabels.finish || 'Finish'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ))
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );

//   return createPortal(tourContent, portalContainer);
// }













// 'use client';
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { createPortal } from 'react-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X } from 'lucide-react';

// // Interface for predefined welcome screen configuration
// export interface PredefinedWelcomeConfig {
//   title: string;
//   message: string;
//   startButtonText?: string;
//   position?: {
//     top?: number | string; // e.g., 200, '200px', '50%'
//     left?: number | string; // e.g., 300, '300px', '50%'
//     transform?: string; // e.g., 'translate(-50%, -50%)'
//   };
//   mobilePosition?: {
//     top?: number | string;
//     left?: number | string;
//     transform?: string;
//   };
// }

// // Interface for TourStep with offset for fine-tuning
// export interface TourStep {
//   target: string;
//   content: string;
//   contentDesktop?: string;
//   contentMobile?: string;
//   position?:
//     | 'top'
//     | 'top-left'
//     | 'top-right'
//     | 'bottom'
//     | 'bottom-left'
//     | 'bottom-right'
//     | 'left'
//     | 'center-left'
//     | 'right'
//     | 'center-right'
//     | 'center';
//   customPosition?: {
//     top?: number | string;
//     left?: number | string;
//     transform?: string;
//   };
//   offset?: {
//     x?: number;
//     y?: number;
//   };
//   device?: 'desktop' | 'mobile' | 'both';
// }

// // Interface for TourProps
// export interface TourProps {
//   tourId: string;
//   steps: TourStep[];
//   theme: 'light' | 'dark';
//   deviceMode?: 'desktop' | 'tablet' | 'mobile';
//   isActive?: boolean;
//   onComplete?: () => void;
//   onSkip?: () => void;
//   onStart?: () => void;
//   onStepChange?: (stepIndex: number) => void;
//   welcomeScreen?: {
//     enabled: boolean;
//     content?: React.ReactNode | PredefinedWelcomeConfig;
//   };
//   buttonLabels?: {
//     next?: string;
//     previous?: string;
//     skip?: string;
//     finish?: string;
//     start?: string;
//   };
//   showProgressDots?: boolean;
// }

// /**
//  * A React component that renders an interactive guided tour with bulletproof z-index handling.
//  * Uses React portals to render outside the normal DOM hierarchy, preventing any z-index conflicts.
//  * Styled with Tailwind CSS, with dynamic highlight styles injected for theme support.
//  */
// export default function Tour({
//   tourId,
//   steps = [],
//   theme,
//   deviceMode,
//   isActive = true,
//   onComplete,
//   onSkip,
//   onStart,
//   onStepChange,
//   welcomeScreen = { enabled: false },
//   buttonLabels = {},
//   showProgressDots = false,
// }: TourProps) {
//   const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
//   const [isVisible, setIsVisible] = useState(isActive);
//   const [tooltipPosition, setTooltipPosition] = useState<{ top: number | string; left: number | string }>({ top: 0, left: 0 });
//   const [tooltipTransform, setTooltipTransform] = useState<string>('');
//   const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
//   const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward' | null>(null);
//   const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
//   const [welcomeStyle, setWelcomeStyle] = useState<React.CSSProperties>({});

//   // Create and manage portal container
//   useEffect(() => {
//     const container = document.createElement('div');
//     container.id = `tour-portal-${tourId}`;
//     container.className = 'fixed inset-0 pointer-events-none z-[2147483647]';
//     document.body.appendChild(container);
//     setPortalContainer(container);

//     return () => {
//       if (container && container.parentNode) {
//         container.parentNode.removeChild(container);
//       }
//     };
//   }, [tourId]);

//   // Inject dynamic styles for highlight effect
//   useEffect(() => {
//     if (!isVisible) return;

//     const styleId = `tour-styles-${tourId}`;
//     let existingStyle = document.getElementById(styleId);

//     if (!existingStyle) {
//       const style = document.createElement('style');
//       style.id = styleId;
//       style.textContent = `
//         .tour-highlight-${tourId} {
//           position: relative !important;
//           z-index: 2147483646 !important;
//           box-shadow: 0 0 8px 2px rgba(29, 78, 216, 0.5) !important; /* Light theme: bg-blue-700 */
//           border: 2px solid rgba(29, 78, 216, 0.7) !important;
//           border-radius: 6px !important;
//           transition: all 0.3s ease !important;
//         }

//         .tour-overlay-${tourId} {
//           pointer-events: auto !important;
//         }

//         .tour-content-${tourId} {
//           pointer-events: auto !important;
//         }

//         [data-theme="dark"] .tour-highlight-${tourId}, .dark .tour-highlight-${tourId} {
//           box-shadow: 0 0 8px 2px rgba(37, 99, 235, 0.5) !important; /* Dark theme: bg-blue-600 */
//           border: 2px solid rgba(37, 99, 235, 0.7) !important;
//         }
//       `;
//       document.head.appendChild(style);
//     }

//     return () => {
//       const style = document.getElementById(styleId);
//       if (style && style.parentNode) {
//         style.parentNode.removeChild(style);
//       }
//     };
//   }, [isVisible, tourId]);

//   // Detect if we're on mobile
//   const isMobile =
//     deviceMode === 'mobile' ||
//     (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

//   // Filter steps based on device
//   const filteredSteps = useMemo(() => {
//     return steps.filter((step) => {
//       if (!step.device || step.device === 'both') return true;
//       return step.device === (isMobile ? 'mobile' : 'desktop');
//     });
//   }, [steps, isMobile]);

//   // Sync isVisible with isActive prop
//   useEffect(() => {
//     setIsVisible(isActive);
//     if (isActive && welcomeScreen.enabled && currentStep === -1) {
//       onStart?.();
//     }
//   }, [isActive, welcomeScreen.enabled, currentStep, onStart]);

//   // Handle responsive welcome screen positioning
//   useEffect(() => {
//     if (!isVisible || currentStep !== -1 || !welcomeScreen.enabled) return;

//     const updateResponsiveStyles = () => {
//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;

//       // Welcome screen styles
//       const config = welcomeScreen.content as PredefinedWelcomeConfig;
//       const hasCustomPosition = config?.position || (isMobile && config?.mobilePosition);

//       if (hasCustomPosition) {
//         // Default center position (50% viewport)
//         let defaultTop = viewportHeight * 0.5;
//         let defaultLeft = viewportWidth * 0.5;
//         let transform = 'translate(-50%, -50%)';

//         // User-provided offsets
//         let userTop: number | string = isMobile && config.mobilePosition?.top ? config.mobilePosition.top : config.position?.top ?? 0;
//         let userLeft: number | string = isMobile && config.mobilePosition?.left ? config.mobilePosition.left : config.position?.left ?? 0;
//         let userTransform = isMobile && config.mobilePosition?.transform ? config.mobilePosition.transform : config.position?.transform;

//         // Convert userTop and userLeft to pixels
//         if (typeof userTop === 'string') {
//           if (userTop.endsWith('rem')) {
//             userTop = parseFloat(userTop) * 16;
//           } else if (userTop.endsWith('%')) {
//             userTop = (parseFloat(userTop) / 100) * viewportHeight;
//           } else if (userTop.endsWith('px')) {
//             userTop = parseFloat(userTop);
//           }
//         }
//         if (typeof userLeft === 'string') {
//           if (userLeft.endsWith('rem')) {
//             userLeft = parseFloat(userLeft) * 16;
//           } else if (userLeft.endsWith('%')) {
//             userLeft = (parseFloat(userLeft) / 100) * viewportWidth;
//           } else if (userLeft.endsWith('px')) {
//             userLeft = parseFloat(userLeft);
//           }
//         }

//         // Calculate new position: default + offset
//         let top = defaultTop + (typeof userTop === 'number' ? userTop : 0);
//         let left = defaultLeft + (typeof userLeft === 'number' ? userLeft : 0);

//         // Boundary checks
//         const welcomeWidth = Math.min(viewportWidth * 0.9, 448); // w-[90%] or max-w-md
//         const welcomeHeight = 300; // Approximate height
//         if (top < 10) top = 10;
//         if (top + welcomeHeight > viewportHeight - 10) top = viewportHeight - welcomeHeight - 10;
//         if (left < 10) left = 10;
//         if (left + welcomeWidth > viewportWidth - 10) left = viewportWidth - welcomeWidth - 10;

//         setWelcomeStyle({
//           position: 'absolute',
//           top,
//           left,
//           transform: userTransform ?? transform,
//         });
//       } else {
//         // Default: rely on Flexbox centering
//         setWelcomeStyle({});
//       }
//     };

//     updateResponsiveStyles();
//     window.addEventListener('resize', updateResponsiveStyles);
//     return () => window.removeEventListener('resize', updateResponsiveStyles);
//   }, [isVisible, currentStep, welcomeScreen, isMobile]);

//   // Find the target element
//   const getTargetElement = (step: TourStep): Element | null => {
//     const selector = step.target;
//     let targetElement: Element | null = document.querySelector(selector);

//     if (!targetElement && selector.startsWith('.')) {
//       const elements = document.querySelectorAll(selector);
//       targetElement = Array.from(elements).find((el) => {
//         const rect = el.getBoundingClientRect();
//         return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
//       }) || null;
//     }

//     return targetElement;
//   };

//   const getStepContent = (step: TourStep): string => {
//     if (isMobile && step.contentMobile) {
//       return step.contentMobile;
//     } else if (!isMobile && step.contentDesktop) {
//       return step.contentDesktop;
//     }
//     return step.content;
//   };

//   const createArrowStyle = (
//     position: string,
//     rect: DOMRect,
//     targetCenterX: number,
//     targetCenterY: number,
//     left: number,
//     tooltipWidth: number,
//     theme: string
//   ): React.CSSProperties => {
//     const baseArrow: React.CSSProperties = {
//       position: 'absolute',
//       width: '0',
//       height: '0',
//       borderStyle: 'solid',
//       zIndex: 1,
//     };

//     const triangleColor = theme === 'dark' ? '#ffffff' : '#111827';
//     let arrow: React.CSSProperties = { ...baseArrow };

//     const borderRadiusOffset = '16px';
//     const cornerVerticalOffset = '-7px';

//     switch (position) {
//       case 'top':
//         arrow = {
//           ...arrow,
//           bottom: '-7px',
//           left: '50%',
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'top-left':
//         arrow = {
//           ...arrow,
//           bottom: cornerVerticalOffset,
//           left: borderRadiusOffset,
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'top-right':
//         arrow = {
//           ...arrow,
//           bottom: cornerVerticalOffset,
//           right: borderRadiusOffset,
//           borderWidth: '7px 7px 0 7px',
//           borderColor: `${triangleColor} transparent transparent transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           left: '50%',
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom-left':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           left: borderRadiusOffset,
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'bottom-right':
//         arrow = {
//           ...arrow,
//           top: '-7px',
//           right: borderRadiusOffset,
//           borderWidth: '0 7px 7px 7px',
//           borderColor: `transparent transparent ${triangleColor} transparent`,
//           transform: 'translateX(-50%)',
//           filter: 'drop-shadow(-1px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'left':
//         arrow = {
//           ...arrow,
//           right: '-7px',
//           top: '50%',
//           borderWidth: '7px 7px 7px 0',
//           borderColor: `transparent ${triangleColor} transparent transparent`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(2px -1px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'center-left':
//         arrow = {
//           ...arrow,
//           left: '-7px',
//           top: '50%',
//           borderWidth: '7px 0 7px 7px',
//           borderColor: `transparent transparent transparent ${triangleColor}`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'right':
//         arrow = {
//           ...arrow,
//           left: '-7px',
//           top: '50%',
//           borderWidth: '7px 0 7px 7px',
//           borderColor: `transparent transparent transparent ${triangleColor}`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(-1px 2px 3px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//       case 'center-right':
//         arrow = {
//           ...arrow,
//           right: '-7px',
//           top: '50%',
//           borderWidth: '7px 7px 7px 0',
//           borderColor: `transparent ${triangleColor} transparent transparent`,
//           transform: 'translateY(-50%)',
//           filter: 'drop-shadow(2px -1px 2px rgba(0, 0, 0, 0.1))',
//         };
//         break;
//     }

//     return arrow;
//   };

//   // Position tooltip and handle scroll/resize
//   useEffect(() => {
//     if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

//     const step = filteredSteps[currentStep];
//     const targetElement = getTargetElement(step);

//     if (!targetElement) {
//       console.warn(
//         `Tour target not found: ${step.target} (device: ${step.device || 'both'}, step: ${currentStep + 1}/${filteredSteps.length})`
//       );
//       if (navigationDirection !== 'backward' && currentStep < filteredSteps.length - 1) {
//         setNavigationDirection('forward');
//         setCurrentStep(currentStep + 1);
//       }
//       return;
//     }

//     const updatePosition = () => {
//       targetElement.scrollIntoView({
//         behavior: 'smooth',
//         block: 'nearest',
//         inline: 'nearest',
//       });

//       const headerHeight = 64;
//       const rect = targetElement.getBoundingClientRect();
//       if (rect.top < headerHeight) {
//         window.scrollBy({
//           top: rect.top - headerHeight,
//           behavior: 'smooth',
//         });
//       }

//       if (step.customPosition) {
//         setTooltipPosition({
//           top: step.customPosition.top ?? '50%',
//           left: step.customPosition.left ?? '50%',
//         });
//         setTooltipTransform(step.customPosition.transform ?? '');
//         setArrowStyle({ display: 'none' });
//         return;
//       }

//       if (step.position === 'center') {
//         setTooltipPosition({ top: '50%', left: '50%' });
//         setTooltipTransform('translate(-50%, -50%)');
//         setArrowStyle({ display: 'none' });
//         return;
//       }

//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;
//       const tooltipWidth = 320;
//       const tooltipHeight = 150;
//       let top: number = 0;
//       let left: number = 0;
//       let transform = '';
//       const position = step.position || 'bottom';
//       const offsetX = step.offset?.x || 0;
//       const offsetY = step.offset?.y || 10;

//       const targetCenterX = rect.left + rect.width / 2;
//       const targetCenterY = rect.top + rect.height / 2;

//       switch (position) {
//         case 'top':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.left + rect.width / 2 + offsetX;
//           transform = 'translateX(-50%)';
//           break;
//         case 'top-left':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.left + offsetX;
//           transform = '';
//           break;
//         case 'top-right':
//           top = rect.top - tooltipHeight - offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = '';
//           break;
//         case 'bottom':
//           top = rect.bottom + offsetY;
//           left = rect.left + rect.width / 2 + offsetX;
//           transform = 'translateX(-50%)';
//           break;
//         case 'bottom-left':
//           top = rect.bottom + offsetY;
//           left = rect.left + offsetX;
//           transform = '';
//           break;
//         case 'bottom-right':
//           top = rect.bottom + offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = '';
//           break;
//         case 'left':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.left - tooltipWidth - 10 + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'center-left':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.left + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'right':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.right + 10 + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//         case 'center-right':
//           top = rect.top + rect.height / 2 + offsetY;
//           left = rect.right - tooltipWidth + offsetX;
//           transform = 'translateY(-50%)';
//           break;
//       }

//       if (top < 10) top = 10;
//       if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;
//       if (left < 10) left = 10;
//       if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;

//       setTooltipPosition({ top, left });
//       setTooltipTransform(transform);

//       const arrow = createArrowStyle(position, rect, targetCenterX, targetCenterY, left, tooltipWidth, theme);
//       setArrowStyle(arrow);
//     };

//     updatePosition();

//     const handleResizeOrScroll = () => updatePosition();
//     window.addEventListener('resize', handleResizeOrScroll);
//     window.addEventListener('scroll', handleResizeOrScroll);

//     return () => {
//       window.removeEventListener('resize', handleResizeOrScroll);
//       window.removeEventListener('scroll', handleResizeOrScroll);
//     };
//   }, [currentStep, filteredSteps, isVisible, deviceMode, theme, navigationDirection]);

//   // Highlight the target element
//   useEffect(() => {
//     if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length) return;

//     const step = filteredSteps[currentStep];
//     const targetElement = getTargetElement(step);
//     if (!targetElement) return;

//     const highlightClass = `tour-highlight-${tourId}`;
//     targetElement.classList.add(highlightClass);

//     return () => {
//       targetElement.classList.remove(highlightClass);
//     };
//   }, [currentStep, filteredSteps, isVisible, tourId]);

//   // Keyboard navigation
//   useEffect(() => {
//     if (!isVisible) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowRight' || e.key === 'Enter') {
//         e.preventDefault();
//         if (currentStep === -1) {
//           handleStart();
//         } else {
//           handleNext();
//         }
//       } else if (e.key === 'ArrowLeft' && currentStep > 0) {
//         e.preventDefault();
//         handlePrevious();
//       } else if (e.key === 'Escape') {
//         e.preventDefault();
//         handleSkip();
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [currentStep, isVisible]);

//   // Notify step change
//   useEffect(() => {
//     if (isVisible && currentStep >= 0) {
//       onStepChange?.(currentStep);
//     }
//   }, [currentStep, isVisible, onStepChange]);

//   // Navigation handlers
//   const completeTour = useCallback(() => {
//     setIsVisible(false);
//     setCurrentStep(welcomeScreen.enabled ? -1 : 0);
//     onComplete?.();
//   }, [onComplete, welcomeScreen.enabled]);

//   const handleStart = useCallback(() => {
//     setCurrentStep(0);
//     setNavigationDirection('forward');
//     onStart?.();
//   }, [onStart]);

//   const handleNext = useCallback(() => {
//     if (currentStep < filteredSteps.length - 1) {
//       setCurrentStep(currentStep + 1);
//       setNavigationDirection('forward');
//     } else {
//       completeTour();
//     }
//   }, [currentStep, filteredSteps.length, completeTour]);

//   const handlePrevious = useCallback(() => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//       setNavigationDirection('backward');
//     }
//   }, [currentStep]);

//   const handleSkip = useCallback(() => {
//     completeTour();
//     onSkip?.();
//   }, [onSkip, completeTour]);

//   if (!isVisible || !portalContainer) return null;

//   const tourContent = (
//     <AnimatePresence>
//       <motion.div
//         className={`tour-overlay-${tourId} fixed inset-0 flex items-center justify-center ${
//           theme === 'dark' ? 'bg-black/70' : 'bg-black/60'
//         }`}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         // style={{ zIndex: 2147483647 }}
//       >
//         {currentStep === -1 && welcomeScreen.enabled ? (
//           <motion.div
//             className={`tour-content-${tourId} p-6 rounded-2xl w-[90%] max-w-md backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//               theme === 'dark'
//                 ? 'bg-white text-gray-900 ring-gray-200/50'
//                 : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//             }`}
//             style={welcomeStyle}
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             transition={{ duration: 0.3, ease: 'easeOut' }}
//             role="dialog"
//             aria-labelledby={`tour-welcome-title-${tourId}`}
//           >
//             {welcomeScreen.content &&
//             typeof welcomeScreen.content === 'object' &&
//             !Array.isArray(welcomeScreen.content) &&
//             'title' in welcomeScreen.content &&
//             'message' in welcomeScreen.content ? (
//               <>
//                 <div className="flex justify-between items-center mb-4">
//                   <h3
//                     id={`tour-welcome-title-${tourId}`}
//                     className="text-xl font-bold tracking-tight"
//                   >
//                     {(welcomeScreen.content as PredefinedWelcomeConfig).title}
//                   </h3>
//                   <button
//                     onClick={handleSkip}
//                     className={`p-2 rounded-full transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
//                         : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
//                     }`}
//                     aria-label="Skip tour"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//                 <p className="text-base leading-relaxed mb-6 font-medium">
//                   {(welcomeScreen.content as PredefinedWelcomeConfig).message}
//                 </p>
//                 <div className="flex justify-between items-center">
//                   <button
//                     onClick={handleSkip}
//                     className={`text-sm font-medium transition-colors duration-200 ${
//                       theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                     }`}
//                   >
//                     {buttonLabels.skip || 'Skip Tour'}
//                   </button>
//                   <button
//                     onClick={handleStart}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {(welcomeScreen.content as PredefinedWelcomeConfig).startButtonText ||
//                       buttonLabels.start ||
//                       'Start Tour'}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {welcomeScreen.content}
//                 <div className="flex justify-between items-center mt-4">
//                   <button
//                     onClick={handleSkip}
//                     className={`text-sm font-medium transition-colors duration-200 ${
//                       theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                     }`}
//                   >
//                     {buttonLabels.skip || 'Skip Tour'}
//                   </button>
//                   <button
//                     onClick={handleStart}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {buttonLabels.start || 'Start Tour'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </motion.div>
//         ) : (
//           currentStep < filteredSteps.length &&
//           (filteredSteps[currentStep].position === 'center' ? (
//             <motion.div
//               className={`tour-content-${tourId} p-6 rounded-2xl max-w-md w-full mx-auto mt-20 backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//                 theme === 'dark'
//                   ? 'bg-white text-gray-900 ring-gray-200/50'
//                   : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//               }`}
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//               role="dialog"
//               aria-labelledby={`tour-step-title-${tourId}-${currentStep}`}
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3
//                   id={`tour-step-title-${tourId}-${currentStep}`}
//                   className="text-xl font-bold tracking-tight"
//                 >
//                   Welcome to the Tour!
//                 </h3>
//                 <button
//                   onClick={handleSkip}
//                   className={`p-2 rounded-full transition-all duration-200 ${
//                     theme === 'dark'
//                       ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
//                       : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
//                   }`}
//                   aria-label="Skip tour"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <p className="text-base leading-relaxed mb-6 font-medium">
//                 {getStepContent(filteredSteps[currentStep])}
//               </p>
//               <div className="mb-4">
//                 <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
//                   <div
//                     className="absolute h-2 bg-blue-500 rounded-full transition-all duration-300"
//                     style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
//                   />
//                 </div>
//                 {showProgressDots && (
//                   <div className="flex justify-center gap-2 mt-2">
//                     {filteredSteps.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-2 h-2 rounded-full ${
//                           index === currentStep
//                             ? 'bg-blue-500'
//                             : theme === 'dark'
//                             ? 'bg-gray-400'
//                             : 'bg-gray-500'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handleSkip}
//                   className={`text-sm font-medium transition-colors duration-200 ${
//                     theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                   }`}
//                 >
//                   {buttonLabels.skip || 'Skip Tour'}
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentStep === 0}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       currentStep === 0
//                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         : theme === 'dark'
//                         ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
//                         : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
//                     }`}
//                   >
//                     {buttonLabels.previous || 'Previous'}
//                   </button>
//                   <span
//                     className={`text-sm font-medium ${
//                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//                     }`}
//                   >
//                     {currentStep + 1} / {filteredSteps.length}
//                   </span>
//                   <button
//                     onClick={handleNext}
//                     className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {currentStep < filteredSteps.length - 1
//                       ? buttonLabels.next || 'Next'
//                       : buttonLabels.finish || 'Finish'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               className={`tour-content-${tourId} absolute p-5 rounded-xl max-w-sm min-w-[200px] backdrop-blur-sm bg-opacity-95 shadow-xl ring-1 ${
//                 theme === 'dark'
//                   ? 'bg-white text-gray-900 ring-gray-200/50'
//                   : 'bg-gray-900 text-gray-100 ring-gray-700/50'
//               }`}
//               style={{
//                 top: tooltipPosition.top,
//                 left: tooltipPosition.left,
//                 transform: tooltipTransform,
//                 margin: '0 10px',
//               }}
//               initial={{
//                 opacity: 0,
//                 y: filteredSteps[currentStep].position?.includes('top')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('bottom')
//                   ? -10
//                   : 0,
//                 x: filteredSteps[currentStep].position?.includes('left')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('right')
//                   ? -10
//                   : 0,
//               }}
//               animate={{ opacity: 1, y: 0, x: 0 }}
//               exit={{
//                 opacity: 0,
//                 y: filteredSteps[currentStep].position?.includes('top')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('bottom')
//                   ? -10
//                   : 0,
//                 x: filteredSteps[currentStep].position?.includes('left')
//                   ? 10
//                   : filteredSteps[currentStep].position?.includes('right')
//                   ? -10
//                   : 0,
//               }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//               role="dialog"
//               aria-labelledby={`tour-step-title-${tourId}-${currentStep}`}
//             >
//               <div className="arrow" style={arrowStyle} />
//               <p
//                 id={`tour-step-title-${tourId}-${currentStep}`}
//                 className="text-base leading-relaxed mb-4 font-medium"
//               >
//                 {getStepContent(filteredSteps[currentStep])}
//               </p>
//               <div className="mb-3">
//                 <div className="relative h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
//                   <div
//                     className="absolute h-1.5 bg-blue-500 rounded-full transition-all duration-300"
//                     style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
//                   />
//                 </div>
//                 {showProgressDots && (
//                   <div className="flex justify-center gap-1.5 mt-2">
//                     {filteredSteps.map((_, index) => (
//                       <div
//                         key={index}
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           index === currentStep
//                             ? 'bg-blue-500'
//                             : theme === 'dark'
//                             ? 'bg-gray-400'
//                             : 'bg-gray-500'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-between items-center">
//                 <button
//                   onClick={handleSkip}
//                   className={`text-sm font-medium transition-colors duration-200 ${
//                     theme === 'dark' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-200'
//                   }`}
//                 >
//                   {buttonLabels.skip || 'Skip'}
//                 </button>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handlePrevious}
//                     disabled={currentStep === 0}
//                     className={`px-3 py-1 rounded-md text-sm font-medium text-white transition-all duration-200 ${
//                       currentStep === 0
//                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         : theme === 'dark'
//                         ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
//                         : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
//                     }`}
//                   >
//                     {buttonLabels.previous || 'Previous'}
//                   </button>
//                   <span
//                     className={`text-xs font-medium ${
//                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//                     }`}
//                   >
//                     {currentStep + 1} / {filteredSteps.length}
//                   </span>
//                   <button
//                     onClick={handleNext}
//                     className={`px-3 py-1 rounded-md text-sm font-medium text-white transition-all duration-200 ${
//                       theme === 'dark'
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
//                         : 'bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700'
//                     }`}
//                   >
//                     {currentStep < filteredSteps.length - 1
//                       ? buttonLabels.next || 'Next'
//                       : buttonLabels.finish || 'Finish'}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           ))
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );

//   return createPortal(tourContent, portalContainer);
// }












'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
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

    // Override body/html overflow to prevent clipping
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'visible';

    // Dynamically adjust z-index based on DOM
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

    // Monitor DOM for new elements
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

    // Monitor DOM for dynamic content
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
    if (!isVisible || currentStep < 0 || currentStep >= filteredSteps.length || !isDomReady) return;

    const step = filteredSteps[currentStep];
    let isMounted = true;

    const highlightElement = async () => {
      const targetElement = await getTargetElement(step);
      if (!targetElement || !isMounted) return;

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

      return () => {
        if (isMounted) {
          targetElement.classList.remove(highlightClass);
          if (parent && originalOverflow) {
            parent.style.overflow = originalOverflow;
          }
        }
      };
    };

    highlightElement();

    return () => {
      isMounted = false;
    };
  }, [currentStep, filteredSteps, isVisible, tourId, getTargetElement, isDomReady]);

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
    setIsVisible(false);
    setCurrentStep(welcomeScreen.enabled ? -1 : 0);
    onComplete?.();
  }, [onComplete, welcomeScreen.enabled]);

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
      <motion.div
        className={`tour-overlay-${tourId} fixed inset-0 flex items-center justify-center ${
          theme === 'dark' ? 'bg-black/70' : 'bg-black/60'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex }}
      >
        {currentStep === -1 && welcomeScreen.enabled ? (
          <motion.div
            className={`tour-content-${tourId} p-6 rounded-xl w-[90%] max-w-md backdrop-blur-sm shadow-lg ring-1 ${
              theme === 'dark' ? 'bg-gray-900 text-gray-100 ring-gray-700/50' : 'bg-white text-gray-900 ring-gray-200/50'
            }`}
            style={welcomeStyle}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            role="dialog"
            aria-labelledby={`tour-welcome-title-${tourId}`}
          >
            {welcomeScreen.content && typeof welcomeScreen.content === 'object' && 'title' in welcomeScreen.content ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 id={`tour-welcome-title-${tourId}`} className="text-lg font-semibold">
                    {(welcomeScreen.content as PredefinedWelcomeConfig).title}
                  </h3>
                  <button
                    onClick={handleSkip}
                    className={`p-2 rounded-full ${
                      theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'
                    }`}
                    aria-label="Skip tour"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm mb-6">
                  {(welcomeScreen.content as PredefinedWelcomeConfig).message}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleSkip}
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {buttonLabels.skip || 'Skip Tour'}
                  </button>
                  <button
                    onClick={handleStart}
                    className={`px-4 py-2 rounded-md text-sm text-white ${
                      theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-600'
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
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {buttonLabels.skip || 'Skip Tour'}
                  </button>
                  <button
                    onClick={handleStart}
                    className={`px-4 py-2 rounded-md text-sm text-white ${
                      theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-600'
                    }`}
                  >
                    {buttonLabels.start || 'Start Tour'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          currentStep < filteredSteps.length && (
            <motion.div
              className={`tour-content-${tourId} absolute p-5 rounded-xl max-w-sm min-w-[200px] backdrop-blur-sm shadow-lg ring-1 ${
                theme === 'dark' ? 'bg-gray-900 text-gray-100 ring-gray-700/50' : 'bg-white text-gray-900 ring-gray-200/50'
              }`}
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                transform: tooltipTransform,
                margin: '0 10px',
                zIndex: zIndex + 1,
              }}
              initial={{
                opacity: 0,
                y: filteredSteps[currentStep].position?.includes('top') ? 10 : -10,
                x: filteredSteps[currentStep].position?.includes('left') ? 10 : -10,
              }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{
                opacity: 0,
                y: filteredSteps[currentStep].position?.includes('top') ? 10 : -10,
                x: filteredSteps[currentStep].position?.includes('left') ? 10 : -10,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="dialog"
              aria-labelledby={`tour-step-title-${tourId}-${currentStep}`}
            >
              <div className={`arrow tour-arrow-${tourId}`} style={arrowStyle} />
              <p id={`tour-step-title-${tourId}-${currentStep}`} className="text-sm mb-4">
                {getStepContent(filteredSteps[currentStep])}
              </p>
              <div className="mb-3">
                <div className="relative h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="absolute h-1.5 bg-blue-500 rounded-full"
                    style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
                  />
                </div>
                {showProgressDots && (
                  <div className="flex justify-center gap-1.5 mt-2">
                    {filteredSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-gray-400'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={handleSkip}
                  className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {buttonLabels.skip || 'Skip'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`px-3 py-1 rounded-md text-sm text-white ${
                      currentStep === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-600 hover:bg-gray-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {buttonLabels.previous || 'Previous'}
                  </button>
                  <span className="text-xs text-gray-400">
                    {currentStep + 1} / {filteredSteps.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className={`px-3 py-1 rounded-md text-sm text-white ${
                      theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-600'
                    }`}
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
    </AnimatePresence>
  );

  return createPortal(tourContent, portalContainer);
}