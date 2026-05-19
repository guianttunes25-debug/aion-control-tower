import { useEffect, useMemo, useState } from 'react'
import { Led } from '../components/Led'

type Platform = 'google' | '99freelas' | 'workana'

type Opportunity = {
  id: string
  platform: Platform
  title: string
  url: string
  budget: string
  notes: string
  serviceType?: string
  fitScore?: number
  executionClass?: 'ready' | 'assisted' | 'out_of_scope'
  executionPlan?: string
  createdAt: string
}

const storageKey = 'aion-browser-operator-opportunities'
const defaultKeywords = 'automação atendimento chatbot ia landing page crm local'

const platformLabels: Record<Platform, string> = {
  google: 'Google',
  '99freelas': '99Freelas',
  workana: 'Workana',
}

function loadOpportunities() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as Opportunity[]) : []
  } catch {
    return []
  }
}

function buildSearchUrl(platform: Platform, keywords: string) {
  const query = encodeURIComponent(keywords.trim() || defaultKeywords)

  if (platform === '99freelas') {
    return `https://www.99freelas.com.br/projects?q=${query}`
  }

  if (platform === 'workana') {
    return `https://www.workana.com/jobs?query=${query}`
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`site:99freelas.com.br OR site:workana.com ${keywords.trim() || defaultKeywords}`)}`
}

function proposalDraft(opportunity: Opportunity) {
  return [
    `Olá! Vi o projeto "${opportunity.title}" e acredito que posso ajudar com uma solução prática usando automação e IA.`,
    '',
    opportunity.executionPlan ? `Plano sugerido: ${opportunity.executionPlan}` : 'Plano sugerido: mapear o fluxo atual, criar uma primeira versão funcional e validar com você antes de expandir.',
    '',
    'Minha proposta inicial é mapear o fluxo atual, criar uma primeira automação funcional e entregar algo simples de operar, sem depender de uma estrutura complexa.',
    '',
    opportunity.notes ? `Pelo que entendi: ${opportunity.notes}` : 'Posso começar entendendo melhor o objetivo, prazo e ferramentas que vocês já usam hoje.',
    '',
    'Se fizer sentido, posso te mandar um plano em 3 etapas com escopo, prazo e valor fechado.',
  ].join('\n')
}

function detectServiceType(text: string) {
  const normalized = text.toLowerCase()
  if (/(chatbot|whatsapp|atendimento|suporte|responder|lead)/.test(normalized)) {
    return 'Automação de atendimento'
  }
  if (/(landing|site|website|pagina|página|webflow|wordpress)/.test(normalized)) {
    return 'Site ou landing page'
  }
  if (/(crm|pipeline|planilha|dashboard|relatorio|relatório|dados)/.test(normalized)) {
    return 'CRM, dados ou dashboard'
  }
  if (/(api|backend|spring|node|react|integração|integracao)/.test(normalized)) {
    return 'Desenvolvimento e integração'
  }
  if (/(design|logo|video|vídeo|motion|3d|mobile nativo|ios|android)/.test(normalized)) {
    return 'Fora do núcleo atual'
  }
  return 'Serviço digital geral'
}

function classifyExecution(text: string) {
  const normalized = text.toLowerCase()
  const strongFit = [
    'automação',
    'automacao',
    'chatbot',
    'whatsapp',
    'crm',
    'landing',
    'site',
    'dashboard',
    'api',
    'integração',
    'integracao',
    'react',
    'spring',
  ].filter((keyword) => normalized.includes(keyword)).length

  const weakFit = ['design', 'logo', 'vídeo', 'video', 'mobile nativo', 'ios', 'android', '3d'].filter((keyword) => normalized.includes(keyword)).length
  const fitScore = Math.max(1, Math.min(10, 4 + strongFit * 2 - weakFit * 2))

  if (fitScore >= 8) {
    return { fitScore, executionClass: 'ready' as const }
  }
  if (fitScore >= 5) {
    return { fitScore, executionClass: 'assisted' as const }
  }
  return { fitScore, executionClass: 'out_of_scope' as const }
}

function executionLabel(executionClass?: Opportunity['executionClass']) {
  if (executionClass === 'ready') {
    return 'Executável pela AION'
  }
  if (executionClass === 'assisted') {
    return 'Executável com escopo humano'
  }
  if (executionClass === 'out_of_scope') {
    return 'Revisar antes de aceitar'
  }
  return 'Não classificado'
}

function executionPlan(serviceType: string, executionClass: Opportunity['executionClass']) {
  if (executionClass === 'out_of_scope') {
    return 'validar se existe parte de automação, site, CRM ou integração antes de aceitar; caso contrário, recusar ou terceirizar.'
  }
  if (serviceType === 'Automação de atendimento') {
    return 'mapear perguntas frequentes, desenhar fluxo de atendimento, criar automação inicial e validar com conversas reais.'
  }
  if (serviceType === 'Site ou landing page') {
    return 'definir oferta, montar landing page objetiva, integrar formulário/WhatsApp e publicar primeira versão.'
  }
  if (serviceType === 'CRM, dados ou dashboard') {
    return 'organizar fonte de dados, criar pipeline simples, montar dashboard e definir rotina de atualização.'
  }
  if (serviceType === 'Desenvolvimento e integração') {
    return 'levantar requisitos, criar integração mínima, testar endpoints e entregar documentação curta de uso.'
  }
  return 'quebrar o pedido em diagnóstico, protótipo funcional e validação com o cliente antes de escalar.'
}

function detectPlatformFromText(text: string, currentPlatform: Platform) {
  const normalized = text.toLowerCase()
  if (normalized.includes('99freelas')) {
    return '99freelas'
  }
  if (normalized.includes('workana')) {
    return 'workana'
  }
  if (normalized.includes('google')) {
    return 'google'
  }
  return currentPlatform
}

function firstUrl(text: string) {
  return text.match(/https?:\/\/[^\s]+/i)?.[0] ?? ''
}

function firstBudget(text: string) {
  return text.match(/R\$\s?[\d.,]+(?:\s?[-–]\s?R\$?\s?[\d.,]+)?/i)?.[0] ?? ''
}

function firstTitle(text: string) {
  return text.split('\n').map((line) => line.trim()).find((line) => line.length > 8 && !line.startsWith('http')) ?? ''
}

function createOpportunity(platform: Platform, title: string, url: string, budget: string, notes: string): Opportunity {
  const analysisText = `${title}\n${budget}\n${notes}`
  const serviceType = detectServiceType(analysisText)
  const execution = classifyExecution(analysisText)

  return {
    id: `opportunity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    platform,
    title,
    url,
    budget,
    notes,
    serviceType,
    fitScore: execution.fitScore,
    executionClass: execution.executionClass,
    executionPlan: executionPlan(serviceType, execution.executionClass),
    createdAt: new Date().toISOString(),
  }
}

