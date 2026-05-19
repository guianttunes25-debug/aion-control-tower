import type { AgentRuntime, RuntimeTask } from '../types'
import { Led } from '../components/Led'

const stations = [
  { type: 'PLANNER', label: 'Planejamento', x: '10%', y: '18%' },
  { type: 'LEAD_RESEARCH', label: 'Lead', x: '38%', y: '16%' },
  { type: 'OFFER_GENERATION', label: 'Receita', x: '66%', y: '18%' },
  { type: 'FIX', label: 'Recuperação', x: '18%', y: '58%' },
  { type: 'REPLY_ANALYSIS', label: 'Resposta', x: '50%', y: '58%' },
  { type: 'DEPLOY', label: 'Deploy', x: '75%', y: '58%' },
]

function findAgent(agents: AgentRuntime[], type: string) {
  return agents.find((agent) => agent.type === type)
}

function currentTask(tasks: RuntimeTask[], type: string) {
  return tasks.find((task) => task.requiredAgentType === type)
}

export function OpsRoom({ agents, runningTasks }: { agents: AgentRuntime[]; runningTasks: RuntimeTask[] }) {
  return (
    <section className="rounded-lg border border-slate-700/70 bg-slate-950/60 p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Sala operacional</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Mesa visual 2D dos agentes</h2>
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-lg border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(8,47,73,0.45))]">
        <div className="absolute inset-x-0 top-0 h-16 border-b border-cyan-300/10 bg-cyan-300/5" />
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-md border border-cyan-300/20 bg-slate-950/80 px-5 py-2 text-xs uppercase tracking-[0.18em] text-cyan-200">Sala de missão</div>
        <div className="absolute bottom-0 left-0 right-0 h-24 border-t border-cyan-300/10 bg-slate-950/50" />

        {stations.map((station) => {
          const agent = findAgent(agents, station.type)
          const task = currentTask(runningTasks, station.type)
          const active = Boolean(task) || agent?.status === 'BUSY'

          return (
            <div key={station.type} className="absolute w-36" style={{ left: station.x, top: station.y }} title={task?.title ?? agent?.status ?? 'Sem dados do runtime'}>
              <div className="rounded-lg border border-cyan-300/20 bg-slate-950/85 p-3 shadow-[0_0_24px_rgba(14,165,233,0.12)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-200">{station.label}</span>
                  <Led tone={active ? 'green' : agent?.status === 'OFFLINE' ? 'red' : 'cyan'} pulse={active} />
                </div>
                <div className="mx-auto h-12 w-12 rounded-md border border-slate-600 bg-slate-800 shadow-inner">
                  <div className={`mx-auto mt-2 h-5 w-5 rounded-full ${active ? 'animate-pulse bg-emerald-300' : 'bg-slate-500'}`} />
                  <div className="mx-auto mt-1 h-3 w-8 rounded-sm bg-cyan-300/30" />
                </div>
                <div className="mt-3 h-8 rounded border border-slate-700 bg-black/40 px-2 py-1 text-[10px] text-slate-300">
                  {task ? task.title : agent?.name ?? 'Sem agente'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
