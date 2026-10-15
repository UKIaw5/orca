import { useState } from 'react'
import { Languages } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { translateSelectedText } from '../translation/translate-selection'
import { readActiveTranslationSelection } from '../translation/translation-selection-source'

// Why capture on mount: opening the menu moves focus out of the pane, which unregisters the selection source before the click.
export function TerminalTranslateMenuItem(): React.JSX.Element | null {
  const [selection] = useState(() => readActiveTranslationSelection())
  if (!selection.trim()) {
    return null
  }
  return (
    <DropdownMenuItem onSelect={() => void translateSelectedText(selection)}>
      <Languages />
      {translate('translation.menuLabel', 'Translate Selection to Japanese')}
    </DropdownMenuItem>
  )
}
