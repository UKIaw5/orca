import { Languages } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { translateActiveSelection } from '../translation/translate-selection'
import { readActiveTranslationSelection } from '../translation/translation-selection-source'

// Why no props: the focused pane registered itself as the selection source; rows mount only while the menu is open.
export function TerminalTranslateMenuItem(): React.JSX.Element | null {
  if (!readActiveTranslationSelection().trim()) {
    return null
  }
  return (
    <DropdownMenuItem onSelect={() => void translateActiveSelection()}>
      <Languages />
      {translate('translation.menuLabel', 'Translate Selection to Japanese')}
    </DropdownMenuItem>
  )
}
