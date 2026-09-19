import type { Transition, Variants } from "motion/react";

/**
 * The site's motion vocabulary.
 *
 * Every animation reads its timing and its shape from here rather than
 * inventing one, for the same reason focus lives in styles.css: a duration
 * chosen per component is a duration nobody can keep consistent. Components
 * import a transition and a variant; they do not write cubic-béziers.
 *
 * Both gates — the OS `prefers-reduced-motion` setting and the site's own
 * pause switch — are applied once, by <SiteMotionConfig> in
 * src/components/motion-provider.tsx. Nothing here needs to check them.
 */

/** Seconds. Anything past `slow` is decoration the reader has to wait through. */
export const DURATION = {
  /** State flips the reader caused: a press, a toggle. */
  instant: 0.12,
  /** The default. Hovers, fades, small moves. */
  fast: 0.2,
  /** Something entering or leaving the page. */
  base: 0.32,
  /** A panel or sheet travelling a real distance. */
  slow: 0.45,
} as const;

/**
 * A single easing family, so everything decelerates the same way.
 * `out` is the standard "arrives and settles" curve; `inOut` is for things
 * that leave and come back, like a drawer.
 */
export const EASE = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASE.out },
  base: { duration: DURATION.base, ease: EASE.out },
  slow: { duration: DURATION.slow, ease: EASE.out },
  drawer: { duration: DURATION.base, ease: EASE.inOut },
} satisfies Record<string, Transition>;

/* ------------------------------ Variants -------------------------------- */

/** Dimmed backdrop behind a modal. */
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * A modal panel. On phones it is a bottom sheet that rises from its own
 * edge; above `sm` it is a centred card that scales up in place — a sheet
 * that grew out of the middle of the screen would read as the wrong object.
 *
 * The centred variant carries its own -50%/-50% offsets rather than leaving
 * them to Tailwind's `-translate-x-1/2`: Motion writes the whole `transform`
 * property inline, so a translate set in a class would be overwritten the
 * moment the panel animated, and the card would fly to the bottom-right.
 */
export const sheetVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const dialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, x: "-50%", y: "-50%" },
  visible: { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
};

/** The corner notice. Comes up from its own edge. */
export const noticeVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Cards arriving as the reader scrolls. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

/** A disclosure opening in place. Height is animated from measured content. */
export const collapseVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1 },
};
