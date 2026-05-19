import { useEffect, useMemo, useState } from 'react'
import { Led } from '../components/Led'

type StudioPackage = {
  id: string
  productType: string
  niche: string
  audience: string
  style: string
  platform: string
  imagePrompt: string
  marketplaceTitle: string
  marketplaceDescription: string
  reelScript: string
  caption: string
  checklist: string[]
  createdAt: string
}

const storageKey = 'aion-product-studio-packages'

const marketplaceUrls = {
  shopee: 'https://seller.shopee.com.br/',
  mercadoLivre: 'https://www.mercadolivre.com.br/anuncie',
  instagram: 'https://business.facebook.com/latest/reels_composer',
  facebook: 'https://business.facebook.com/latest/home',
}

function loadPackages() {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as StudioPackage[]) : []
  } catch {
    return []
  }
}

function sanitize(value: string, fallback: string) {
  return value.trim() || fallback
}

function createPackage(productType: string, niche: string, audience: string, style: string, platform: string): StudioPackage {
  const cleanProduct = sanitize(productType, 'camiseta estampada')
  const cleanNiche = sanitize(niche, 'empreendedores locais')
  const cleanAudience = sanitize(audience, 'donos de pequenos negócios')
  const cleanStyle = sanitize(style, 'moderno, limpo, comercial e memorável')
  const cleanPlatform = sanitize(platform, 'Instagram, Facebook e marketplace')

  const imagePrompt = [
    `Crie uma arte original para ${cleanProduct}.`,
    `Tema/nicho: ${cleanNiche}.`,
    `Público-alvo: ${cleanAudience}.`,
    `Estilo visual: ${cleanStyle}.`,
    'Composição central forte, alto contraste, legível em camiseta, sem marcas registradas, sem personagens protegidos por copyright, sem logotipos reais.',
    'Entregar como arte vetorial/ilustração limpa, pronta para mockup e impressão DTG ou sublimação.',
  ].join(' ')

  const marketplaceTitle = `${cleanProduct} ${cleanNiche} - arte exclusiva`
  const marketplaceDescription = [
    `Produto pensado para ${cleanAudience}, com visual ${cleanStyle}.`,
    `Ideal para quem se identifica com ${cleanNiche} e quer uma peça original, prática e com presença visual.`,
    'Antes de vender em escala, valide a primeira arte com mockup, preço, prazo de produção e fornecedor.',
  ].join('\n')

  const reelScript = [
    'Cena 1: close rápido no problema ou desejo do público.',
    `Texto na tela: "Para quem vive ${cleanNiche} todos os dias."`,
    'Cena 2: revelar a estampa no mockup da camiseta com movimento curto.',
    `Cena 3: mostrar detalhe da arte e frase curta conectada com ${cleanAudience}.`,
    'Cena 4: chamada para ação: "Comente QUERO para receber o modelo/primeiro lote."',
  ].join('\n')

  const caption = [
    `Nova arte para ${cleanNiche}.`,
    `Criada para ${cleanAudience} que querem vestir uma ideia com identidade própria.`,
    'Se quiser ver o primeiro lote, comenta QUERO.',
    '#camiseta #estampa #empreendedorismo #negociolocal #ia',
  ].join('\n')

  return {
    id: `studio-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    productType: cleanProduct,
    niche: cleanNiche,
    audience: cleanAudience,
    style: cleanStyle,
    platform: cleanPlatform,
    imagePrompt,
    marketplaceTitle,
    marketplaceDescription,
    reelScript,
    caption,
    checklist: [
      'Gerar 3 variações da estampa com ferramenta de imagem IA.',
      'Escolher uma arte sem marca registrada, personagem protegido ou elemento copiado.',
      'Aplicar em mockup de camiseta e validar leitura no celular.',
      'Definir fornecedor, custo, margem e prazo antes de anunciar.',
      'Publicar somente após revisão humana do anúncio, preço e política da plataforma.',
      'Postar reels manualmente ou via Meta Business Suite depois de conferir legenda e direitos de uso.',
    ],
    createdAt: new Date().toISOString(),
  }
}

function openExternal(url: string) {
  const tab = window.open(url, '_blank')
  if (tab) {
    tab.opener = null
  }
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

export function ProductStudio() {
  const [productType, setProductType] = useState('camiseta estampada')
  const [niche, setNiche] = useState('donos de mercados locais')
  const [audience, setAudience] = useState('empreendedores de bairro')
  const [style, setStyle] = useState('moderno, brasileiro, direto, com apelo comercial')
  const [platform, setPlatform] = useState('Instagram, Facebook, Shopee e Mercado Livre')
  const [packages, setPackages] = useState<StudioPackage[]>(() => loadPackages())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(packages.slice(0, 20)))
  }, [packages])

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedId) ?? packages[0] ?? null,
    [packages, selectedId],
  )

  function generatePackage() {
    const nextPackage = createPackage(productType, niche, audience, style, platform)
    setPackages((current) => [nextPackage, ...current].slice(0, 20))
    setSelectedId(nextPackage.id)
  }

  return (
    <section className="rounded-lg border border-fuchsia-300/20 bg-slate-950/70 p-5 shadow-[0_0_48px_rgba(217,70,239,0.08)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-200/90">Product & Content Studio</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Produtos, estampas e reels assistidos por IA</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Gere conceito de produto, prompt de arte, anúncio de marketplace, roteiro de reels e legenda. Publicação e venda continuam com revisão humana.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold text-fuchsia-100">
          <Led tone="yellow" pulse />
          Aprovação antes de publicar
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Briefing do produto</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/60" value={productType} onChange={(event) => setProductType(event.target.value)} placeholder="Produto" />
            <input className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/60" value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="Nicho" />
          </div>
          <input className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/60" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="Público-alvo" />
          <textarea className="mt-3 min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/60" value={style} onChange={(event) => setStyle(event.target.value)} placeholder="Estilo visual" />
          <input className="mt-3 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-300/60" value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="Canais de venda/postagem" />
          <button className="mt-3 w-full rounded-md border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20" type="button" onClick={generatePackage}>
            Gerar pacote de produto
          </button>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-fuchsia-300/40" type="button" onClick={() => openExternal(marketplaceUrls.shopee)}>Abrir Shopee Seller</button>
            <button className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-fuchsia-300/40" type="button" onClick={() => openExternal(marketplaceUrls.mercadoLivre)}>Abrir Mercado Livre</button>
            <button className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-fuchsia-300/40" type="button" onClick={() => openExternal(marketplaceUrls.instagram)}>Abrir Reels/Meta</button>
            <button className="rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-fuchsia-300/40" type="button" onClick={() => openExternal(marketplaceUrls.facebook)}>Abrir Facebook</button>
          </div>

          <div className="mt-4 rounded-md border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            O estúdio prepara os ativos e textos. Ele não cria conta, não paga tráfego, não publica e não vende sem sua confirmação.
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Pacotes criados</p>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {packages.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-500">Nenhum pacote criado ainda.</div>
            ) : (
              packages.map((item) => (
                <button key={item.id} className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${selectedPackage?.id === item.id ? 'border-fuchsia-300/40 bg-fuchsia-400/10 text-fuchsia-50' : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-fuchsia-300/30'}`} type="button" onClick={() => setSelectedId(item.id)}>
                  <span className="block font-semibold">{item.marketplaceTitle}</span>
                  <span className="mt-1 block text-xs text-slate-500">{item.platform}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedPackage ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Prompt de estampa</p>
              <button className="rounded-md border border-fuchsia-300/35 bg-fuchsia-400/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20" type="button" onClick={() => copyText(selectedPackage.imagePrompt)}>Copiar prompt</button>
            </div>
            <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200">{selectedPackage.imagePrompt}</pre>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Anúncio de marketplace</p>
              <button className="rounded-md border border-fuchsia-300/35 bg-fuchsia-400/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20" type="button" onClick={() => copyText(`${selectedPackage.marketplaceTitle}\n\n${selectedPackage.marketplaceDescription}`)}>Copiar anúncio</button>
            </div>
            <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200">{selectedPackage.marketplaceTitle}\n\n{selectedPackage.marketplaceDescription}</pre>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Roteiro de reels</p>
              <button className="rounded-md border border-fuchsia-300/35 bg-fuchsia-400/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20" type="button" onClick={() => copyText(selectedPackage.reelScript)}>Copiar roteiro</button>
            </div>
            <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200">{selectedPackage.reelScript}</pre>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Legenda e checklist</p>
              <button className="rounded-md border border-fuchsia-300/35 bg-fuchsia-400/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20" type="button" onClick={() => copyText(`${selectedPackage.caption}\n\nChecklist:\n${selectedPackage.checklist.map((item) => `- ${item}`).join('\n')}`)}>Copiar tudo</button>
            </div>
            <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-200">{selectedPackage.caption}\n\nChecklist:\n{selectedPackage.checklist.map((item) => `- ${item}`).join('\n')}</pre>
          </div>
        </div>
      ) : null}
    </section>
  )
}
