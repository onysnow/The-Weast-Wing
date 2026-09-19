import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TRANSITION, dialogVariants, overlayVariants, sheetVariants } from "@/lib/motion";
import { useIsWide } from "@/lib/use-media-query";

/**
 * The site's modal.
 *
 * Built directly on the Radix dialog primitive rather than the shadcn
 * `DialogContent` wrapper, because the wrapper mounts and unmounts with the
 * open state: the panel simply vanished on close, which is the thing that
 * looked cheapest about it. `forceMount` hands the open state to
 * <AnimatePresence> instead, so the exit actually plays before the panel
 * leaves the tree.
 *
 * The panel is a bottom sheet on phones and a centred card above `sm`, so it
 * takes the matching entrance — a sheet that scaled up from its centre would
 * read as the wrong object.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const openerRef = useRef<HTMLElement | null>(null);
  const isWide = useIsWide();

  useEffect(() => {
    if (open && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
  }, [open]);

  const closeAndRestoreFocus = () => {
    onClose();
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && closeAndRestoreFocus()}
    >
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <m.div
                className="fixed inset-0 z-50 bg-black/80"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={TRANSITION.fast}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <m.div
                className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] w-full overflow-y-auto border-t-4 border-t-accent bg-background shadow-lg sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:border"
                variants={isWide ? dialogVariants : sheetVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={TRANSITION.base}
              >
                <div className="border-b border-border px-5 py-5 pr-14 text-left sm:px-6">
                  <DialogPrimitive.Title className="font-display text-xl font-bold uppercase leading-tight">
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">
                    Information from The Weast Wing about {title.toLowerCase()}.
                  </DialogPrimitive.Description>
                </div>

                <DialogPrimitive.Close asChild>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="absolute right-1 top-1 text-muted-foreground hover:text-foreground sm:right-2 sm:top-2"
                    aria-label="Close"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </DialogPrimitive.Close>

                <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {children}
                </div>
              </m.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
