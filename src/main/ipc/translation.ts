import { ipcMain } from 'electron'
import { createGoogleTranslateProvider } from '../translation/google-translate-provider'
import {
  clearGoogleTranslateApiKey,
  getGoogleTranslateApiKeyProtection,
  hasGoogleTranslateApiKey,
  readGoogleTranslateApiKey,
  saveGoogleTranslateApiKey
} from '../translation/google-translate-api-key-store'
import { createTranslationService } from '../../shared/translation/translation-service'
import type {
  TranslationIpcResult,
  TranslationKeyStatus
} from '../../shared/translation/translation-ipc-types'

async function readKeyStatus(): Promise<TranslationKeyStatus> {
  return {
    configured: await hasGoogleTranslateApiKey(),
    protection: await getGoogleTranslateApiKeyProtection()
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Translation failed'
}

export function registerTranslationHandlers(): void {
  const service = createTranslationService({
    provider: createGoogleTranslateProvider({ readApiKey: readGoogleTranslateApiKey })
  })

  ipcMain.handle('translation:getApiKeyStatus', (): Promise<TranslationKeyStatus> =>
    readKeyStatus()
  )

  ipcMain.handle(
    'translation:saveApiKey',
    async (_event, apiKey: unknown): Promise<TranslationKeyStatus> => {
      if (typeof apiKey !== 'string') {
        throw new Error('Google Translate API key is required')
      }
      await saveGoogleTranslateApiKey(apiKey)
      return readKeyStatus()
    }
  )

  ipcMain.handle('translation:clearApiKey', async (): Promise<TranslationKeyStatus> => {
    await clearGoogleTranslateApiKey()
    return readKeyStatus()
  })

  // Why: results are returned, not thrown, so the renderer never sees Electron's "Error invoking remote method" wrapper.
  ipcMain.handle(
    'translation:translate',
    async (_event, text: unknown): Promise<TranslationIpcResult> => {
      if (typeof text !== 'string') {
        return { ok: false, error: 'Nothing to translate' }
      }
      try {
        const { translated, truncated } = await service.translate(text)
        return { ok: true, translated, truncated }
      } catch (error) {
        return { ok: false, error: errorMessage(error) }
      }
    }
  )
}
