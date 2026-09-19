export function AdSlot({ label }: { label: string }) {
  return (
    <div
      className="my-8 flex h-20 items-center justify-center border border-dashed border-border bg-muted/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
      aria-label="Advertisement placeholder"
    >
      {label}
    </div>
  );
}
