import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query.
 *
 * `useSyncExternalStore` rather than an effect with state: React reads the
 * value during render on the client and the dedicated server snapshot keeps
 * the SSR pass honest, so there is no first paint at the wrong breakpoint.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => undefined;
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Tailwind's `sm` breakpoint — where the site stops being a single column. */
export const useIsWide = () => useMediaQuery("(min-width: 40rem)");
