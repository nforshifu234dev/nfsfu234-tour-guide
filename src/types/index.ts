import type { ReactNode } from 'react';

export interface ThemeConfig {
  backdrop?: string;
  tooltipBg?: string;
  tooltipText?: string;
  tooltipBorder?: string;
  buttonBg?: string;
  buttonText?: string;
  progressBar?: string;
  highlightRing?: string;
}

export interface ButtonLabels {
  next?: string;
  previous?: string;
  skip?: string;
  finish?: string;
  start?: string;
}

export interface WelcomeScreenConfig {
  enabled?: boolean;
  title?: string;
  message?: string;
  startButtonText?: string;
}

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
  theme?: 'light' | 'dark' | 'custom';
  customTheme?: ThemeConfig;
  accentColor?: string;
  welcomeScreen?: WelcomeScreenConfig;
  buttonLabels?: ButtonLabels;
  showProgress?: boolean;
  showBranding?: boolean;
  onStart?: () => void;
  onStepChange?: (index: number) => void;
  onSkip?: () => void;
  onComplete?: () => void;
  className?: string;
  overlayClassName?: string;
  tooltipClassName?: string;
  highlightClassName?: string;
}

/**
 * Project-wide defaults, usually created once via `defineConfig()` and
 * provided at the app root with <TourProvider config={...}>.
 * Any prop passed directly to a <Tour> instance still overrides these.
 */
export type TourConfig = Partial<
  Pick<
    TourProps,
    | 'theme'
    | 'customTheme'
    | 'accentColor'
    | 'buttonLabels'
    | 'showProgress'
    | 'showBranding'
    | 'highlightClassName'
    | 'overlayClassName'
    | 'tooltipClassName'
    | 'className'
  >
>;