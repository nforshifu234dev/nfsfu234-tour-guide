import type { TourConfig } from './types';

/**
 * Type-safe helper for your project-root tour config.
 *
 * @example
 * // tour.config.ts (project root)
 * import { defineConfig } from '@nfsfu234/tour-guide';
 *
 * export default defineConfig({
 *   theme: 'dark',
 *   accentColor: '#10b981',
 *   showBranding: false,
 *   buttonLabels: { next: 'Next', finish: 'Done' },
 * });
 */
export function defineConfig(config: TourConfig): TourConfig {
  return config;
}