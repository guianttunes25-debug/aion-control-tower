import { useEffect, useMemo, useState } from 'react'
import { Led } from '../components/Led'

type AutomationRun = {
  id: string
  goal: string
  status: 'planned' | 'waiting_approval' | 'completed_locally'
  plan: string[]
  artifacts: string[]
  createdAt: string
}

type LearningMemory = {
  id: string
  sourceUrl: string
  title: string
  summary: string
  playbook: string[]
  createdAt: string
}

const runsStorageKey = 'aion-automation-runs'
const learningStorageKey = 'aion-learning-memory'

function loadItems<T>(key: string) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T[]) : []
  } catch {
    return []
  }
}

function openExternal(url: string) {
  const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
  const tab = window.open(normalizedUrl, '_blank')
  if (tab) {
    tab.opener = null
  }
}

function compactLines(text: string) {
  return text
    .split(/\n|\.|;|-/)
    .map((line) => line.trim())
    .filter((line) => line.length > 18)
}

function createLearning(sourceUrl: string, notes: string): LearningMemory {
  const lines = compactLines(notes)
  const playbook = lines.slice(0, 6).map((line, index) => `${index + 1}. ${line}`)
  const summary = lines.slice(0, 3).join('. ') || notes.trim().slice(0, 280) || 'Aprendizado registrado para uso futuro.'

  return {
    id: `learning-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sourceUrl: sourceUrl.trim(),
    title: lines[0]?.slice(0, 80) || 'Curso ou aula registrada',
    summary,
    playbook: playbook.length > 0 ? playbook : ['1. Revisar conteúdo', '2. Transformar em checklist', '3. Aplicar em uma tarefa real'],
    createdAt: new Date().toISOString(),
  }
}

function createAutomationRun(goal: string, memories: LearningMemory[]): AutomationRun {
  const trimmedGoal = goal.trim() || 'Executar tarefa assistida pela AION'
  const latestMemory = memories[0]
  const learnedSteps = latestMemory?.playbook.slice(0, 3) ?? []

  return {
    id: `automation-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    goal: trimmedGoal,
    status: 'waiting_approval',
    plan: [
      'Analisar objetivo, risco e resultado esperado.',
      'Dividir a tarefa em etapas pequenas e verificáveis.',
      ...learnedSteps.map((step) => `Aplicar aprendizado: ${step}`),
      'Gerar artefatos locais: plano, checklist, texto, proposta ou briefing.',
      'Pedir aprovação humana antes de publicar, enviar, comprar, contratar ou alterar sistema externo.',
    ],
    artifacts: [
      `Briefing executivo: ${trimmedGoal}`,
      'Checklist de execução criado localmente.',
      latestMemory ? `Memória aplicada: ${latestMemory.title}` : 'Nenhuma memória de curso aplicada ainda.',
    ],
    createdAt: new Date().toISOString(),
  }
}

