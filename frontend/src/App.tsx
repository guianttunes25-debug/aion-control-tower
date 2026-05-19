import { AgentsPanel } from './components/AgentsPanel'
import { Led } from './components/Led'
import { LiveActivityStream } from './components/LiveActivityStream'
import { StatusPanel } from './components/StatusPanel'
import { TopLeads } from './components/TopLeads'
import { AgentGraph } from './agent-graph/AgentGraph'
import { ApprovalConsole } from './approval-console/ApprovalConsole'
import { AutomationCenter } from './automation-center/AutomationCenter'
import { BrowserOperator } from './browser-operator/BrowserOperator'
import { CeoChat } from './ceo-chat/CeoChat'
import { useAionTelemetry } from './hooks/useAionTelemetry'
import { OpsRoom } from './ops-room/OpsRoom'
import { ProductStudio } from './product-studio/ProductStudio'

function App() {
  const telemetry = useAionTelemetry(3000)
  const statusTone = telemetry.online ? 'green' : 'red'

  return (
    <main className="min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-cyan-300/20 bg-slate-950/70 p-5 shadow-[0_0_60px_rgba(14,165,233,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Sistema de comando de IA</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-5xl">AION CONTROL TOWER</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-400 sm:text-base">
                Central de comando do AION para observabilidade do runtime, hierarquia de agentes, sala operacional e aprovações humanas.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-100">
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

        <StatusPanel
          online={telemetry.online}
          health={telemetry.health}
          latencyMs={telemetry.latencyMs}
          lastHeartbeat={telemetry.lastHeartbeat}
        />

        <CeoChat telemetry={telemetry} />

        <BrowserOperator />

        <ProductStudio />

        <AutomationCenter />

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-5">
            <AgentsPanel metrics={telemetry.runtime} />
            <TopLeads leads={telemetry.leads} revenue={telemetry.revenue} />
          </div>
          <LiveActivityStream events={telemetry.events} leads={telemetry.leads} runtime={telemetry.runtime} />
        </div>

        <AgentGraph agents={telemetry.agents} runningTasks={telemetry.runningTasks} />

        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <OpsRoom agents={telemetry.agents} runningTasks={telemetry.runningTasks} />
          <ApprovalConsole leads={telemetry.leads} runningTasks={telemetry.runningTasks} />
        </div>
      </div>
    </main>
  )
}

export default App
