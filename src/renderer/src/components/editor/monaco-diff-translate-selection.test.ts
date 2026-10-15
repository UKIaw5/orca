import type { editor } from 'monaco-editor'
import { describe, expect, it, vi } from 'vitest'
import { installDiffEditorTranslateSelection } from './monaco-translate-selection'

vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))

function createFakePane() {
  const actionDispose = vi.fn()
  const pane = {
    addAction: vi.fn(() => ({ dispose: actionDispose })),
    onDidFocusEditorWidget: vi.fn(() => ({ dispose: vi.fn() })),
    onDidBlurEditorWidget: vi.fn(() => ({ dispose: vi.fn() }))
  }
  return { pane, actionDispose }
}

describe('installDiffEditorTranslateSelection', () => {
  it('adds the translate action to both panes and removes it on cleanup', () => {
    const original = createFakePane()
    const modified = createFakePane()
    const diffEditor = {
      getOriginalEditor: () => original.pane,
      getModifiedEditor: () => modified.pane
    }

    // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the fakes implement only the editor methods the installer calls.
    const typed = diffEditor as unknown as editor.IStandaloneDiffEditor
    const cleanup = installDiffEditorTranslateSelection(typed)

    expect(original.pane.addAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'orca.translateSelection' })
    )
    expect(modified.pane.addAction).toHaveBeenCalledTimes(1)
    cleanup()
    expect(original.actionDispose).toHaveBeenCalledTimes(1)
    expect(modified.actionDispose).toHaveBeenCalledTimes(1)
  })
})
