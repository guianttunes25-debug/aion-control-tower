import type { LeadMemory, RevenueMetrics } from '../types'
import { LeadCard } from './LeadCard'
import { MetricCard } from './MetricCard'

export function TopLeads({ leads, revenue }: { leads: LeadMemory[]; revenue: RevenueMetrics | null }) {
  return (
    <section className="rounded-lg border border-slate-700/70 bg-slate-950/60 p-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Fluxo comercial</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Prioridade dos leads</h2>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-3">
          <MetricCard label="Leads" value={revenue?.leadCount ?? leads.length} tone="cyan" />
          <MetricCard label="Reuniões" value={revenue?.meetingsBooked ?? 0} tone="green" />
          <MetricCard label="MRR" value={`R$ ${revenue?.monthlyRecurringRevenue ?? 0}`} tone="yellow" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {leads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-slate-400">Nenhum lead priorizado retornado pelo radar.</div>
        ) : (
          leads.map((lead, index) => <LeadCard key={lead.id} lead={lead} rank={index} />)
        )}
      </div>
    </section>
  )
}
