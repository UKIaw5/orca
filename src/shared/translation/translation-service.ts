import type { TranslationLanguagePair, TranslationProvider } from './translation-provider'

export const DEFAULT_TRANSLATION_MAX_CHARS = 5000
const DEFAULT_CACHE_SIZE = 100

export type TranslationResult = {
  translated: string
  truncated: boolean
  cached: boolean
}

export type TranslationService = {
  translate: (text: string) => Promise<TranslationResult>
}

export function createTranslationService({
  provider,
  languages = { from: 'en', to: 'ja' },
  maxChars = DEFAULT_TRANSLATION_MAX_CHARS,
  cacheSize = DEFAULT_CACHE_SIZE
}: {
  provider: TranslationProvider
  languages?: TranslationLanguagePair
  maxChars?: number
  cacheSize?: number
}): TranslationService {
  const cache = new Map<string, string>()

  return {
    async translate(text) {
      const trimmed = text.trim()
      if (!trimmed) {
        throw new Error('Nothing to translate')
      }
      const truncated = trimmed.length > maxChars
      const source = truncated ? trimmed.slice(0, maxChars) : trimmed
      const key = `${provider.id}|${languages.from}|${languages.to}|${source}`
      const hit = cache.get(key)
      if (hit !== undefined) {
        // Why: re-insert so Map order tracks recency for LRU eviction.
        cache.delete(key)
        cache.set(key, hit)
        return { translated: hit, truncated, cached: true }
      }
      const translated = await provider.translate(source, languages)
      cache.set(key, translated)
      if (cache.size > cacheSize) {
        const oldest = cache.keys().next().value
        if (oldest !== undefined) {
          cache.delete(oldest)
        }
      }
      return { translated, truncated, cached: false }
    }
  }
}
