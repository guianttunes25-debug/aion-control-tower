chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ installedAt: new Date().toISOString() })
})