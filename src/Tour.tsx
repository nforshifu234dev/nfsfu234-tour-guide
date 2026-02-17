// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';

// // ────────────────────────────────────────────────
// // Types (kept almost identical)
// // ────────────────────────────────────────────────

// export interface TourStep {
//   target: string;
//   content: string;
//   contentMobile?: string;
//   position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
//   offset?: { x?: number; y?: number };
//   device?: 'desktop' | 'mobile' | 'both';
// }

// export interface TourProps {
//   tourId?: string;
//   steps: TourStep[];
//   isActive?: boolean;
//   theme?: 'light' | 'dark';
//   accentColor?: string;
//   onComplete?: () => void;
//   onSkip?: () => void;
//   onStart?: () => void;
//   onStepChange?: (index: number) => void;
//   welcomeScreen?: {
//     enabled: boolean;
//     title?: string;
//     message?: string;
//     startButtonText?: string;
//   };
//   buttonLabels?: {
//     next?: string;
//     previous?: string;
//     skip?: string;
//     finish?: string;
//     start?: string;
//   };
//   showProgress?: boolean;
//   className?: string;
//   overlayClassName?: string;
//   tooltipClassName?: string;
//   highlightClassName?: string;
// }

// // ────────────────────────────────────────────────
// // Main Component
// // ────────────────────────────────────────────────

// export default function Tour({
//   tourId = 'tour-guide',
//   steps,
//   isActive = true,
//   theme = 'dark',
//   accentColor = '#10b981',
//   onComplete,
//   onSkip,
//   onStart,
//   onStepChange,
//   welcomeScreen = { enabled: false },
//   buttonLabels = {},
//   showProgress = true,
//   className = '',
//   overlayClassName = '',
//   tooltipClassName = '',
//   highlightClassName = 'tour-highlight',
// }: TourProps) {
//   const [currentStep, setCurrentStep] = useState(welcomeScreen.enabled ? -1 : 0);
//   const [visible, setVisible] = useState(isActive);
//   const [mounted, setMounted] = useState(false);

//   const overlayRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Highlight logic
//   useEffect(() => {
//     if (!visible || !mounted || currentStep < 0) return;

//     const step = steps[currentStep];
//     if (!step) return;

//     const target = document.querySelector(step.target);
//     if (!target) return;

//     target.classList.add(highlightClassName);
//     target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

//     return () => {
//       target.classList.remove(highlightClassName);
//     };
//   }, [currentStep, visible, mounted, steps, highlightClassName]);

//   // Navigation
//   const next = () => {
//     if (currentStep < steps.length - 1) {
//       const nextIndex = currentStep + 1;
//       setCurrentStep(nextIndex);
//       onStepChange?.(nextIndex);
//     } else {
//       setVisible(false);
//       onComplete?.();
//     }
//   };

//   const prev = () => {
//     if (currentStep > (welcomeScreen.enabled ? -1 : 0)) {
//       const prevIndex = currentStep - 1;
//       setCurrentStep(prevIndex);
//       onStepChange?.(prevIndex);
//     }
//   };

//   const skip = () => {
//     setVisible(false);
//     onSkip?.();
//   };

//   const start = () => {
//     setCurrentStep(0);
//     onStart?.();
//     onStepChange?.(0);
//   };

//   if (!mounted || !visible) return null;

//   const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

//   // Simple arrow styles (CSS-in-JS style object)
//   const getArrowStyle = (position?: string) => {
//     const color = theme === 'dark' ? '#ffffff' : '#111827';
//     switch (position) {
//       case 'top':
//         return { bottom: '-8px', left: '50%', transform: 'translateX(-50%)', borderWidth: '8px 8px 0 8px', borderColor: `${color} transparent transparent transparent` };
//       case 'bottom':
//         return { top: '-8px', left: '50%', transform: 'translateX(-50%)', borderWidth: '0 8px 8px 8px', borderColor: `transparent transparent ${color} transparent` };
//       case 'left':
//         return { right: '-8px', top: '50%', transform: 'translateY(-50%)', borderWidth: '8px 8px 8px 0', borderColor: `transparent ${color} transparent transparent` };
//       case 'right':
//         return { left: '-8px', top: '50%', transform: 'translateY(-50%)', borderWidth: '8px 0 8px 8px', borderColor: `transparent transparent transparent ${color}` };
//       default:
//         return { display: 'none' };
//     }
//   };

