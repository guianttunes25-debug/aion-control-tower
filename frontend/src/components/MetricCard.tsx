import { Led } from './Led'

type MetricCardProps = {
  label: string
  value: string | number
  detail?: string
  tone?: 'green' | 'yellow' | 'red' | 'cyan'
}

export function MetricCard({ label, value, detail, tone = 'cyan' }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-cyan-400/15 bg-slate-950/70 p-4 shadow-[0_0_28px_rgba(8,145,178,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
        <Led tone={tone} />
      </div>
      <div className="text-3xl font-semibold text-slate-50">{value}</div>
      {detail ? <p className="mt-2 text-sm text-slate-400">{detail}</p> : null}
    </article>
  )
}
