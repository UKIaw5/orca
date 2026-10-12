import type { TranslationProvider } from '../../shared/translation/translation-provider'
import {
  protectCodeTokens,
  restoreProtectedText
} from '../../shared/translation/translation-text-protection'

const GOOGLE_TRANSLATE_V2_URL = 'https://translation.googleapis.com/language/translate/v2'
const REQUEST_TIMEOUT_MS = 15_000

type FetchLike = (input: string, init: RequestInit) => Promise<Response>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readTranslatedText(body: unknown): string | null {
  const translations = isRecord(body) && isRecord(body.data) ? body.data.translations : null
  const first = Array.isArray(translations) ? translations[0] : null
  return isRecord(first) && typeof first.translatedText === 'string' ? first.translatedText : null
}

function readErrorMessage(body: unknown): string | null {
  return isRecord(body) && isRecord(body.error) && typeof body.error.message === 'string'
    ? body.error.message
    : null
}

export function createGoogleTranslateProvider({
  readApiKey,
  fetchImpl = fetch
}: {
  readApiKey: () => string | null
  fetchImpl?: FetchLike
}): TranslationProvider {
  return {
    id: 'google-v2',
    async translate(text, { from, to }) {
      const apiKey = readApiKey()
      if (!apiKey) {
        throw new Error('Google Translate API key is not configured')
      }
      let response: Response
      try {
        response = await fetchImpl(GOOGLE_TRANSLATE_V2_URL, {
          method: 'POST',
          // Why: header auth keeps the key out of URLs that error logs and proxies may record.
          headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
          body: JSON.stringify({
            q: protectCodeTokens(text),
            source: from,
            target: to,
            format: 'html'
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        })
      } catch {
        throw new Error('Could not reach Google Translate')
      }
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const message = readErrorMessage(body)
        throw new Error(
          `Google Translate failed (${response.status})${message ? `: ${message}` : ''}`
        )
      }
      const translated = readTranslatedText(body)
      if (translated === null) {
        throw new Error('Google Translate returned an unexpected response')
      }
      return restoreProtectedText(translated)
    }
  }
}
