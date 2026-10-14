import { describe, expect, it, vi } from 'vitest'
import { buildEditableContextMenuTemplate } from './editable-context-menu'

function build(selectionText: string): Electron.MenuItemConstructorOptions[] {
  return buildEditableContextMenuTemplate(
    {
      x: 5,
      y: 6,
      isEditable: true,
      selectionText,
      misspelledWord: '',
      dictionarySuggestions: [],
      formControlType: 'none'
    },
    {
      replaceMisspelling: vi.fn(),
      send: vi.fn(),
      session: { addWordToSpellCheckerDictionary: vi.fn() }
    }
  )
}

describe('rich markdown translate menu item', () => {
  it('appears first when text is selected', () => {
    expect(build('hello')[0].label).toBe('Translate Selection to Japanese')
  })

  it('is absent without a selection', () => {
    expect(build('  ').map((item) => item.label)).not.toContain('Translate Selection to Japanese')
  })
})
