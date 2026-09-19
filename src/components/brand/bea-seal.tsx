export function BEASeal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect
          key={i}
          x="49.5"
          y="4"
          width="1"
          height="4"
          fill="currentColor"
          transform={`rotate(${(360 / 24) * i} 50 50)`}
        />
      ))}
      <text
        x="50"
        y="44"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="var(--font-display)"
      >
        BEA
      </text>
      <line x1="30" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        BUREAU OF
      </text>
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        EXECUTIVE
      </text>
      <text
        x="50"
        y="78"
        textAnchor="middle"
        fontSize="5"
        letterSpacing="0.5"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        ANOMALIES
      </text>
    </svg>
  );
}
