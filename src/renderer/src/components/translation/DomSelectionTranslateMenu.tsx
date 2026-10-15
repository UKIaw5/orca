import { useEffect, useState } from 'react'
import { Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { translate } from '@/i18n/i18n'
import { isEditableTarget } from '@/lib/editable-target'
import { readDomSelectionAtPoint } from './translation-dom-selection'
import { translateSelectedText } from './translate-selection'

type MenuState = { x: number; y: number; text: string }

// Covers read-only DOM text (markdown preview, issue bodies, diffs' prose) that has no menu of its own.
export function DomSelectionTranslateMenu(): React.JSX.Element {
  const [menu, setMenu] = useState<MenuState | null>(null)

  useEffect(() => {
    const onContextMenu = (event: MouseEvent): void => {
      // Bubble phase: surfaces with their own menu have already claimed the event.
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return
      }
      const text = readDomSelectionAtPoint(event.clientX, event.clientY)
      if (text.trim()) {
        event.preventDefault()
        setMenu({ x: event.clientX, y: event.clientY, text })
      }
    }
    window.addEventListener('contextmenu', onContextMenu)
    return () => window.removeEventListener('contextmenu', onContextMenu)
  }, [])

  return (
    <DropdownMenu
      open={menu !== null}
      onOpenChange={(open) => !open && setMenu(null)}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button
          aria-hidden
          tabIndex={-1}
          className="pointer-events-none fixed size-px opacity-0"
          style={{ left: menu?.x ?? 0, top: menu?.y ?? 0 }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={0}
        align="start"
        // Why: closing must not pull focus back and collapse the selection.
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem onSelect={() => menu && void translateSelectedText(menu.text)}>
          <Languages />
          {translate('translation.menuLabel', 'Translate Selection to Japanese')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
