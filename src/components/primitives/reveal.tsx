import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// useLayoutEffect warns during server rendering; useEffect is the right
// no-op there. On the client we need layout timing — see below.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fades its children in as they scroll into view.
 *
 * Renders visible so the content is in the SSR HTML and survives with
 * JavaScript off. The hide-then-reveal decision runs in a *layout* effect
 * rather than a passive one: with useEffect the browser painted the visible
 * state first, so every below-the-fold card flashed into view and then
 * blanked before fading back in. A layout effect runs before that paint.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden">("visible");

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen: leave it alone rather than animating something the
    // reader is looking at.
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("visible");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal={state} className="incident-reveal">
      {children}
    </div>
  );
}
