import type {
  TranslationIpcResult,
  TranslationKeyStatus
} from '../../shared/translation/translation-ipc-types'

export type TranslationApi = {
  getApiKeyStatus: () => Promise<TranslationKeyStatus>
  saveApiKey: (apiKey: string) => Promise<TranslationKeyStatus>
  clearApiKey: () => Promise<TranslationKeyStatus>
  translate: (text: string) => Promise<TranslationIpcResult>
}
