import { useEffect } from 'react'
import { translateActiveSelection } from './translate-selection'

export function TranslateSelectionShortcut(): null {
  useEffect(() => window.api.ui.onTranslateSelection(() => void translateActiveSelection()), [])
  return null
}
