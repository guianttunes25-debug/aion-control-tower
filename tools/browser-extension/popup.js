const taskInput = document.querySelector('#task')
const authorizeButton = document.querySelector('#authorize')
const observeButton = document.querySelector('#observe')
const runGoogleButton = document.querySelector('#run-google')
const highlightButton = document.querySelector('#highlight')
const activityList = document.querySelector('#activity')
const pageStatus = document.querySelector('#page-status')

const defaultTask = 'Pesquisar cursos de IA gratuitos com certificado e parar antes de cadastro ou login'

function addActivity(text) {
  const item = document.createElement('li')
  item.textContent = text
  activityList.prepend(item)
}

function setAuthorized(enabled) {
  observeButton.disabled = !enabled
  runGoogleButton.disabled = !enabled
  highlightButton.disabled = !enabled
  pageStatus.textContent = enabled ? 'Autorizado' : 'Aguardando autorizacao'
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
  const stored = await chrome.storage.local.get(['task', `authorized:${tab?.id}`])
  taskInput.value = stored.task || defaultTask
  setAuthorized(Boolean(stored[`authorized:${tab?.id}`]))
  addActivity(tab?.url ? `Pagina ativa: ${tab.url}` : 'Pagina ativa nao identificada')
}

authorizeButton.addEventListener('click', async () => {
  const tab = await getActiveTab()
  const task = taskInput.value.trim() || defaultTask
  await chrome.storage.local.set({ task, [`authorized:${tab.id}`]: true })
  setAuthorized(true)
  addActivity('Autorizacao concedida para esta aba e este objetivo.')
})

observeButton.addEventListener('click', async () => {
  try {
    const result = await sendToActiveTab({ type: 'AION_OBSERVE_PAGE' })
    addActivity(`Pagina observada: ${result.title || 'sem titulo'}; ${result.clickables} acoes visiveis.`)
  } catch (error) {
    addActivity(`Falha ao observar pagina: ${error.message}`)
  }
})

runGoogleButton.addEventListener('click', async () => {
  try {
    const task = taskInput.value.trim() || defaultTask
    await chrome.storage.local.set({ task })
    const result = await sendToActiveTab({ type: 'AION_RUN_GOOGLE_SEARCH', task })
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