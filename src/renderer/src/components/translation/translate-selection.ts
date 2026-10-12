import { translate } from '@/i18n/i18n'
import { createToastResultSink, type TranslationResultSink } from './translation-result-sink'
import { readActiveTranslationSelection } from './translation-selection-source'

type TranslateText = (text: string) => ReturnType<typeof window.api.translation.translate>

export async function translateSelectedText(
  text: string,
  sink: TranslationResultSink = createToastResultSink(),
  translateText: TranslateText = (value) => window.api.translation.translate(value)
): Promise<void> {
  const source = text.trim()
  if (!source) {
    sink.showError(translate('translation.noSelection', 'Select some text to translate.'))
    return
  }
  sink.showPending(source)
  try {
    const result = await translateText(source)
    if (result.ok) {
      sink.showResult({ source, translated: result.translated, truncated: result.truncated })
    } else {
      sink.showError(result.error)
    }
  } catch {
    sink.showError(translate('translation.failed', 'Translation failed.'))
  }
}

export function translateActiveSelection(sink?: TranslationResultSink): Promise<void> {
  return translateSelectedText(readActiveTranslationSelection(), sink)
}
