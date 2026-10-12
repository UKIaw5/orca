import { describe, expect, it } from 'vitest'
import { getWindowShortcutActionId, resolveWindowShortcutAction } from './window-shortcut-policy'
import type { WindowShortcutInput } from './window-shortcut-policy'

const CHORD: WindowShortcutInput = {
  code: 'KeyT',
  key: 't',
  meta: false,
  control: true,
  alt: true,
  shift: false
}

describe('translate.selection shortcut', () => {
  it('ships unbound and resolves once the user binds a chord', () => {
    expect(resolveWindowShortcutAction(CHORD, 'linux')).toBeNull()
    expect(
      resolveWindowShortcutAction(CHORD, 'linux', { 'translate.selection': ['Mod+Alt+T'] })
    ).toEqual({ type: 'translateSelection' })
  })

  it('maps back to its action id', () => {
    expect(getWindowShortcutActionId({ type: 'translateSelection' })).toBe('translate.selection')
  })

  it('keeps dictation and sidebar toggles resolving after the table refactor', () => {
    expect(
      resolveWindowShortcutAction(
        { code: 'KeyE', key: 'e', meta: false, control: true, alt: false, shift: false },
        'linux'
      )
    ).toEqual({ type: 'dictationKeyDown' })
    expect(
      resolveWindowShortcutAction(
        { code: 'KeyB', key: 'b', meta: true, control: false, alt: false, shift: false },
        'darwin'
      )
    ).toEqual({ type: 'toggleLeftSidebar' })
  })
})
