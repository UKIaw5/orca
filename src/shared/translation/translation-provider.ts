export type TranslationLanguagePair = { from: string; to: string }

export type TranslationProvider = {
  id: string
  translate: (text: string, languages: TranslationLanguagePair) => Promise<string>
}
