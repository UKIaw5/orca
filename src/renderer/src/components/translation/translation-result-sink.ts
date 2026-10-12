import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'

export type TranslationResultSink = {
  showPending: (source: string) => void
  showResult: (result: { source: string; translated: string; truncated: boolean }) => void
  showError: (message: string) => void
}

const RESULT_TOAST_DURATION_MS = 30_000

// Interim sink until the popup/tab sinks land; one toast id keeps a retry replacing the last one.
export function createToastResultSink(): TranslationResultSink {
  const id = 'translate-selection'
  return {
    showPending: () => {
      toast.loading(translate('translation.pending', 'Translating…'), { id })
    },
    showResult: ({ translated, truncated }) => {
      toast(translated, {
        id,
        duration: RESULT_TOAST_DURATION_MS,
        closeButton: true,
        description: truncated
          ? translate('translation.truncated', 'Long selection: only the beginning was translated.')
          : undefined
      })
    },
    showError: (message) => {
      toast.error(message, { id })
    }
  }
}
