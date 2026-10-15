import { readDomSelectionText } from './translation-dom-selection'

export type TranslationSelectionSource = { readSelection: () => string }

let activeSource: TranslationSelectionSource | null = null

// Why: the shortcut arrives via main with no target, so the focused editor/terminal registers itself as the selection owner.
export function registerActiveTranslationSelectionSource(
  source: TranslationSelectionSource
): () => void {
  activeSource = source
  return () => {
    if (activeSource === source) {
      activeSource = null
    }
  }
}

// Falls back to the page selection so read-only DOM surfaces work with the shortcut without registering.
export function readActiveTranslationSelection(): string {
  return activeSource ? activeSource.readSelection() : readDomSelectionText()
}