//   return (
//     <div className={`fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none ${overlayClassName} ${className}`}>
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={skip} aria-hidden="true" />

//       {/* Content */}
//       <div className="relative pointer-events-auto max-w-lg w-[90%]">
//         {currentStep === -1 && welcomeScreen.enabled ? (
//           <div
//             className={`
//               p-6 rounded-xl shadow-2xl border
//               ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
//             `}
//           >
//             <div className="flex items-start justify-between mb-4">
//               <h2 className="text-2xl font-bold">{welcomeScreen.title || 'Welcome'}</h2>
//               <button onClick={skip} aria-label="Skip tour" className="p-1 hover:opacity-80">
//                 ×
//               </button>
//             </div>
//             <p className="mb-6">{welcomeScreen.message || 'Let me guide you.'}</p>
//             <div className="flex justify-end gap-4">
//               <button onClick={skip} className="text-sm opacity-80 hover:opacity-100">
//                 {buttonLabels.skip || 'Skip'}
//               </button>
//               <button
//                 onClick={start}
//                 className={`px-6 py-3 rounded-lg font-medium text-white ${
//                   theme === 'dark' ? 'bg-[${accentColor}] hover:brightness-110' : 'bg-[${accentColor}] hover:brightness-90'
//                 }`}
//               >
//                 {welcomeScreen.startButtonText || buttonLabels.start || 'Start'}
//               </button>
//             </div>
//           </div>
//         ) : step ? (
//           <div
//             className={`
//               p-5 rounded-xl shadow-xl border
//               ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
//             `}
//           >
//             <p className="mb-4">{step.content}</p>

//             {showProgress && (
//               <div className="h-1 bg-zinc-700 rounded-full mb-4 overflow-hidden">
//                 <div
//                   className={`h-full transition-all`}
//                   style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, backgroundColor: accentColor }}
//                 />
//               </div>
//             )}

//             <div className="flex justify-between items-center">
//               <button onClick={skip} className="text-sm opacity-80 hover:opacity-100">
//                 {buttonLabels.skip || 'Skip'}
//               </button>
//               <div className="flex gap-3">
//                 <button
//                   onClick={prev}
//                   disabled={currentStep === 0}
//                   className={`px-4 py-2 rounded ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}`}
//                 >
//                   {buttonLabels.previous || 'Back'}
//                 </button>
//                 <button
//                   onClick={next}
//                   className={`px-5 py-2 rounded font-medium text-white`}
//                   style={{ backgroundColor: accentColor }}
//                 >
//                   {currentStep < steps.length - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
//                 </button>
//               </div>
//             </div>

