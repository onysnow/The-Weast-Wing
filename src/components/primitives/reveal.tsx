import { useInView } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// useLayoutEffect warns during server rendering; useEffect is the right no-op
// there. On the client we need layout timing — see below.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fades its children in as they scroll into view.
 *
 * Deliberately *not* a `motion.div` with `initial="hidden"`, which is how this
 * is usually written. That form puts `opacity: 0` in the server-rendered HTML,
 * so with JavaScript off — or before it loads, or for a crawler that does not
 * run it — every card below the fold is invisible. On a site whose content is
 * the point, that trade is not worth a fade.
 *
 * So the element renders visible, and a *layout* effect decides whether to
 * hide it, before the browser paints. (With a passive effect the browser
 * painted the visible state first, and every card flashed into view, blanked,
 * then faded back in.) Motion's `useInView` then drives the reveal, replacing
 * the IntersectionObserver this used to set up by hand; the movement itself is
 * CSS, which keeps it off the main thread and costs no JavaScript per card.
 *
 * Both motion gates still apply: the media query short-circuits the hide
 * below, and `.incident-reveal` is pinned visible under
 * `prefers-reduced-motion` in styles.css.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px", amount: 0.08 });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen: leave it alone rather than animating something the
    // reader is looking at.
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) return;
    setArmed(true);
  }, []);

  const state = !armed || inView ? "visible" : "hidden";

  return (
    <div ref={ref} data-reveal={state} className="incident-reveal">
      {children}
    </div>
  );
}
