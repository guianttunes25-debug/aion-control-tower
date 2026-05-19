import { useEffect, useMemo, useState } from 'react'
import { Led } from '../components/Led'

type AutopilotStatus = 'draft' | 'needs_authorization' | 'authorized' | 'running' | 'waiting_human' | 'completed'

type CourseCandidate = {
  title: string
  provider: string
  url: string
  reason: string
  requiresManualSignup: boolean
}

type BrowserAutopilotSession = {
  id: string
  url: string
  task: string
  status: AutopilotStatus
  createdAt: string
  authorizedAt?: string
  lastRunAt?: string
  allowedActions: string[]
  blockedActions: string[]
  plan: string[]
  activity: string[]
  courseCandidates?: CourseCandidate[]
  pendingApproval?: string
}

const storageKey = 'aion-browser-autopilot-sessions'

const defaultAllowedActions = [
  'Abrir a pagina informada em uma nova aba',
  'Ler conteudo publico ou conteudo que voce colar no painel',
  'Gerar plano de cliques e campos antes de executar',
  'Preparar texto, proposta, checklist ou resumo localmente',
  'Pedir nova aprovacao antes de qualquer acao externa sensivel',
]

const defaultBlockedActions = [
  'Digitar login, senha, token ou dados sensiveis',
  'Resolver captcha',
  'Enviar formulario, mensagem, proposta ou pagamento sem confirmacao',
  'Publicar em marketplace, rede social ou site externo sem aprovacao',
  'Ignorar termos de uso, paywall ou bloqueios do site',
]

function loadSessions() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as BrowserAutopilotSession[]) : []
  } catch {
    return []
  }
}

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) {
    return ''
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
}

function openExternal(url: string) {
  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) {
    return false
  }

  const tab = window.open(normalizedUrl, '_blank')
  if (tab) {
    tab.opener = null
  }
  return Boolean(tab)
}

function isCourseResearchTask(task: string) {
  const normalizedTask = task.toLowerCase()
  return /curso|cursos|aula|estudar|aprend|treinamento|formacao|formação/.test(normalizedTask)
}

function buildCourseSearchUrl(task: string) {
  const normalizedTask = task.trim() || 'cursos de IA'
  return `https://www.google.com/search?q=${encodeURIComponent(`${normalizedTask} curso IA gratuito certificado`)}`
}

function createCourseCandidates(task: string): CourseCandidate[] {
  const normalizedTask = task.toLowerCase()
  const isIntro = normalizedTask.includes('iniciante') || normalizedTask.includes('básico') || normalizedTask.includes('basico')
  const focus = normalizedTask.includes('automacao') || normalizedTask.includes('automação') ? 'automação com IA' : 'inteligência artificial aplicada'

  return [
    {
      title: isIntro ? 'IA para iniciantes - trilha de fundamentos' : `Curso prático de ${focus}`,
      provider: 'Google Search',
      url: buildCourseSearchUrl(task),
      reason: 'Busca ampla para comparar opções, preço, certificado e pré-requisitos antes de escolher.',
      requiresManualSignup: false,
    },
    {
      title: 'freeCodeCamp - IA, automação e programação aplicada',
      provider: 'freeCodeCamp / YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${task} freecodecamp inteligencia artificial automacao`)}`,
      reason: 'Bom ponto de partida gratuito para estudar sem barreira de cadastro pesado.',
      requiresManualSignup: false,
    },
    {
      title: 'Coursera - cursos de IA com opção de certificado',
      provider: 'Coursera',
      url: `https://www.coursera.org/search?query=${encodeURIComponent(task || 'artificial intelligence')}`,
      reason: 'Boa fonte para cursos estruturados; pode exigir conta para matrícula e certificado.',
      requiresManualSignup: true,
    },
    {
      title: 'edX - fundamentos de IA e automação',
      provider: 'edX',
      url: `https://www.edx.org/search?q=${encodeURIComponent(task || 'artificial intelligence')}`,
      reason: 'Boa fonte acadêmica; matrícula, login e certificado devem ser feitos manualmente.',
      requiresManualSignup: true,
    },
  ]
}

function createPlan(task: string) {
  const trimmedTask = task.trim() || 'Executar tarefa assistida na pagina autorizada'
  if (isCourseResearchTask(trimmedTask)) {
    return [
      `Confirmar objetivo: ${trimmedTask}`,
      'Abrir busca de cursos em nova aba.',
      'Gerar candidatos iniciais de cursos e fontes confiáveis.',
      'Comparar se exige cadastro, certificado, pagamento ou login.',
      'Pedir autorização humana antes de abrir cadastro, matrícula ou login.',
      'Guardar resumo do curso escolhido na memória de aprendizado depois que você colar o conteúdo ou transcrição.',
    ]
  }

  return [
    `Confirmar objetivo: ${trimmedTask}`,
    'Abrir a pagina e aguardar autorizacao humana antes de atuar.',
    'Observar a pagina sem inserir credenciais ou resolver captcha.',
    'Montar plano de acao com passos pequenos e reversiveis.',
    'Pedir confirmacao antes de clicar em enviar, publicar, pagar, contratar ou alterar dados externos.',
    'Salvar resumo do que foi aprendido na memoria local da AION.',
  ]
}

