import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { TelemetrySnapshot } from '../types'
import { Led } from '../components/Led'

type ChatRole = 'user' | 'ceo'
type CeoMode = 'fast' | 'auto' | 'gpt'

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  createdAt: string
  source?: 'llm' | 'local'
}

type OpenedUrlRequest = {
  url: string
  opened: boolean
} | null

const storageKey = 'aion-ceo-chat-history'
const modeStorageKey = 'aion-ceo-chat-mode'
const quickPrompts = [
  'CEO, o que está sendo feito agora?',
  'Procurar trabalhos no 99Freelas',
  'Criar produto com estampa e reels',
  'Executar tarefa automática assistida',
  'Aprender com um curso',
  'Qual é o lead prioritário?',
  'Quais agentes estão ativos?',
]

const ceoModel = 'qwen2.5-coder:14b'

function loadMode(): CeoMode {
  try {
    const stored = window.localStorage.getItem(modeStorageKey)
    return stored === 'auto' || stored === 'gpt' || stored === 'fast' ? stored : 'fast'
  } catch {
    return 'fast'
  }
}

function loadHistory() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as ChatMessage[]) : []
  } catch {
    return []
  }
}

function normalizeUrl(input: string) {
  const match = input.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?/i)
  if (!match) {
    return null
  }

  const rawUrl = match[0]
  return rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`
}

function openRequestedUrl(prompt: string): OpenedUrlRequest {
  const requestedUrl = normalizeUrl(prompt)

  if (!requestedUrl || !/(abr|acess|site|url|pesquis|visite|naveg)/i.test(prompt)) {
    return null
  }

  const opened = window.open(requestedUrl, '_blank')
  if (opened) {
    opened.opener = null
  }

  return { url: requestedUrl, opened: Boolean(opened) }
}

function formatLead(telemetry: TelemetrySnapshot) {
  const lead = telemetry.leads[0]
  if (!lead) {
    return 'Ainda não tenho lead prioritário retornado pelo radar. Próximo passo: alimentar o ciclo real com novos mercados locais e registrar objeções no revenue_lead_memory.'
  }

  return `Lead prioritário agora: ${lead.leadName}, score ${lead.leadScore}, nicho ${lead.niche}. Objeção registrada: ${lead.objectionCategory ?? 'nenhuma'}. Reunião: ${lead.meetingOutcome ?? 'pendente'}. Eu manteria foco nesse lead antes de inventar arquitetura nova.`
}

function formatAgents(telemetry: TelemetrySnapshot) {
  const activeAgents = telemetry.agents.filter((agent) => agent.status === 'AVAILABLE' || agent.status === 'ACTIVE' || agent.status === 'BUSY')
  if (activeAgents.length === 0) {
    return 'Não encontrei agentes ativos na telemetria agora. Eu checaria backend, scheduler e heartbeat antes de mandar novas tarefas.'
  }

  const names = activeAgents.slice(0, 8).map((agent) => agent.name).join(', ')
  const extra = activeAgents.length > 8 ? ` e mais ${activeAgents.length - 8}` : ''
  return `Tenho ${activeAgents.length} agentes operacionais: ${names}${extra}. O runtime está pronto para observação e execução orientada por tarefas.`
}

function formatCurrentWork(telemetry: TelemetrySnapshot) {
  const completed = telemetry.runtime?.tasksCompleted ?? 0
  const failed = telemetry.runtime?.tasksFailed ?? 0
  const running = telemetry.runningTasks.length
  const lead = telemetry.leads[0]
  const latestEvent = telemetry.events[0]?.message ?? 'sem evento recente'

  return [
    `Status executivo: sistema ${telemetry.online ? 'online' : 'offline'}, ${telemetry.runtime?.activeAgents ?? 0} agentes ativos, ${running} tarefas em execução, ${completed} tarefas concluídas e ${failed} falhas permanentes.`,
    lead ? `Radar comercial: prioridade em ${lead.leadName}, score ${lead.leadScore}, interesse ${lead.interestLevel ?? 'desconhecido'}.` : 'Radar comercial: sem lead prioritário carregado agora.',
    `Último sinal do runtime: ${latestEvent}.`,
  ].join(' ')
}

function formatFreelanceSearch() {
  return [
    'Ativei o plano de prospecção assistida: use o painel Browser Operator SDR logo abaixo desta conversa.',
    '1. Escolha 99Freelas, Workana ou Google.',
    '2. Abra a busca com termos como automação, chatbot, CRM, IA e landing page.',
    '3. Faça login manualmente se o site pedir.',
    '4. Cole o texto da vaga no analisador para eu classificar fit, tipo de serviço e plano de execução.',
    '5. Eu gero a proposta, mas você aprova antes de enviar.',
    '',
    'Sobre executar qualquer tarefa: não é qualquer coisa. AION executa melhor tarefas digitais como automação, chatbot, site, landing page, CRM, dashboard, integrações e backend/frontend. Design avançado, vídeo, app nativo, captcha, pagamentos e ações externas sensíveis precisam de revisão humana ou parceiro.',
  ].join('\n')
}

function formatProductStudio() {
  return [
    'Ativei o plano de produto/conteúdo: use o Product & Content Studio no painel.',
    'Ele consegue gerar prompt de estampa, anúncio de marketplace, roteiro de reels, legenda e checklist de publicação.',
    '',
    'O que ele ainda não faz sozinho: criar conta, publicar produto, subir vídeo, pagar tráfego, responder compradores ou vender sem sua confirmação.',
    'Para vender de verdade, o fluxo seguro é: gerar arte -> validar direitos/fornecedor -> criar mockup -> revisar preço -> publicar manualmente ou aprovar publicação assistida.',
  ].join('\n')
}

function formatAutomationCenter() {
  return [
    'Ativei o plano de automação/aprendizado: use o Automation & Learning Center no painel.',
    'Botão Executar Automático: cria execução local, plano, artefatos e etapa de aprovação.',
    'Botão Aprender com Curso: abre o curso no navegador; depois você cola resumo/transcrição e eu guardo como memória reutilizável.',
    '',
    'Limite importante: eu não passo login, senha ou captcha, e não publico/envio/pago nada sem aprovação humana.',
  ].join('\n')
}

function isLocalCommand(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase()
  return Boolean(
    normalizeUrl(prompt)
    || normalizedPrompt.includes('lead')
    || normalizedPrompt.includes('cliente')
    || normalizedPrompt.includes('mercado')
    || normalizedPrompt.includes('agente')
    || normalizedPrompt.includes('runtime')
    || normalizedPrompt.includes('worker')
    || normalizedPrompt.includes('99freelas')
    || normalizedPrompt.includes('freela')
    || normalizedPrompt.includes('trabalho')
    || normalizedPrompt.includes('job')
    || normalizedPrompt.includes('proposta')
    || normalizedPrompt.includes('estampa')
    || normalizedPrompt.includes('camiseta')
    || normalizedPrompt.includes('produto')
    || normalizedPrompt.includes('marketplace')
    || normalizedPrompt.includes('reels')
    || normalizedPrompt.includes('instagram')
    || normalizedPrompt.includes('facebook')
    || normalizedPrompt.includes('automático')
    || normalizedPrompt.includes('automatico')
    || normalizedPrompt.includes('executar')
    || normalizedPrompt.includes('curso')
    || normalizedPrompt.includes('aprender')
    || normalizedPrompt.includes('memória')
    || normalizedPrompt.includes('memoria')
    || normalizedPrompt.includes('fazendo')
    || normalizedPrompt.includes('feito')
    || normalizedPrompt.includes('sendo')
    || normalizedPrompt.includes('status')
    || normalizedPrompt.includes('atual')
    || normalizedPrompt.includes('andamento'),
  )
}

function shouldUseModel(mode: CeoMode, prompt: string) {
  if (mode === 'gpt') {
    return true
  }
  if (mode === 'fast') {
    return false
  }
  return !isLocalCommand(prompt)
}

function buildCeoReply(prompt: string, telemetry: TelemetrySnapshot, openedUrlRequest?: OpenedUrlRequest) {
  const normalizedPrompt = prompt.toLowerCase()
  const urlRequest = openedUrlRequest ?? openRequestedUrl(prompt)

  if (urlRequest) {
    return urlRequest.opened
      ? `Abri ${urlRequest.url} em uma nova aba. Vou tratar isso como pesquisa operacional; quando você voltar com o contexto, eu conecto com leads, oferta ou execução.`
      : `Tentei abrir ${urlRequest.url}, mas o navegador bloqueou a nova aba. O link está registrado aqui para você abrir manualmente.`
  }

  if (normalizedPrompt.includes('lead') || normalizedPrompt.includes('cliente') || normalizedPrompt.includes('mercado')) {
    return formatLead(telemetry)
  }

  if (
    normalizedPrompt.includes('99freelas')
    || normalizedPrompt.includes('freela')
    || normalizedPrompt.includes('trabalho')
    || normalizedPrompt.includes('job')
    || normalizedPrompt.includes('proposta')
  ) {
    return formatFreelanceSearch()
  }

  if (
    normalizedPrompt.includes('estampa')
    || normalizedPrompt.includes('camiseta')
    || normalizedPrompt.includes('produto')
    || normalizedPrompt.includes('marketplace')
    || normalizedPrompt.includes('reels')
    || normalizedPrompt.includes('instagram')
    || normalizedPrompt.includes('facebook')
  ) {
    return formatProductStudio()
  }

  if (
    normalizedPrompt.includes('automático')
    || normalizedPrompt.includes('automatico')
    || normalizedPrompt.includes('executar')
    || normalizedPrompt.includes('curso')
    || normalizedPrompt.includes('aprender')
    || normalizedPrompt.includes('memória')
    || normalizedPrompt.includes('memoria')
  ) {
    return formatAutomationCenter()
  }

  if (normalizedPrompt.includes('agente') || normalizedPrompt.includes('runtime') || normalizedPrompt.includes('worker')) {
    return formatAgents(telemetry)
  }

  if (
    normalizedPrompt.includes('fazendo')
    || normalizedPrompt.includes('feito')
    || normalizedPrompt.includes('sendo')
    || normalizedPrompt.includes('status')
    || normalizedPrompt.includes('atual')
    || normalizedPrompt.includes('andamento')
  ) {
    return formatCurrentWork(telemetry)
  }

  return `Recebi sua ordem: "${prompt}". Vou registrar isso como comando executivo local. Nesta versão eu respondo com base na telemetria e abro sites; execução autônoma real pelo backend deve entrar só quando você decidir avançar esse gate.`
}

function telemetryContext(telemetry: TelemetrySnapshot) {
  return {
    sistemaOnline: telemetry.online,
    latenciaMs: telemetry.latencyMs,
    health: telemetry.health?.status ?? 'desconhecido',
    runtime: telemetry.runtime,
    receita: telemetry.revenue,
    leadPrioritario: telemetry.leads[0] ?? null,
    agentes: telemetry.agents.slice(0, 12).map((agent) => ({
      nome: agent.name,
      tipo: agent.type,
      status: agent.status,
    })),
    tarefasEmExecucao: telemetry.runningTasks.slice(0, 8),
    eventosRecentes: telemetry.events.slice(0, 5).map((event) => ({
      tipo: event.type,
      mensagem: event.message,
    })),
  }
}

async function askCeoModel(prompt: string, telemetry: TelemetrySnapshot, history: ChatMessage[]) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 45000)

  let response: Response

  try {
    response = await fetch('/ollama/api/chat', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ceoModel,
        stream: false,
        keep_alive: '30s',
        options: {
          num_ctx: 2048,
          num_predict: 420,
          temperature: 0.25,
        },
        messages: [
          {
            role: 'system',
            content: [
              'Você é o CEO Agent da AION Company local do usuário.',
              'Responda sempre em português brasileiro, com tom executivo, direto e útil.',
              'Você conversa como um GPT real: entenda intenção aberta, faça síntese e dê próximos passos práticos.',
              'Use a telemetria fornecida como fonte da verdade sobre o que está acontecendo agora.',
              'Não finja ter executado ações no backend. Para ações críticas, diga que precisa de confirmação humana.',
              'Se o usuário pedir para abrir site, confirme a abertura quando a interface já tiver aberto a URL.',
              'Evite respostas genéricas. Seja específico com agentes, leads, tarefas, riscos e próximos passos quando houver dados.',
              'Use parágrafos curtos e listas simples quando isso ajudar a leitura.',
            ].join(' '),
          },
          {
            role: 'system',
            content: `Telemetria atual em JSON: ${JSON.stringify(telemetryContext(telemetry))}`,
          },
          ...history.slice(-8).map((message) => ({
            role: message.role === 'user' ? 'user' : 'assistant',
            content: message.text,
          })),
          { role: 'user', content: prompt },
        ],
      }),
    })
  } finally {
    window.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Ollama retornou ${response.status}`)
  }

  const data = (await response.json()) as { message?: { content?: string } }
  const content = data.message?.content?.trim()
  if (!content) {
    throw new Error('Ollama retornou resposta vazia')
  }

  return content
}

