import type { RuntimeMetrics } from '../types'
import { MetricCard } from './MetricCard'

export function AgentsPanel({ metrics }: { metrics: RuntimeMetrics | null }) {
  const completed = metrics?.tasksCompleted ?? 0
  const failed = metrics?.tasksFailed ?? 0
  const total = completed + failed
  const successRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <section className="rounded-lg border border-slate-700/70 bg-slate-950/60 p-5">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Agentes ao vivo</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Grade de execução do runtime</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Agentes ativos" value={metrics?.activeAgents ?? '--'} detail="Pool de workers disponível" tone="green" />
        <MetricCard label="Tarefas rodando" value="ao vivo" detail="Scheduler consultando backend" tone="yellow" />
        <MetricCard label="Tarefas concluídas" value={completed} detail={`${failed} falhas permanentes`} tone="cyan" />
        <MetricCard label="Taxa de sucesso" value={`${successRate}%`} detail="Concluídas vs falhas" tone={successRate >= 95 ? 'green' : 'yellow'} />
      </div>
    </section>
  )
}
