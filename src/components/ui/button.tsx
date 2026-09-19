import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The site's one button.
 *
 * This started as the stock shadcn button and had drifted out of use: most of
 * the site was hand-rolled `<button>` elements with their own hover and focus
 * classes, five of which had picked five different focus treatments. The
 * variants below are named for the roles the site actually has. Focus comes
 * from the site-wide rule in styles.css — a 2px offset outline in the current
 * surface's ink — so no variant restates it; `bar` is the one exception, and
 * it overrides deliberately, because an outline on a control mounted in a
 * solid bar reads as a box floating over the glyph.
 *
 * Adding a one-off `className` for colour or focus here is a smell: the variant
 * list is the place to add a role.
 */
const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium transition-colors",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    // Icons default to 16px but a variant or caller can say otherwise.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Navy fill. The neutral affirmative action. */
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        /** Brand red, display type. The one call to action per view. */
        accent:
          "border-2 border-accent bg-accent font-display font-bold uppercase tracking-[0.12em] text-accent-foreground hover:bg-accent/85",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted",
        link: "text-accent underline underline-offset-4",
        /** Bordered tile: share targets, filters, anything in a row of peers. */
        chip: "border border-border bg-card font-bold uppercase tracking-wider hover:bg-muted",
        /**
         * Mounted inside a solid bar (the header, the ticker). Takes its ink
         * from the bar, washes on hover, and inverts on focus.
         */
        bar: "hover-wash focus-invert text-current",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        /** Full-width block CTA, as in the hero. */
        block: "w-full px-5 py-3",
        icon: "size-9",
        /** 44px, the minimum comfortable touch target (WCAG 2.5.8 asks 24). */
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