//             {/* Arrow */}
//             <div
//               className="absolute w-0 h-0 border-8 border-transparent"
//               style={{
//                 ...getArrowStyle(step.position),
//                 borderColor: theme === 'dark' ? 'white' : '#111827',
//               }}
//             />
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }

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
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; transform: string }>({
    top: 0,
    left: 0,
    transform: '',
  });

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Highlight + scroll to target
  useEffect(() => {
    if (!visible || !mounted || currentStep < 0) return;

    const step = steps[currentStep];
    if (!step) return;

    const target = document.querySelector(step.target) as HTMLElement;
    if (!target) return;

    target.classList.add(highlightClassName);
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

    // Calculate tooltip position relative to target
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipW = tooltipRef.current?.offsetWidth || 320;
    const tooltipH = tooltipRef.current?.offsetHeight || 160;

    let top = 0;
    let left = 0;
    let transform = '';

    const pos = step.position || 'bottom';
    const ox = step.offset?.x ?? 0;
    const oy = step.offset?.y ?? 12;

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

    setTooltipPos({ top, left, transform });

    return () => {
      target.classList.remove(highlightClassName);
    };
  }, [currentStep, visible, mounted, steps, highlightClassName]);

  // Navigation (same as before)
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

    // Simple arrow styles (CSS-in-JS style object)
  const getArrowStyle = (position?: string) => {
    const color = theme === 'dark' ? '#ffffff' : '#111827';
    switch (position) {
      case 'top':
        return { bottom: '-8px', left: '50%', transform: 'translateX(-50%)', borderWidth: '8px 8px 0 8px', borderColor: `${color} transparent transparent transparent` };
      case 'bottom':
        return { top: '-8px', left: '50%', transform: 'translateX(-50%)', borderWidth: '0 8px 8px 8px', borderColor: `transparent transparent ${color} transparent` };
      case 'left':
        return { right: '-8px', top: '50%', transform: 'translateY(-50%)', borderWidth: '8px 8px 8px 0', borderColor: `transparent ${color} transparent transparent` };
      case 'right':
        return { left: '-8px', top: '50%', transform: 'translateY(-50%)', borderWidth: '8px 0 8px 8px', borderColor: `transparent transparent transparent ${color}` };
      default:
        return { display: 'none' };
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] pointer-events-none ${overlayClassName} ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={skip} aria-hidden="true" />

      {/* Content */}
      {currentStep === -1 && welcomeScreen.enabled ? (
        // Welcome — always centered
        <div
          className={`
            pointer-events-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            p-6 rounded-xl shadow-2xl border max-w-lg w-[90%]
            ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
          `}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-bold">{welcomeScreen.title || 'Welcome'}</h2>
            <button onClick={skip} aria-label="Skip tour" className="p-1 hover:opacity-80">
              ×
            </button>
          </div>
          <p className="mb-6">{welcomeScreen.message || 'Let me guide you.'}</p>
          <div className="flex justify-end gap-4">
            <button onClick={skip} className="text-sm opacity-80 hover:opacity-100">
              {buttonLabels.skip || 'Skip'}
            </button>
            <button
              onClick={start}
              className={`px-6 py-3 rounded-lg font-medium text-white`}
              style={{ backgroundColor: accentColor }}
            >
              {welcomeScreen.startButtonText || buttonLabels.start || 'Start'}
            </button>
          </div>
        </div>
      ) : step ? (
        // Tooltip — positioned near target
        <div
          ref={tooltipRef}
          className={`
            pointer-events-auto fixed p-5 rounded-xl shadow-xl border max-w-sm w-[90%]
            ${theme === 'dark' ? 'bg-zinc-900/95 text-white border-zinc-700' : 'bg-white/95 text-zinc-900 border-zinc-200'}
            ${tooltipClassName}
          `}
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: tooltipPos.transform,
          }}
        >
          <p className="mb-4">{step.content}</p>

          {showProgress && (
            <div className="h-1 bg-zinc-700 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full transition-all"
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
                className={`px-4 py-2 rounded ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-700'}`}
              >
                {buttonLabels.previous || 'Back'}
              </button>
              <button
                onClick={next}
                className={`px-5 py-2 rounded font-medium text-white`}
                style={{ backgroundColor: accentColor }}
              >
                {currentStep < steps.length - 1 ? buttonLabels.next || 'Next' : buttonLabels.finish || 'Finish'}
              </button>
            </div>
          </div>

          {/* Arrow pointing to target */}
          <div
            className="absolute w-0 h-0 border-8 border-transparent"
            style={{
              ...getArrowStyle(step.position),
              borderColor: theme === 'dark' ? '#ffffff' : '#111827',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}