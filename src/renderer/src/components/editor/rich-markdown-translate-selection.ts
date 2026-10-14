import type { Editor } from '@tiptap/react'
import { registerActiveTranslationSelectionSource } from '../translation/translation-selection-source'

export function readRichMarkdownSelectionText(editor: Editor): string {
  const { from, to, empty } = editor.state.selection
  return empty ? '' : editor.state.doc.textBetween(from, to, '\n')
}

// Lets the global shortcut find the focused rich editor's selection.
export function installRichMarkdownTranslateSelection(editor: Editor): () => void {
  let unregister: (() => void) | null = null
  const release = (): void => {
    unregister?.()
    unregister = null
  }
  const onFocus = (): void => {
    release()
    unregister = registerActiveTranslationSelectionSource({
      readSelection: () => readRichMarkdownSelectionText(editor)
    })
  }
  if (editor.isFocused) {
    onFocus()
  }
  editor.on('focus', onFocus)
  editor.on('blur', release)
  return () => {
    editor.off('focus', onFocus)
    editor.off('blur', release)
    release()
  }
}
