import type { Terminal } from '@xterm/xterm'
import { registerActiveTranslationSelectionSource } from '../translation/translation-selection-source'
import { readTerminalClipboardSelection } from './terminal-clipboard-selection-text'

function readSelectionSafely(terminal: Pick<Terminal, 'getSelection'>): string {
  try {
    return readTerminalClipboardSelection(terminal)
  } catch {
    return ''
  }
}

// Lets the global shortcut find the focused terminal's selection; listeners die with the pane container.
export function installTerminalTranslateSelection(
  terminal: Pick<Terminal, 'getSelection'>,
  container: HTMLElement
): void {
  let unregister: (() => void) | null = null
  const release = (): void => {
    unregister?.()
    unregister = null
  }
  container.addEventListener('focusin', () => {
    release()
    unregister = registerActiveTranslationSelectionSource({
      readSelection: () => readSelectionSafely(terminal)
    })
  })
  container.addEventListener('focusout', release)
}
