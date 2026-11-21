import { useEffect, useState } from 'react'
import { Languages } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { translateSelectedText } from '../translation/translate-selection'
import { readActiveTranslationSelection } from '../translation/translation-selection-source'

// Why capture on mount: opening the menu moves focus out of the pane, which unregisters the selection source before the click.
export function TerminalTranslateMenuItem(): React.JSX.Element | null {
  const [selection] = useState(() => readActiveTranslationSelection())
  const [clipboard, setClipboard] = useState('')
  const hasSelection = selection.trim() !== ''

  // Why: full-screen TUIs such as Claude Code own mouse selection and copy it on release, leaving no terminal selection.
  useEffect(() => {
    if (hasSelection) {
      return
    }
    let cancelled = false
    void window.api.ui
      .readClipboardText()
      .then((text) => !cancelled && setClipboard(text))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [hasSelection])

  const text = hasSelection ? selection : clipboard
  if (!text.trim()) {
    return null
  }
  return (
    <DropdownMenuItem onSelect={() => void translateSelectedText(text)}>
      <Languages />
      {hasSelection
        ? translate('translation.menuLabel', 'Translate Selection to Japanese')
        : translate('translation.menuLabelClipboard', 'Translate Clipboard to Japanese')}
    </DropdownMenuItem>
  )
}
