export type HealthResponse = {
  status?: string
  components?: {
    db?: { status?: string }
    diskSpace?: { status?: string }
    ping?: { status?: string }
  }
}

export type RuntimeMetrics = {
  tasksCompleted: number
  tasksFailed: number
  averageExecutionSeconds: number
  activeAgents: number
}

export type RevenueMetrics = {
  revenueGenerated: number
  meetingsBooked: number
  offersAccepted: number
  conversionRate: number
  monthlyRecurringRevenue: number
  leadCount: number
}

export type LeadMemory = {
  id: number
  leadName: string
  niche: string
  productOffer: string
  targetMonthlyPrice: string
  website?: string | null
  instagram?: string | null
  objectionCategory?: string | null
  responseLatencyMinutes?: number | null
  interestLevel?: string | null
  meetingOutcome?: string | null
  businessPainLevel?: string | null
  decisionMakerPresent?: boolean | null
  budgetRange?: string | null
  followUpCount: number
  leadScore: number
  instagramAbandoned?: boolean | null
  familyBusiness?: boolean | null
  noPromotions?: boolean | null
  competitiveNeighborhood?: boolean | null
  scoreNotes?: string | null
  revenueGenerated: number
  meetingsBooked: number
  offersAccepted: number
  monthlyRecurringRevenue: number
  updatedAt: string
}

export type RuntimeEvent = {
  id?: number
  type?: string
  taskId?: number | null
  agentId?: number | null
  message?: string
  timestamp?: string
  createdAt?: string
}

export type AgentRuntime = {
  id: number
  name: string
  type: string
  status: string
  lastHeartbeat?: string | null
  createdAt?: string | null
}

export type RuntimeTask = {
  id: number
  title: string
  status: string
  requiredAgentType?: string | null
  workflowId?: string | null
  workflowStep?: number | null
  updatedAt?: string | null
}

export type TelemetrySnapshot = {
  health: HealthResponse | null
  runtime: RuntimeMetrics | null
  revenue: RevenueMetrics | null
  leads: LeadMemory[]
  events: RuntimeEvent[]
  agents: AgentRuntime[]
  runningTasks: RuntimeTask[]
  latencyMs: number | null
  lastHeartbeat: Date | null
  online: boolean
  error: string | null
}
