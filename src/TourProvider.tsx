'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { TourConfig } from './types';

const TourConfigContext = createContext<TourConfig>({});

interface TourProviderProps {
  /** Usually the result of defineConfig() imported from your tour.config file. */
  config: TourConfig;
  children: ReactNode;
}

/**
 * Wrap your app root with this once to give every <Tour /> instance
 * shared defaults (theme, accentColor, buttonLabels, branding, etc).
 * Props passed directly to a <Tour> always win over these defaults.
 *
 * @example
 * import { TourProvider } from '@nfsfu234/tour-guide';
 * import tourConfig from '../tour.config';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <TourProvider config={tourConfig}>
 *       {children}
 *     </TourProvider>
 *   );
 * }
 */
export function TourProvider({ config, children }: TourProviderProps) {
  return (
    <TourConfigContext.Provider value={config}>
      {children}
    </TourConfigContext.Provider>
  );
}

/** Internal — used by <Tour /> to read inherited defaults. */
export function useTourConfig(): TourConfig {
  return useContext(TourConfigContext);
}