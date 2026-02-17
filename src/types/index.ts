// src/types/index.ts
// ────────────────────────────────────────────────
// Public API types for nfsfu234-tour-guide
// ────────────────────────────────────────────────

export interface TourStep {
  target: string;
  content: string;
  contentMobile?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: { x?: number; y?: number };
  device?: 'desktop' | 'mobile' | 'both';
}

export interface WelcomeScreenConfig {
  enabled: boolean;
  title?: string;
  message?: string;
  startButtonText?: string;
}

export interface ButtonLabels {
  next?: string;
  previous?: string;
  skip?: string;
  finish?: string;
  start?: string;
}

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

export interface TourProps {
  tourId?: string;
  steps: TourStep[];
  isActive?: boolean;
  theme?: 'light' | 'dark' | 'custom';
  customTheme?: ThemeConfig;
  accentColor?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onStart?: () => void;
  onStepChange?: (index: number) => void;
  welcomeScreen?: WelcomeScreenConfig;
  buttonLabels?: ButtonLabels;
  showProgress?: boolean;
  highlightClassName?: string;
  overlayClassName?: string;
  tooltipClassName?: string;
  className?: string;
}