import type { LeadMemory } from '../types'
import { Led } from './Led'

export function LeadCard({ lead, rank }: { lead: LeadMemory; rank: number }) {
  const isTopLead = rank === 0
  const signals = [
    ['Instagram parado', lead.instagramAbandoned],
    ['Operação familiar', lead.familyBusiness],
    ['Sem promoções', lead.noPromotions],
    ['Bairro competitivo', lead.competitiveNeighborhood],
  ] as const

  return (
    <article
      className={`rounded-lg border p-4 ${
        isTopLead
          ? 'border-emerald-300/50 bg-emerald-950/20 shadow-[0_0_32px_rgba(16,185,129,0.14)]'
          : 'border-slate-700/70 bg-slate-950/60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
            <Led tone={isTopLead ? 'green' : 'cyan'} pulse={isTopLead} />
            {isTopLead ? 'Lead mais quente' : `Posição ${rank + 1}`}
          </div>
          <h3 className="text-lg font-semibold text-white">{lead.leadName}</h3>
          <p className="mt-1 text-sm text-slate-400">{lead.niche} / {lead.instagram ?? 'sem instagram'}</p>
        </div>
        <div className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Score</p>
          <p className="text-3xl font-semibold text-white">{lead.leadScore}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <span>Objeção: {lead.objectionCategory ?? 'nenhuma'}</span>
        <span>Interesse: {lead.interestLevel ?? 'desconhecido'}</span>
        <span>Reunião: {lead.meetingOutcome ?? 'pendente'}</span>
        <span>Latência: {lead.responseLatencyMinutes ?? '--'} min</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {signals.map(([label, active]) => (
          <span
            key={label}
            className={`rounded-full border px-3 py-1 text-xs ${
              active ? 'border-emerald-300/35 bg-emerald-400/10 text-emerald-200' : 'border-slate-700 bg-slate-900/70 text-slate-500'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </article>
  )
}