export function AutomationCenter() {
  const [goal, setGoal] = useState('Encontrar uma oportunidade, gerar proposta e preparar execução sem enviar nada sozinho')
  const [courseUrl, setCourseUrl] = useState('')
  const [courseNotes, setCourseNotes] = useState('')
  const [runs, setRuns] = useState<AutomationRun[]>(() => loadItems<AutomationRun>(runsStorageKey))
  const [memories, setMemories] = useState<LearningMemory[]>(() => loadItems<LearningMemory>(learningStorageKey))
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(runsStorageKey, JSON.stringify(runs.slice(0, 30)))
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [runs])

  useEffect(() => {
    try {
      window.localStorage.setItem(learningStorageKey, JSON.stringify(memories.slice(0, 30)))
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [memories])

  const selectedRun = useMemo(
    () => runs.find((run) => run.id === selectedRunId) ?? runs[0] ?? null,
    [runs, selectedRunId],
  )

  const selectedMemory = useMemo(
    () => memories.find((memory) => memory.id === selectedMemoryId) ?? memories[0] ?? null,
    [memories, selectedMemoryId],
  )

  function startAutomation() {
    const run = createAutomationRun(goal, memories)
    setRuns((current) => [run, ...current].slice(0, 30))
    setSelectedRunId(run.id)
  }

  function saveLearning() {
    if (!courseUrl.trim() && !courseNotes.trim()) {
      return
    }

    const memory = createLearning(courseUrl, courseNotes)
    setMemories((current) => [memory, ...current].slice(0, 30))
    setSelectedMemoryId(memory.id)
    setCourseUrl('')
    setCourseNotes('')
  }

  function approveLocalRun() {
    if (!selectedRun) {
      return
    }

    setRuns((current) => current.map((run) => (
      run.id === selectedRun.id ? { ...run, status: 'completed_locally' } : run
    )))
  }

  return (
    <section className="rounded-lg border border-sky-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(56,189,248,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/90">Automation & Learning Center</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Execução automática assistida e aprendizado por curso</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Crie execuções automáticas locais, abra cursos no navegador, salve aprendizados e aplique essa memória nos próximos planos.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100">
          <Led tone="yellow" pulse />
          Automático com aprovação
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Botão automático</p>
          <textarea
            className="mt-4 min-h-28 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/60"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Descreva a tarefa que a IA deve executar..."
          />
          <button className="mt-3 w-full rounded-md border border-sky-300/35 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20" type="button" onClick={startAutomation}>
            Executar automático assistido
          </button>
          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            Este botão executa automações internas e cria artefatos locais. Login, senha, captcha, publicação, envio e pagamento continuam bloqueados até aprovação humana.
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Aprender com curso</p>
          <input
            className="mt-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/60"
            value={courseUrl}
            onChange={(event) => setCourseUrl(event.target.value)}
            placeholder="URL do curso, aula ou artigo"
          />
          <button className="mt-3 w-full rounded-md border border-sky-300/35 bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => openExternal(courseUrl)} disabled={!courseUrl.trim()}>
            Abrir curso no navegador
          </button>
          <textarea
            className="mt-3 min-h-28 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/60"
            value={courseNotes}
            onChange={(event) => setCourseNotes(event.target.value)}
            placeholder="Cole aqui resumo, transcrição, tópicos da aula ou o que a IA deve guardar na memória..."
          />
          <button className="mt-3 w-full rounded-md border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={saveLearning} disabled={!courseUrl.trim() && !courseNotes.trim()}>
            Guardar aprendizado na memória
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Execuções automáticas</p>
            <button className="rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={approveLocalRun} disabled={!selectedRun || selectedRun.status === 'completed_locally'}>
              Aprovar conclusão local
            </button>
          </div>
          <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
            {runs.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Nenhuma execução automática criada ainda.</div>
            ) : (
              runs.map((run) => (
                <button key={run.id} className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${selectedRun?.id === run.id ? 'border-sky-300/40 bg-sky-400/10 text-sky-50' : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-sky-300/30'}`} type="button" onClick={() => setSelectedRunId(run.id)}>
                  <span className="block font-semibold">{run.goal}</span>
                  <span className="mt-1 block text-xs text-slate-500">{run.status === 'completed_locally' ? 'concluída localmente' : 'aguardando aprovação'}</span>
                </button>
              ))
            )}
          </div>
          {selectedRun ? (
            <div className="mt-3 rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-semibold text-white">Plano</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {selectedRun.plan.map((step, index) => <li key={`${selectedRun.id}-plan-${index}`}>{step}</li>)}
              </ol>
              <p className="mt-3 font-semibold text-white">Artefatos</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {selectedRun.artifacts.map((artifact, index) => <li key={`${selectedRun.id}-artifact-${index}`}>{artifact}</li>)}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Memória de aprendizado</p>
          <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
            {memories.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Nenhum aprendizado salvo ainda.</div>
            ) : (
              memories.map((memory) => (
                <button key={memory.id} className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${selectedMemory?.id === memory.id ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-50' : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-emerald-300/30'}`} type="button" onClick={() => setSelectedMemoryId(memory.id)}>
                  <span className="block font-semibold">{memory.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{memory.sourceUrl || 'fonte manual'}</span>
                </button>
              ))
            )}
          </div>
          {selectedMemory ? (
            <div className="mt-3 rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
              <p className="font-semibold text-white">Resumo</p>
              <p className="mt-2 text-slate-300">{selectedMemory.summary}</p>
              <p className="mt-3 font-semibold text-white">Playbook aprendido</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {selectedMemory.playbook.map((step, index) => <li key={`${selectedMemory.id}-playbook-${index}`}>{step.replace(/^\d+\.\s*/, '')}</li>)}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
