export function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
      {Array.from({ length: 32 }).map((_, i) => (
        <rect
          key={i}
          x="49.4"
          y="2"
          width="1.2"
          height="5"
          fill="currentColor"
          transform={`rotate(${(360 / 32) * i} 50 50)`}
        />
      ))}
      <path
        d="M50 30c8 0 11 5 10 9 5 1 8 4 8 8 4 1 6 4 6 7 0 4-4 7-9 7H35c-5 0-9-3-9-7 0-3 2-6 6-7 0-4 3-7 8-8-1-4 2-9 10-9z"
        fill="currentColor"
        opacity="0.9"
      />
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        EST. 2026
      </text>
    </svg>
  );
}
