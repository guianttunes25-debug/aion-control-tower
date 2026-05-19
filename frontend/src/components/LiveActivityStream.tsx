import type { LeadMemory, RuntimeEvent, RuntimeMetrics } from '../types'
import { Led } from './Led'

function eventLabel(event: RuntimeEvent) {
  const type = event.type ?? 'RUNTIME_EVENT'
  const message = event.message ?? 'Atividade detectada no sistema'
  const translatedType = type
    .replace('AGENT_HEARTBEAT', 'HEARTBEAT_DO_AGENTE')
    .replace('TASK_ASSIGNED', 'TAREFA_ATRIBUÍDA')
    .replace('TASK_STARTED', 'TAREFA_INICIADA')
    .replace('TASK_COMPLETED', 'TAREFA_CONCLUÍDA')
    .replace('TASK_FAILED', 'TAREFA_COM_FALHA')
  const translatedMessage = message
    .replace('heartbeat received', 'heartbeat recebido')
    .replace('Task completed', 'Tarefa concluída')
    .replace('Task started', 'Tarefa iniciada')
    .replace('Task assigned', 'Tarefa atribuida')
  return `${translatedType}: ${translatedMessage}`
}

export function LiveActivityStream({
  events,
  leads,
  runtime,
}: {
  events: RuntimeEvent[]
  leads: LeadMemory[]
  runtime: RuntimeMetrics | null
}) {
  const lead = leads[0]
  const synthetic = [
    lead ? `Lead processado: ${lead.leadName}` : 'Radar de leads aguardando dados',
    lead ? `Score atualizado: ${lead.leadScore}` : 'Ranking de score em espera',
    `Workflow executado: ${runtime?.tasksCompleted ?? 0} tarefas concluídas`,
  ]

  const feed = [
    ...synthetic.map((message, index) => ({ id: `synthetic-${index}`, message })),
    ...events.slice(0, 8).map((event, index) => ({ id: event.id ?? `event-${index}`, message: eventLabel(event) })),
  ].slice(0, 10)

  return (
    <section className="rounded-lg border border-cyan-300/20 bg-slate-950/70 p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Feed ao vivo</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Fluxo de atividade</h2>
        </div>
        <Led tone="green" pulse />
      </div>

      <ol className="space-y-3">
        {feed.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-md border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-200">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
            <span>{item.message}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
