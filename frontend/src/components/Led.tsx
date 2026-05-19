type LedTone = 'green' | 'yellow' | 'red' | 'cyan'

const toneClass: Record<LedTone, string> = {
  green: 'bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.95)]',
  yellow: 'bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.95)]',
  red: 'bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.95)]',
  cyan: 'bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]',
}

export function Led({ tone = 'green', pulse = false }: { tone?: LedTone; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-3 w-3 shrink-0 items-center justify-center" aria-hidden="true">
      {pulse ? <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${toneClass[tone]} opacity-40`} /> : null}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${toneClass[tone]}`} />
    </span>
  )
}
