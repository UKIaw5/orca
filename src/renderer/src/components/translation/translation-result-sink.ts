import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import { currentTranslationAnchor, showTranslationPopupState } from './translation-popup-store'

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
      // Why success, not a bare toast: updating a loading toast without a type keeps its spinner.
      toast.success(translated, {
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

// Popup anchored where the user last pointed; replaced in place by each run.
export function createPopupResultSink(): TranslationResultSink {
  const anchor = currentTranslationAnchor()
  return {
    showPending: () => showTranslationPopupState({ status: 'pending', anchor }),
    showResult: ({ source, translated, truncated }) =>
      showTranslationPopupState({ status: 'result', anchor, source, translated, truncated }),
    showError: (message) => showTranslationPopupState({ status: 'error', anchor, message })
  }
}
