import { ipcRenderer } from 'electron'
import type { TranslationApi } from './translation-api'

export const translationApi = {
  getApiKeyStatus: () => ipcRenderer.invoke('translation:getApiKeyStatus'),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('translation:saveApiKey', apiKey),
  clearApiKey: () => ipcRenderer.invoke('translation:clearApiKey'),
  translate: (text: string) => ipcRenderer.invoke('translation:translate', text)
} satisfies TranslationApi