export function BrowserOperator() {
  const [platform, setPlatform] = useState<Platform>('99freelas')
  const [keywords, setKeywords] = useState(defaultKeywords)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')
  const [jobText, setJobText] = useState('')
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => loadOpportunities())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(opportunities.slice(0, 30)))
  }, [opportunities])

  const searchUrl = useMemo(() => buildSearchUrl(platform, keywords), [platform, keywords])
  const selectedOpportunity = opportunities.find((opportunity) => opportunity.id === selectedId) ?? opportunities[0] ?? null

  function openSearch() {
    const tab = window.open(searchUrl, '_blank')
    if (tab) {
      tab.opener = null
    }
  }

  function saveOpportunity() {
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()
    if (!trimmedTitle || !trimmedUrl) {
      return
    }

    const opportunity = createOpportunity(platform, trimmedTitle, trimmedUrl, budget.trim(), notes.trim())
    setOpportunities((current) => [opportunity, ...current].slice(0, 30))
    setSelectedId(opportunity.id)
    setTitle('')
    setUrl('')
    setBudget('')
    setNotes('')
  }

  function analyzeJobText() {
    const trimmedText = jobText.trim()
    if (!trimmedText) {
      return
    }

    setPlatform(detectPlatformFromText(trimmedText, platform))
    setTitle(firstTitle(trimmedText))
    setUrl(firstUrl(trimmedText))
    setBudget(firstBudget(trimmedText))
    setNotes(trimmedText.slice(0, 600))
  }

  async function copyDraft() {
    if (!selectedOpportunity) {
      return
    }
    await navigator.clipboard.writeText(proposalDraft(selectedOpportunity))
  }

  return (
    <section className="rounded-lg border border-emerald-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(16,185,129,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/90">Browser Operator SDR</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Busca assistida de trabalhos</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Abra buscas, faça login manual quando necessário, registre oportunidades e gere proposta para aprovação antes de enviar.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
          <Led tone="green" pulse />
          Humano no controle
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pesquisar oportunidades</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(['google', '99freelas', 'workana'] as const).map((value) => (
              <button
                key={value}
                className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                  platform === value
                    ? 'border-emerald-300/50 bg-emerald-400/20 text-emerald-50'
                    : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-300/40 hover:bg-emerald-400/10'
                }`}
                type="button"
                onClick={() => setPlatform(value)}
              >
                {platformLabels[value]}
              </button>
            ))}
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400" htmlFor="browser-keywords">Palavras-chave</label>
          <textarea
            id="browser-keywords"
            className="mt-2 min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
          />

          <button className="mt-3 w-full rounded-md border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20" type="button" onClick={openSearch}>
            Abrir busca em nova aba
          </button>

          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            Cadastro, login, captcha, senha e envio de proposta continuam manuais. O operador organiza a busca e prepara a abordagem.
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Registrar oportunidade</p>
          <textarea
            className="mt-4 min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
            value={jobText}
            onChange={(event) => setJobText(event.target.value)}
            placeholder="Cole aqui o texto da vaga para extrair título, orçamento, URL, fit e plano de execução..."
          />
          <button className="mt-3 w-full rounded-md border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={analyzeJobText} disabled={!jobText.trim()}>
            Analisar texto da vaga
          </button>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título do trabalho"
            />
            <input
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="Orçamento ou faixa"
            />
          </div>
          <input
            className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="URL da oportunidade"
          />
          <textarea
            className="mt-3 min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Resumo do problema, prazo, stack, sinais de fit..."
          />
          <button className="mt-3 w-full rounded-md border border-cyan-300/35 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={saveOpportunity} disabled={!title.trim() || !url.trim()}>
            Salvar oportunidade
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Radar local</p>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {opportunities.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Nenhuma oportunidade registrada ainda.</div>
            ) : (
              opportunities.map((opportunity) => (
                <button
                  key={opportunity.id}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                    selectedOpportunity?.id === opportunity.id
                      ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-50'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-emerald-300/30'
                  }`}
                  type="button"
                  onClick={() => setSelectedId(opportunity.id)}
                >
                  <span className="block font-semibold">{opportunity.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{platformLabels[opportunity.platform]} · {opportunity.budget || 'sem orçamento'}</span>
                  <span className="mt-1 block text-xs text-emerald-200/80">{executionLabel(opportunity.executionClass)} · fit {opportunity.fitScore ?? '--'}/10</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Proposta assistida</p>
            <button className="rounded-md border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={copyDraft} disabled={!selectedOpportunity}>
              Copiar proposta
            </button>
          </div>
          {selectedOpportunity ? (
            <div className="mt-3 space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Capacidade</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-100">{executionLabel(selectedOpportunity.executionClass)}</p>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Fit</p>
                  <p className="mt-1 text-sm font-semibold text-white">{selectedOpportunity.fitScore ?? '--'}/10</p>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Tipo</p>
                  <p className="mt-1 text-sm font-semibold text-cyan-100">{selectedOpportunity.serviceType ?? 'Não classificado'}</p>
                </div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Plano de execução: </span>{selectedOpportunity.executionPlan ?? 'classificar escopo antes de aceitar.'}
              </div>
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200">
                {proposalDraft(selectedOpportunity)}
              </pre>
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Selecione ou registre uma oportunidade para gerar uma proposta.</div>
          )}
        </div>
      </div>
    </section>
  )
}
