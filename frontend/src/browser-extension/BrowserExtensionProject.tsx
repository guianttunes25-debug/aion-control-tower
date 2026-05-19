import { useState } from 'react'

const extensionPath = 'C:\\AI-Company\\projects\\taskmaster\\tools\\browser-extension'

const capabilities = [
  'Autorizar uma aba por objetivo',
  'Enviar snapshot ao backend local',
  'Decidir proximo passo com Safety Policy',
  'Destacar botoes, links e campos operaveis',
  'Iniciar pesquisa segura no Google',
]

const endpoints = [
  'POST /browser-autopilot/sessions',
  'POST /browser-autopilot/sessions/{id}/observe',
  'POST /browser-autopilot/sessions/{id}/decide',
  'POST /browser-autopilot/sessions/{id}/execution-result',
]

const blockedActions = [
  'Login, senha, token e dados sensiveis',
  'Captcha, pagamento, publicacao e envio',
  'Cadastro ou matricula automatica',
]

export function BrowserExtensionProject() {
  const [copyStatus, setCopyStatus] = useState('')

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(extensionPath)
      setCopyStatus('Caminho copiado')
    } catch {
      setCopyStatus('Copie manualmente o caminho abaixo')
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300/80">Projeto de extensão</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">AION Browser Autopilot para Chrome/Edge</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Ponte local para operar a aba aberta com permissão humana. A extensão envia snapshots para o BrowserAutopilotAgent no backend, que classifica risco e propõe a próxima ação.
          </p>
        </div>
        <span className="rounded-md border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">
          Incluida no repo
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pasta carregavel no navegador</p>
          <div className="mt-3 rounded-md border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-sm text-cyan-100">
            {extensionPath}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPath}
              className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:border-cyan-200"
            >
              Copiar caminho
            </button>
            <span className="self-center text-sm text-slate-400">{copyStatus}</span>
          </div>
        </article>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Instalação</p>
          <ol className="mt-3 space-y-2 text-sm text-slate-300">
            <li>1. Abra <code className="text-cyan-100">chrome://extensions</code> ou <code className="text-cyan-100">edge://extensions</code>.</li>
            <li>2. Ative o modo de desenvolvedor.</li>
            <li>3. Use <code className="text-cyan-100">Carregar sem compactação</code> e selecione a pasta acima.</li>
          </ol>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Operações disponíveis</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            {capabilities.map((item) => (
              <li key={item} className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2">{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border border-amber-300/20 bg-amber-400/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">Bloqueios mantidos</p>
          <ul className="mt-3 grid gap-2 text-sm text-amber-100/90">
            {blockedActions.map((item) => (
              <li key={item} className="rounded-md border border-amber-300/15 bg-slate-950/60 px-3 py-2">{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <article className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cérebro central local</p>
        <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          {endpoints.map((endpoint) => (
            <code key={endpoint} className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-cyan-100">{endpoint}</code>
          ))}
        </div>
      </article>
    </section>
  )
}