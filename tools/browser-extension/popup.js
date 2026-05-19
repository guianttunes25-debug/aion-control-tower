const taskInput = document.querySelector('#task')
const authorizeButton = document.querySelector('#authorize')
const observeButton = document.querySelector('#observe')
const decideButton = document.querySelector('#decide')
const executeToolButton = document.querySelector('#execute-tool')
const runGoogleButton = document.querySelector('#run-google')
const highlightButton = document.querySelector('#highlight')
const activityList = document.querySelector('#activity')
const pageStatus = document.querySelector('#page-status')

const backendBaseUrl = 'http://localhost:8080/browser-autopilot/sessions'
const defaultTask = 'Pesquisar cursos de IA gratuitos com certificado e parar antes de cadastro ou login'
let lastDecision = null

function addActivity(text) {
  const item = document.createElement('li')
  item.textContent = text
  activityList.prepend(item)
}

function setAuthorized(enabled) {
  observeButton.disabled = !enabled
  decideButton.disabled = !enabled
  executeToolButton.disabled = !enabled || !lastDecision?.autoExecutable
  runGoogleButton.disabled = !enabled
  highlightButton.disabled = !enabled
  pageStatus.textContent = enabled ? 'Autorizado' : 'Aguardando autorizacao'
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw await backendError(response)
  }

  return response.json()
}

async function getJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw await backendError(response)
  }

  return response.json()
}

