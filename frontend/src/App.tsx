import { useMemo, useState } from 'react'
import { AgentsPanel } from './components/AgentsPanel'
import { Led } from './components/Led'
import { LiveActivityStream } from './components/LiveActivityStream'
import { StatusPanel } from './components/StatusPanel'
import { TopLeads } from './components/TopLeads'
import { AgentGraph } from './agent-graph/AgentGraph'
import { ApprovalConsole } from './approval-console/ApprovalConsole'
import { AutomationCenter } from './automation-center/AutomationCenter'
import { BrowserAutopilot } from './browser-autopilot/BrowserAutopilot'
import { BrowserExtensionProject } from './browser-extension/BrowserExtensionProject'
import { BrowserOperator } from './browser-operator/BrowserOperator'
import { CeoChat } from './ceo-chat/CeoChat'
import { useAionTelemetry } from './hooks/useAionTelemetry'
import { OpsRoom } from './ops-room/OpsRoom'
import { ProductStudio } from './product-studio/ProductStudio'

type WorkspaceView = 'active' | 'browser' | 'production' | 'runtime' | 'extension'

const workspaceViews: { id: WorkspaceView; label: string; description: string }[] = [
  { id: 'active', label: 'Em uso', description: 'Status, CEO e sinais ativos' },
  { id: 'browser', label: 'Navegador', description: 'Operador, Autopilot e cursos' },
  { id: 'production', label: 'Produção', description: 'Produto, conteúdo e automações' },
  { id: 'runtime', label: 'Runtime', description: 'Agentes, leads, feed e aprovações' },
  { id: 'extension', label: 'Extensão', description: 'Chrome/Edge Autopilot' },
]

function formatNumber(value: number | undefined) {
  return value === undefined ? '--' : value.toLocaleString('pt-BR')
}

function App() {
  const telemetry = useAionTelemetry(3000)
  const [activeView, setActiveView] = useState<WorkspaceView>('active')
  const statusTone = telemetry.online ? 'green' : 'red'
  const activeAgents = telemetry.runtime?.activeAgents ?? 0
  const runningTasks = telemetry.runningTasks.length
  const topLead = telemetry.leads[0]

  const activitySummary = useMemo(() => [
    {
      label: 'Sistema',
      value: telemetry.online ? 'Online' : 'Offline',
      detail: telemetry.error ? 'Telemetria degradada' : 'Runtime local',
      tone: telemetry.online ? 'text-emerald-300' : 'text-rose-300',
    },
    {
      label: 'Agentes ativos',
      value: formatNumber(activeAgents),
      detail: runningTasks > 0 ? `${runningTasks} tarefa(s) em execução` : 'Nenhuma tarefa rodando agora',
      tone: activeAgents > 0 ? 'text-cyan-200' : 'text-slate-300',
    },
    {
      label: 'Lead prioritário',
      value: topLead ? String(topLead.leadScore) : '--',
      detail: topLead?.leadName ?? 'Radar aguardando dados',
      tone: topLead ? 'text-amber-200' : 'text-slate-300',
    },
    {
      label: 'Extensão',
      value: 'Pronta',
      detail: 'Chrome/Edge developer mode',
      tone: 'text-teal-200',
    },
  ], [activeAgents, runningTasks, telemetry.error, telemetry.online, topLead])

  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-lg border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">Sistema de comando de IA</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">AION COMMAND CENTER</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Painel compacto para operar apenas o que está ativo: CEO, navegador, runtime e extensão local.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-100">
              <Led tone={statusTone} pulse={telemetry.online} />
              {telemetry.online ? 'Sistema online' : 'Sistema offline'}
            </div>
          </div>
          {telemetry.error ? (
            <div className="mt-4 rounded-md border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              Telemetria degradada: {telemetry.error}
            </div>
          ) : null}
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {activitySummary.map((item) => (
            <article key={item.label} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>{item.value}</p>
              <p className="mt-1 truncate text-sm text-slate-400">{item.detail}</p>
            </article>
          ))}
        </section>

        <nav className="grid gap-2 rounded-lg border border-slate-800 bg-slate-950/70 p-2 lg:grid-cols-5">
          {workspaceViews.map((view) => {
            const selected = activeView === view.id
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={`rounded-md border px-3 py-3 text-left transition ${
                  selected
                    ? 'border-cyan-300/60 bg-cyan-300/12 text-white'
                    : 'border-transparent bg-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-100'
                }`}
              >
                <span className="block text-sm font-semibold">{view.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{view.description}</span>
              </button>
            )
          })}
        </nav>

        {activeView === 'active' ? (
          <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col gap-4">
              <StatusPanel
                online={telemetry.online}
                health={telemetry.health}
                latencyMs={telemetry.latencyMs}
                lastHeartbeat={telemetry.lastHeartbeat}
              />
              <TopLeads leads={telemetry.leads} revenue={telemetry.revenue} />
            </div>
            <CeoChat telemetry={telemetry} />
          </div>
        ) : null}

        {activeView === 'browser' ? (
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <BrowserOperator />
            <BrowserAutopilot />
          </div>
        ) : null}

        {activeView === 'production' ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <ProductStudio />
            <AutomationCenter />
          </div>
        ) : null}

        {activeView === 'runtime' ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <AgentsPanel metrics={telemetry.runtime} />
              <LiveActivityStream events={telemetry.events} leads={telemetry.leads} runtime={telemetry.runtime} />
            </div>
            <AgentGraph agents={telemetry.agents} runningTasks={telemetry.runningTasks} />
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <OpsRoom agents={telemetry.agents} runningTasks={telemetry.runningTasks} />
              <ApprovalConsole leads={telemetry.leads} runningTasks={telemetry.runningTasks} />
            </div>
          </div>
        ) : null}

        {activeView === 'extension' ? <BrowserExtensionProject /> : null}
      </div>
    </main>
  )
}

export default App
