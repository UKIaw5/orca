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

export function readActiveTranslationSelection(): string {
  return activeSource?.readSelection() ?? ''
}
