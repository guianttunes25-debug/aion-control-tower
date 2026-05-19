import type { HealthResponse } from '../types'
import { Led } from './Led'
import { MetricCard } from './MetricCard'

type StatusPanelProps = {
  online: boolean
  health: HealthResponse | null
  latencyMs: number | null
  lastHeartbeat: Date | null
}

export function StatusPanel({ online, health, latencyMs, lastHeartbeat }: StatusPanelProps) {
  const apiTone = online ? 'green' : 'red'
  const dbStatus = health?.components?.db?.status ?? (online ? 'UP' : 'UNKNOWN')
  const heartbeat = lastHeartbeat?.toLocaleTimeString('pt-BR') ?? '--:--:--'

  return (
    <section className="rounded-lg border border-cyan-300/20 bg-cyan-950/10 p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Status do sistema</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{online ? 'ONLINE' : 'OFFLINE'}</h2>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-cyan-300/20 bg-slate-950/70 px-4 py-2 text-sm text-slate-200">
          <Led tone={apiTone} pulse={online} />
          API {health?.status ?? 'INDISPONÍVEL'}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Heartbeat" value={heartbeat} detail="Atualiza a cada 3s" tone={online ? 'green' : 'red'} />
        <MetricCard label="Latência" value={latencyMs === null ? '--' : `${latencyMs}ms`} detail="Média das chamadas API" tone="cyan" />
        <MetricCard label="PostgreSQL" value={dbStatus} detail="Verificação via actuator" tone={dbStatus === 'UP' ? 'green' : 'yellow'} />
      </div>
    </section>
  )
}
