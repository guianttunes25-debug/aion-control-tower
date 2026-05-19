import { useEffect, useMemo, useState } from 'react'
import { fetchTelemetry } from '../api'
import type { TelemetrySnapshot } from '../types'

const emptySnapshot: TelemetrySnapshot = {
  health: null,
  runtime: null,
  revenue: null,
  leads: [],
  events: [],
  agents: [],
  runningTasks: [],
  latencyMs: null,
  lastHeartbeat: null,
  online: false,
  error: null,
}

export function useAionTelemetry(pollMs = 3000) {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(emptySnapshot)

  useEffect(() => {
    let mounted = true
    let timer: number | undefined

    async function tick() {
      try {
        const telemetry = await fetchTelemetry()
        if (!mounted) {
          return
        }

        setSnapshot({
          ...telemetry,
          lastHeartbeat: new Date(),
          online: telemetry.health?.status === 'UP',
          error: null,
        })
      } catch (error) {
        if (!mounted) {
          return
        }

        setSnapshot((current) => ({
          ...current,
          online: false,
          lastHeartbeat: new Date(),
          error: error instanceof Error ? error.message : 'Telemetry unavailable',
        }))
      } finally {
        if (mounted) {
          timer = window.setTimeout(tick, pollMs)
        }
      }
    }

    tick()

    return () => {
      mounted = false
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [pollMs])

  return useMemo(() => snapshot, [snapshot])
}
