const AION_SAFE_ACTION_STYLE_ID = 'aion-autopilot-safe-action-style'

function visibleText(element) {
  return (element.innerText || element.textContent || element.getAttribute('aria-label') || element.getAttribute('title') || '').trim()
}

function isVisible(element) {
  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
}

function clickables() {
  return [...document.querySelectorAll('a, button, input, textarea, select, [role="button"], [tabindex]')]
    .filter(isVisible)
    .slice(0, 80)
}

function observePage() {
  const actions = clickables()
  return {
    title: document.title,
    url: location.href,
    headings: [...document.querySelectorAll('h1, h2, h3')].map(visibleText).filter(Boolean).slice(0, 12),
    clickables: actions.length,
    actionLabels: actions.map(visibleText).filter(Boolean).slice(0, 20),
  }
}

function ensureStyle() {
  if (document.getElementById(AION_SAFE_ACTION_STYLE_ID)) {
    return
  }
  const style = document.createElement('style')
  style.id = AION_SAFE_ACTION_STYLE_ID
  style.textContent = `
    .aion-autopilot-safe-action {
      outline: 2px solid #38bdf8 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.22) !important;
    }
  `
  document.documentElement.appendChild(style)
}

function highlightActions() {
  ensureStyle()
  const actions = clickables().slice(0, 30)
  actions.forEach((element) => element.classList.add('aion-autopilot-safe-action'))
  return actions.length
}

function googleSearchInput() {
  return document.querySelector('textarea[name="q"], input[name="q"]')
}

function runGoogleSearch(task) {
  if (!location.hostname.includes('google.')) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${task} curso IA gratuito certificado`)}`, '_blank', 'noopener')
    return 'Google aberto em nova aba para pesquisar cursos.'
  }

  const input = googleSearchInput()
  if (!input) {
    return 'Campo de busca do Google nao encontrado. Abra google.com e tente novamente.'
  }

  input.focus()
  input.value = `${task} curso IA gratuito certificado`
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

  const form = input.closest('form')
  if (form) {
    form.submit()
  }

  return 'Pesquisa iniciada. AION nao fara cadastro, login, captcha, matricula ou pagamento.'
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AION_OBSERVE_PAGE') {
    sendResponse(observePage())
    return true
  }

  if (message.type === 'AION_HIGHLIGHT_ACTIONS') {
    sendResponse({ count: highlightActions() })
    return true
  }

  if (message.type === 'AION_RUN_GOOGLE_SEARCH') {
    sendResponse({ message: runGoogleSearch(message.task || 'cursos de IA') })
    return true
  }

  return false
})