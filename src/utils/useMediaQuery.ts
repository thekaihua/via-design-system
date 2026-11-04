import { useSyncExternalStore } from 'react';
import { breakpoints } from '../tokens/tokens';

/** Subscribes to a CSS media query. Returns false during server rendering. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export type ShellSize = 'mobile' | 'tablet' | 'desktop';

/** Layout size from the breakpoint tokens: < 768 mobile, 768–1023 tablet, ≥ 1024 desktop. */
export function useShellSize(): ShellSize {
  const tablet = useMediaQuery(`(min-width: ${breakpoints.stack}px)`);
  const desktop = useMediaQuery(`(min-width: ${breakpoints.wide}px)`);
  return desktop ? 'desktop' : tablet ? 'tablet' : 'mobile';
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
