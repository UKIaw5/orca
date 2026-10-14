import { useEffect, useSyncExternalStore } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { translate } from '@/i18n/i18n'
import { Button } from '../ui/button'
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover'
import {
  closeTranslationPopup,
  getTranslationPopupState,
  rememberTranslationAnchor,
  subscribeTranslationPopup
} from './translation-popup-store'

export function TranslationPopup(): React.JSX.Element | null {
  const state = useSyncExternalStore(subscribeTranslationPopup, getTranslationPopupState)

  useEffect(() => {
    // Why: a click on Monaco's menu item would otherwise replace the right-click point beside the selection.
    const remember = (event: PointerEvent | MouseEvent): void => {
      if (event.target instanceof Element && event.target.closest('.monaco-menu')) {
        return
      }
      rememberTranslationAnchor({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('pointerup', remember, true)
    window.addEventListener('contextmenu', remember, true)
    return () => {
      window.removeEventListener('pointerup', remember, true)
      window.removeEventListener('contextmenu', remember, true)
    }
  }, [])

  if (state.status === 'closed') {
    return null
  }
  return (
    <Popover open onOpenChange={(open) => !open && closeTranslationPopup()}>
      <PopoverAnchor asChild>
        <span
          aria-hidden
          className="pointer-events-none fixed size-0"
          style={{ left: state.anchor.x, top: state.anchor.y }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="w-96 max-w-[90vw]"
        // Why: keep focus in the editor/terminal so the selection stays and typing continues.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="space-y-2 p-3 text-sm">
          {state.status === 'pending' && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {translate('translation.pending', 'Translating…')}
            </p>
          )}
          {state.status === 'error' && <p className="text-destructive">{state.message}</p>}
          {state.status === 'result' && (
            <>
              <p className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words scrollbar-sleek">
                {state.translated}
              </p>
              {state.truncated && (
                <p className="text-xs text-muted-foreground">
                  {translate(
                    'translation.truncated',
                    'Long selection: only the beginning was translated.'
                  )}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void window.api.ui.writeClipboardText(state.translated)}
                >
                  <Copy className="size-3.5" />
                  {translate('translation.copy', 'Copy')}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
