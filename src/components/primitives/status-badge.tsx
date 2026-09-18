export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {status}
    </span>
  );
}
