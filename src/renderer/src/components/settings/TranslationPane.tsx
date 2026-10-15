import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, Lock, Unlink } from 'lucide-react'
import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import { useShortcutLabel } from '@/hooks/useShortcutLabel'
import type { TranslationKeyStatus } from '../../../../shared/translation/translation-ipc-types'
import { useAppStore } from '../../store'
import { isWindowsUserAgent } from '../terminal-pane/pane-helpers'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { UnsealedCredentialNotice } from './UnsealedCredentialNotice'

export function TranslationPane(): React.JSX.Element {
  const shortcutLabel = useShortcutLabel('translate.selection')
  const rightClickPastes = useAppStore(
    (store) => store.settings?.terminalRightClickToPaste ?? isWindowsUserAgent()
  )
  const [status, setStatus] = useState<TranslationKeyStatus | null>(null)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    void window.api.translation
      .getApiKeyStatus()
      .then((next) => {
        if (mountedRef.current) {
          setStatus(next)
        }
      })
      .catch(() => {})
    return () => {
      mountedRef.current = false
    }
  }, [])

  const run = useCallback(
    async (action: () => Promise<TranslationKeyStatus>, failure: string): Promise<void> => {
      setPending(true)
      try {
        const next = await action()
        if (mountedRef.current) {
          setStatus(next)
          setDraft('')
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : failure)
      } finally {
        if (mountedRef.current) {
          setPending(false)
        }
      }
    },
    []
  )

  const configured = status?.configured === true
  const save = (): void =>
    void run(
      () => window.api.translation.saveApiKey(draft),
      translate('translation.settings.saveFailed', 'Failed to save the API key')
    )
  const clear = (): void =>
    void run(
      () => window.api.translation.clearApiKey(),
      translate('translation.settings.clearFailed', 'Failed to remove the API key')
    )

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {translate(
          'translation.settings.privacy',
          'Selected text is sent to Google Cloud Translation when you translate it. Nothing is sent until you run the shortcut or the context-menu item.'
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        {translate(
          'translation.settings.shortcut',
          'Shortcut: {{shortcut}} (change it in Shortcuts).',
          {
            shortcut: shortcutLabel
          }
        )}
      </p>
      {rightClickPastes ? (
        <p className="text-xs text-muted-foreground">
          {translate(
            'translation.settings.terminalMenuHint',
            'In terminals, right-click copies or pastes. Ctrl+right-click opens the menu that has Translate.'
          )}
        </p>
      ) : null}
      <UnsealedCredentialNotice
        protection={status?.protection ?? null}
        credentialName={translate('translation.settings.keyName', 'Your Google Translate key')}
      />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="translation-api-key">
            {translate('translation.settings.apiKey', 'Google Cloud Translation API key')}
          </Label>
          {configured && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5" />
              {translate('translation.settings.configured', 'Configured')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="translation-api-key"
            type="password"
            value={draft}
            disabled={pending}
            placeholder={
              configured
                ? translate(
                    'translation.settings.replacePlaceholder',
                    'Enter a new key to replace it'
                  )
                : translate('translation.settings.keyPlaceholder', 'AIza...')
            }
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && draft.trim()) {
                save()
              }
            }}
          />
          <Button disabled={pending || !draft.trim()} onClick={save}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {translate('translation.settings.save', 'Save Key')}
          </Button>
          {configured && (
            <button
              onClick={clear}
              disabled={pending}
              aria-label={translate('translation.settings.remove', 'Remove API key')}
              className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Unlink className="size-3.5" />
            </button>
          )}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          <Lock className="size-3 shrink-0" />
          {translate(
            'translation.settings.storage',
            'Stored in ~/.orca using Electron encrypted storage when available.'
          )}
        </p>
      </div>
    </div>
  )
}
