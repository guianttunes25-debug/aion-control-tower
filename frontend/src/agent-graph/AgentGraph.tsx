import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { AgentRuntime, RuntimeTask } from '../types'
import { Led } from '../components/Led'

type AgentNodeData = {
  label: string
  role: string
  status: string
  seniority: string
  active: boolean
}

const leadershipNodes: Array<Node<AgentNodeData>> = [
  { id: 'ceo', type: 'agent', position: { x: 340, y: 0 }, data: { label: 'CEO Agent', role: 'Visão / metas', status: 'PLANEJADO', seniority: 'Executivo', active: false } },
  { id: 'cto', type: 'agent', position: { x: 340, y: 115 }, data: { label: 'CTO Agent', role: 'Governança técnica', status: 'ATIVO', seniority: 'Meta', active: true } },
  { id: 'manager', type: 'agent', position: { x: 340, y: 230 }, data: { label: 'Agent Manager', role: 'Supervisão do runtime', status: 'ATIVO', seniority: 'Staff', active: true } },
  { id: 'dispatcher', type: 'agent', position: { x: 340, y: 345 }, data: { label: 'Dispatcher', role: 'Roteamento de tarefas', status: 'ATIVO', seniority: 'Senior', active: true } },
]

const baseEdges: Edge[] = [
  { id: 'ceo-cto', source: 'ceo', target: 'cto', animated: false },
  { id: 'cto-manager', source: 'cto', target: 'manager', animated: true },
  { id: 'manager-dispatcher', source: 'manager', target: 'dispatcher', animated: true },
]

function statusTone(status: string, active: boolean) {
  if (active || status === 'AVAILABLE' || status === 'ACTIVE') {
    return 'green'
  }
  if (status === 'BUSY' || status === 'RUNNING') {
    return 'yellow'
  }
  return status === 'OFFLINE' ? 'red' : 'cyan'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    AVAILABLE: 'DISPONÍVEL',
    OFFLINE: 'OFFLINE',
    BUSY: 'OCUPADO',
    ACTIVE: 'ATIVO',
    PLANNED: 'PLANEJADO',
    ATIVO: 'ATIVO',
    PLANEJADO: 'PLANEJADO',
  }
  return labels[status] ?? status
}

function AgentNode({ data }: NodeProps<Node<AgentNodeData>>) {
  const tone = statusTone(data.status, data.active)

  return (
    <div className="min-w-44 rounded-lg border border-cyan-300/25 bg-slate-950/95 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <Handle type="target" position={Position.Top} className="!bg-cyan-300" />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">{data.seniority}</div>
        <Led tone={tone} pulse={data.active} />
      </div>
      <div className="mt-2 text-sm font-semibold text-white">{data.label}</div>
      <div className="mt-1 text-xs text-slate-400">{data.role}</div>
      <div className="mt-3 rounded border border-slate-700 bg-slate-900/80 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">{statusLabel(data.status)}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-300" />
    </div>
  )
}

const nodeTypes = { agent: AgentNode }

function agentSeniority(type: string) {
  if (['PLANNER', 'REVIEW', 'DEPLOY'].includes(type)) {
    return 'Senior'
  }
  if (['LEAD_RESEARCH', 'OPPORTUNITY_SCORE', 'OFFER_GENERATION', 'OUTREACH', 'REPLY_ANALYSIS'].includes(type)) {
    return 'Especialista'
  }
  return 'Worker'
}

function agentRole(type: string) {
  const roles: Record<string, string> = {
    PLANNER: 'Planejamento',
    RESEARCH: 'Pesquisa',
    CODE: 'Implementação',
    REVIEW: 'Revisão',
    FIX: 'Recuperação',
    TEST: 'Validação',
    DEPLOY: 'Preparação de release',
    LEAD_RESEARCH: 'Inteligência de leads',
    OPPORTUNITY_SCORE: 'Score comercial',
    OFFER_GENERATION: 'Desenho da oferta',
    OUTREACH: 'Rascunho de abordagem',
    REPLY_ANALYSIS: 'Análise de resposta',
  }
  return roles[type] ?? type
}

function buildGraph(agents: AgentRuntime[], runningTasks: RuntimeTask[]) {
  const activeTypes = new Set(runningTasks.map((task) => task.requiredAgentType).filter(Boolean))
  const visibleAgents = agents.filter((agent) => agent.name !== 'FakeCodeAgent')
  const columns = [-40, 160, 360, 560, 760]

  const agentNodes: Array<Node<AgentNodeData>> = visibleAgents.map((agent, index) => ({
    id: `agent-${agent.id}`,
    type: 'agent',
    position: { x: columns[index % columns.length], y: 500 + Math.floor(index / columns.length) * 135 },
    data: {
      label: agent.name,
      role: agentRole(agent.type),
      status: agent.status,
      seniority: agentSeniority(agent.type),
      active: activeTypes.has(agent.type) || agent.status === 'BUSY',
    },
  }))

  const agentEdges: Edge[] = visibleAgents.map((agent) => ({
    id: `dispatcher-${agent.id}`,
    source: 'dispatcher',
    target: `agent-${agent.id}`,
    animated: activeTypes.has(agent.type) || agent.status === 'BUSY',
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: activeTypes.has(agent.type) ? '#34d399' : '#164e63' },
  }))

  return {
    nodes: [...leadershipNodes, ...agentNodes],
    edges: [...baseEdges, ...agentEdges],
  }
}

export function AgentGraph({ agents, runningTasks }: { agents: AgentRuntime[]; runningTasks: RuntimeTask[] }) {
  const { nodes, edges } = buildGraph(agents, runningTasks)

  return (
    <section className="rounded-lg border border-cyan-300/20 bg-slate-950/70 p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Grafo de agentes</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Hierarquia e fluxo de delegação</h2>
        </div>
        <p className="max-w-xl text-sm text-slate-400">Papéis mestres são modelados visualmente; workers reais vêm do runtime ao vivo.</p>
      </div>
      <div className="h-[620px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.55}
          maxZoom={1.4}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#155e75" gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </section>
  )
}
