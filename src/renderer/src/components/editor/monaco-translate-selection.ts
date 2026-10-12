import type { editor } from 'monaco-editor'
import { translate } from '@/i18n/i18n'
import { translateSelectedText } from '../translation/translate-selection'
import { registerActiveTranslationSelectionSource } from '../translation/translation-selection-source'

export function readMonacoSelectionText(editorInstance: editor.IStandaloneCodeEditor): string {
  const model = editorInstance.getModel()
  const selection = editorInstance.getSelection()
  return model && selection && !selection.isEmpty() ? model.getValueInRange(selection) : ''
}

// Context-menu action plus focus tracking so the global shortcut can find this editor's selection.
export function installMonacoTranslateSelection(editorInstance: editor.IStandaloneCodeEditor): {
  dispose: () => void
} {
  const action = editorInstance.addAction({
    id: 'orca.translateSelection',
    label: translate('translation.menuLabel', 'Translate Selection to Japanese'),
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 3,
    precondition: 'editorHasSelection',
    run: () => {
      void translateSelectedText(readMonacoSelectionText(editorInstance))
    }
  })
  let unregister: (() => void) | null = null
  const releaseSource = (): void => {
    unregister?.()
    unregister = null
  }
  const focus = editorInstance.onDidFocusEditorWidget(() => {
    releaseSource()
    unregister = registerActiveTranslationSelectionSource({
      readSelection: () => readMonacoSelectionText(editorInstance)
    })
  })
  const blur = editorInstance.onDidBlurEditorWidget(releaseSource)
  return {
    dispose: () => {
      releaseSource()
      focus.dispose()
      blur.dispose()
      action.dispose()
    }
  }
}