async function backendError(response) {
  let message = `Backend retornou ${response.status}`
  try {
    const payload = await response.json()
    if (payload?.message) {
      message = `${message}: ${payload.message}`
    }
  } catch {
    // Response body may be empty or non-JSON.
  }
  const error = new Error(message)
  error.status = response.status
  return error
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function sendToActiveTab(message) {
  const tab = await getActiveTab()
  if (!tab?.id) {
    throw new Error('Nenhuma aba ativa encontrada')
  }
  return chrome.tabs.sendMessage(tab.id, message)
}

async function loadState() {
  const tab = await getActiveTab()
  const stored = await chrome.storage.local.get(['task', `authorized:${tab?.id}`, `session:${tab?.id}`])
  taskInput.value = stored.task || defaultTask
  setAuthorized(Boolean(stored[`authorized:${tab?.id}`]))
  addActivity(tab?.url ? `Pagina ativa: ${tab.url}` : 'Pagina ativa nao identificada')
  if (stored[`session:${tab?.id}`]) {
    addActivity(`Sessao backend: ${stored[`session:${tab?.id}`]}`)
  }
}

async function ensureBackendSession(tab, task) {
  const stored = await chrome.storage.local.get([`session:${tab.id}`])
  const storedSessionId = stored[`session:${tab.id}`]
  if (storedSessionId) {
    try {
      await getJson(`${backendBaseUrl}/${storedSessionId}`)
      return storedSessionId
    } catch (error) {
      await chrome.storage.local.remove(`session:${tab.id}`)
      addActivity('Sessao backend expirada. Criando nova sessao local.')
    }
  }

  const response = await postJson(backendBaseUrl, {
    goal: task,
    startUrl: tab.url || 'about:blank',
  })
  await chrome.storage.local.set({ [`session:${tab.id}`]: response.id })
  return response.id
}

async function withFreshSession(tab, task, action) {
  let sessionId = await ensureBackendSession(tab, task)
  try {
    return await action(sessionId)
  } catch (error) {
    if (error.status === 404 || error.status === 500) {
      await chrome.storage.local.remove(`session:${tab.id}`)
      addActivity('Sessao backend perdeu estado. Recriando e tentando de novo.')
      sessionId = await ensureBackendSession(tab, task)
      return action(sessionId)
    }
    throw error
  }
}

async function executeDecisionTool(decision, task) {
  if (!decision?.autoExecutable) {
    addActivity('Ferramenta nao executada: decisao exige humano ou nao e automatica.')
    return null
  }

  if (decision.toolName === 'observe_page') {
    const result = await sendToActiveTab({ type: 'AION_OBSERVE_PAGE' })
    addActivity(`Ferramenta observe_page: ${result.clickables} acoes visiveis.`)
    return { message: `observe_page executada: ${result.clickables} acoes visiveis`, result }
  }

  if (decision.toolName === 'highlight_safe_actions') {
    const result = await sendToActiveTab({ type: 'AION_HIGHLIGHT_ACTIONS' })
    addActivity(`Ferramenta highlight_safe_actions: ${result.count} acoes destacadas.`)
    return { message: `highlight_safe_actions executada: ${result.count} acoes destacadas`, result }
  }

  if (decision.toolName === 'run_google_search') {
    const result = await sendToActiveTab({ type: 'AION_RUN_GOOGLE_SEARCH', task: decision.toolInput || task })
    addActivity(`Ferramenta run_google_search: ${result.message}`)
    return { message: result.message, result }
  }

  if (decision.toolName === 'extract_public_content') {
    const result = await sendToActiveTab({ type: 'AION_EXTRACT_PUBLIC_CONTENT' })
    addActivity(`Ferramenta extract_public_content: ${result.paragraphs.length} trechos publicos extraidos.`)
    return { message: `extract_public_content executada: ${result.paragraphs.length} trechos publicos extraidos`, result }
  }

  addActivity(`Ferramenta desconhecida ou bloqueada: ${decision.toolName}`)
  return null
}

async function executeLastDecision() {
  const tab = await getActiveTab()
  const task = taskInput.value.trim() || defaultTask
  if (!lastDecision) {
    addActivity('Nenhuma decisao disponível. Clique em Decidir proximo passo primeiro.')
    return
  }

  const execution = await executeDecisionTool(lastDecision, task)
  if (execution) {
    await withFreshSession(tab, task, (sessionId) => postJson(`${backendBaseUrl}/${sessionId}/execution-result`, { result: execution.message }))
  }
}

authorizeButton.addEventListener('click', async () => {
  const tab = await getActiveTab()
  const task = taskInput.value.trim() || defaultTask
  let sessionId = null
  try {
    sessionId = await ensureBackendSession(tab, task)
  } catch (error) {
    addActivity(`Backend offline: autorizacao ficou local. ${error.message}`)
  }
  await chrome.storage.local.set({ task, [`authorized:${tab.id}`]: true })
  setAuthorized(true)
  addActivity(sessionId ? `Autorizacao concedida. Sessao ${sessionId}.` : 'Autorizacao concedida localmente para esta aba.')
})

observeButton.addEventListener('click', async () => {
  try {
    const tab = await getActiveTab()
    const task = taskInput.value.trim() || defaultTask
    const result = await sendToActiveTab({ type: 'AION_OBSERVE_PAGE' })
    await withFreshSession(tab, task, (sessionId) => postJson(`${backendBaseUrl}/${sessionId}/observe`, result))
    addActivity(`Pagina observada: ${result.title || 'sem titulo'}; ${result.clickables} acoes visiveis.`)
  } catch (error) {
    addActivity(`Falha ao observar pagina: ${error.message}`)
  }
})

decideButton.addEventListener('click', async () => {
  try {
    const tab = await getActiveTab()
    const task = taskInput.value.trim() || defaultTask
    const snapshot = await sendToActiveTab({ type: 'AION_OBSERVE_PAGE' })
    const decision = await withFreshSession(tab, task, async (sessionId) => {
      await postJson(`${backendBaseUrl}/${sessionId}/observe`, snapshot)
      return postJson(`${backendBaseUrl}/${sessionId}/decide`, {})
    })
    lastDecision = decision
    executeToolButton.disabled = !decision.autoExecutable
    addActivity(`Decisao: ${decision.actionType} / risco ${decision.riskLevel}. ${decision.nextAction}`)
    if (decision.toolName) {
      addActivity(`Ferramenta sugerida: ${decision.toolName}${decision.autoExecutable ? ' (auto segura)' : ' (manual)'}`)
    }
    if (decision.reason) {
      addActivity(`Motivo: ${decision.reason}`)
    }
    if (decision.approvalRequired) {
      addActivity('Aprovacao humana obrigatoria antes de executar esta acao.')
    } else if (decision.autoExecutable) {
      await executeLastDecision()
    }
  } catch (error) {
    addActivity(`Falha ao decidir: ${error.message}`)
  }
})

executeToolButton.addEventListener('click', async () => {
  try {
    await executeLastDecision()
  } catch (error) {
    addActivity(`Falha ao executar ferramenta: ${error.message}`)
  }
})

runGoogleButton.addEventListener('click', async () => {
  try {
    const task = taskInput.value.trim() || defaultTask
    const tab = await getActiveTab()
    await chrome.storage.local.set({ task })
    const result = await sendToActiveTab({ type: 'AION_RUN_GOOGLE_SEARCH', task })
    await withFreshSession(tab, task, (sessionId) => postJson(`${backendBaseUrl}/${sessionId}/execution-result`, { result: result.message }))
    addActivity(result.message)
  } catch (error) {
    addActivity(`Falha ao pesquisar: ${error.message}`)
  }
})

highlightButton.addEventListener('click', async () => {
  try {
    const result = await sendToActiveTab({ type: 'AION_HIGHLIGHT_ACTIONS' })
    addActivity(`Acoes destacadas: ${result.count}`)
  } catch (error) {
    addActivity(`Falha ao destacar acoes: ${error.message}`)
  }
})

loadState().catch((error) => addActivity(error.message))