// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerActiveTranslationSelectionSource } from '../translation/translation-selection-source'

const translateSelectedText = vi.fn()
const readClipboardText = vi.fn<() => Promise<string>>()

vi.mock('@/i18n/i18n', () => ({ translate: (_key: string, fallback: string) => fallback }))
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({
    onSelect,
    children
  }: {
    onSelect: () => void
    children: React.ReactNode
  }) => <button onClick={onSelect}>{children}</button>
}))
vi.mock('../translation/translate-selection', () => ({
  translateSelectedText: (text: string) => translateSelectedText(text)
}))

vi.stubGlobal('window', Object.assign(window, { api: { ui: { readClipboardText } } }))

const { TerminalTranslateMenuItem } = await import('./TerminalTranslateMenuItem')

describe('TerminalTranslateMenuItem', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('translates the selection captured when the menu opened, even after focus left the pane', () => {
    const unregister = registerActiveTranslationSelectionSource({ readSelection: () => 'hello' })
    render(<TerminalTranslateMenuItem />)
    unregister()
    fireEvent.click(screen.getByText('Translate Selection to Japanese'))
    expect(translateSelectedText).toHaveBeenCalledWith('hello')
  })

  it('renders nothing without a selection or clipboard text', async () => {
    readClipboardText.mockResolvedValue('  ')
    const { container } = render(<TerminalTranslateMenuItem />)
    await waitFor(() => expect(readClipboardText).toHaveBeenCalled())
    expect(container.innerHTML).toBe('')
  })

  it('offers the clipboard when a full-screen app left no terminal selection', async () => {
    readClipboardText.mockResolvedValue('copied by the TUI')
    render(<TerminalTranslateMenuItem />)
    fireEvent.click(await screen.findByText('Translate Clipboard to Japanese'))
    expect(translateSelectedText).toHaveBeenCalledWith('copied by the TUI')
  })
})