function createSession(url: string, task: string): BrowserAutopilotSession {
  const normalizedUrl = normalizeUrl(url)
  return {
    id: `browser-autopilot-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    url: normalizedUrl,
    task: task.trim() || 'Pesquisar e aprender com a pagina aberta',
    status: 'needs_authorization',
    createdAt: new Date().toISOString(),
    allowedActions: defaultAllowedActions,
    blockedActions: defaultBlockedActions,
    plan: createPlan(task),
    activity: [
      'Sessao criada. AION aguardando autorizacao explicita para atuar nesta pagina.',
    ],
  }
}

function mergeUniqueActivity(nextItems: string[], currentItems: string[]) {
  return [...nextItems, ...currentItems].filter((item, index, items) => items.indexOf(item) === index)
}

function statusLabel(status: AutopilotStatus) {
  const labels: Record<AutopilotStatus, string> = {
    draft: 'rascunho',
    needs_authorization: 'aguardando autorizacao',
    authorized: 'autorizado',
    running: 'executando plano local',
    waiting_human: 'aguardando humano',
    completed: 'concluido localmente',
  }
  return labels[status]
}

function statusTone(status: AutopilotStatus) {
  if (status === 'authorized' || status === 'running' || status === 'completed') {
    return 'green' as const
  }
  return 'yellow' as const
}

export function BrowserAutopilot() {
  const [url, setUrl] = useState('https://www.google.com/search?q=automacao+ia+negocios+locais')
  const [task, setTask] = useState('Pesquisar oportunidades de automacao com IA para negocios locais e resumir aprendizados')
  const [sessions, setSessions] = useState<BrowserAutopilotSession[]>(() => loadSessions())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(sessions.slice(0, 20)))
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [sessions])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? sessions[0] ?? null,
    [sessions, selectedId],
  )

  function requestAuthorization() {
    const normalizedUrl = normalizeUrl(url)
    if (!normalizedUrl) {
      return
    }

    openExternal(normalizedUrl)
    const session = createSession(normalizedUrl, task)
    setSessions((current) => [session, ...current].slice(0, 20))
    setSelectedId(session.id)
  }

  function authorizeSelectedSession() {
    if (!selectedSession) {
      return
    }

    setSessions((current) => current.map((session) => (
      session.id === selectedSession.id
        ? {
            ...session,
            status: 'authorized',
            authorizedAt: new Date().toISOString(),
            activity: [
              'Autorizacao concedida pelo humano para esta URL e este objetivo.',
              ...session.activity,
            ],
          }
        : session
    )))
  }

  function runLocalPlan() {
    if (!selectedSession || selectedSession.status === 'needs_authorization') {
      return
    }

    if (isCourseResearchTask(selectedSession.task)) {
      const searchUrl = buildCourseSearchUrl(selectedSession.task)
      const candidates = createCourseCandidates(selectedSession.task)
      openExternal(searchUrl)

      setSessions((current) => current.map((session) => (
        session.id === selectedSession.id
          ? {
              ...session,
              status: 'waiting_human',
              lastRunAt: new Date().toISOString(),
              courseCandidates: candidates,
              pendingApproval: 'Escolha um curso candidato. Se a plataforma pedir cadastro, login, certificado pago ou matrícula, autorize e faça essa etapa manualmente.',
              activity: mergeUniqueActivity([
                `Busca automatica aberta: ${searchUrl}`,
                `Candidatos de curso gerados: ${candidates.map((candidate) => candidate.provider).join(', ')}.`,
                'AION parou antes de cadastro/login. Proximo passo exige autorizacao humana.',
              ], session.activity),
            }
          : session
      )))
      return
    }

    setSessions((current) => current.map((session) => (
      session.id === selectedSession.id
        ? {
            ...session,
            status: 'waiting_human',
            lastRunAt: new Date().toISOString(),
            activity: [
              'Plano local preparado. Para controle real da pagina, conectar Browser Research Agent via Playwright local.',
              'AION nao vai digitar credenciais, passar captcha, enviar ou publicar sem nova aprovacao.',
              ...session.activity,
            ],
          }
        : session
    )))
  }

  function authorizeManualSignup(candidate: CourseCandidate) {
    if (!selectedSession) {
      return
    }

    openExternal(candidate.url)
    setSessions((current) => current.map((session) => (
      session.id === selectedSession.id
        ? {
            ...session,
            status: 'waiting_human',
            pendingApproval: `Cadastro/matricula em ${candidate.provider} deve ser feito manualmente por voce. Depois cole resumo, transcricao ou anotacoes no Learning Center.`,
            activity: mergeUniqueActivity([
              `Autorizado abrir candidato: ${candidate.title} (${candidate.provider}).`,
              candidate.requiresManualSignup
                ? 'Cadastro, login, senha e matricula continuam manuais nesta etapa.'
                : 'Fonte aberta para estudo. Se aparecer login/captcha/pagamento, pare e peca nova aprovacao.',
            ], session.activity),
          }
        : session
    )))
  }

  function markCompleted() {
    if (!selectedSession) {
      return
    }

    setSessions((current) => current.map((session) => (
      session.id === selectedSession.id
        ? {
            ...session,
            status: 'completed',
            activity: [
              'Sessao marcada como concluida localmente pelo operador humano.',
              ...session.activity,
            ],
          }
        : session
    )))
  }

  return (
    <section className="rounded-lg border border-cyan-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(34,211,238,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/90">Browser Autopilot</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Atuacao em pagina com autorizacao</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Abra uma pagina, defina a tarefa, autorize o escopo e acompanhe o plano antes de qualquer acao sensivel.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
          <Led tone="yellow" pulse />
          Permissao por sessao
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Nova sessao autorizada</p>
          <input
            className="mt-4 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="URL da pagina"
          />
          <textarea
            className="mt-3 min-h-28 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="O que a IA deve fazer nessa pagina?"
          />
          <button className="mt-3 w-full rounded-md border border-cyan-300/35 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20" type="button" onClick={requestAuthorization}>
            Abrir pagina e pedir autorizacao
          </button>
          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            Controle completo de clique/leitura em sites externos exige um worker local com Playwright ou extensao. Esta tela cria o gate de autorizacao e o plano seguro para esse modo.
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sessao ativa</p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={authorizeSelectedSession} disabled={!selectedSession || selectedSession.status !== 'needs_authorization'}>
                Autorizar atuacao
              </button>
              <button className="rounded-md border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={runLocalPlan} disabled={!selectedSession || selectedSession.status === 'needs_authorization' || selectedSession.status === 'completed'}>
                Executar plano seguro
              </button>
              <button className="rounded-md border border-violet-300/35 bg-violet-400/10 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={markCompleted} disabled={!selectedSession || selectedSession.status === 'completed'}>
                Concluir
              </button>
            </div>
          </div>

          {selectedSession ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{selectedSession.task}</span>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-cyan-100">
                    <Led tone={statusTone(selectedSession.status)} pulse={selectedSession.status !== 'completed'} />
                    {statusLabel(selectedSession.status)}
                  </span>
                </div>
                <p className="mt-1 break-all text-xs text-cyan-100/75">{selectedSession.url}</p>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">Permitido</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-emerald-50/90">
                    {selectedSession.allowedActions.map((action, index) => <li key={`${selectedSession.id}-allowed-${index}`}>{action}</li>)}
                  </ul>
                </div>
                <div className="rounded-md border border-rose-300/20 bg-rose-400/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-100">Bloqueado</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-50/90">
                    {selectedSession.blockedActions.map((action, index) => <li key={`${selectedSession.id}-blocked-${index}`}>{action}</li>)}
                  </ul>
                </div>
              </div>

              <div className="rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
                <p className="font-semibold text-white">Plano antes de agir</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {selectedSession.plan.map((step, index) => <li key={`${selectedSession.id}-plan-${index}`}>{step}</li>)}
                </ol>
              </div>

              {selectedSession.courseCandidates && selectedSession.courseCandidates.length > 0 ? (
                <div className="rounded-md border border-cyan-300/20 bg-cyan-400/10 p-3 text-sm text-cyan-50">
                  <p className="font-semibold text-white">Cursos encontrados para avaliar</p>
                  <div className="mt-3 grid gap-2">
                    {selectedSession.courseCandidates.map((candidate, index) => (
                      <div key={`${selectedSession.id}-candidate-${index}`} className="rounded-md border border-cyan-300/20 bg-slate-950/70 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-cyan-50">{candidate.title}</p>
                            <p className="mt-1 text-xs text-cyan-100/70">{candidate.provider} - {candidate.reason}</p>
                            <p className="mt-1 break-all text-xs text-slate-400">{candidate.url}</p>
                          </div>
                          <button className="rounded-md border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20" type="button" onClick={() => authorizeManualSignup(candidate)}>
                            {candidate.requiresManualSignup ? 'Autorizar cadastro manual' : 'Abrir para estudar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedSession.pendingApproval ? (
                    <div className="mt-3 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                      {selectedSession.pendingApproval}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
                <p className="font-semibold text-white">Atividade</p>
                <ul className="mt-2 space-y-1">
                  {selectedSession.activity.map((item, index) => <li key={`${selectedSession.id}-activity-${index}`}>{item}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-slate-700 px-3 py-6 text-sm text-slate-500">
              Nenhuma sessao criada ainda. Abra uma pagina e autorize uma tarefa para iniciar.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Historico de sessoes</p>
        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          {sessions.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Nenhuma sessao de navegador registrada ainda.</div>
          ) : sessions.map((session) => (
            <button key={session.id} className={`rounded-md border px-3 py-2 text-left text-sm transition ${selectedSession?.id === session.id ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-50' : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-cyan-300/30'}`} type="button" onClick={() => setSelectedId(session.id)}>
              <span className="block font-semibold">{session.task}</span>
              <span className="mt-1 block truncate text-xs text-slate-500">{statusLabel(session.status)} - {session.url}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
