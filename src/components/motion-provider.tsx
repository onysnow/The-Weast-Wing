import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

import { useMotionState } from "@/lib/motion-preference";
import { TRANSITION } from "@/lib/motion";

/**
 * Applies the site's two motion gates once, at the root, so no individual
 * animation has to remember them.
 *
 *  - `reducedMotion="user"` hands the OS `prefers-reduced-motion` setting to
 *    Motion, which then drops transform and layout animation and keeps only
 *    opacity — the behaviour that setting asks for.
 *  - The site's own pause switch (the control in the ticker, which exists
 *    because WCAG 2.2.2 wants a stop for anything looping past five seconds)
 *    forces the same treatment for visitors who have not set an OS
 *    preference.
 *
 * `transition` here is the default every child animation inherits unless it
 * names its own.
 *
 * <LazyMotion> is why components import `m` rather than `motion`: `motion.div`
 * pulls Motion's whole feature set into the first bundle, including drag,
 * layout projection and SVG path morphing, none of which this site uses.
 * Loading `domAnimation` instead, in a chunk of its own, costs what the site
 * actually animates. `strict` makes the mistake loud — a stray `motion.div`
 * throws in development rather than quietly restoring the weight.
 */
export function SiteMotionConfig({ children }: { children: ReactNode }) {
  const paused = useMotionState() === "paused";

  return (
    <LazyMotion features={loadDomAnimation} strict>
      <MotionConfig reducedMotion={paused ? "always" : "user"} transition={TRANSITION.base}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

/** Split out so the feature bundle is fetched after first paint, not with it. */
const loadDomAnimation = () =>
  import("motion/react").then((motionModule) => motionModule.domAnimation);
