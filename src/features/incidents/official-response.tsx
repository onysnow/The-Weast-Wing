import { Seal } from "@/components/brand/seal";

/**
 * The Weast Wing's official defense of the President: earnest, official-looking,
 * and deeply unconvincing. This is the joke.
 */
export function OfficialResponse({ text }: { text?: string | undefined }) {
  if (!text) return null;
  return (
    <blockquote className="m-0 border border-border bg-muted p-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
        <Seal className="size-4 shrink-0 text-primary" />
        Official Response — The Weast Wing
      </p>
      <p className="mt-1.5 border-l-2 border-accent pl-3 text-xs italic leading-relaxed text-muted-foreground">
        “{text}”
      </p>
      <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
        Issued with total confidence. Reviewed by no one.
      </p>
    </blockquote>
  );
}
