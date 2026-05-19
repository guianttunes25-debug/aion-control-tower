import { useState } from 'react'
import type { LeadMemory, RuntimeTask } from '../types'
import { Led } from '../components/Led'

type Decision = 'approved' | 'rejected' | 'modified'

type DecisionState = {
  decision: Decision
  decidedAt: string
  leadName: string
}

type DecisionStateByKey = Record<string, DecisionState>

function loadStoredDecisions() {
  const decisions: DecisionStateByKey = {}

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)

    if (!key?.startsWith('aion-approval-')) {
      continue
    }

    const value = window.localStorage.getItem(key)

    if (!value) {
      continue
    }

    try {
      decisions[key] = JSON.parse(value) as DecisionState
    } catch {
      window.localStorage.removeItem(key)
    }
  }

  return decisions
}

function riskLevel(lead?: LeadMemory) {
  if (!lead) {
    return 'DESCONHECIDO'
  }
  if (lead.leadScore >= 8 || lead.meetingOutcome === 'demo_requested') {
    return 'MÉDIO'
  }
  return 'BAIXO'
}

function decisionLabel(decision: Decision) {
  const labels: Record<Decision, string> = {
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    modified: 'Modificar antes de seguir',
  }
  return labels[decision]
}

export function ApprovalConsole({ leads, runningTasks }: { leads: LeadMemory[]; runningTasks: RuntimeTask[] }) {
  const lead = leads[0]
  const pendingHuman = runningTasks.find((task) => task.requiredAgentType === 'HUMAN_APPROVAL')
  const hasCommercialGate = Boolean(lead && (lead.leadScore >= 8 || lead.meetingOutcome === 'demo_requested'))
  const risk = riskLevel(lead)
  const storageKey = lead ? `aion-approval-${lead.id}` : 'aion-approval-empty'
  const [decisionStates, setDecisionStates] = useState<DecisionStateByKey>(loadStoredDecisions)
  const decisionState = decisionStates[storageKey] ?? null

  function recordDecision(decision: Decision) {
    if (!lead) {
      return
    }

    const nextDecision = {
      decision,
      decidedAt: new Date().toISOString(),
      leadName: lead.leadName,
    }
    window.localStorage.setItem(storageKey, JSON.stringify(nextDecision))
    setDecisionStates((current) => ({ ...current, [storageKey]: nextDecision }))
  }

  const gateLabel = decisionState
    ? decisionLabel(decisionState.decision)
    : hasCommercialGate || pendingHuman
      ? 'Revisão necessária'
      : 'Nenhuma ação crítica'

  return (
    <section className="rounded-lg border border-amber-300/25 bg-amber-950/10 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">Console de aprovação</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Gate de decisão humana</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-300/25 bg-slate-950/70 px-4 py-2 text-sm text-amber-100">
          <Led tone={decisionState ? 'green' : hasCommercialGate || pendingHuman ? 'yellow' : 'green'} pulse={!decisionState && (hasCommercialGate || Boolean(pendingHuman))} />
          {gateLabel}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/75 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Contexto</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{lead?.leadName ?? 'Nenhum lead selecionado'}</h3>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <span>Score: {lead?.leadScore ?? '--'}</span>
            <span>Risco: {risk}</span>
            <span>Resultado: {lead?.meetingOutcome ?? 'pendente'}</span>
            <span>Objeção: {lead?.objectionCategory ?? 'nenhuma'}</span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Ações críticas como enviar ofertas, fechar leads, criar agentes ou alterar leads de score alto continuam dependendo de aprovação humana.
          </p>
          {decisionState ? (
            <div className="mt-4 rounded-md border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
              Decisão registrada: {decisionLabel(decisionState.decision)} às {new Date(decisionState.decidedAt).toLocaleTimeString('pt-BR')}.
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/75 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Ações de decisão</p>
          <div className="mt-4 grid gap-3">
            <button className="rounded-md border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-left text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20" type="button" onClick={() => recordDecision('approved')}>Aprovar</button>
            <button className="rounded-md border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-left text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20" type="button" onClick={() => recordDecision('rejected')}>Rejeitar</button>
            <button className="rounded-md border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20" type="button" onClick={() => recordDecision('modified')}>Modificar</button>
          </div>
          <p className="mt-3 text-xs text-slate-500">Nesta versão a decisão é registrada localmente no navegador. Persistência no backend entra depois da validação dos 10 leads.</p>
        </div>
      </div>
    </section>
  )
}
