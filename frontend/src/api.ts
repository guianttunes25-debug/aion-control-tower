import type { AgentRuntime, HealthResponse, LeadMemory, RevenueMetrics, RuntimeEvent, RuntimeMetrics, RuntimeTask } from './types'

const API_PREFIX = '/api'

async function getJson<T>(path: string): Promise<{ data: T; latencyMs: number }> {
  const startedAt = performance.now()
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: { Accept: 'application/json' },
  })

  const latencyMs = Math.round(performance.now() - startedAt)

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`)
  }

  return { data: (await response.json()) as T, latencyMs }
}

export async function fetchTelemetry() {
  const [health, runtime, revenue, leads, events, agents, runningTasks] = await Promise.all([
    getJson<HealthResponse>('/actuator/health'),
    getJson<RuntimeMetrics>('/runtime/metrics'),
    getJson<RevenueMetrics>('/revenue/workflows/metrics/pmf'),
    getJson<LeadMemory[]>('/revenue/workflows/memory/leads/priority'),
    getJson<RuntimeEvent[]>('/runtime/events'),
    getJson<AgentRuntime[]>('/runtime/agents'),
    getJson<RuntimeTask[]>('/runtime/tasks/running'),
  ])

  const latencyMs = Math.round(
    (
      health.latencyMs
      + runtime.latencyMs
      + revenue.latencyMs
      + leads.latencyMs
      + events.latencyMs
      + agents.latencyMs
      + runningTasks.latencyMs
    ) / 7,
  )

  return {
    health: health.data,
    runtime: runtime.data,
    revenue: revenue.data,
    leads: leads.data,
    events: events.data,
    agents: agents.data,
    runningTasks: runningTasks.data,
    latencyMs,
  }
}
