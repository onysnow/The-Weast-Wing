import { useEffect, useRef, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeAndRestoreFocus()}>
      <DialogContent className="inset-x-0 bottom-0 top-auto max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-auto rounded-none border-x-0 border-b-0 border-t-4 border-t-accent p-0 sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border-x sm:border-b">
        <DialogHeader className="border-b border-border px-5 py-5 pr-14 text-left sm:px-6">
          <DialogTitle className="font-display text-xl font-bold uppercase leading-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Information from The Weast Wing about {title.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