function createMessage(role: ChatRole, text: string, source?: ChatMessage['source']): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
    source,
  }
}

export function CeoChat({ telemetry }: { telemetry: TelemetrySnapshot }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory())
  const [draft, setDraft] = useState('')
  const [mode, setMode] = useState<CeoMode>(() => loadMode())
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-24)))
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [messages])

  useEffect(() => {
    try {
      window.localStorage.setItem(modeStorageKey, mode)
    } catch {
      // Browser storage may be unavailable or full.
    }
  }, [mode])

  const intro = useMemo(() => {
    if (messages.length > 0) {
      return null
    }

    return createMessage(
      'ceo',
      'Estou online. Pode me perguntar o que está sendo feito, pedir leitura do radar comercial, consultar agentes ou mandar abrir um site para pesquisa.',
    )
  }, [messages.length])

  const visibleMessages = intro ? [intro, ...messages] : messages

  async function submitPrompt(prompt: string) {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || isThinking) {
      return
    }

    const userMessage = createMessage('user', trimmedPrompt)
    setDraft('')
    setIsThinking(true)

    const openedUrlRequest = openRequestedUrl(trimmedPrompt)

    setMessages((current) => [...current, userMessage].slice(-24))

    try {
      if (shouldUseModel(mode, trimmedPrompt)) {
        const llmReply = await askCeoModel(trimmedPrompt, telemetry, messages)
        setMessages((current) => [...current, createMessage('ceo', llmReply, 'llm')].slice(-24))
      } else {
        setMessages((current) => [...current, createMessage('ceo', buildCeoReply(trimmedPrompt, telemetry, openedUrlRequest), 'local')].slice(-24))
      }
    } catch {
      setMessages((current) => [...current, createMessage('ceo', buildCeoReply(trimmedPrompt, telemetry, openedUrlRequest), 'local')].slice(-24))
    } finally {
      setIsThinking(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitPrompt(draft)
  }

  return (
    <section className="rounded-lg border border-violet-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(124,58,237,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/90">Linha direta com o CEO</p>
          <h2 className="mt-1 text-xl font-semibold text-white">CEO Agent</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Use o modo rápido para consultas sem GPU ou ative o GPT local quando quiser raciocínio mais profundo com qwen2.5-coder:14b.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100">
          <Led tone={telemetry.online ? 'green' : 'yellow'} pulse={telemetry.online} />
          {isThinking ? 'CEO pensando' : mode === 'gpt' ? 'GPT local ativo' : mode === 'auto' ? 'Auto econômico' : 'Modo rápido'}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <div className="flex h-80 flex-col rounded-lg border border-slate-800 bg-slate-950/80">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {visibleMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-lg border px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-50'
                      : 'border-violet-300/25 bg-violet-400/10 text-violet-50'
                  }`}
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {message.role === 'user' ? 'Você' : 'CEO'} · {new Date(message.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.role === 'ceo' && message.source ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      {message.source === 'llm' ? `Modelo local: ${ceoModel}` : 'Resposta rápida'}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
            {isThinking ? (
              <div className="flex justify-start">
                <div className="rounded-lg border border-violet-300/25 bg-violet-400/10 px-3 py-2 text-sm text-violet-50">
                  CEO está pensando com {ceoModel}...
                </div>
              </div>
            ) : null}
          </div>

          <form className="border-t border-slate-800 p-3" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/60"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={isThinking}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    submitPrompt(draft)
                  }
                }}
                placeholder="Fale com o CEO..."
              />
              <button className="rounded-md border border-violet-300/35 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={() => submitPrompt(draft)} disabled={isThinking}>
                {isThinking ? 'Pensando' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Modo de resposta</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              ['fast', 'Rápido'],
              ['auto', 'Auto'],
              ['gpt', 'GPT'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  mode === value
                    ? 'border-violet-300/50 bg-violet-400/20 text-violet-50'
                    : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-violet-300/40 hover:bg-violet-400/10'
                }`}
                type="button"
                onClick={() => setMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Rápido não usa GPU. Auto usa GPT só em perguntas abertas. GPT sempre chama o modelo local.
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Comandos rápidos</p>
          <div className="mt-4 grid gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-violet-300/40 hover:bg-violet-400/10"
                type="button"
                onClick={() => submitPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            Economia ativa: contexto reduzido, limite de resposta e modelo mantido por pouco tempo na memória. Use GPT apenas quando precisar de análise profunda.
          </div>
        </div>
      </div>
    </section>
  )
}
